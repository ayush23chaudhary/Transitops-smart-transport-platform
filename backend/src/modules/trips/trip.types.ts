import { Trip, TripStatus, Vehicle, Driver, User } from '@prisma/client';

export type TripWithDetails = Trip & {
  vehicle: Pick<Vehicle, 'id' | 'registrationNumber' | 'name' | 'type' | 'maxLoadCapacity' | 'odometer' | 'status'>;
  driver: Pick<Driver, 'id' | 'name' | 'licenseNumber' | 'licenseCategory' | 'licenseExpiryDate' | 'safetyScore' | 'status'>;
  creator: Pick<User, 'id' | 'name' | 'email' | 'role'>;
};

export interface CreateTripDto {
  tripNumber: string;
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number;
  plannedDistance: number;
  scheduledAt: Date;
  revenue?: number;
}

export interface CompleteTripDto {
  actualDistance?: number;
  endOdometer?: number;
  revenue?: number;
}
