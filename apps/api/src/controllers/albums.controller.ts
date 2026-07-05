import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Album, ALBUM_STATUSES } from '../models/Album';
import { Photo } from '../models/Photo';
import { UploadJob } from '../models/UploadJob';
import { asyncHandler } from '../utils/asyncHandler';
import { sendOk, sendCreated, sendNoContent } from '../utils/ApiResponse';
import { AppError } from '../utils/AppError';
import { extractDriveFolderId } from '../services/drive.service';
import {
  startImportJob,
  pauseCurrentJob,
  resumeJob,
  cancelCurrentJob,
  retryFailed,
  isEngineRunning,
  getCurrentJobId,
} from '../services/uploadEngine.service';
import { logAction } from '../services/log.service';
import { notifyUser } from '../services/notifications.service';
import { deleteImage } from '../services/cloudinary.service';
import { getDriveFileWebViewLink } from '../services/drive.service';

function toObjectId(id: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError({ message: 'Invalid id', statusCode: 400, code: 'INVALID_ID' });
  }
  return new Types.ObjectId(id);
}

function albumSafe(a: any) {
  return {
    id: a._id.toString(),
    title: a.title,
    description: a.description ?? null,
    year: a.year,
    coverPhotoId: a.coverPhotoId ? a.coverPhotoId.toString() : null,
    status: a.status,
    driveFolderId: a.driveFolderId ?? null,
    driveFolderUrl: a.driveFolderUrl ?? null,
    eventDate: a.eventDate ?? null,
    totalPhotos: a.totalPhotos,
    uploadedPhotos: a.uploadedPhotos,
    failedPhotos: a.failedPhotos,
    tags: a.tags ?? [],
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    publishedAt: a.publishedAt ?? null,
    createdBy: a.createdBy ? a.createdBy.toString() : null,
    publishedBy: a.publishedBy ? a.publishedBy.toString() : null,
  };
}

function photoSafe(p: any) {
  return {
    id: p._id.toString(),
    albumId: p.albumId.toString(),
    driveFileId: p.driveFileId,
    driveFileName: p.driveFileName,
    mimeType: p.mimeType ?? null,
    width: p.width ?? null,
    height: p.height ?? null,
    originalSize: p.originalSize ?? null,
    compressedSize: p.compressedSize ?? null,
    cloudinaryUrl: p.cloudinaryUrl ?? null,
    cloudinaryThumbnailUrl: p.cloudinaryThumbnailUrl ?? null,
    status: p.status,
    error: p.error ?? null,
    uploadedAt: p.uploadedAt ?? null,
    originalDownloadUrl: getDriveFileWebViewLink(p.driveFileId),
  };
}

// ─────────────────────────────────────────────────────────────────
// Public (published only) endpoints — visible to all approved users
// ─────────────────────────────────────────────────────────────────

export const listPublishedAlbums = asyncHandler(async (req: Request, res: Response) => {
  const year = req.query.year ? Number(req.query.year) : undefined;
  const search = req.query.search as string | undefined;
  const page = Math.max(1, parseInt((req.query.page as string) ?? '1', 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt((req.query.limit as string) ?? '24', 10) || 24)
  );
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { status: 'published' };
  if (year) filter.year = year;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];
  }

  const [albums, total] = await Promise.all([
    Album.find(filter).sort({ year: -1, publishedAt: -1 }).skip(skip).limit(limit).lean(),
    Album.countDocuments(filter),
  ]);

  sendOk(
    res,
    albums.map(albumSafe),
    { page, limit, total, pages: Math.ceil(total / limit) }
  );
});

export const listYears = asyncHandler(async (_req: Request, res: Response) => {
  const years = await Album.distinct('year', { status: 'published' });
  sendOk(res, years.sort((a, b) => b - a));
});

export const getPublishedAlbum = asyncHandler(async (req: Request, res: Response) => {
  const album = await Album.findOne({
    _id: toObjectId(req.params.id),
    status: 'published',
  }).lean();
  if (!album) {
    throw new AppError({ message: 'Album not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  sendOk(res, albumSafe(album));
});

export const getPublishedAlbumPhotos = asyncHandler(async (req: Request, res: Response) => {
  const albumId = toObjectId(req.params.id);
  const album = await Album.findOne({ _id: albumId, status: 'published' }).lean();
  if (!album) {
    throw new AppError({ message: 'Album not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  const page = Math.max(1, parseInt((req.query.page as string) ?? '1', 10) || 1);
  const limit = Math.min(
    200,
    Math.max(1, parseInt((req.query.limit as string) ?? '60', 10) || 60)
  );
  const skip = (page - 1) * limit;

  const [photos, total] = await Promise.all([
    Photo.find({ albumId, status: 'uploaded' })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Photo.countDocuments({ albumId, status: 'uploaded' }),
  ]);

  sendOk(
    res,
    photos.map(photoSafe),
    { page, limit, total, pages: Math.ceil(total / limit) }
  );
});

// ─────────────────────────────────────────────────────────────────
// Admin endpoints
// ─────────────────────────────────────────────────────────────────

export const adminListAlbums = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const year = req.query.year ? Number(req.query.year) : undefined;
  const search = req.query.search as string | undefined;
  const page = Math.max(1, parseInt((req.query.page as string) ?? '1', 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt((req.query.limit as string) ?? '20', 10) || 20)
  );
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (status && (ALBUM_STATUSES as string[]).includes(status)) filter.status = status;
  if (year) filter.year = year;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];
  }

  const [albums, total] = await Promise.all([
    Album.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Album.countDocuments(filter),
  ]);

  sendOk(
    res,
    albums.map(albumSafe),
    { page, limit, total, pages: Math.ceil(total / limit) }
  );
});

export const adminGetAlbum = asyncHandler(async (req: Request, res: Response) => {
  const album = await Album.findById(toObjectId(req.params.id)).lean();
  if (!album) {
    throw new AppError({ message: 'Album not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  sendOk(res, albumSafe(album));
});

export const adminCreateAlbum = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as {
    title: string;
    description?: string;
    year: number;
    driveFolderUrl: string;
    eventDate?: Date;
    tags?: string | string[];
  };

  const folderId = extractDriveFolderId(body.driveFolderUrl);

  const tags = Array.isArray(body.tags)
    ? body.tags
    : typeof body.tags === 'string'
      ? body.tags.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

  const album = await Album.create({
    title: body.title,
    description: body.description,
    year: body.year,
    driveFolderId: folderId,
    driveFolderUrl: body.driveFolderUrl,
    eventDate: body.eventDate,
    tags,
    createdBy: toObjectId(req.userId!),
    status: 'draft',
    totalPhotos: 0,
    uploadedPhotos: 0,
    failedPhotos: 0,
  });

  await logAction(
    {
      userId: req.userId,
      action: 'album.create',
      targetId: album._id.toString(),
      result: 'success',
    },
    req
  );

  sendCreated(res, albumSafe(album.toObject()));
});

export const adminUpdateAlbum = asyncHandler(async (req: Request, res: Response) => {
  const album = await Album.findById(toObjectId(req.params.id));
  if (!album) {
    throw new AppError({ message: 'Album not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  Object.assign(album, req.body);
  await album.save();

  await logAction(
    {
      userId: req.userId,
      action: 'album.update',
      targetId: album._id.toString(),
      result: 'success',
    },
    req
  );

  sendOk(res, albumSafe(album.toObject()));
});

export const adminDeleteAlbum = asyncHandler(async (req: Request, res: Response) => {
  const album = await Album.findById(toObjectId(req.params.id));
  if (!album) {
    throw new AppError({ message: 'Album not found', statusCode: 404, code: 'NOT_FOUND' });
  }

  // Best-effort cleanup of Cloudinary assets
  const photos = await Photo.find({ albumId: album._id });
  for (const p of photos) {
    if (p.cloudinaryPublicId) {
      try {
        await deleteImage(p.cloudinaryPublicId);
      } catch {
        /* ignore */
      }
    }
  }

  await Photo.deleteMany({ albumId: album._id });
  await UploadJob.deleteMany({ albumId: album._id });
  await album.deleteOne();

  await logAction(
    {
      userId: req.userId,
      action: 'album.delete',
      targetId: req.params.id,
      result: 'success',
      meta: { title: album.title, photosDeleted: photos.length },
    },
    req
  );

  sendNoContent(res);
});

export const adminStartImport = asyncHandler(async (req: Request, res: Response) => {
  const album = await Album.findById(toObjectId(req.params.id));
  if (!album) {
    throw new AppError({ message: 'Album not found', statusCode: 404, code: 'NOT_FOUND' });
  }

  const jobId = await startImportJob({
    albumId: album._id.toString(),
    userId: req.userId!,
  });

  await logAction(
    {
      userId: req.userId,
      action: 'album.import_start',
      targetId: album._id.toString(),
      result: 'success',
      meta: { jobId },
    },
    req
  );

  sendOk(res, { jobId, engineRunning: isEngineRunning(), currentJobId: getCurrentJobId() });
});

export const adminPublishAlbum = asyncHandler(async (req: Request, res: Response) => {
  const album = await Album.findById(toObjectId(req.params.id));
  if (!album) {
    throw new AppError({ message: 'Album not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  if (album.status === 'published') {
    return sendOk(res, albumSafe(album.toObject()));
  }
  if (album.totalPhotos === 0 || album.uploadedPhotos === 0) {
    throw new AppError({
      message: 'Cannot publish an album with no uploaded photos',
      statusCode: 400,
      code: 'NO_PHOTOS',
    });
  }

  album.status = 'published';
  album.publishedBy = toObjectId(req.userId!);
  album.publishedAt = new Date();
  await album.save();

  await logAction(
    {
      userId: req.userId,
      action: 'album.publish',
      targetId: album._id.toString(),
      result: 'success',
    },
    req
  );

  // Fan-out notification to all approved users
  const { User } = await import('../models/User');
  const recipients = await User.find({ status: 'approved' })
    .select('_id')
    .lean();
  await Promise.all(
    recipients.map((u) =>
      notifyUser({
        userId: u._id.toString(),
        type: 'album_published',
        title: `New album published: ${album.title}`,
        message: `${album.uploadedPhotos} photo${album.uploadedPhotos === 1 ? '' : 's'} from ${album.year} are now live in the gallery.`,
        link: `/gallery/${album._id.toString()}`,
      })
    )
  );

  sendOk(res, albumSafe(album.toObject()));
});

export const adminUnpublishAlbum = asyncHandler(async (req: Request, res: Response) => {
  const album = await Album.findById(toObjectId(req.params.id));
  if (!album) {
    throw new AppError({ message: 'Album not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  album.status = 'archived';
  album.publishedAt = undefined;
  album.publishedBy = undefined;
  await album.save();

  await logAction(
    {
      userId: req.userId,
      action: 'album.unpublish',
      targetId: album._id.toString(),
      result: 'success',
    },
    req
  );

  sendOk(res, albumSafe(album.toObject()));
});

// ─────────────────────────────────────────────────────────────────
// Upload job endpoints (admin)
// ─────────────────────────────────────────────────────────────────

export const listJobs = asyncHandler(async (_req: Request, res: Response) => {
  const jobs = await UploadJob.find().sort({ createdAt: -1 }).limit(100).lean();
  sendOk(res, jobs);
});

export const getJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await UploadJob.findById(toObjectId(req.params.id)).lean();
  if (!job) {
    throw new AppError({ message: 'Job not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  sendOk(res, job);
});

export const pauseJob = asyncHandler(async (_req: Request, res: Response) => {
  await pauseCurrentJob();
  sendOk(res, { engineRunning: isEngineRunning(), currentJobId: getCurrentJobId() });
});

export const resumeJobEndpoint = asyncHandler(async (req: Request, res: Response) => {
  await resumeJob(req.params.id);
  sendOk(res, { engineRunning: isEngineRunning(), currentJobId: getCurrentJobId() });
});

export const cancelJob = asyncHandler(async (_req: Request, res: Response) => {
  await cancelCurrentJob();
  sendOk(res, { engineRunning: isEngineRunning(), currentJobId: getCurrentJobId() });
});

export const retryJob = asyncHandler(async (req: Request, res: Response) => {
  await retryFailed(req.params.id);
  sendOk(res, { engineRunning: isEngineRunning(), currentJobId: getCurrentJobId() });
});
