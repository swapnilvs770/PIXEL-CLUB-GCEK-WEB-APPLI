import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authenticate';
import {
  getOverview,
  requestsTimeline,
  albumsByYear,
} from '../controllers/analytics.controller';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/overview', getOverview);
router.get('/requests-timeline', requestsTimeline);
router.get('/albums-by-year', albumsByYear);

export default router;
