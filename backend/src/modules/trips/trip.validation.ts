import { z } from 'zod';

export const createTripSchema = z.object({
  tripNumber: z.string().min(1, 'Trip number is required'),
  source: z.string().min(1, 'Source is required'),
  destination: z.string().min(1, 'Destination is required'),
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  driverId: z.string().uuid('Invalid driver ID'),
  cargoWeight: z.number().nonnegative('Cargo weight must be non-negative'),
  plannedDistance: z.number().positive('Planned distance must be positive'),
  scheduledAt: z.string().datetime({ message: 'Scheduled date must be a valid ISO datetime' }),
  revenue: z.number().nonnegative('Revenue must be non-negative').optional(),
});

export const completeTripSchema = z.object({
  actualDistance: z.number().nonnegative('Actual distance must be non-negative').optional(),
  endOdometer: z.number().nonnegative('End odometer must be non-negative').optional(),
  revenue: z.number().nonnegative('Revenue must be non-negative').optional(),
});
