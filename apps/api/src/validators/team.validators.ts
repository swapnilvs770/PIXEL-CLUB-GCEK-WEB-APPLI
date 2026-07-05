import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const socialsSchema = z
  .object({
    instagram: z.string().url().or(z.literal('')).optional(),
    linkedin: z.string().url().or(z.literal('')).optional(),
    twitter: z.string().url().or(z.literal('')).optional(),
    website: z.string().url().or(z.literal('')).optional(),
    other: z.string().url().or(z.literal('')).optional(),
  })
  .optional();

export const createBatchSchema = z.object({
  batchName: z.string().min(1).max(120).trim(),
  batchYear: z.string().min(1).max(20).trim(),
  isActive: z.boolean().optional(),
});

export const updateBatchSchema = z.object({
  batchName: z.string().min(1).max(120).trim().optional(),
  batchYear: z.string().min(1).max(20).trim().optional(),
});

export const addMemberSchema = z.object({
  userId: objectId.optional(),
  name: z.string().min(1).max(120).trim(),
  photoUrl: z.string().url().or(z.literal('')).optional(),
  designation: z.string().min(1).max(120).trim(),
  bio: z.string().max(600).optional(),
  contributions: z.array(z.string().max(120)).max(20).optional(),
  socials: socialsSchema,
  displayOrder: z.number().int().min(0).optional(),
});

export const updateMemberSchema = addMemberSchema.partial();

export const idParamSchema = z.object({ id: objectId });
export const memberIdParamSchema = z.object({
  id: objectId,
  memberId: objectId,
});
