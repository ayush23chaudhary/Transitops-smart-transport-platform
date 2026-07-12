import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { prisma } from '../../config/db';

const router = Router();

router.use(authenticate);

// Get list of maintenance records
router.get('/', async (req, res): Promise<void> => {
  try {
    const records = await prisma.maintenanceRecord.findMany({
      include: { vehicle: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
