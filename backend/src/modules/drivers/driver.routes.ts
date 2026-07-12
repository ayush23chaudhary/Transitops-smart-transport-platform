import { Router, Response } from 'express';
import { prisma } from '../../config/db';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

// Get all drivers
router.get('/', async (req, res): Promise<void> => {
  try {
    const drivers = await prisma.driver.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    res.status(200).json({ success: true, data: drivers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Extension Point: Workforce developer will add CRUD here
router.post('/', async (req, res): Promise<void> => {
  res.status(501).json({ success: false, message: 'Not Implemented. Workforce Developer owns this feature.' });
});

export default router;
