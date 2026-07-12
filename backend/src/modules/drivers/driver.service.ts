import { DriverStatus, TripStatus } from '@prisma/client';
import { prisma } from '../../config/db';
import { DriverPayload, DriverResponse } from './driver.types';

const isLicenseExpired = (expiry: Date) => new Date(expiry) < new Date();

const calculateCompletionRate = (completed: number, cancelled: number): number => {
  const total = completed + cancelled;
  if (total === 0) return 0;
  return Number(((completed / total) * 100).toFixed(2));
};

export class DriverService {
  static async listActiveDrivers(): Promise<DriverResponse[]> {
    const drivers = await prisma.driver.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        trips: true,
      },
    });

    return drivers.map((driver) => {
      const completedTrips = driver.trips.filter((trip) => trip.status === TripStatus.COMPLETED).length;
      const cancelledTrips = driver.trips.filter((trip) => trip.status === TripStatus.CANCELLED).length;
      const completionRate = calculateCompletionRate(completedTrips, cancelledTrips);
      const dispatchEligible =
        driver.status === DriverStatus.AVAILABLE &&
        !isLicenseExpired(driver.licenseExpiryDate) &&
        driver.trips.every((trip) => trip.status !== TripStatus.DISPATCHED);

      return {
        id: driver.id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        licenseNumber: driver.licenseNumber,
        licenseCategory: driver.licenseCategory,
        licenseExpiryDate: driver.licenseExpiryDate.toISOString(),
        safetyScore: Number(driver.safetyScore),
        status: driver.status,
        isActive: driver.isActive,
        createdAt: driver.createdAt.toISOString(),
        updatedAt: driver.updatedAt.toISOString(),
        dispatchEligible,
        completedTrips,
        cancelledTrips,
        totalTerminalTrips: completedTrips + cancelledTrips,
        completionRate,
      };
    });
  }

  static async getAvailableDrivers(): Promise<DriverResponse[]> {
    const drivers = await prisma.driver.findMany({
      where: {
        isActive: true,
        status: DriverStatus.AVAILABLE,
        licenseExpiryDate: { gt: new Date() },
      },
      orderBy: { name: 'asc' },
      include: { trips: true },
    });

    return drivers
      .filter((driver) => driver.trips.every((trip) => trip.status !== TripStatus.DISPATCHED))
      .map((driver) => {
        const completedTrips = driver.trips.filter((trip) => trip.status === TripStatus.COMPLETED).length;
        const cancelledTrips = driver.trips.filter((trip) => trip.status === TripStatus.CANCELLED).length;
        const completionRate = calculateCompletionRate(completedTrips, cancelledTrips);
        return {
          id: driver.id,
          name: driver.name,
          email: driver.email,
          phone: driver.phone,
          licenseNumber: driver.licenseNumber,
          licenseCategory: driver.licenseCategory,
          licenseExpiryDate: driver.licenseExpiryDate.toISOString(),
          safetyScore: Number(driver.safetyScore),
          status: driver.status,
          isActive: driver.isActive,
          createdAt: driver.createdAt.toISOString(),
          updatedAt: driver.updatedAt.toISOString(),
          dispatchEligible: true,
          completedTrips,
          cancelledTrips,
          totalTerminalTrips: completedTrips + cancelledTrips,
          completionRate,
        };
      });
  }

  static async getById(id: string): Promise<DriverResponse | null> {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: { trips: true },
    });

    if (!driver) return null;

    const completedTrips = driver.trips.filter((trip) => trip.status === TripStatus.COMPLETED).length;
    const cancelledTrips = driver.trips.filter((trip) => trip.status === TripStatus.CANCELLED).length;
    const completionRate = calculateCompletionRate(completedTrips, cancelledTrips);
    const dispatchEligible =
      driver.status === DriverStatus.AVAILABLE &&
      !isLicenseExpired(driver.licenseExpiryDate) &&
      driver.trips.every((trip) => trip.status !== TripStatus.DISPATCHED);

    return {
      id: driver.id,
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      licenseCategory: driver.licenseCategory,
      licenseExpiryDate: driver.licenseExpiryDate.toISOString(),
      safetyScore: Number(driver.safetyScore),
      status: driver.status,
      isActive: driver.isActive,
      createdAt: driver.createdAt.toISOString(),
      updatedAt: driver.updatedAt.toISOString(),
      dispatchEligible,
      completedTrips,
      cancelledTrips,
      totalTerminalTrips: completedTrips + cancelledTrips,
      completionRate,
    };
  }

  static async createDriver(data: DriverPayload): Promise<DriverResponse> {
    const existingByEmail = await prisma.driver.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existingByEmail) {
      throw new Error('Driver email already exists.');
    }

    const existingByLicense = await prisma.driver.findUnique({ where: { licenseNumber: data.licenseNumber } });
    if (existingByLicense) {
      throw new Error('Driver license number already exists.');
    }

    const driver = await prisma.driver.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
        licenseExpiryDate: new Date(data.licenseExpiryDate),
      },
      include: { trips: true },
    });

    return this.getById(driver.id) as Promise<DriverResponse>;
  }

  static async updateDriver(id: string, data: Partial<DriverPayload>): Promise<DriverResponse> {
    const driver = await prisma.driver.findUnique({ where: { id }, include: { trips: true } });
    if (!driver) {
      throw new Error('Driver not found.');
    }

    if (data.email && data.email.toLowerCase() !== driver.email) {
      const existingByEmail = await prisma.driver.findUnique({ where: { email: data.email.toLowerCase() } });
      if (existingByEmail) {
        throw new Error('Driver email already exists.');
      }
    }

    if (data.licenseNumber && data.licenseNumber !== driver.licenseNumber) {
      const existingByLicense = await prisma.driver.findUnique({ where: { licenseNumber: data.licenseNumber } });
      if (existingByLicense) {
        throw new Error('Driver license number already exists.');
      }
    }

    if (data.status === DriverStatus.AVAILABLE) {
      const activeTrip = driver.trips.find((trip) => trip.status === TripStatus.DISPATCHED);
      if (activeTrip) {
        throw new Error('Driver is currently assigned to an active dispatched trip. Cannot switch to AVAILABLE.');
      }
    }

    if (
      data.status &&
      (data.status === DriverStatus.SUSPENDED || data.status === DriverStatus.OFF_DUTY) &&
      driver.trips.some((trip) => trip.status === TripStatus.DISPATCHED)
    ) {
      throw new Error('Cannot change status while driver has an active dispatched trip.');
    }

    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: {
        ...data,
        email: data.email ? data.email.toLowerCase() : undefined,
        licenseExpiryDate: data.licenseExpiryDate ? new Date(data.licenseExpiryDate) : undefined,
      },
      include: { trips: true },
    });

    return this.getById(updatedDriver.id) as Promise<DriverResponse>;
  }
}
