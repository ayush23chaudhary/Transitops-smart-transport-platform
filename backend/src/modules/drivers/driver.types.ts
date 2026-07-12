import { DriverStatus } from '@prisma/client';

export interface DriverPayload {
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string;
  safetyScore: number;
  status: DriverStatus;
  isActive?: boolean;
}

export interface DriverSafetyProfile {
  completedTrips: number;
  cancelledTrips: number;
  totalTerminalTrips: number;
  completionRate: number;
  hasActiveDispatchedTrip: boolean;
}

export interface DriverResponse extends DriverPayload {
  id: string;
  createdAt: string;
  updatedAt: string;
  dispatchEligible: boolean;
  completionRate: number;
  completedTrips: number;
  cancelledTrips: number;
  totalTerminalTrips: number;
}
