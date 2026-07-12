import { prisma } from '../../config/db';
import { TripStatus, VehicleStatus, DriverStatus, Trip } from '@prisma/client';
import { CreateTripDto, CompleteTripDto, TripWithDetails } from './trip.types';

export class TripService {
  /**
   * Get all trips, optionally filtered by status
   */
  static async getAll(status?: TripStatus): Promise<TripWithDetails[]> {
    return prisma.trip.findMany({
      where: status ? { status } : {},
      include: {
        vehicle: {
          select: {
            id: true,
            registrationNumber: true,
            name: true,
            type: true,
            maxLoadCapacity: true,
            odometer: true,
            status: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            licenseNumber: true,
            licenseCategory: true,
            licenseExpiryDate: true,
            safetyScore: true,
            status: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }) as unknown as Promise<TripWithDetails[]>;
  }

  /**
   * Get a trip by ID
   */
  static async getById(id: string): Promise<TripWithDetails | null> {
    return prisma.trip.findUnique({
      where: { id },
      include: {
        vehicle: {
          select: {
            id: true,
            registrationNumber: true,
            name: true,
            type: true,
            maxLoadCapacity: true,
            odometer: true,
            status: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            licenseNumber: true,
            licenseCategory: true,
            licenseExpiryDate: true,
            safetyScore: true,
            status: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }) as unknown as Promise<TripWithDetails | null>;
  }

  /**
   * Create a DRAFT trip
   */
  static async createDraft(data: CreateTripDto, userId: string): Promise<Trip> {
    const existingTrip = await prisma.trip.findUnique({
      where: { tripNumber: data.tripNumber },
    });

    if (existingTrip) {
      throw new Error(`Trip number ${data.tripNumber} already exists`);
    }

    // Verify vehicle and driver exist
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) {
      throw new Error('Assigned vehicle does not exist');
    }

    const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });
    if (!driver) {
      throw new Error('Assigned driver does not exist');
    }

    // Cargo weight check
    if (Number(data.cargoWeight) > Number(vehicle.maxLoadCapacity)) {
      throw new Error(`Cargo weight (${data.cargoWeight} kg) exceeds vehicle max load capacity (${vehicle.maxLoadCapacity} kg)`);
    }

    return prisma.trip.create({
      data: {
        tripNumber: data.tripNumber,
        source: data.source,
        destination: data.destination,
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        cargoWeight: data.cargoWeight,
        plannedDistance: data.plannedDistance,
        status: TripStatus.DRAFT,
        scheduledAt: data.scheduledAt,
        revenue: data.revenue,
        createdById: userId,
      },
    });
  }

  /**
   * Dispatch a trip (Atomic transaction)
   */
  static async dispatchTrip(id: string): Promise<Trip> {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch Trip
      const trip = await tx.trip.findUnique({
        where: { id },
        include: { vehicle: true, driver: true },
      });

      if (!trip) {
        throw new Error('Trip not found');
      }

      // 4. Verify Trip status is DRAFT
      if (trip.status !== TripStatus.DRAFT) {
        throw new Error(`Trip cannot be dispatched because it is in ${trip.status} status`);
      }

      const vehicle = trip.vehicle;
      const driver = trip.driver;

      // 5. Verify Vehicle status is AVAILABLE
      if (vehicle.status !== VehicleStatus.AVAILABLE) {
        throw new Error(`Vehicle ${vehicle.registrationNumber} is not AVAILABLE (current status: ${vehicle.status})`);
      }

      // 8. Verify Driver is not suspended
      if (driver.status === DriverStatus.SUSPENDED) {
        throw new Error(`Driver ${driver.name} cannot be dispatched because they are SUSPENDED`);
      }

      // 7. Verify Driver license has not expired
      if (new Date(driver.licenseExpiryDate) < new Date()) {
        throw new Error(`Driver ${driver.name} cannot be dispatched because their license has expired`);
      }

      // 6. Verify Driver status is AVAILABLE
      if (driver.status !== DriverStatus.AVAILABLE) {
        throw new Error(`Driver ${driver.name} is not AVAILABLE (current status: ${driver.status})`);
      }

      // 9. Verify cargoWeight <= vehicle.maxLoadCapacity
      if (Number(trip.cargoWeight) > Number(vehicle.maxLoadCapacity)) {
        throw new Error(`Cargo weight (${trip.cargoWeight} kg) exceeds vehicle capacity (${vehicle.maxLoadCapacity} kg)`);
      }

      // 10. Verify no conflicting active trip exists
      const conflictingVehicleTrip = await tx.trip.findFirst({
        where: {
          vehicleId: vehicle.id,
          status: TripStatus.DISPATCHED,
        },
      });
      if (conflictingVehicleTrip) {
        throw new Error(`Vehicle ${vehicle.registrationNumber} already has an active dispatched trip`);
      }

      const conflictingDriverTrip = await tx.trip.findFirst({
        where: {
          driverId: driver.id,
          status: TripStatus.DISPATCHED,
        },
      });
      if (conflictingDriverTrip) {
        throw new Error(`Driver ${driver.name} already has an active dispatched trip`);
      }

      // 11. Update Trip to DISPATCHED
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: {
          status: TripStatus.DISPATCHED,
          dispatchedAt: new Date(),
          startOdometer: vehicle.odometer, // capture odometer at start
        },
      });

      // 13. Update Vehicle to ON_TRIP
      await tx.vehicle.update({
        where: { id: vehicle.id },
        data: { status: VehicleStatus.ON_TRIP },
      });

      // 14. Update Driver to ON_TRIP
      await tx.driver.update({
        where: { id: driver.id },
        data: { status: DriverStatus.ON_TRIP },
      });

      return updatedTrip;
    });
  }

  /**
   * Complete a trip (Atomic transaction)
   */
  static async completeTrip(id: string, data: CompleteTripDto): Promise<Trip> {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch Trip
      const trip = await tx.trip.findUnique({
        where: { id },
        include: { vehicle: true, driver: true },
      });

      if (!trip) {
        throw new Error('Trip not found');
      }

      // Verify Trip is DISPATCHED
      if (trip.status !== TripStatus.DISPATCHED) {
        throw new Error(`Trip cannot be completed because it is in ${trip.status} status`);
      }

      // Validate end odometer
      if (data.endOdometer !== undefined) {
        const startOdo = trip.startOdometer ? Number(trip.startOdometer) : Number(trip.vehicle.odometer);
        if (data.endOdometer < startOdo) {
          throw new Error(`End odometer (${data.endOdometer}) cannot be less than start odometer (${startOdo})`);
        }
      }

      // 3. Update Trip to COMPLETED
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: {
          status: TripStatus.COMPLETED,
          completedAt: new Date(),
          actualDistance: data.actualDistance ?? trip.plannedDistance,
          endOdometer: data.endOdometer ?? (trip.startOdometer ? Number(trip.startOdometer) + Number(data.actualDistance ?? trip.plannedDistance) : null),
          revenue: data.revenue !== undefined ? data.revenue : trip.revenue,
        },
      });

      // 7. Update Vehicle to AVAILABLE
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: {
          status: VehicleStatus.AVAILABLE,
          // 9. Update vehicle odometer when valid
          odometer: data.endOdometer ?? (trip.vehicle.odometer.toNumber() + Number(data.actualDistance ?? trip.plannedDistance)),
        },
      });

      // 8. Update Driver to AVAILABLE
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.AVAILABLE },
      });

      return updatedTrip;
    });
  }

  /**
   * Cancel a trip (Atomic transaction)
   */
  static async cancelTrip(id: string): Promise<Trip> {
    return prisma.$transaction(async (tx) => {
      // Fetch Trip
      const trip = await tx.trip.findUnique({
        where: { id },
      });

      if (!trip) {
        throw new Error('Trip not found');
      }

      if (trip.status === TripStatus.COMPLETED) {
        throw new Error('Completed trips cannot be cancelled');
      }

      if (trip.status === TripStatus.CANCELLED) {
        throw new Error('Trip is already cancelled');
      }

      // If DRAFT trip: Change only Trip to CANCELLED
      if (trip.status === TripStatus.DRAFT) {
        return tx.trip.update({
          where: { id },
          data: {
            status: TripStatus.CANCELLED,
            cancelledAt: new Date(),
          },
        });
      }

      // If DISPATCHED trip: Trip -> CANCELLED, Vehicle -> AVAILABLE, Driver -> AVAILABLE
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: {
          status: TripStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      });

      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: VehicleStatus.AVAILABLE },
      });

      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.AVAILABLE },
      });

      return updatedTrip;
    });
  }
}
