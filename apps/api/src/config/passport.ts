import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { env, adminBootstrapEmails } from './env';
import { User } from '../models/User';
import { logger } from './logger';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_REDIRECT_URI,
      scope: ['profile', 'email'],
    },
    async (_accessToken, _refreshToken, profile: Profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase().trim();
        if (!email) {
          return done(new Error('Google account did not return an email address'));
        }

        const photo = profile.photos?.[0]?.value;
        const displayName = profile.displayName?.trim() || email.split('@')[0];
        const isBootstrapAdmin = adminBootstrapEmails.includes(email);

        // Try to find by googleId first, then by email (handles re-login after email change)
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.findOne({ email });
          if (user) {
            user.googleId = profile.id;
            if (!user.avatarUrl && photo) user.avatarUrl = photo;
            if (!user.name) user.name = displayName;
          } else {
            user = new User({
              googleId: profile.id,
              email,
              name: displayName,
              avatarUrl: photo ?? null,
              role: isBootstrapAdmin ? 'admin' : 'user',
              status: isBootstrapAdmin ? 'approved' : 'pending',
            });
            if (isBootstrapAdmin) {
              user.approvedAt = new Date();
            }
          }
        } else {
          // Existing user — keep role/status as admin set them, just refresh profile fields
          if (!user.avatarUrl && photo) user.avatarUrl = photo;
          if (!user.name) user.name = displayName;
        }

        user.lastLoginAt = new Date();
        await user.save();

        logger.info(
          { userId: user._id.toString(), email, role: user.role, status: user.status },
          'Google OAuth login'
        );

        return done(null, user);
      } catch (err) {
        logger.error({ err }, 'Google OAuth verification error');
        return done(err as Error);
      }
    }
  )
);

export default passport;
