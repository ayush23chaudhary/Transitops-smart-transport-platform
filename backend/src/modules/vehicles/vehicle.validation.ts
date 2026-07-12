import { z } from 'zod';
import { VehicleStatus } from '@prisma/client';

export const createVehicleSchema = z.object({
  registrationNumber: z.string().min(1, 'Registration number is required'),
  name: z.string().min(1, 'Vehicle name/model is required'),
  type: z.string().min(1, 'Vehicle type is required'),
  maxLoadCapacity: z.number().positive('Maximum load capacity must be positive'),
  odometer: z.number().nonnegative('Odometer must be non-negative'),
  acquisitionCost: z.number().nonnegative('Acquisition cost must be non-negative'),
  status: z.nativeEnum(VehicleStatus).optional(),
});

export const updateVehicleSchema = z.object({
  registrationNumber: z.string().min(1, 'Registration number is required').optional(),
  name: z.string().min(1, 'Vehicle name/model is required').optional(),
  type: z.string().min(1, 'Vehicle type is required').optional(),
  maxLoadCapacity: z.number().positive('Maximum load capacity must be positive').optional(),
  odometer: z.number().nonnegative('Odometer must be non-negative').optional(),
  acquisitionCost: z.number().nonnegative('Acquisition cost must be non-negative').optional(),
  status: z.nativeEnum(VehicleStatus).optional(),
});
