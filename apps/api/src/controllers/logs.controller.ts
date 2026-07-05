import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Log } from '../models/Log';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { sendOk } from '../utils/ApiResponse';

export const listLogs = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt((req.query.page as string) ?? '1', 10) || 1);
  const limit = Math.min(
    200,
    Math.max(1, parseInt((req.query.limit as string) ?? '50', 10) || 50)
  );
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (req.query.action) filter.action = req.query.action;
  if (req.query.result) filter.result = req.query.result;
  if (req.query.userId && Types.ObjectId.isValid(req.query.userId as string)) {
    filter.userId = new Types.ObjectId(req.query.userId as string);
  }
  if (req.query.from || req.query.to) {
    const range: Record<string, Date> = {};
    if (req.query.from) range.$gte = new Date(req.query.from as string);
    if (req.query.to) range.$lte = new Date(req.query.to as string);
    filter.createdAt = range;
  }
  if (req.query.search) {
    const rx = new RegExp(req.query.search as string, 'i');
    filter.$or = [{ action: rx }, { ip: rx }, { userAgent: rx }];
  }

  const [logs, total] = await Promise.all([
    Log.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Log.countDocuments(filter),
  ]);

  // Hydrate user info
  const userIds = Array.from(
    new Set(logs.map((l) => l.userId?.toString()).filter((id): id is string => Boolean(id)))
  );
  const users = userIds.length
    ? await User.find({ _id: { $in: userIds } })
        .select('name email avatarUrl')
        .lean()
    : [];
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  sendOk(
    res,
    logs.map((l) => ({
      id: l._id.toString(),
      userId: l.userId ? l.userId.toString() : null,
      user: l.userId && userMap.has(l.userId.toString())
        ? {
            id: l.userId.toString(),
            name: userMap.get(l.userId.toString())!.name,
            email: userMap.get(l.userId.toString())!.email,
            avatarUrl: userMap.get(l.userId.toString())!.avatarUrl ?? null,
          }
        : null,
      action: l.action,
      targetId: l.targetId ?? null,
      result: l.result,
      ip: l.ip ?? null,
      userAgent: l.userAgent ?? null,
      meta: l.meta ?? null,
      createdAt: l.createdAt,
    })),
    { page, limit, total, pages: Math.ceil(total / limit) }
  );
});

export const distinctActions = asyncHandler(async (_req: Request, res: Response) => {
  const actions = await Log.distinct('action');
  sendOk(res, actions.sort());
});
