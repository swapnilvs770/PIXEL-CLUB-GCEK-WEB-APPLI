import { Router } from 'express';
import { authenticate, requireAdmin, requireApproved } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import {
  createBatchSchema,
  updateBatchSchema,
  addMemberSchema,
  updateMemberSchema,
  idParamSchema,
  memberIdParamSchema,
} from '../validators/team.validators';
import {
  getActiveTeam,
  listBatches,
  getBatch,
  createBatch,
  updateBatch,
  deleteBatch,
  setActiveBatch,
  syncBatch,
  addMember,
  updateMember,
  deleteMember,
} from '../controllers/team.controller';

const router = Router();
router.use(authenticate);
router.use(requireApproved);

// Public (to all approved users)
router.get('/', getActiveTeam);
router.get('/batches', listBatches);
router.get('/batches/:id', validate(idParamSchema, 'params'), getBatch);

// Admin
export const adminTeamRouter = Router();
adminTeamRouter.use(authenticate, requireAdmin);

adminTeamRouter.post('/', validate(createBatchSchema), createBatch);
adminTeamRouter.patch(
  '/batches/:id',
  validate(idParamSchema, 'params'),
  validate(updateBatchSchema),
  updateBatch
);
adminTeamRouter.delete('/batches/:id', validate(idParamSchema, 'params'), deleteBatch);
adminTeamRouter.post('/batches/:id/activate', validate(idParamSchema, 'params'), setActiveBatch);
adminTeamRouter.post('/batches/:id/sync', validate(idParamSchema, 'params'), syncBatch);

adminTeamRouter.post(
  '/batches/:id/members',
  validate(idParamSchema, 'params'),
  validate(addMemberSchema),
  addMember
);
adminTeamRouter.patch(
  '/batches/:id/members/:memberId',
  validate(memberIdParamSchema, 'params'),
  validate(updateMemberSchema),
  updateMember
);
adminTeamRouter.delete(
  '/batches/:id/members/:memberId',
  validate(memberIdParamSchema, 'params'),
  deleteMember
);

export default router;
