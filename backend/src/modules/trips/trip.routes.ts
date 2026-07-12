import { Router } from 'express';
import { TripController } from './trip.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// All trip routes require authentication
router.use(authenticate);

// Get all trips & get by ID
router.get('/', TripController.getAll);
router.get('/:id', TripController.getById);

// Modifications require Admin, Manager, or Dispatcher role
router.post(
  '/',
  authorize(UserRole.FLEET_MANAGER, UserRole.DISPATCHER),
  TripController.create
);

router.post(
  '/:id/dispatch',
  authorize(UserRole.FLEET_MANAGER, UserRole.DISPATCHER),
  TripController.dispatch
);

router.post(
  '/:id/complete',
  authorize(UserRole.FLEET_MANAGER, UserRole.DISPATCHER),
  TripController.complete
);

router.post(
  '/:id/cancel',
  authorize(UserRole.FLEET_MANAGER, UserRole.DISPATCHER),
  TripController.cancel
);

export default router;
