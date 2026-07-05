import { Schema, model, Document, Types } from 'mongoose';

export type AlbumStatus = 'draft' | 'published' | 'archived';

export const ALBUM_STATUSES: AlbumStatus[] = ['draft', 'published', 'archived'];

export interface IAlbum extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  year: number;
  coverPhotoId?: Types.ObjectId;
  status: AlbumStatus;
  driveFolderId?: string;
  driveFolderUrl?: string;
  eventDate?: Date;
  totalPhotos: number;
  uploadedPhotos: number;
  failedPhotos: number;
  createdBy: Types.ObjectId;
  publishedBy?: Types.ObjectId;
  publishedAt?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AlbumSchema = new Schema<IAlbum>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 2000 },
    year: { type: Number, required: true, index: true },
    coverPhotoId: { type: Schema.Types.ObjectId, ref: 'Photo' },
    status: {
      type: String,
      enum: ALBUM_STATUSES,
      default: 'draft',
      required: true,
      index: true,
    },
    driveFolderId: { type: String, index: true },
    driveFolderUrl: { type: String },
    eventDate: { type: Date },
    totalPhotos: { type: Number, default: 0 },
    uploadedPhotos: { type: Number, default: 0 },
    failedPhotos: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    publishedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    publishedAt: { type: Date },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

AlbumSchema.index({ status: 1, year: -1 });
AlbumSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Album = model<IAlbum>('Album', AlbumSchema);
