import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { PhotographyRequest, SafeRequestJSON } from '../models/PhotographyRequest';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendOk, sendCreated } from '../utils/ApiResponse';
import { logAction } from '../services/log.service';
import { notifyUser } from '../services/notifications.service';

function toObjectId(id: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError({
      message: 'Invalid id',
      statusCode: 400,
      code: 'INVALID_ID',
    });
  }
  return new Types.ObjectId(id);
}

function buildSafe(doc: any): SafeRequestJSON {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id.toString(),
    userId: o.userId.toString(),
    user: o.userId && typeof o.userId === 'object' && o.userId.name
      ? {
          id: o.userId._id?.toString() ?? o.userId.toString(),
          name: o.userId.name,
          email: o.userId.email,
          avatarUrl: o.userId.avatarUrl ?? null,
        }
      : null,
    title: o.title,
    description: o.description ?? null,
    eventDate: o.eventDate,
    venue: o.venue,
    expectedAttendees: o.expectedAttendees ?? null,
    contactPhone: o.contactPhone ?? null,
    notes: o.notes ?? null,
    status: o.status,
    albumId: o.albumId ? o.albumId.toString() : null,
    rejectionReason: o.rejectionReason ?? null,
    approvedBy: o.approvedBy ? o.approvedBy.toString() : null,
    approvedAt: o.approvedAt ?? null,
    rejectedBy: o.rejectedBy ? o.rejectedBy.toString() : null,
    rejectedAt: o.rejectedAt ?? null,
    completedBy: o.completedBy ? o.completedBy.toString() : null,
    completedAt: o.completedAt ?? null,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

// ─────────────────────────────────────────────────────────────────
// User-facing endpoints
// ─────────────────────────────────────────────────────────────────

export const createRequest = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as {
    title: string;
    description?: string;
    eventDate: Date;
    venue: string;
    expectedAttendees?: number;
    contactPhone?: string;
    notes?: string;
  };

  const request = await PhotographyRequest.create({
    userId: toObjectId(req.userId!),
    title: body.title,
    description: body.description || undefined,
    eventDate: body.eventDate,
    venue: body.venue,
    expectedAttendees: body.expectedAttendees,
    contactPhone: body.contactPhone || undefined,
    notes: body.notes || undefined,
    status: 'pending',
  });

  await logAction(
    {
      userId: req.userId,
      action: 'request.create',
      targetId: request._id.toString(),
      result: 'success',
    },
    req
  );

  sendCreated(res, buildSafe(request));
});

export const listMyRequests = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt((req.query.page as string) ?? '1', 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt((req.query.limit as string) ?? '20', 10) || 20)
  );
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    PhotographyRequest.find({ userId: toObjectId(req.userId!) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    PhotographyRequest.countDocuments({ userId: toObjectId(req.userId!) }),
  ]);

  sendOk(
    res,
    items.map(buildSafe),
    { page, limit, total, pages: Math.ceil(total / limit) }
  );
});

export const getMyRequest = asyncHandler(async (req: Request, res: Response) => {
  const r = await PhotographyRequest.findOne({
    _id: toObjectId(req.params.id),
    userId: toObjectId(req.userId!),
  });
  if (!r) {
    throw new AppError({ message: 'Request not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  sendOk(res, buildSafe(r));
});

export const updateMyRequest = asyncHandler(async (req: Request, res: Response) => {
  const r = await PhotographyRequest.findOne({
    _id: toObjectId(req.params.id),
    userId: toObjectId(req.userId!),
  });
  if (!r) {
    throw new AppError({ message: 'Request not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  if (r.status !== 'pending') {
    throw new AppError({
      message: 'Only pending requests can be edited',
      statusCode: 400,
      code: 'NOT_EDITABLE',
    });
  }

  const updates = req.body as Partial<{
    title: string;
    description: string;
    eventDate: Date;
    venue: string;
    expectedAttendees: number;
    contactPhone: string;
    notes: string;
  }>;

  Object.assign(r, updates);
  await r.save();

  await logAction(
    {
      userId: req.userId,
      action: 'request.update',
      targetId: r._id.toString(),
      result: 'success',
    },
    req
  );

  sendOk(res, buildSafe(r));
});

export const deleteMyRequest = asyncHandler(async (req: Request, res: Response) => {
  const r = await PhotographyRequest.findOne({
    _id: toObjectId(req.params.id),
    userId: toObjectId(req.userId!),
  });
  if (!r) {
    throw new AppError({ message: 'Request not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  if (r.status !== 'pending') {
    throw new AppError({
      message: 'Only pending requests can be withdrawn',
      statusCode: 400,
      code: 'NOT_WITHDRAWABLE',
    });
  }
  await r.deleteOne();

  await logAction(
    {
      userId: req.userId,
      action: 'request.withdraw',
      targetId: r._id.toString(),
      result: 'success',
    },
    req
  );

  sendOk(res, { ok: true });
});

// ─────────────────────────────────────────────────────────────────
// Admin endpoints
// ─────────────────────────────────────────────────────────────────

export const listAllRequests = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const userId = req.query.userId as string | undefined;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (userId && Types.ObjectId.isValid(userId)) {
    filter.userId = new Types.ObjectId(userId);
  }

  const page = Math.max(1, parseInt((req.query.page as string) ?? '1', 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt((req.query.limit as string) ?? '20', 10) || 20)
  );
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    PhotographyRequest.find(filter)
      .populate('userId', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    PhotographyRequest.countDocuments(filter),
  ]);

  sendOk(
    res,
    items.map(buildSafe),
    { page, limit, total, pages: Math.ceil(total / limit) }
  );
});

export const getAnyRequest = asyncHandler(async (req: Request, res: Response) => {
  const r = await PhotographyRequest.findById(toObjectId(req.params.id)).populate(
    'userId',
    'name email avatarUrl'
  );
  if (!r) {
    throw new AppError({ message: 'Request not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  sendOk(res, buildSafe(r));
});

export const approveRequest = asyncHandler(async (req: Request, res: Response) => {
  const r = await PhotographyRequest.findById(toObjectId(req.params.id));
  if (!r) {
    throw new AppError({ message: 'Request not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  if (r.status !== 'pending') {
    throw new AppError({
      message: `Cannot approve a request in status "${r.status}"`,
      statusCode: 400,
      code: 'INVALID_TRANSITION',
    });
  }
  r.status = 'approved';
  r.approvedBy = toObjectId(req.userId!);
  r.approvedAt = new Date();
  r.rejectionReason = undefined;
  await r.save();

  await logAction(
    {
      userId: req.userId,
      action: 'request.approve',
      targetId: r._id.toString(),
      result: 'success',
    },
    req
  );

  await notifyUser({
    userId: r.userId.toString(),
    type: 'request_approved',
    title: 'Photography request approved',
    message: `Your photography request "${r.title}" has been approved. The team will be in touch with details.`,
    link: `/requests/${r._id.toString()}`,
  });

  sendOk(res, buildSafe(r));
});

export const rejectRequest = asyncHandler(async (req: Request, res: Response) => {
  const r = await PhotographyRequest.findById(toObjectId(req.params.id));
  if (!r) {
    throw new AppError({ message: 'Request not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  if (r.status !== 'pending') {
    throw new AppError({
      message: `Cannot reject a request in status "${r.status}"`,
      statusCode: 400,
      code: 'INVALID_TRANSITION',
    });
  }
  const { reason } = req.body as { reason: string };

  r.status = 'rejected';
  r.rejectedBy = toObjectId(req.userId!);
  r.rejectedAt = new Date();
  r.rejectionReason = reason;
  await r.save();

  await logAction(
    {
      userId: req.userId,
      action: 'request.reject',
      targetId: r._id.toString(),
      result: 'success',
      meta: { reason },
    },
    req
  );

  await notifyUser({
    userId: r.userId.toString(),
    type: 'request_rejected',
    title: 'Photography request rejected',
    message: `Your photography request "${r.title}" was rejected. Reason: ${reason}`,
    link: `/requests/${r._id.toString()}`,
  });

  sendOk(res, buildSafe(r));
});

export const markPhotographyCompleted = asyncHandler(async (req: Request, res: Response) => {
  const r = await PhotographyRequest.findById(toObjectId(req.params.id));
  if (!r) {
    throw new AppError({ message: 'Request not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  if (r.status !== 'approved') {
    throw new AppError({
      message: 'Only approved requests can be marked as photography-completed',
      statusCode: 400,
      code: 'INVALID_TRANSITION',
    });
  }
  r.status = 'photography_completed';
  await r.save();

  await logAction(
    {
      userId: req.userId,
      action: 'request.photography_completed',
      targetId: r._id.toString(),
      result: 'success',
    },
    req
  );

  sendOk(res, buildSafe(r));
});

export const linkAlbum = asyncHandler(async (req: Request, res: Response) => {
  const r = await PhotographyRequest.findById(toObjectId(req.params.id));
  if (!r) {
    throw new AppError({ message: 'Request not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  if (r.status !== 'photography_completed' && r.status !== 'approved') {
    throw new AppError({
      message: 'Only photography-completed (or approved) requests can be linked to an album',
      statusCode: 400,
      code: 'INVALID_TRANSITION',
    });
  }
  const { albumId } = req.body as { albumId: string };

  r.albumId = toObjectId(albumId);
  await r.save();

  await logAction(
    {
      userId: req.userId,
      action: 'request.link_album',
      targetId: r._id.toString(),
      result: 'success',
      meta: { albumId },
    },
    req
  );

  sendOk(res, buildSafe(r));
});

export const completeRequest = asyncHandler(async (req: Request, res: Response) => {
  const r = await PhotographyRequest.findById(toObjectId(req.params.id));
  if (!r) {
    throw new AppError({ message: 'Request not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  if (r.status !== 'photography_completed') {
    throw new AppError({
      message: 'Request must be marked photography-completed first',
      statusCode: 400,
      code: 'INVALID_TRANSITION',
    });
  }
  if (!r.albumId) {
    throw new AppError({
      message: 'Link an album to this request before marking it complete',
      statusCode: 400,
      code: 'NO_ALBUM',
    });
  }
  r.status = 'completed';
  r.completedBy = toObjectId(req.userId!);
  r.completedAt = new Date();
  await r.save();

  await logAction(
    {
      userId: req.userId,
      action: 'request.complete',
      targetId: r._id.toString(),
      result: 'success',
    },
    req
  );

  await notifyUser({
    userId: r.userId.toString(),
    type: 'request_completed',
    title: 'Photography request completed',
    message: `Your request "${r.title}" is now complete. The album is live in the gallery.`,
    link: `/gallery`,
  });

  sendOk(res, buildSafe(r));
});

/** Convenience: confirm a user exists (used by some admin flows) */
export async function ensureUserExists(userId: string): Promise<void> {
  const exists = await User.exists({ _id: toObjectId(userId) });
  if (!exists) {
    throw new AppError({ message: 'User not found', statusCode: 404, code: 'USER_NOT_FOUND' });
  }
}
