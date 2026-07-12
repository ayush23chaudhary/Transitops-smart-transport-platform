import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { prisma } from '../../config/db';

const router = Router();

router.use(authenticate);

// Get summary data for dashboard
router.get('/summary', async (req, res): Promise<void> => {
  try {
    const vehicleCount = await prisma.vehicle.count({ where: { isActive: true } });
    const driverCount = await prisma.driver.count({ where: { isActive: true } });
    const activeTripsCount = await prisma.trip.count({ where: { status: 'DISPATCHED' } });
    const pendingTripsCount = await prisma.trip.count({ where: { status: 'DRAFT' } });

    res.status(200).json({
      success: true,
      data: {
        vehicles: vehicleCount,
        drivers: driverCount,
        activeTrips: activeTripsCount,
        pendingTrips: pendingTripsCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
