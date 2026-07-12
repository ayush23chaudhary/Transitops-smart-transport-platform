import { Response } from 'express';
import { prisma } from '../../config/db';
import { AuthenticatedRequest } from '../../middleware/auth';
import { createFuelLogSchema, createExpenseSchema } from './finance.validation';
import { ExpenseCategory } from '@prisma/client';

export class FinanceController {
  /**
   * List fuel logs with optional filters
   */
  static async getFuelLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { vehicleId, startDate, endDate } = req.query;

      const where: any = {};

      if (vehicleId) {
        where.vehicleId = String(vehicleId);
      }

      if (startDate || endDate) {
        where.recordedAt = {};
        if (startDate) {
          where.recordedAt.gte = new Date(String(startDate));
        }
        if (endDate) {
          where.recordedAt.lte = new Date(String(endDate));
        }
      }

      const logs = await prisma.fuelLog.findMany({
        where,
        include: { vehicle: true, trip: true },
        orderBy: { recordedAt: 'desc' },
      });

      res.status(200).json({ success: true, data: logs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Create a new fuel log
   */
  static async createFuelLog(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = createFuelLogSchema.parse(req.body);

      // Verify vehicle exists
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: parsed.vehicleId },
      });
      if (!vehicle) {
        res.status(404).json({ success: false, message: 'Vehicle not found' });
        return;
      }

      // Verify trip exists if provided
      if (parsed.tripId) {
        const trip = await prisma.trip.findUnique({
          where: { id: parsed.tripId },
        });
        if (!trip) {
          res.status(404).json({ success: false, message: 'Trip not found' });
          return;
        }
        if (trip.vehicleId !== parsed.vehicleId) {
          res.status(400).json({ success: false, message: 'Trip does not belong to the specified vehicle' });
          return;
        }
      }

      // Verify odometer reading is not less than the vehicle's current odometer
      if (Number(parsed.odometerReading) < Number(vehicle.odometer)) {
        res.status(400).json({
          success: false,
          message: `Odometer reading (${parsed.odometerReading}) cannot be less than the vehicle's current odometer (${vehicle.odometer})`,
        });
        return;
      }

      const log = await prisma.fuelLog.create({
        data: {
          vehicleId: parsed.vehicleId,
          tripId: parsed.tripId || null,
          liters: parsed.liters,
          cost: parsed.cost,
          odometerReading: parsed.odometerReading,
          recordedAt: new Date(parsed.recordedAt),
          createdById: req.user!.id,
        },
        include: { vehicle: true, trip: true },
      });

      res.status(201).json({ success: true, data: log });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, message: error.errors[0].message });
        return;
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * List expenses with optional filters
   */
  static async getExpenses(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { vehicleId, tripId, category, startDate, endDate } = req.query;

      const where: any = {};

      if (vehicleId) {
        where.vehicleId = String(vehicleId);
      }

      if (tripId) {
        where.tripId = String(tripId);
      }

      if (category) {
        where.category = category as ExpenseCategory;
      }

      if (startDate || endDate) {
        where.expenseDate = {};
        if (startDate) {
          where.expenseDate.gte = new Date(String(startDate));
        }
        if (endDate) {
          where.expenseDate.lte = new Date(String(endDate));
        }
      }

      const expenses = await prisma.expense.findMany({
        where,
        include: { vehicle: true, trip: true },
        orderBy: { expenseDate: 'desc' },
      });

      res.status(200).json({ success: true, data: expenses });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Create a new expense
   */
  static async createExpense(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = createExpenseSchema.parse(req.body);

      // Verify vehicle exists if provided
      if (parsed.vehicleId) {
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: parsed.vehicleId },
        });
        if (!vehicle) {
          res.status(404).json({ success: false, message: 'Vehicle not found' });
          return;
        }
      }

      // Verify trip exists if provided
      if (parsed.tripId) {
        const trip = await prisma.trip.findUnique({
          where: { id: parsed.tripId },
        });
        if (!trip) {
          res.status(404).json({ success: false, message: 'Trip not found' });
          return;
        }
        if (parsed.vehicleId && trip.vehicleId !== parsed.vehicleId) {
          res.status(400).json({ success: false, message: 'Trip does not belong to the specified vehicle' });
          return;
        }
      }

      const expense = await prisma.expense.create({
        data: {
          vehicleId: parsed.vehicleId || null,
          tripId: parsed.tripId || null,
          category: parsed.category,
          amount: parsed.amount,
          description: parsed.description,
          expenseDate: new Date(parsed.expenseDate),
          createdById: req.user!.id,
        },
        include: { vehicle: true, trip: true },
      });

      res.status(201).json({ success: true, data: expense });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, message: error.errors[0].message });
        return;
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Aggregate operational costs
   */
  static async getSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { vehicleId, startDate, endDate } = req.query;

      // Construct filter conditions for aggregation
      const filterConditionsFuel: any = {};
      const filterConditionsExpense: any = {};
      const filterConditionsMaintenance: any = { status: 'COMPLETED' };

      if (vehicleId) {
        filterConditionsFuel.vehicleId = String(vehicleId);
        filterConditionsExpense.vehicleId = String(vehicleId);
        filterConditionsMaintenance.vehicleId = String(vehicleId);
      }

      if (startDate || endDate) {
        const dateFilterFuel: any = {};
        const dateFilterExpense: any = {};
        const dateFilterMaintenance: any = {};

        if (startDate) {
          const sDate = new Date(String(startDate));
          dateFilterFuel.gte = sDate;
          dateFilterExpense.gte = sDate;
          dateFilterMaintenance.gte = sDate;
        }
        if (endDate) {
          const eDate = new Date(String(endDate));
          dateFilterFuel.lte = eDate;
          dateFilterExpense.lte = eDate;
          dateFilterMaintenance.lte = eDate;
        }

        filterConditionsFuel.recordedAt = dateFilterFuel;
        filterConditionsExpense.expenseDate = dateFilterExpense;
        filterConditionsMaintenance.completedAt = dateFilterMaintenance;
      }

      // Aggregate fuel cost
      const fuelCostAgg = await prisma.fuelLog.aggregate({
        where: filterConditionsFuel,
        _sum: { cost: true },
      });

      // Aggregate general expense amount
      const expenseAmountAgg = await prisma.expense.aggregate({
        where: filterConditionsExpense,
        _sum: { amount: true },
      });

      // Aggregate maintenance costs
      const maintenanceCostAgg = await prisma.maintenanceRecord.aggregate({
        where: filterConditionsMaintenance,
        _sum: { cost: true },
      });

      const totalFuelCost = Number(fuelCostAgg._sum.cost || 0);
      const totalExpenseAmount = Number(expenseAmountAgg._sum.amount || 0);
      const totalMaintenanceCost = Number(maintenanceCostAgg._sum.cost || 0);
      const totalOperationalCost = totalFuelCost + totalExpenseAmount + totalMaintenanceCost;

      res.status(200).json({
        success: true,
        data: {
          fuelCost: totalFuelCost,
          expenseCost: totalExpenseAmount,
          maintenanceCost: totalMaintenanceCost,
          totalOperationalCost,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
