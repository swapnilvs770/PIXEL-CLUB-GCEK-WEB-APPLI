import { Schema, model, Document, Types } from 'mongoose';

export type PhotoStatus = 'pending' | 'compressed' | 'uploaded' | 'failed';

export const PHOTO_STATUSES: PhotoStatus[] = ['pending', 'compressed', 'uploaded', 'failed'];

export interface IPhoto extends Document {
  _id: Types.ObjectId;
  albumId: Types.ObjectId;
  driveFileId: string;
  driveFileName: string;
  mimeType?: string;
  width?: number;
  height?: number;
  originalSize?: number;
  compressedSize?: number;
  cloudinaryPublicId?: string;
  cloudinaryUrl?: string;
  cloudinaryThumbnailUrl?: string;
  status: PhotoStatus;
  error?: string;
  uploadedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PhotoSchema = new Schema<IPhoto>(
  {
    albumId: {
      type: Schema.Types.ObjectId,
      ref: 'Album',
      required: true,
      index: true,
    },
    driveFileId: { type: String, required: true, index: true },
    driveFileName: { type: String, required: true },
    mimeType: { type: String },
    width: { type: Number },
    height: { type: Number },
    originalSize: { type: Number },
    compressedSize: { type: Number },
    cloudinaryPublicId: { type: String, index: true },
    cloudinaryUrl: { type: String },
    cloudinaryThumbnailUrl: { type: String },
    status: {
      type: String,
      enum: PHOTO_STATUSES,
      default: 'pending',
      required: true,
      index: true,
    },
    error: { type: String },
    uploadedAt: { type: Date },
  },
  { timestamps: true }
);

PhotoSchema.index({ albumId: 1, driveFileId: 1 }, { unique: true });
PhotoSchema.index({ albumId: 1, status: 1 });
PhotoSchema.index({ albumId: 1, createdAt: -1 });

export const Photo = model<IPhoto>('Photo', PhotoSchema);
