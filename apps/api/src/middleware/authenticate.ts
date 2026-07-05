import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: 'user' | 'admin';
      userStatus?: 'pending' | 'approved' | 'blocked';
    }
  }
}

/**
 * Verifies the JWT and re-loads the user's current role/status from the database.
 * This ensures that if an admin blocks a user, that user cannot continue using a
 * previously-issued token even though it hasn't expired.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError({
        message: 'Authentication required',
        statusCode: 401,
        code: 'NOT_AUTHENTICATED',
      });
    }

    const token = header.slice(7).trim();
    if (!token) {
      throw new AppError({
        message: 'Authentication required',
        statusCode: 401,
        code: 'NOT_AUTHENTICATED',
      });
    }

    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.sub)
      .select('role status')
      .lean();
    if (!user) {
      throw new AppError({
        message: 'User no longer exists',
        statusCode: 401,
        code: 'USER_NOT_FOUND',
      });
    }

    req.userId = payload.sub;
    req.userRole = user.role;
    req.userStatus = user.status;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.userRole !== 'admin') {
    return next(
      new AppError({
        message: 'Admin access required',
        statusCode: 403,
        code: 'FORBIDDEN',
      })
    );
  }
  next();
}

export function requireApproved(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.userStatus !== 'approved') {
    return next(
      new AppError({
        message:
          req.userStatus === 'pending'
            ? 'Account is pending admin approval'
            : 'Account has been blocked',
        statusCode: 403,
        code: req.userStatus === 'pending' ? 'PENDING' : 'BLOCKED',
      })
    );
  }
  next();
}
