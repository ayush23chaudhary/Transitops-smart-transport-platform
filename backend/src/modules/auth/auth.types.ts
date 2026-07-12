import { UserRole } from '@prisma/client';

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthTokenPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
