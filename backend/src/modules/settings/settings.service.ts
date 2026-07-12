import { prisma } from '../../config/db';

export class SettingsService {
  static async getSettings() {
    let settings = await prisma.organizationSettings.findFirst();
    if (!settings) {
      settings = await prisma.organizationSettings.create({
        data: {
          depotName: 'Gandhinagar Depot GT4',
          currencyCode: 'INR',
          distanceUnit: 'km',
        },
      });
    }
    return settings;
  }

  static async updateSettings(data: { depotName?: string; currencyCode?: string; distanceUnit?: string }) {
    let settings = await prisma.organizationSettings.findFirst();
    if (!settings) {
      return await prisma.organizationSettings.create({
        data: {
          depotName: data.depotName ?? 'Gandhinagar Depot GT4',
          currencyCode: data.currencyCode ?? 'INR',
          distanceUnit: data.distanceUnit ?? 'km',
        },
      });
    }
    return await prisma.organizationSettings.update({
      where: { id: settings.id },
      data: {
        depotName: data.depotName,
        currencyCode: data.currencyCode,
        distanceUnit: data.distanceUnit,
      },
    });
  }
}
