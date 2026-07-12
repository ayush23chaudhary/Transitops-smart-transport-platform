import { Request, Response } from 'express';
import { DriverService } from './driver.service';
import { createDriverSchema, updateDriverSchema } from './driver.validation';

export class DriverController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const drivers = await DriverService.listActiveDrivers();
      res.status(200).json({ success: true, data: drivers });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch drivers' });
    }
  }

  static async getAvailable(req: Request, res: Response): Promise<void> {
    try {
      const drivers = await DriverService.getAvailableDrivers();
      res.status(200).json({ success: true, data: drivers });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch available drivers' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const parsed = createDriverSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: parsed.error.errors[0]?.message || 'Invalid driver data' });
        return;
      }

      const driver = await DriverService.createDriver(parsed.data);
      res.status(201).json({ success: true, data: driver });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Failed to create driver' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const parsed = updateDriverSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: parsed.error.errors[0]?.message || 'Invalid driver data' });
        return;
      }

      const driver = await DriverService.updateDriver(id, parsed.data);
      res.status(200).json({ success: true, data: driver });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Failed to update driver' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const driver = await DriverService.getById(id);
      if (!driver) {
        res.status(404).json({ success: false, message: 'Driver not found' });
        return;
      }
      res.status(200).json({ success: true, data: driver });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch driver' });
    }
  }
}
