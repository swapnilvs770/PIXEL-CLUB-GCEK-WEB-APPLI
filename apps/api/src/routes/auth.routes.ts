import { Router } from 'express';
import passport from '../config/passport';
import { googleCallback, getMe, logout } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';
import { env } from '../config/env';

const router = Router();

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${env.CLIENT_BASE_URL}/login?error=oauth_failed`,
  }),
  googleCallback
);

router.get('/me', authenticate, getMe);

router.post('/logout', authenticate, logout);

export default router;
