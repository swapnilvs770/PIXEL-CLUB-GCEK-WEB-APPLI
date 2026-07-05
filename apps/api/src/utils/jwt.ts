import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './AppError';

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  email: string;
  role: 'user' | 'admin';
  status: 'pending' | 'approved' | 'blocked';
}

export function signAccessToken(payload: Omit<AccessTokenPayload, 'iat' | 'exp'>): string {
  const opts: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET, opts);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
    if (!decoded.sub || !decoded.email || !decoded.role) {
      throw new AppError({ message: 'Invalid token payload', statusCode: 401, code: 'INVALID_TOKEN' });
    }
    return decoded;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError({ message: 'Invalid or expired token', statusCode: 401, code: 'INVALID_TOKEN' });
  }
}
