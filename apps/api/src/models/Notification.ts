import { Schema, model, Document, Types } from 'mongoose';

export type NotificationType =
  | 'account_approved'
  | 'account_blocked'
  | 'request_approved'
  | 'request_rejected'
  | 'request_completed'
  | 'album_published';

export const NOTIFICATION_TYPES: NotificationType[] = [
  'account_approved',
  'account_blocked',
  'request_approved',
  'request_rejected',
  'request_completed',
  'album_published',
];

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  readAt?: Date;
  emailSent: boolean;
  emailError?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
      index: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 1000 },
    link: { type: String, maxlength: 500 },
    read: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    emailSent: { type: Boolean, default: false },
    emailError: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification = model<INotification>(
  'Notification',
  NotificationSchema
);
