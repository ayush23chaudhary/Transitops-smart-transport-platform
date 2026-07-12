import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { AnalyticsController } from './analytics.controller';
import { prisma } from '../../config/db';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Existing dashboard summary endpoint (preserved)
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

// Analytics KPI metrics
router.get(
  '/kpis',
  authorize(UserRole.FLEET_MANAGER, UserRole.DISPATCHER, UserRole.SAFETY_OFFICER, UserRole.FINANCIAL_ANALYST),
  AnalyticsController.getKPIs
);

// Cost breakdown breakdown
router.get(
  '/cost-breakdown',
  authorize(UserRole.FLEET_MANAGER, UserRole.DISPATCHER, UserRole.SAFETY_OFFICER, UserRole.FINANCIAL_ANALYST),
  AnalyticsController.getCostBreakdown
);

// Top 5 costliest vehicles
router.get(
  '/costliest-vehicles',
  authorize(UserRole.FLEET_MANAGER, UserRole.DISPATCHER, UserRole.SAFETY_OFFICER, UserRole.FINANCIAL_ANALYST),
  AnalyticsController.getCostliestVehicles
);

// Vehicle ROI metrics
router.get(
  '/vehicle-roi',
  authorize(UserRole.FLEET_MANAGER, UserRole.DISPATCHER, UserRole.SAFETY_OFFICER, UserRole.FINANCIAL_ANALYST),
  AnalyticsController.getVehicleROI
);

// Trends analysis
router.get(
  '/trends',
  authorize(UserRole.FLEET_MANAGER, UserRole.DISPATCHER, UserRole.SAFETY_OFFICER, UserRole.FINANCIAL_ANALYST),
  AnalyticsController.getTrends
);

export default router;
