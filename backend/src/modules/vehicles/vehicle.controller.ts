import { Request, Response } from 'express';
import { prisma } from '../../config/db';
import { createVehicleSchema, updateVehicleSchema } from './vehicle.validation';
import { VehicleStatus } from '@prisma/client';

export class VehicleController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { status, type, search } = req.query;

      const where: any = { isActive: true };

      if (status) {
        where.status = status as VehicleStatus;
      }
      if (type) {
        where.type = type;
      }
      if (search) {
        const searchStr = String(search);
        where.OR = [
          { registrationNumber: { contains: searchStr, mode: 'insensitive' } },
          { name: { contains: searchStr, mode: 'insensitive' } },
        ];
      }

      const vehicles = await prisma.vehicle.findMany({
        where,
        orderBy: { registrationNumber: 'asc' },
      });

      res.status(200).json({ success: true, data: vehicles });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const vehicle = await prisma.vehicle.findUnique({
        where: { id },
      });

      if (!vehicle) {
        res.status(404).json({ success: false, message: 'Vehicle not found' });
        return;
      }

      res.status(200).json({ success: true, data: vehicle });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const parsedData = createVehicleSchema.parse(req.body);

      const existingVehicle = await prisma.vehicle.findUnique({
        where: { registrationNumber: parsedData.registrationNumber },
      });

      if (existingVehicle) {
        res.status(400).json({ success: false, message: 'Vehicle registration number already exists.' });
        return;
      }

      const vehicle = await prisma.vehicle.create({
        data: {
          registrationNumber: parsedData.registrationNumber,
          name: parsedData.name,
          type: parsedData.type,
          maxLoadCapacity: parsedData.maxLoadCapacity,
          odometer: parsedData.odometer,
          acquisitionCost: parsedData.acquisitionCost,
          status: parsedData.status || VehicleStatus.AVAILABLE,
        },
      });

      res.status(201).json({ success: true, data: vehicle });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, message: error.errors[0].message });
        return;
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const parsedData = updateVehicleSchema.parse(req.body);

      const currentVehicle = await prisma.vehicle.findUnique({
        where: { id },
      });

      if (!currentVehicle) {
        res.status(404).json({ success: false, message: 'Vehicle not found' });
        return;
      }

      if (parsedData.registrationNumber && parsedData.registrationNumber !== currentVehicle.registrationNumber) {
        const existingVehicle = await prisma.vehicle.findUnique({
          where: { registrationNumber: parsedData.registrationNumber },
        });

        if (existingVehicle) {
          res.status(400).json({ success: false, message: 'Vehicle registration number already exists.' });
          return;
        }
      }

      // Business rule validation for status changes
      if (parsedData.status && parsedData.status !== currentVehicle.status) {
        const newStatus = parsedData.status;

        // Ensure we aren't changing to AVAILABLE if there are active trips/maintenance
        if (newStatus === VehicleStatus.AVAILABLE) {
          const activeTrip = await prisma.trip.findFirst({
            where: { vehicleId: id, status: 'DISPATCHED' },
          });
          if (activeTrip) {
            res.status(400).json({ success: false, message: 'Vehicle is currently assigned to an active trip.' });
            return;
          }

          const activeMaintenance = await prisma.maintenanceRecord.findFirst({
            where: { vehicleId: id, status: 'IN_PROGRESS' },
          });
          if (activeMaintenance) {
            res.status(400).json({ success: false, message: 'Vehicle is currently in maintenance.' });
            return;
          }
        }

        if (newStatus === VehicleStatus.RETIRED) {
          const activeTrip = await prisma.trip.findFirst({
            where: { vehicleId: id, status: 'DISPATCHED' },
          });
          if (activeTrip) {
            res.status(400).json({ success: false, message: 'Vehicle is currently assigned to an active trip.' });
            return;
          }
          if (currentVehicle.status === VehicleStatus.ON_TRIP) {
            res.status(400).json({ success: false, message: 'Cannot retire a vehicle that is on a trip.' });
            return;
          }
        }
        
        if (currentVehicle.status === VehicleStatus.ON_TRIP) {
             res.status(400).json({ success: false, message: 'Cannot manually change status of a vehicle on a trip.' });
             return;
        }
      }

      const updatedVehicle = await prisma.vehicle.update({
        where: { id },
        data: parsedData,
      });

      res.status(200).json({ success: true, data: updatedVehicle });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, message: error.errors[0].message });
        return;
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getAvailable(req: Request, res: Response): Promise<void> {
    try {
      // Find all vehicles that are AVAILABLE, active, and not retired/in-shop/on-trip
      const vehicles = await prisma.vehicle.findMany({
        where: {
          status: VehicleStatus.AVAILABLE,
          isActive: true,
        },
      });

      // Double check for any conflicting active dispatched trips
      const vehicleIds = vehicles.map((v: any) => v.id);
      
      const activeTrips = await prisma.trip.findMany({
        where: {
          vehicleId: { in: vehicleIds },
          status: 'DISPATCHED',
        },
        select: { vehicleId: true },
      });
      const dispatchedVehicleIds = new Set(activeTrips.map((t: any) => t.vehicleId));

      const activeMaintenance = await prisma.maintenanceRecord.findMany({
        where: {
          vehicleId: { in: vehicleIds },
          status: 'IN_PROGRESS',
        },
        select: { vehicleId: true },
      });
      const maintenanceVehicleIds = new Set(activeMaintenance.map((m: any) => m.vehicleId));

      const eligibleVehicles = vehicles.filter((v: any) => !dispatchedVehicleIds.has(v.id) && !maintenanceVehicleIds.has(v.id));

      const formattedVehicles = eligibleVehicles.map((v: any) => ({
        id: v.id,
        registrationNumber: v.registrationNumber,
        name: v.name,
        type: v.type,
        maxLoadCapacity: v.maxLoadCapacity,
        odometer: v.odometer,
        status: v.status,
      }));

      res.status(200).json({ success: true, data: formattedVehicles });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
