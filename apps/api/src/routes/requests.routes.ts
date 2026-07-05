import { Router } from 'express';
import { authenticate, requireAdmin, requireApproved } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import {
  createRequestSchema,
  updateRequestSchema,
  rejectRequestSchema,
  linkAlbumSchema,
  listRequestsQuerySchema,
  idParamSchema,
} from '../validators/request.validators';
import {
  createRequest,
  listMyRequests,
  getMyRequest,
  updateMyRequest,
  deleteMyRequest,
  listAllRequests,
  getAnyRequest,
  approveRequest,
  rejectRequest,
  markPhotographyCompleted,
  linkAlbum,
  completeRequest,
} from '../controllers/requests.controller';

const router = Router();

router.use(authenticate);
router.use(requireApproved);

// ── User-facing ──
router.get('/', validate(listRequestsQuerySchema, 'query'), (req, res, next) => {
  // mine=true or no filter -> user's own list. Admin path uses /admin/requests.
  if (req.userRole === 'admin' && req.query.mine === 'true') {
    return listMyRequests(req, res, next);
  }
  if (req.userRole !== 'admin') {
    return listMyRequests(req, res, next);
  }
  // Admin without ?mine=true is not allowed on /requests (they have /admin/requests)
  return listMyRequests(req, res, next);
});

router.post('/', validate(createRequestSchema), createRequest);
router.get('/:id', validate(idParamSchema, 'params'), getMyRequest);
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateRequestSchema), updateMyRequest);
router.delete('/:id', validate(idParamSchema, 'params'), deleteMyRequest);

// ── Admin actions (mounted on a separate router below) ──

export const adminRequestsRouter = Router();
adminRequestsRouter.use(authenticate, requireAdmin);
adminRequestsRouter.get('/', validate(listRequestsQuerySchema, 'query'), listAllRequests);
adminRequestsRouter.get('/:id', validate(idParamSchema, 'params'), getAnyRequest);
adminRequestsRouter.post('/:id/approve', validate(idParamSchema, 'params'), approveRequest);
adminRequestsRouter.post(
  '/:id/reject',
  validate(idParamSchema, 'params'),
  validate(rejectRequestSchema),
  rejectRequest
);
adminRequestsRouter.post(
  '/:id/photography-completed',
  validate(idParamSchema, 'params'),
  markPhotographyCompleted
);
adminRequestsRouter.post(
  '/:id/link-album',
  validate(idParamSchema, 'params'),
  validate(linkAlbumSchema),
  linkAlbum
);
adminRequestsRouter.post('/:id/complete', validate(idParamSchema, 'params'), completeRequest);

export default router;
