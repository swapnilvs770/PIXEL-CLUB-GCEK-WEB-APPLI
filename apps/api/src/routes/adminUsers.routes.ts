import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireAdmin } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import {
  listUsers,
  getUser,
  approveUser,
  blockUser,
  unblockUser,
  promoteToAdmin,
  demoteToUser,
} from '../controllers/adminUsers.controller';

const router = Router();

router.use(authenticate, requireAdmin);

const idParam = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id'),
});

const listQuery = z.object({
  status: z.enum(['pending', 'approved', 'blocked']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

router.get('/', validate(listQuery, 'query'), listUsers);
router.get('/:id', validate(idParam, 'params'), getUser);
router.post('/:id/approve', validate(idParam, 'params'), approveUser);
router.post('/:id/block', validate(idParam, 'params'), blockUser);
router.post('/:id/unblock', validate(idParam, 'params'), unblockUser);
router.post('/:id/promote', validate(idParam, 'params'), promoteToAdmin);
router.post('/:id/demote', validate(idParam, 'params'), demoteToUser);

export default router;
