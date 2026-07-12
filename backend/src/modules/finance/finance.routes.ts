import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { prisma } from '../../config/db';

const router = Router();

router.use(authenticate);

// Get expenses & fuel logs
router.get('/expenses', async (req, res): Promise<void> => {
  try {
    const expenses = await prisma.expense.findMany({
      include: { vehicle: true, trip: true },
      orderBy: { expenseDate: 'desc' },
    });
    res.status(200).json({ success: true, data: expenses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/fuel', async (req, res): Promise<void> => {
  try {
    const logs = await prisma.fuelLog.findMany({
      include: { vehicle: true, trip: true },
      orderBy: { recordedAt: 'desc' },
    });
    res.status(200).json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
