import { Router, Response } from 'express';
import { prisma } from '../../config/db';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

// Get all vehicles
router.get('/', async (req, res): Promise<void> => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { isActive: true },
      orderBy: { registrationNumber: 'asc' },
    });
    res.status(200).json({ success: true, data: vehicles });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Extension Point: Fleet developer will add CRUD here
router.post('/', async (req, res): Promise<void> => {
  res.status(501).json({ success: false, message: 'Not Implemented. Fleet Developer owns this feature.' });
});

export default router;
