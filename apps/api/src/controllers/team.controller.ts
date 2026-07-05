import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { TeamBatch, ITeamMember } from '../models/TeamBatch';
import { asyncHandler } from '../utils/asyncHandler';
import { sendOk, sendCreated, sendNoContent } from '../utils/ApiResponse';
import { AppError } from '../utils/AppError';
import { syncBatchWithAdmins } from '../services/teamSync.service';
import { logAction } from '../services/log.service';

function toObjectId(id: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError({ message: 'Invalid id', statusCode: 400, code: 'INVALID_ID' });
  }
  return new Types.ObjectId(id);
}

function batchSafe(b: any) {
  return {
    id: b._id.toString(),
    batchName: b.batchName,
    batchYear: b.batchYear,
    isActive: b.isActive,
    members: (b.members ?? []).map((m: any) => ({
      id: m._id.toString(),
      userId: m.userId ? m.userId.toString() : null,
      name: m.name,
      photoUrl: m.photoUrl ?? null,
      designation: m.designation,
      bio: m.bio ?? '',
      contributions: m.contributions ?? [],
      socials: m.socials ?? {},
      displayOrder: m.displayOrder ?? 0,
    })),
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

// ─────────────────────────────────────────────────────────────────
// Public (approved users only)
// ─────────────────────────────────────────────────────────────────

export const getActiveTeam = asyncHandler(async (_req: Request, res: Response) => {
  const batch = await TeamBatch.findOne({ isActive: true })
    .sort({ updatedAt: -1 })
    .lean();
  if (!batch) {
    sendOk(res, null);
    return;
  }
  // Sort members by displayOrder before returning
  const sorted = { ...batch, members: [...batch.members].sort((a, b) => a.displayOrder - b.displayOrder) };
  sendOk(res, batchSafe(sorted));
});

export const listBatches = asyncHandler(async (_req: Request, res: Response) => {
  const batches = await TeamBatch.find().sort({ batchYear: -1, createdAt: -1 }).lean();
  sendOk(res, batches.map((b) => ({ ...batchSafe(b), memberCount: b.members.length })));
});

export const getBatch = asyncHandler(async (req: Request, res: Response) => {
  const batch = await TeamBatch.findById(toObjectId(req.params.id)).lean();
  if (!batch) {
    throw new AppError({ message: 'Batch not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  sendOk(res, batchSafe(batch));
});

// ─────────────────────────────────────────────────────────────────
// Admin
// ─────────────────────────────────────────────────────────────────

export const createBatch = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { batchName: string; batchYear: string; isActive?: boolean };

  // If setting as active, deactivate any other active batch first
  if (body.isActive) {
    await TeamBatch.updateMany({ isActive: true }, { $set: { isActive: false } });
  }

  const batch = await TeamBatch.create({
    batchName: body.batchName,
    batchYear: body.batchYear,
    isActive: body.isActive ?? false,
    members: [],
    createdBy: toObjectId(req.userId!),
  });

  await logAction(
    {
      userId: req.userId,
      action: 'team.batch.create',
      targetId: batch._id.toString(),
      result: 'success',
      meta: { batchName: body.batchName, batchYear: body.batchYear },
    },
    req
  );

  sendCreated(res, batchSafe(batch.toObject()));
});

export const updateBatch = asyncHandler(async (req: Request, res: Response) => {
  const batch = await TeamBatch.findById(toObjectId(req.params.id));
  if (!batch) {
    throw new AppError({ message: 'Batch not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  Object.assign(batch, req.body);
  await batch.save();

  await logAction(
    {
      userId: req.userId,
      action: 'team.batch.update',
      targetId: batch._id.toString(),
      result: 'success',
    },
    req
  );

  sendOk(res, batchSafe(batch.toObject()));
});

export const deleteBatch = asyncHandler(async (req: Request, res: Response) => {
  const batch = await TeamBatch.findById(toObjectId(req.params.id));
  if (!batch) {
    throw new AppError({ message: 'Batch not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  await batch.deleteOne();

  await logAction(
    {
      userId: req.userId,
      action: 'team.batch.delete',
      targetId: req.params.id,
      result: 'success',
      meta: { batchName: batch.batchName },
    },
    req
  );

  sendNoContent(res);
});

export const setActiveBatch = asyncHandler(async (req: Request, res: Response) => {
  const id = toObjectId(req.params.id);
  // Ensure target exists
  const target = await TeamBatch.findById(id);
  if (!target) {
    throw new AppError({ message: 'Batch not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  // Deactivate all others, then activate target
  await TeamBatch.updateMany({ _id: { $ne: id } }, { $set: { isActive: false } });
  target.isActive = true;
  await target.save();

  await logAction(
    {
      userId: req.userId,
      action: 'team.batch.activate',
      targetId: id.toString(),
      result: 'success',
      meta: { batchName: target.batchName },
    },
    req
  );

  sendOk(res, batchSafe(target.toObject()));
});

export const syncBatch = asyncHandler(async (req: Request, res: Response) => {
  await syncBatchWithAdmins(req.params.id);
  const batch = await TeamBatch.findById(toObjectId(req.params.id)).lean();
  if (!batch) {
    throw new AppError({ message: 'Batch not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  sendOk(res, batchSafe(batch));
});

export const addMember = asyncHandler(async (req: Request, res: Response) => {
  const batch = await TeamBatch.findById(toObjectId(req.params.id));
  if (!batch) {
    throw new AppError({ message: 'Batch not found', statusCode: 404, code: 'NOT_FOUND' });
  }

  const body = req.body as Partial<ITeamMember> & {
    userId?: string;
  };

  batch.members.push({
    userId: body.userId ? toObjectId(body.userId) : null,
    name: body.name!,
    photoUrl: body.photoUrl ?? null,
    designation: body.designation!,
    bio: body.bio ?? '',
    contributions: body.contributions ?? [],
    socials: body.socials ?? {},
    displayOrder:
      body.displayOrder ?? (batch.members.length > 0
        ? Math.max(...batch.members.map((m) => m.displayOrder)) + 1
        : 0),
  });

  await batch.save();

  await logAction(
    {
      userId: req.userId,
      action: 'team.member.add',
      targetId: batch._id.toString(),
      result: 'success',
      meta: { name: body.name },
    },
    req
  );

  sendOk(res, batchSafe(batch.toObject()));
});

export const updateMember = asyncHandler(async (req: Request, res: Response) => {
  const batch = await TeamBatch.findById(toObjectId(req.params.id));
  if (!batch) {
    throw new AppError({ message: 'Batch not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  const member = batch.members.find((m) => m._id?.toString() === req.params.memberId);
  if (!member) {
    throw new AppError({ message: 'Member not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  const body = req.body as Partial<ITeamMember> & { userId?: string };

  if (body.userId !== undefined) {
    member.userId = body.userId ? toObjectId(body.userId) : null;
  }
  if (body.name !== undefined) member.name = body.name;
  if (body.photoUrl !== undefined) member.photoUrl = body.photoUrl ?? null;
  if (body.designation !== undefined) member.designation = body.designation;
  if (body.bio !== undefined) member.bio = body.bio;
  if (body.contributions !== undefined) member.contributions = body.contributions;
  if (body.socials !== undefined) member.socials = body.socials;
  if (body.displayOrder !== undefined) member.displayOrder = body.displayOrder;

  await batch.save();

  await logAction(
    {
      userId: req.userId,
      action: 'team.member.update',
      targetId: batch._id.toString(),
      result: 'success',
      meta: { memberId: req.params.memberId },
    },
    req
  );

  sendOk(res, batchSafe(batch.toObject()));
});

export const deleteMember = asyncHandler(async (req: Request, res: Response) => {
  const batch = await TeamBatch.findById(toObjectId(req.params.id));
  if (!batch) {
    throw new AppError({ message: 'Batch not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  const idx = batch.members.findIndex((m) => m._id?.toString() === req.params.memberId);
  if (idx === -1) {
    throw new AppError({ message: 'Member not found', statusCode: 404, code: 'NOT_FOUND' });
  }
  batch.members.splice(idx, 1);
  await batch.save();

  await logAction(
    {
      userId: req.userId,
      action: 'team.member.delete',
      targetId: batch._id.toString(),
      result: 'success',
      meta: { memberId: req.params.memberId },
    },
    req
  );

  sendOk(res, batchSafe(batch.toObject()));
});
