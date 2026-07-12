import { z } from 'zod';
import { DriverStatus } from '@prisma/client';

const driverStatusEnum = z.nativeEnum(DriverStatus);

export const createDriverSchema = z.object({
  name: z.string().min(1, 'Driver name is required'),
  email: z.string().email('A valid email is required'),
  phone: z.string().min(10, 'Phone number is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseCategory: z.string().min(1, 'License category is required'),
  licenseExpiryDate: z.string().datetime({ message: 'License expiry date must be a valid ISO datetime' }),
  safetyScore: z.number().min(0, 'Safety score must be at least 0').max(10, 'Safety score cannot exceed 10'),
  status: driverStatusEnum,
  isActive: z.boolean().optional(),
});

export const updateDriverSchema = createDriverSchema.partial().extend({
  licenseExpiryDate: z.string().datetime({ message: 'License expiry date must be a valid ISO datetime' }).optional(),
});
