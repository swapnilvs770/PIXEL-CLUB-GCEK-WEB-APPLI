import { z } from 'zod';

export const listLogsQuerySchema = z.object({
  action: z.string().max(100).optional(),
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  result: z.enum(['success', 'failure']).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});
