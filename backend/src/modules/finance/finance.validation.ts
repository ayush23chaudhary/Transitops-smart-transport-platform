import { z } from 'zod';
import { ExpenseCategory } from '@prisma/client';

export const createFuelLogSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID format'),
  tripId: z.string().uuid('Invalid trip ID format').optional().nullable(),
  liters: z.number().positive('Fuel liters must be positive'),
  cost: z.number().positive('Fuel cost must be positive'),
  odometerReading: z.number().nonnegative('Odometer reading must be non-negative'),
  recordedAt: z.string().datetime('Invalid recorded date format').or(z.date()),
});

export const createExpenseSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID format').optional().nullable(),
  tripId: z.string().uuid('Invalid trip ID format').optional().nullable(),
  category: z.nativeEnum(ExpenseCategory, { errorMap: () => ({ message: 'Invalid expense category' }) }),
  amount: z.number().positive('Expense amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  expenseDate: z.string().datetime('Invalid expense date format').or(z.date()),
});
