import { api } from '../../lib/api';
import type { LoginResponse } from './auth.types';

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return api.post<LoginResponse>('/auth/login', { email, password });
  },
};
