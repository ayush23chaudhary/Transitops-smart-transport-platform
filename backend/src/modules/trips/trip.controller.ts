import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { TripService } from './trip.service';
import { createTripSchema, completeTripSchema } from './trip.validation';
import { TripStatus } from '@prisma/client';

export class TripController {
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const statusFilter = req.query.status as TripStatus | undefined;
      const trips = await TripService.getAll(statusFilter);
      res.status(200).json({
        success: true,
        data: trips,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch trips',
      });
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const trip = await TripService.getById(id);
      if (!trip) {
        res.status(404).json({
          success: false,
          message: 'Trip not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch trip details',
      });
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = createTripSchema.safeParse(req.body);
      if (!validated.success) {
        res.status(400).json({
          success: false,
          message: validated.error.errors[0]?.message || 'Validation error',
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const trip = await TripService.createDraft(
        {
          ...validated.data,
          scheduledAt: new Date(validated.data.scheduledAt),
        },
        req.user.id
      );

      res.status(201).json({
        success: true,
        data: trip,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create trip draft',
      });
    }
  }

  static async dispatch(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const trip = await TripService.dispatchTrip(id);
      res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to dispatch trip',
      });
    }
  }

  static async complete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validated = completeTripSchema.safeParse(req.body);
      if (!validated.success) {
        res.status(400).json({
          success: false,
          message: validated.error.errors[0]?.message || 'Validation error',
        });
        return;
      }

      const trip = await TripService.completeTrip(id, validated.data);
      res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to complete trip',
      });
    }
  }

  static async cancel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const trip = await TripService.cancelTrip(id);
      res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to cancel trip',
      });
    }
  }
}
