import { Router } from 'express';
import { VehicleController } from './vehicle.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Get available vehicles for dispatch
router.get('/available', VehicleController.getAvailable);

router.get('/', VehicleController.getAll);
router.get('/:id', VehicleController.getById);

router.post(
  '/',
  authorize(UserRole.FLEET_MANAGER),
  VehicleController.create
);

router.patch(
  '/:id',
  authorize(UserRole.FLEET_MANAGER),
  VehicleController.update
);

export default router;
