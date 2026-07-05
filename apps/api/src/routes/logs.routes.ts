import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { listLogsQuerySchema } from '../validators/logs.validators';
import { listLogs, distinctActions } from '../controllers/logs.controller';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/', validate(listLogsQuerySchema, 'query'), listLogs);
router.get('/actions', distinctActions);

export default router;
