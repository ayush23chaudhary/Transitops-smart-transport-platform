import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  maintenanceType: z.string().min(1, 'Maintenance type is required'),
  description: z.string().optional(),
  cost: z.number().nonnegative('Cost must be non-negative'),
  scheduledAt: z.string().datetime().optional(),
});
