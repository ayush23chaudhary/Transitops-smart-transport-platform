import { Response } from 'express';
import { prisma } from '../../config/db';
import { AuthenticatedRequest } from '../../middleware/auth';

export class AnalyticsController {
  /**
   * Get global KPIs for the fleet
   */
  static async getKPIs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // 1. Fleet Utilization
      const activeOnTripCount = await prisma.vehicle.count({
        where: { status: 'ON_TRIP', isActive: true },
      });
      const totalActiveVehicles = await prisma.vehicle.count({
        where: { isActive: true },
      });
      const fleetUtilization = totalActiveVehicles > 0
        ? parseFloat(((activeOnTripCount / totalActiveVehicles) * 100).toFixed(2))
        : 0;

      // 2. Fuel Efficiency
      const tripDistanceSum = await prisma.trip.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { actualDistance: true },
      });
      const fuelLitersSum = await prisma.fuelLog.aggregate({
        _sum: { liters: true },
      });
      const totalDistance = Number(tripDistanceSum._sum.actualDistance || 0);
      const totalLiters = Number(fuelLitersSum._sum.liters || 0);
      const fuelEfficiency = totalLiters > 0
        ? parseFloat((totalDistance / totalLiters).toFixed(2))
        : 0;

      // 3. Operational Cost
      const fuelCostSum = await prisma.fuelLog.aggregate({
        _sum: { cost: true },
      });
      const maintenanceCostSum = await prisma.maintenanceRecord.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { cost: true },
      });
      const expenseAmountSum = await prisma.expense.aggregate({
        _sum: { amount: true },
      });
      const totalFuelCost = Number(fuelCostSum._sum.cost || 0);
      const totalMaintenanceCost = Number(maintenanceCostSum._sum.cost || 0);
      const totalExpenseAmount = Number(expenseAmountSum._sum.amount || 0);
      const totalOperationalCost = totalFuelCost + totalMaintenanceCost + totalExpenseAmount;

      // 4. Total Attributed Revenue
      const tripRevenueSum = await prisma.trip.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { revenue: true },
      });
      const totalRevenue = Number(tripRevenueSum._sum.revenue || 0);

      res.status(200).json({
        success: true,
        data: {
          fleetUtilization,
          fuelEfficiency,
          totalOperationalCost: parseFloat(totalOperationalCost.toFixed(2)),
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          activeVehicles: totalActiveVehicles,
          vehiclesOnTrip: activeOnTripCount,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get operational cost category breakdown
   */
  static async getCostBreakdown(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const fuelCostSum = await prisma.fuelLog.aggregate({
        _sum: { cost: true },
      });
      const maintenanceCostSum = await prisma.maintenanceRecord.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { cost: true },
      });
      const expenseBreakdown = await prisma.expense.groupBy({
        by: ['category'],
        _sum: { amount: true },
      });

      const fuelCost = Number(fuelCostSum._sum.cost || 0);
      const maintenanceCost = Number(maintenanceCostSum._sum.cost || 0);

      const categories = ['TOLL', 'PARKING', 'REPAIR', 'MAINTENANCE', 'INSURANCE', 'OTHER'];
      const expensesBreakdown: any = {};
      categories.forEach((cat) => {
        expensesBreakdown[cat.toLowerCase()] = 0;
      });

      expenseBreakdown.forEach((item) => {
        expensesBreakdown[item.category.toLowerCase()] = Number(item._sum.amount || 0);
      });

      res.status(200).json({
        success: true,
        data: {
          fuel: parseFloat(fuelCost.toFixed(2)),
          maintenance: parseFloat(maintenanceCost.toFixed(2)),
          expenses: expensesBreakdown,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get top 5 costliest vehicles
   */
  static async getCostliestVehicles(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const vehicles = await prisma.vehicle.findMany({
        where: { isActive: true },
        select: {
          id: true,
          registrationNumber: true,
          name: true,
          type: true,
          fuelLogs: { select: { cost: true } },
          maintenance: {
            where: { status: 'COMPLETED' },
            select: { cost: true },
          },
          expenses: { select: { amount: true } },
        },
      });

      const vehicleCosts = vehicles.map((v) => {
        const fuelCost = v.fuelLogs.reduce((sum, log) => sum + Number(log.cost), 0);
        const maintenanceCost = v.maintenance.reduce((sum, record) => sum + Number(record.cost), 0);
        const expenseCost = v.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
        const totalCost = fuelCost + maintenanceCost + expenseCost;

        return {
          id: v.id,
          registrationNumber: v.registrationNumber,
          name: v.name,
          type: v.type,
          fuelCost: parseFloat(fuelCost.toFixed(2)),
          maintenanceCost: parseFloat(maintenanceCost.toFixed(2)),
          expenseCost: parseFloat(expenseCost.toFixed(2)),
          totalCost: parseFloat(totalCost.toFixed(2)),
        };
      });

      const costliest = vehicleCosts
        .sort((a, b) => b.totalCost - a.totalCost)
        .slice(0, 5);

      res.status(200).json({ success: true, data: costliest });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get ROI details per vehicle
   */
  static async getVehicleROI(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const vehicles = await prisma.vehicle.findMany({
        where: { isActive: true },
        select: {
          id: true,
          registrationNumber: true,
          name: true,
          acquisitionCost: true,
          trips: {
            where: { status: 'COMPLETED' },
            select: { revenue: true },
          },
          fuelLogs: { select: { cost: true } },
          maintenance: {
            where: { status: 'COMPLETED' },
            select: { cost: true },
          },
          expenses: { select: { amount: true } },
        },
      });

      const vehicleROIs = vehicles.map((v) => {
        const revenue = v.trips.reduce((sum, trip) => sum + Number(trip.revenue || 0), 0);
        const fuelCost = v.fuelLogs.reduce((sum, log) => sum + Number(log.cost), 0);
        const maintenanceCost = v.maintenance.reduce((sum, record) => sum + Number(record.cost), 0);
        const expenseCost = v.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
        const operatingCost = fuelCost + maintenanceCost + expenseCost;

        const acqCost = Number(v.acquisitionCost);
        const netProfit = revenue - operatingCost;
        const roi = acqCost > 0 ? (netProfit / acqCost) * 100 : 0;

        return {
          id: v.id,
          registrationNumber: v.registrationNumber,
          name: v.name,
          revenue: parseFloat(revenue.toFixed(2)),
          operatingCost: parseFloat(operatingCost.toFixed(2)),
          acquisitionCost: acqCost,
          netProfit: parseFloat(netProfit.toFixed(2)),
          roi: parseFloat(roi.toFixed(2)),
        };
      });

      res.status(200).json({ success: true, data: vehicleROIs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get 6-month revenue and cost trends
   */
  static async getTrends(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const trips = await prisma.trip.findMany({
        where: {
          status: 'COMPLETED',
          completedAt: { gte: sixMonthsAgo },
        },
        select: { revenue: true, completedAt: true },
      });

      const fuelLogs = await prisma.fuelLog.findMany({
        where: { recordedAt: { gte: sixMonthsAgo } },
        select: { cost: true, recordedAt: true },
      });

      const maintenance = await prisma.maintenanceRecord.findMany({
        where: {
          status: 'COMPLETED',
          completedAt: { gte: sixMonthsAgo },
        },
        select: { cost: true, completedAt: true },
      });

      const expenses = await prisma.expense.findMany({
        where: { expenseDate: { gte: sixMonthsAgo } },
        select: { amount: true, expenseDate: true },
      });

      const monthlyData: {
        [key: string]: {
          month: string;
          revenue: number;
          fuelCost: number;
          maintenanceCost: number;
          expenseCost: number;
          totalCost: number;
        };
      } = {};

      // Initialize trend slots for the last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthName = d.toLocaleString('default', { month: 'short' });
        monthlyData[key] = {
          month: monthName,
          revenue: 0,
          fuelCost: 0,
          maintenanceCost: 0,
          expenseCost: 0,
          totalCost: 0,
        };
      }

      trips.forEach((t) => {
        if (t.completedAt) {
          const key = `${t.completedAt.getFullYear()}-${String(t.completedAt.getMonth() + 1).padStart(2, '0')}`;
          if (monthlyData[key]) {
            monthlyData[key].revenue += Number(t.revenue || 0);
          }
        }
      });

      fuelLogs.forEach((f) => {
        const key = `${f.recordedAt.getFullYear()}-${String(f.recordedAt.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData[key]) {
          monthlyData[key].fuelCost += Number(f.cost || 0);
          monthlyData[key].totalCost += Number(f.cost || 0);
        }
      });

      maintenance.forEach((m) => {
        if (m.completedAt) {
          const key = `${m.completedAt.getFullYear()}-${String(m.completedAt.getMonth() + 1).padStart(2, '0')}`;
          if (monthlyData[key]) {
            monthlyData[key].maintenanceCost += Number(m.cost || 0);
            monthlyData[key].totalCost += Number(m.cost || 0);
          }
        }
      });

      expenses.forEach((e) => {
        const key = `${e.expenseDate.getFullYear()}-${String(e.expenseDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData[key]) {
          monthlyData[key].expenseCost += Number(e.amount || 0);
          monthlyData[key].totalCost += Number(e.amount || 0);
        }
      });

      const trends = Object.keys(monthlyData)
        .sort()
        .map((key) => {
          const item = monthlyData[key];
          return {
            month: item.month,
            revenue: parseFloat(item.revenue.toFixed(2)),
            fuelCost: parseFloat(item.fuelCost.toFixed(2)),
            maintenanceCost: parseFloat(item.maintenanceCost.toFixed(2)),
            expenseCost: parseFloat(item.expenseCost.toFixed(2)),
            totalCost: parseFloat(item.totalCost.toFixed(2)),
          };
        });

      res.status(200).json({ success: true, data: trends });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
