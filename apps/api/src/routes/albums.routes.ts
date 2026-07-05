import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import {
  createAlbumSchema,
  updateAlbumSchema,
  listAlbumsQuerySchema,
  idParamSchema,
} from '../validators/album.validators';
import {
  // Public
  listPublishedAlbums,
  listYears,
  getPublishedAlbum,
  getPublishedAlbumPhotos,
  // Admin
  adminListAlbums,
  adminGetAlbum,
  adminCreateAlbum,
  adminUpdateAlbum,
  adminDeleteAlbum,
  adminStartImport,
  adminPublishAlbum,
  adminUnpublishAlbum,
  // Jobs
  listJobs,
  getJob,
  pauseJob,
  resumeJobEndpoint,
  cancelJob,
  retryJob,
} from '../controllers/albums.controller';

// Public/user-facing router (mounted at /api/albums)
const router = Router();
router.use(authenticate);

router.get('/', validate(listAlbumsQuerySchema, 'query'), listPublishedAlbums);
router.get('/years', listYears);
router.get('/:id', validate(idParamSchema, 'params'), getPublishedAlbum);
router.get('/:id/photos', validate(idParamSchema, 'params'), getPublishedAlbumPhotos);

// Admin router (mounted at /api/admin/albums and /api/admin/upload-jobs)
export const adminAlbumsRouter = Router();
adminAlbumsRouter.use(authenticate, requireAdmin);

adminAlbumsRouter.get('/', validate(listAlbumsQuerySchema, 'query'), adminListAlbums);
adminAlbumsRouter.post('/', validate(createAlbumSchema), adminCreateAlbum);
adminAlbumsRouter.get('/:id', validate(idParamSchema, 'params'), adminGetAlbum);
adminAlbumsRouter.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateAlbumSchema),
  adminUpdateAlbum
);
adminAlbumsRouter.delete('/:id', validate(idParamSchema, 'params'), adminDeleteAlbum);
adminAlbumsRouter.post(
  '/:id/start-import',
  validate(idParamSchema, 'params'),
  adminStartImport
);
adminAlbumsRouter.post(
  '/:id/publish',
  validate(idParamSchema, 'params'),
  adminPublishAlbum
);
adminAlbumsRouter.post(
  '/:id/unpublish',
  validate(idParamSchema, 'params'),
  adminUnpublishAlbum
);

export const adminUploadJobsRouter = Router();
adminUploadJobsRouter.use(authenticate, requireAdmin);

adminUploadJobsRouter.get('/', listJobs);
adminUploadJobsRouter.get('/:id', validate(idParamSchema, 'params'), getJob);
adminUploadJobsRouter.post('/pause', pauseJob);
adminUploadJobsRouter.post('/:id/resume', validate(idParamSchema, 'params'), resumeJobEndpoint);
adminUploadJobsRouter.post('/cancel', cancelJob);
adminUploadJobsRouter.post('/:id/retry', validate(idParamSchema, 'params'), retryJob);

export default router;
