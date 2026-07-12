export interface DriverRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string;
  safetyScore: number;
  status: string;
  dispatchEligible: boolean;
  completionRate: number;
  completedTrips: number;
  cancelledTrips: number;
  totalTerminalTrips: number;
}
