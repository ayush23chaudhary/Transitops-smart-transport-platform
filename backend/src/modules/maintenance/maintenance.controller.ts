import { Request, Response } from 'express';
import { prisma } from '../../config/db';
import { createMaintenanceSchema } from './maintenance.validation';
import { MaintenanceStatus, VehicleStatus } from '@prisma/client';

export class MaintenanceController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { vehicleId, status } = req.query;
      
      const where: any = {};
      if (vehicleId) where.vehicleId = vehicleId;
      if (status) where.status = status as MaintenanceStatus;

      const records = await prisma.maintenanceRecord.findMany({
        where,
        include: { vehicle: true },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json({ success: true, data: records });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const record = await prisma.maintenanceRecord.findUnique({
        where: { id },
        include: { vehicle: true },
      });
      
      if (!record) {
        res.status(404).json({ success: false, message: 'Maintenance record not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: record });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const parsedData = createMaintenanceSchema.parse(req.body);
      const userId = (req as any).user.id;

      const vehicle = await prisma.vehicle.findUnique({ where: { id: parsedData.vehicleId } });
      if (!vehicle) {
        res.status(400).json({ success: false, message: 'Vehicle not found' });
        return;
      }

      if (vehicle.status === VehicleStatus.RETIRED) {
        res.status(400).json({ success: false, message: 'Retired vehicles cannot enter maintenance.' });
        return;
      }

      const record = await prisma.maintenanceRecord.create({
        data: {
          vehicleId: parsedData.vehicleId,
          maintenanceType: parsedData.maintenanceType,
          description: parsedData.description || '',
          cost: parsedData.cost,
          status: MaintenanceStatus.SCHEDULED,
          scheduledAt: parsedData.scheduledAt ? new Date(parsedData.scheduledAt) : null,
          createdById: userId,
        },
      });

      res.status(201).json({ success: true, data: record });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, message: error.errors[0].message });
        return;
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async start(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.$transaction(async (tx: any) => {
        const record = await tx.maintenanceRecord.findUnique({ where: { id } });
        if (!record) throw new Error('Maintenance record not found');
        if (record.status !== MaintenanceStatus.SCHEDULED) {
          throw new Error('Only scheduled maintenance can be started.');
        }

        const vehicle = await tx.vehicle.findUnique({ where: { id: record.vehicleId } });
        if (!vehicle) throw new Error('Vehicle not found');

        if (vehicle.status === VehicleStatus.ON_TRIP) {
          throw new Error('Vehicle is currently assigned to an active trip.');
        }
        if (vehicle.status === VehicleStatus.RETIRED) {
          throw new Error('Retired vehicles cannot enter maintenance.');
        }

        const activeTrip = await tx.trip.findFirst({
          where: { vehicleId: vehicle.id, status: 'DISPATCHED' },
        });
        if (activeTrip) {
          throw new Error('Vehicle is currently assigned to an active trip.');
        }

        const activeMaintenance = await tx.maintenanceRecord.findFirst({
          where: { vehicleId: vehicle.id, status: MaintenanceStatus.IN_PROGRESS },
        });
        if (activeMaintenance) {
          throw new Error('Vehicle is currently in maintenance.');
        }

        await tx.maintenanceRecord.update({
          where: { id },
          data: {
            status: MaintenanceStatus.IN_PROGRESS,
            startedAt: new Date(),
          },
        });

        await tx.vehicle.update({
          where: { id: vehicle.id },
          data: { status: VehicleStatus.IN_SHOP },
        });
      });

      res.status(200).json({ success: true, message: 'Maintenance started successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async complete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.$transaction(async (tx: any) => {
        const record = await tx.maintenanceRecord.findUnique({ where: { id } });
        if (!record) throw new Error('Maintenance record not found');
        if (record.status === MaintenanceStatus.COMPLETED) {
          throw new Error('Maintenance record is already completed.');
        }
        if (record.status !== MaintenanceStatus.IN_PROGRESS) {
          throw new Error('Only in-progress maintenance can be completed.');
        }

        await tx.maintenanceRecord.update({
          where: { id },
          data: {
            status: MaintenanceStatus.COMPLETED,
            completedAt: new Date(),
          },
        });

        const otherActiveMaintenance = await tx.maintenanceRecord.findFirst({
          where: { 
            vehicleId: record.vehicleId, 
            status: MaintenanceStatus.IN_PROGRESS,
            id: { not: record.id }
          },
        });

        if (!otherActiveMaintenance) {
          const vehicle = await tx.vehicle.findUnique({ where: { id: record.vehicleId } });
          if (vehicle?.status === VehicleStatus.IN_SHOP) {
            await tx.vehicle.update({
              where: { id: record.vehicleId },
              data: { status: VehicleStatus.AVAILABLE },
            });
          }
        }
      });

      res.status(200).json({ success: true, message: 'Maintenance completed successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async cancel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.$transaction(async (tx: any) => {
        const record = await tx.maintenanceRecord.findUnique({ where: { id } });
        if (!record) throw new Error('Maintenance record not found');
        if (record.status !== MaintenanceStatus.SCHEDULED) {
          throw new Error('Only scheduled maintenance can be cancelled.');
        }

        await tx.maintenanceRecord.update({
          where: { id },
          data: { status: MaintenanceStatus.CANCELLED },
        });
      });

      res.status(200).json({ success: true, message: 'Maintenance cancelled successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
