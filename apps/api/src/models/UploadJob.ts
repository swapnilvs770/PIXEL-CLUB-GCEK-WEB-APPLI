import { Schema, model, Document, Types } from 'mongoose';

export type UploadJobStatus =
  | 'queued'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export const UPLOAD_JOB_STATUSES: UploadJobStatus[] = [
  'queued',
  'running',
  'paused',
  'completed',
  'failed',
  'cancelled',
];

export interface JobLogEntry {
  ts: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface IUploadJob extends Document {
  _id: Types.ObjectId;
  albumId: Types.ObjectId;
  status: UploadJobStatus;
  startedBy: Types.ObjectId;
  startedAt?: Date;
  completedAt?: Date;
  pausedAt?: Date;
  totalPhotos: number;
  processedPhotos: number;
  uploadedPhotos: number;
  failedPhotos: number;
  currentFileName?: string;
  averageSpeed: number; // bytes per second
  etaSeconds?: number;
  logs: JobLogEntry[];
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UploadJobSchema = new Schema<IUploadJob>(
  {
    albumId: {
      type: Schema.Types.ObjectId,
      ref: 'Album',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: UPLOAD_JOB_STATUSES,
      default: 'queued',
      required: true,
      index: true,
    },
    startedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    pausedAt: { type: Date },
    totalPhotos: { type: Number, default: 0 },
    processedPhotos: { type: Number, default: 0 },
    uploadedPhotos: { type: Number, default: 0 },
    failedPhotos: { type: Number, default: 0 },
    currentFileName: { type: String },
    averageSpeed: { type: Number, default: 0 },
    etaSeconds: { type: Number },
    logs: {
      type: [
        new Schema<JobLogEntry>(
          {
            ts: { type: Date, required: true },
            level: { type: String, enum: ['info', 'warn', 'error'], required: true },
            message: { type: String, required: true },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    error: { type: String },
  },
  { timestamps: true }
);

UploadJobSchema.index({ status: 1, createdAt: -1 });
UploadJobSchema.index({ albumId: 1, createdAt: -1 });

export const UploadJob = model<IUploadJob>('UploadJob', UploadJobSchema);
