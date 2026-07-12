import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { FinanceController } from './finance.controller';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get(
  '/expenses',
  authorize(UserRole.FINANCIAL_ANALYST, UserRole.FLEET_MANAGER),
  FinanceController.getExpenses
);

router.post(
  '/expenses',
  authorize(UserRole.FINANCIAL_ANALYST),
  FinanceController.createExpense
);

router.get(
  '/fuel',
  authorize(UserRole.FINANCIAL_ANALYST, UserRole.FLEET_MANAGER),
  FinanceController.getFuelLogs
);

router.post(
  '/fuel',
  authorize(UserRole.FINANCIAL_ANALYST),
  FinanceController.createFuelLog
);

router.get(
  '/summary',
  authorize(UserRole.FINANCIAL_ANALYST, UserRole.FLEET_MANAGER),
  FinanceController.getSummary
);

export default router;
