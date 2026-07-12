import { api } from '../../lib/api';
import type { DriverRow } from './driver.types';

export interface DriverPayload {
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string;
  safetyScore: number;
  status: string;
  isActive?: boolean;
}

export const driverService = {
  list: () => api.get<DriverRow[]>('/drivers'),
  available: () => api.get<DriverRow[]>('/drivers/available'),
  create: (payload: DriverPayload) => api.post<DriverRow>('/drivers', payload),
  update: (id: string, payload: Partial<DriverPayload>) => api.patch<DriverRow>(`/drivers/${id}`, payload),
};
