import { IUploadJob, JobLogEntry } from '../models/UploadJob';
import { Album } from '../models/Album';
import { Photo } from '../models/Photo';
import { UploadJob } from '../models/UploadJob';
import {
  listImagesInFolder,
  downloadDriveFile,
} from './drive.service';
import { compressImage } from './image.service';
import { uploadImage } from './cloudinary.service';
import { emitUploadProgress } from '../config/socket';
import { logger } from '../config/logger';

interface EngineState {
  isRunning: boolean;
  currentJobId?: string;
  shouldPause: boolean;
  shouldCancel: boolean;
}

const state: EngineState = {
  isRunning: false,
  shouldPause: false,
  shouldCancel: false,
};

export function isEngineRunning(): boolean {
  return state.isRunning;
}

export function getCurrentJobId(): string | undefined {
  return state.currentJobId;
}

/** Schedule a job to start processing. Background-only. */
export async function startImportJob(opts: {
  albumId: string;
  userId: string;
}): Promise<string> {
  if (state.isRunning) {
    throw new Error(
      'Another upload job is already running. Pause or cancel it before starting a new one.'
    );
  }

  const album = await Album.findById(opts.albumId);
  if (!album) throw new Error('Album not found');
  if (!album.driveFolderId) throw new Error('Album has no Drive folder');

  const job = await UploadJob.create({
    albumId: album._id,
    startedBy: opts.userId,
    status: 'queued',
    totalPhotos: 0,
    processedPhotos: 0,
    uploadedPhotos: 0,
    failedPhotos: 0,
    averageSpeed: 0,
    logs: [],
  });

  state.shouldPause = false;
  state.shouldCancel = false;
  void processJob(job);
  return job._id.toString();
}

/** Resume a paused job. */
export async function resumeJob(jobId: string): Promise<void> {
  const job = await UploadJob.findById(jobId);
  if (!job) throw new Error('Job not found');
  if (job.status !== 'paused') {
    throw new Error(`Job is in status "${job.status}", cannot resume`);
  }
  if (state.isRunning) {
    throw new Error('Another upload job is already running');
  }
  state.shouldPause = false;
  state.shouldCancel = false;
  void processJob(job);
}

/** Pause the currently running job. */
export async function pauseCurrentJob(): Promise<void> {
  if (!state.isRunning) return;
  state.shouldPause = true;
}

/** Cancel the currently running job. */
export async function cancelCurrentJob(): Promise<void> {
  if (!state.isRunning) return;
  state.shouldCancel = true;
  state.shouldPause = true;
}

/** Retry only the failed photos of a (possibly completed) job. */
export async function retryFailed(jobId: string): Promise<void> {
  const job = await UploadJob.findById(jobId);
  if (!job) throw new Error('Job not found');
  if (state.isRunning) throw new Error('Another upload job is already running');

  const failedPhotos = await Photo.find({
    albumId: job.albumId,
    status: 'failed',
  });
  if (failedPhotos.length === 0) return;

  // Reset failed photos to pending so the engine picks them up again
  await Photo.updateMany(
    { _id: { $in: failedPhotos.map((p) => p._id) } },
    { $set: { status: 'pending', error: undefined } }
  );

  job.status = 'queued';
  job.failedPhotos = 0;
  job.totalPhotos = await Photo.countDocuments({ albumId: job.albumId });
  job.processedPhotos = await Photo.countDocuments({
    albumId: job.albumId,
    status: 'uploaded',
  });
  job.uploadedPhotos = job.processedPhotos;
  await job.save();

  state.shouldPause = false;
  state.shouldCancel = false;
  void processJob(job);
}

// ─────────────────────────────────────────────────────────────────

async function appendLog(
  job: IUploadJob,
  level: 'info' | 'warn' | 'error',
  message: string
): Promise<void> {
  const entry: JobLogEntry = { ts: new Date(), level, message };
  job.logs.push(entry);
  if (job.logs.length > 500) {
    job.logs.splice(0, job.logs.length - 500);
  }
  await job.save();
  emitUploadProgress(job._id.toString(), { type: 'log', entry });
}

function emit(job: IUploadJob, payload: Record<string, unknown>): void {
  emitUploadProgress(job._id.toString(), payload);
}

async function processJob(job: IUploadJob): Promise<void> {
  if (state.isRunning) return;
  state.isRunning = true;
  state.currentJobId = job._id.toString();

  try {
    job.status = 'running';
    job.startedAt = job.startedAt ?? new Date();
    await job.save();
    emit(job, { type: 'status', status: 'running' });
    await appendLog(job, 'info', `Job ${job._id.toString()} started`);

    const album = await Album.findById(job.albumId);
    if (!album || !album.driveFolderId) {
      throw new Error('Album or Drive folder missing');
    }

    await appendLog(job, 'info', `Listing images in Drive folder ${album.driveFolderId}`);
    const driveFiles = await listImagesInFolder(album.driveFolderId);
    await appendLog(
      job,
      'info',
      `Found ${driveFiles.length} image(s) in the Drive folder`
    );

    if (driveFiles.length === 0) {
      job.status = 'completed';
      job.completedAt = new Date();
      await job.save();
      emit(job, { type: 'status', status: 'completed' });
      return;
    }

    // Upsert Photo records for each Drive file
    for (const file of driveFiles) {
      await Photo.findOneAndUpdate(
        { albumId: album._id, driveFileId: file.id },
        {
          $setOnInsert: {
            albumId: album._id,
            driveFileId: file.id,
            driveFileName: file.name,
            mimeType: file.mimeType,
            originalSize: file.size,
            status: 'pending',
          },
        },
        { upsert: true, new: true }
      );
    }

    // Refresh totals from the DB so we account for already-uploaded photos
    const allPhotos = await Photo.find({ albumId: album._id }).sort({ createdAt: 1 });
    job.totalPhotos = allPhotos.length;
    job.uploadedPhotos = allPhotos.filter((p) => p.status === 'uploaded').length;
    job.failedPhotos = allPhotos.filter((p) => p.status === 'failed').length;
    job.processedPhotos = job.uploadedPhotos + job.failedPhotos;

    album.totalPhotos = job.totalPhotos;
    album.uploadedPhotos = job.uploadedPhotos;
    album.failedPhotos = job.failedPhotos;
    await album.save();
    await job.save();

    emit(job, {
      type: 'totals',
      totalPhotos: job.totalPhotos,
      processedPhotos: job.processedPhotos,
      uploadedPhotos: job.uploadedPhotos,
      failedPhotos: job.failedPhotos,
    });

    const startTime = Date.now();
    let bytesProcessed = allPhotos
      .filter((p) => p.status === 'uploaded')
      .reduce((s, p) => s + (p.compressedSize ?? 0), 0);

    for (let i = 0; i < allPhotos.length; i++) {
      // Handle pause / cancel
      if (state.shouldCancel) {
        job.status = 'cancelled';
        job.completedAt = new Date();
        await job.save();
        emit(job, { type: 'status', status: 'cancelled' });
        await appendLog(job, 'warn', 'Job cancelled by user');
        return;
      }
      while (state.shouldPause && !state.shouldCancel) {
        if (job.status !== 'paused') {
          job.status = 'paused';
          job.pausedAt = new Date();
          await job.save();
          emit(job, { type: 'status', status: 'paused' });
          await appendLog(job, 'warn', 'Job paused by user');
        }
        await sleep(1000);
      }
      if (job.status === 'paused' && !state.shouldPause) {
        job.status = 'running';
        await job.save();
        emit(job, { type: 'status', status: 'running' });
        await appendLog(job, 'info', 'Job resumed');
      }

      const photo = allPhotos[i];
      if (photo.status === 'uploaded') {
        continue; // already done from a previous run
      }

      job.currentFileName = photo.driveFileName;
      emit(job, {
        type: 'current',
        fileName: photo.driveFileName,
        index: i + 1,
      });

      try {
        await appendLog(
          job,
          'info',
          `[${i + 1}/${allPhotos.length}] Downloading ${photo.driveFileName}`
        );
        const original = await downloadDriveFile(photo.driveFileId);

        await appendLog(job, 'info', `Compressing ${photo.driveFileName}`);
        const compressed = await compressImage(original);
        bytesProcessed += compressed.size;

        await appendLog(
          job,
          'info',
          `Uploading ${photo.driveFileName} to Cloudinary`
        );
        const cloud = await uploadImage(compressed.buffer, {
          folder: `pcmp/albums/${album._id.toString()}`,
          publicId: photo.driveFileId,
        });

        photo.cloudinaryPublicId = cloud.publicId;
        photo.cloudinaryUrl = cloud.url;
        photo.cloudinaryThumbnailUrl = cloud.thumbnailUrl;
        photo.width = compressed.width;
        photo.height = compressed.height;
        photo.compressedSize = compressed.size;
        photo.status = 'uploaded';
        photo.uploadedAt = new Date();
        photo.error = undefined;
        await photo.save();

        job.uploadedPhotos++;
        job.processedPhotos++;
      } catch (err) {
        const msg = (err as Error).message ?? 'Unknown error';
        photo.status = 'failed';
        photo.error = msg;
        await photo.save();
        job.failedPhotos++;
        job.processedPhotos++;
        await appendLog(job, 'error', `Failed ${photo.driveFileName}: ${msg}`);
      }

      // Update speed / ETA
      const elapsed = (Date.now() - startTime) / 1000;
      job.averageSpeed = bytesProcessed / Math.max(elapsed, 1);
      const remainingPhotos = job.totalPhotos - job.processedPhotos;
      const avgBytesPerPhoto =
        bytesProcessed / Math.max(job.processedPhotos, 1);
      job.etaSeconds =
        job.averageSpeed > 0
          ? Math.round((remainingPhotos * avgBytesPerPhoto) / job.averageSpeed)
          : undefined;

      await job.save();

      album.uploadedPhotos = job.uploadedPhotos;
      album.failedPhotos = job.failedPhotos;
      await album.save();

      emit(job, {
        type: 'progress',
        processedPhotos: job.processedPhotos,
        uploadedPhotos: job.uploadedPhotos,
        failedPhotos: job.failedPhotos,
        totalPhotos: job.totalPhotos,
        currentFileName: job.currentFileName,
        averageSpeed: job.averageSpeed,
        etaSeconds: job.etaSeconds,
      });
    }

    job.status = 'completed';
    job.completedAt = new Date();
    job.currentFileName = undefined;
    await job.save();
    emit(job, { type: 'status', status: 'completed' });
    await appendLog(
      job,
      'info',
      `Job complete: ${job.uploadedPhotos} uploaded, ${job.failedPhotos} failed`
    );
  } catch (err) {
    const msg = (err as Error).message ?? 'Unknown error';
    job.status = 'failed';
    job.error = msg;
    job.completedAt = new Date();
    await job.save();
    await appendLog(job, 'error', `Job failed: ${msg}`);
    emit(job, { type: 'status', status: 'failed', error: msg });
    logger.error({ err, jobId: job._id.toString() }, 'Upload job failed');
  } finally {
    state.isRunning = false;
    state.currentJobId = undefined;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
