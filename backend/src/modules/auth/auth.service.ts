import { prisma } from '../../config/db';
import * as bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { LoginDto, AuthTokenPayload } from './auth.types';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

export async function loginUser(data: LoginDto): Promise<{ token: string; user: AuthTokenPayload }> {
  const normalizedEmail = data.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !user.isActive) {
    throw new Error('Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(data.password, user.passwordHash);
  if (!passwordMatches) {
    throw new Error('Invalid email or password');
  }

  const payload: AuthTokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as any);

  return { token, user: payload };
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
}
