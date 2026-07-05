import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { sendOk } from '../utils/ApiResponse';
import { AppError } from '../utils/AppError';
import { logAction } from '../services/log.service';

function toObjectId(id: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError({
      message: 'Invalid user id',
      statusCode: 400,
      code: 'INVALID_ID',
    });
  }
  return new Types.ObjectId(id);
}

function toSafe(user: { _id: Types.ObjectId; email: string; name: string; avatarUrl?: string | null; role: 'user' | 'admin'; status: 'pending' | 'approved' | 'blocked'; createdAt: Date; lastLoginAt?: Date | null }) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl ?? null,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt ?? null,
  };
}

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const filter: Record<string, unknown> = {};
  if (status === 'pending' || status === 'approved' || status === 'blocked') {
    filter.status = status;
  }

  const page = Math.max(1, parseInt((req.query.page as string) ?? '1', 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt((req.query.limit as string) ?? '20', 10) || 20)
  );
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  sendOk(
    res,
    users.map((u) =>
      toSafe({
        _id: u._id,
        email: u.email,
        name: u.name,
        avatarUrl: u.avatarUrl,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt,
      })
    ),
    { page, limit, total, pages: Math.ceil(total / limit) }
  );
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(toObjectId(req.params.id));
  if (!user) {
    throw new AppError({
      message: 'User not found',
      statusCode: 404,
      code: 'USER_NOT_FOUND',
    });
  }
  sendOk(res, user.toSafeJSON());
});

export const approveUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(toObjectId(req.params.id));
  if (!user) {
    throw new AppError({
      message: 'User not found',
      statusCode: 404,
      code: 'USER_NOT_FOUND',
    });
  }
  if (user.status === 'blocked') {
    throw new AppError({
      message: 'Cannot approve a blocked user. Unblock them first.',
      statusCode: 400,
      code: 'BLOCKED_USER',
    });
  }
  user.status = 'approved';
  user.approvedAt = new Date();
  user.approvedBy = new Types.ObjectId(req.userId!);
  await user.save();

  await logAction(
    {
      userId: req.userId,
      action: 'user.approve',
      targetId: user._id.toString(),
      result: 'success',
    },
    req
  );

  sendOk(res, user.toSafeJSON());
});

export const blockUser = asyncHandler(async (req: Request, res: Response) => {
  const targetId = toObjectId(req.params.id);
  if (targetId.toString() === req.userId) {
    throw new AppError({
      message: 'You cannot block yourself',
      statusCode: 400,
      code: 'SELF_BLOCK',
    });
  }
  const user = await User.findById(targetId);
  if (!user) {
    throw new AppError({
      message: 'User not found',
      statusCode: 404,
      code: 'USER_NOT_FOUND',
    });
  }
  user.status = 'blocked';
  user.blockedAt = new Date();
  user.blockedBy = new Types.ObjectId(req.userId!);
  await user.save();

  await logAction(
    {
      userId: req.userId,
      action: 'user.block',
      targetId: user._id.toString(),
      result: 'success',
    },
    req
  );

  sendOk(res, user.toSafeJSON());
});

export const unblockUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(toObjectId(req.params.id));
  if (!user) {
    throw new AppError({
      message: 'User not found',
      statusCode: 404,
      code: 'USER_NOT_FOUND',
    });
  }
  // Unblocking auto-approves so the user can sign in again.
  user.status = 'approved';
  user.blockedAt = undefined;
  user.blockedBy = undefined;
  if (!user.approvedAt) {
    user.approvedAt = new Date();
    user.approvedBy = new Types.ObjectId(req.userId!);
  }
  await user.save();

  await logAction(
    {
      userId: req.userId,
      action: 'user.unblock',
      targetId: user._id.toString(),
      result: 'success',
    },
    req
  );

  sendOk(res, user.toSafeJSON());
});

export const promoteToAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(toObjectId(req.params.id));
    if (!user) {
      throw new AppError({
        message: 'User not found',
        statusCode: 404,
        code: 'USER_NOT_FOUND',
      });
    }
    user.role = 'admin';
    // Promotion implies approval.
    user.status = 'approved';
    if (!user.approvedAt) {
      user.approvedAt = new Date();
      user.approvedBy = new Types.ObjectId(req.userId!);
    }
    await user.save();

    await logAction(
      {
        userId: req.userId,
        action: 'user.promote',
        targetId: user._id.toString(),
        result: 'success',
      },
      req
    );

    sendOk(res, user.toSafeJSON());
  }
);

export const demoteToUser = asyncHandler(async (req: Request, res: Response) => {
  const targetId = toObjectId(req.params.id);
  if (targetId.toString() === req.userId) {
    throw new AppError({
      message: 'You cannot demote yourself',
      statusCode: 400,
      code: 'SELF_DEMOTE',
    });
  }
  const user = await User.findById(targetId);
  if (!user) {
    throw new AppError({
      message: 'User not found',
      statusCode: 404,
      code: 'USER_NOT_FOUND',
    });
  }
  user.role = 'user';
  await user.save();

  await logAction(
    {
      userId: req.userId,
      action: 'user.demote',
      targetId: user._id.toString(),
      result: 'success',
    },
    req
  );

  sendOk(res, user.toSafeJSON());
});
