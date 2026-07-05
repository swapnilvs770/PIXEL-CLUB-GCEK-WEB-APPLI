import { Schema, model, Document, Types } from 'mongoose';

export type RequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'photography_completed'
  | 'completed';

export const REQUEST_STATUSES: RequestStatus[] = [
  'pending',
  'approved',
  'rejected',
  'photography_completed',
  'completed',
];

export interface IPhotographyRequest extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description?: string;
  eventDate: Date;
  venue: string;
  expectedAttendees?: number;
  contactPhone?: string;
  notes?: string;
  status: RequestStatus;
  albumId?: Types.ObjectId;
  rejectionReason?: string;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  rejectedBy?: Types.ObjectId;
  rejectedAt?: Date;
  completedBy?: Types.ObjectId;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SafeRequestJSON {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  } | null;
  title: string;
  description: string | null;
  eventDate: Date;
  venue: string;
  expectedAttendees: number | null;
  contactPhone: string | null;
  notes: string | null;
  status: RequestStatus;
  albumId: string | null;
  rejectionReason: string | null;
  approvedBy: string | null;
  approvedAt: Date | null;
  rejectedBy: string | null;
  rejectedAt: Date | null;
  completedBy: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const PhotographyRequestSchema = new Schema<IPhotographyRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 2000 },
    eventDate: { type: Date, required: true, index: true },
    venue: { type: String, required: true, trim: true, maxlength: 200 },
    expectedAttendees: { type: Number, min: 0 },
    contactPhone: { type: String, trim: true, maxlength: 30 },
    notes: { type: String, maxlength: 1000 },
    status: {
      type: String,
      enum: REQUEST_STATUSES,
      default: 'pending',
      required: true,
      index: true,
    },
    albumId: { type: Schema.Types.ObjectId, ref: 'Album' },
    rejectionReason: { type: String, maxlength: 500 },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: { type: Date },
    completedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

PhotographyRequestSchema.index({ status: 1, eventDate: -1 });
PhotographyRequestSchema.index({ userId: 1, createdAt: -1 });

export const PhotographyRequest = model<IPhotographyRequest>(
  'PhotographyRequest',
  PhotographyRequestSchema
);
