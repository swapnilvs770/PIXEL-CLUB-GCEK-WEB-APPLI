import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { updateSettingsSchema } from '../validators/settings.validators';
import {
  getPublicSettings,
  adminGetSettings,
  adminUpdateSettings,
} from '../controllers/settings.controller';

const router = Router();

// Public read
router.get('/', getPublicSettings);

// Admin
const adminRouter = Router();
adminRouter.use(authenticate, requireAdmin);
adminRouter.get('/', adminGetSettings);
adminRouter.put('/', validate(updateSettingsSchema), adminUpdateSettings);

export { adminRouter };
export default router;
