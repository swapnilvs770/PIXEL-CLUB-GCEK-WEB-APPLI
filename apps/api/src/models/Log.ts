import { Schema, model, Document, Types } from 'mongoose';

export type LogResult = 'success' | 'failure';

export interface ILog extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  action: string;
  targetId?: string;
  result: LogResult;
  ip?: string;
  userAgent?: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

const LogSchema = new Schema<ILog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true, index: true },
    targetId: { type: String, index: true },
    result: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
      required: true,
      index: true,
    },
    ip: { type: String },
    userAgent: { type: String },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

LogSchema.index({ createdAt: -1 });
LogSchema.index({ action: 1, createdAt: -1 });

export const Log = model<ILog>('Log', LogSchema);
