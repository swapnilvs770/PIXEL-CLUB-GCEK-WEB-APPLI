import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const phoneRegex = /^[\d\s+\-()]{7,20}$/;

export const createRequestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200).trim(),
  description: z.string().max(2000).trim().optional().or(z.literal('')),
  eventDate: z.coerce.date({
    errorMap: () => ({ message: 'Event date is required' }),
  }),
  venue: z.string().min(1, 'Venue is required').max(200).trim(),
  expectedAttendees: z.coerce.number().int().nonnegative().optional(),
  contactPhone: z
    .string()
    .regex(phoneRegex, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  notes: z.string().max(1000).trim().optional().or(z.literal('')),
});

export const updateRequestSchema = createRequestSchema.partial();

export const rejectRequestSchema = z.object({
  reason: z.string().min(1, 'Reason is required').max(500).trim(),
});

export const linkAlbumSchema = z.object({
  albumId: objectId,
});

export const listRequestsQuerySchema = z.object({
  status: z
    .enum(['pending', 'approved', 'rejected', 'photography_completed', 'completed'])
    .optional(),
  mine: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const idParamSchema = z.object({ id: objectId });
