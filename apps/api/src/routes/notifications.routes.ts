import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { idParamSchema, listQuerySchema } from '../validators/notifications.validators';
import {
  listNotifications,
  unreadCount,
  markRead,
  markAllRead,
  deleteNotification,
} from '../controllers/notifications.controller';

const router = Router();
router.use(authenticate);

router.get('/', validate(listQuerySchema, 'query'), listNotifications);
router.get('/unread-count', unreadCount);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', validate(idParamSchema, 'params'), markRead);
router.delete('/:id', validate(idParamSchema, 'params'), deleteNotification);

export default router;
