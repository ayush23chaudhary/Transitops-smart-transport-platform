import { Router } from 'express';
import { MaintenanceController } from './maintenance.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', MaintenanceController.getAll);
router.get('/:id', MaintenanceController.getById);

router.post(
  '/',
  authorize(UserRole.FLEET_MANAGER),
  MaintenanceController.create
);

router.post(
  '/:id/start',
  authorize(UserRole.FLEET_MANAGER),
  MaintenanceController.start
);

router.post(
  '/:id/complete',
  authorize(UserRole.FLEET_MANAGER),
  MaintenanceController.complete
);

router.post(
  '/:id/cancel',
  authorize(UserRole.FLEET_MANAGER),
  MaintenanceController.cancel
);

export default router;
