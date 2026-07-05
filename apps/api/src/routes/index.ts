import { Router } from 'express';
import healthRouter from './health.routes';
import authRouter from './auth.routes';
import adminUsersRouter from './adminUsers.routes';
import requestsRouter, { adminRequestsRouter } from './requests.routes';
import albumsRouter, {
  adminAlbumsRouter,
  adminUploadJobsRouter,
} from './albums.routes';
import teamRouter, { adminTeamRouter } from './team.routes';
import notificationsRouter from './notifications.routes';
import logsRouter from './logs.routes';
import analyticsRouter from './analytics.routes';
import settingsRouter, { adminRouter as adminSettingsRouter } from './settings.routes';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/admin/users', adminUsersRouter);
router.use('/requests', requestsRouter);
router.use('/admin/requests', adminRequestsRouter);
router.use('/albums', albumsRouter);
router.use('/admin/albums', adminAlbumsRouter);
router.use('/admin/upload-jobs', adminUploadJobsRouter);
router.use('/team', teamRouter);
router.use('/admin/team', adminTeamRouter);
router.use('/notifications', notificationsRouter);
router.use('/admin/logs', logsRouter);
router.use('/analytics', analyticsRouter);
router.use('/settings', settingsRouter);
router.use('/admin/settings', adminSettingsRouter);

// All Phase 1-6 routes mounted.

export default router;
