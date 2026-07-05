import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const createAlbumSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).trim(),
  description: z.string().max(2000).trim().optional(),
  year: z.coerce
    .number()
    .int()
    .min(2000, 'Year must be 2000 or later')
    .max(2100, 'Year must be 2100 or earlier'),
  driveFolderUrl: z
    .string()
    .min(1, 'Drive folder URL or ID is required')
    .max(500)
    .trim(),
  eventDate: z.coerce.date().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
});

export const updateAlbumSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(2000).trim().optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  eventDate: z.coerce.date().optional(),
  coverPhotoId: objectId.optional(),
  tags: z.array(z.string().max(40)).optional(),
});

export const listAlbumsQuerySchema = z.object({
  status: z.enum(['draft', 'published', 'archived']).optional(),
  year: z.coerce.number().int().optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const idParamSchema = z.object({ id: objectId });
