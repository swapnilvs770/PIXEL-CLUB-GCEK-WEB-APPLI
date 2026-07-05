import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Notification } from '../models/Notification';
import { asyncHandler } from '../utils/asyncHandler';
import { sendOk, sendNoContent } from '../utils/ApiResponse';
import { AppError } from '../utils/AppError';

function toObjectId(id: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError({ message: 'Invalid id', statusCode: 400, code: 'INVALID_ID' });
  }
  return new Types.ObjectId(id);
}

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt((req.query.page as string) ?? '1', 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt((req.query.limit as string) ?? '20', 10) || 20)
  );
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { userId: toObjectId(req.userId!) };
  if (req.query.unreadOnly === 'true') {
    filter.read = false;
  }

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId: filter.userId, read: false }),
  ]);

  sendOk(
    res,
    items.map((n) => ({
      id: n._id.toString(),
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link ?? null,
      read: n.read,
      readAt: n.readAt ?? null,
      createdAt: n.createdAt,
    })),
    { page, limit, total, pages: Math.ceil(total / limit), unreadCount }
  );
});

export const unreadCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await Notification.countDocuments({
    userId: toObjectId(req.userId!),
    read: false,
  });
  sendOk(res, { count });
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const n = await Notification.findOne({
    _id: toObjectId(req.params.id),
    userId: toObjectId(req.userId!),
  });
  if (!n) {
    throw new AppError({ message: 'Notification not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  if (!n.read) {
    n.read = true;
    n.readAt = new Date();
    await n.save();
  }
  sendOk(res, { id: n._id.toString(), read: true });
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  const result = await Notification.updateMany(
    { userId: toObjectId(req.userId!), read: false },
    { $set: { read: true, readAt: new Date() } }
  );
  sendOk(res, { modified: result.modifiedCount ?? 0 });
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const n = await Notification.findOneAndDelete({
    _id: toObjectId(req.params.id),
    userId: toObjectId(req.userId!),
  });
  if (!n) {
    throw new AppError({ message: 'Notification not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  sendNoContent(res);
});
