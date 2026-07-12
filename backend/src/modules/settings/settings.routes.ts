import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

// All authenticated roles can read settings
router.get('/', SettingsController.get);

// Only FLEET_MANAGER can modify settings
router.patch('/', authorize(UserRole.FLEET_MANAGER), SettingsController.update);

export default router;
