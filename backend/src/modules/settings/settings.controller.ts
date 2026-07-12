import { Request, Response } from 'express';
import { SettingsService } from './settings.service';

export class SettingsController {
  static async get(req: Request, res: Response): Promise<void> {
    try {
      const settings = await SettingsService.getSettings();
      res.status(200).json({ success: true, data: settings });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch settings' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { depotName, currencyCode, distanceUnit } = req.body;
      const settings = await SettingsService.updateSettings({ depotName, currencyCode, distanceUnit });
      res.status(200).json({ success: true, data: settings });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update settings' });
    }
  }
}
