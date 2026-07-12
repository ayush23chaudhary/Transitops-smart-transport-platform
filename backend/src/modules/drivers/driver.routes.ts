import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '@prisma/client';
import { DriverController } from './driver.controller';

const router = Router();

router.use(authenticate);

router.get('/available', DriverController.getAvailable);
router.get('/', DriverController.list);
router.get('/:id', DriverController.getById);

router.post(
  '/',
  authorize(UserRole.SAFETY_OFFICER),
  DriverController.create
);

router.patch(
  '/:id',
  authorize(UserRole.SAFETY_OFFICER),
  DriverController.update
);

export default router;
