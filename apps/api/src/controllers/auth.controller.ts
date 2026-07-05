import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendOk } from '../utils/ApiResponse';
import { AppError } from '../utils/AppError';
import { User, IUser } from '../models/User';
import { signAccessToken } from '../utils/jwt';
import { env } from '../config/env';
import { logAction } from '../services/log.service';

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) {
    throw new AppError({
      message: 'User not found',
      statusCode: 404,
      code: 'USER_NOT_FOUND',
    });
  }
  sendOk(res, user.toSafeJSON());
});

/**
 * Passport hands control here after a successful Google login.
 * We issue a JWT and redirect the browser to the frontend callback page.
 */
export const googleCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser | undefined;
    if (!user) {
      throw new AppError({
        message: 'OAuth handshake failed',
        statusCode: 401,
        code: 'OAUTH_FAILED',
      });
    }

    const token = signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      status: user.status,
    });

    await logAction(
      {
        userId: user._id.toString(),
        action: 'auth.login',
        result: 'success',
        meta: { provider: 'google', role: user.role, status: user.status },
      },
      req
    );

    const redirectUrl = new URL('/auth/callback', env.CLIENT_BASE_URL);
    redirectUrl.searchParams.set('token', token);
    res.redirect(redirectUrl.toString());
  }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await logAction(
    {
      userId: req.userId,
      action: 'auth.logout',
      result: 'success',
    },
    req
  );
  sendOk(res, { ok: true });
});
