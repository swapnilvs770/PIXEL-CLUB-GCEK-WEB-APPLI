import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Aperture,
  Camera,
  ChevronLeft,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuroraBackground } from '@/components/motion/aurora-background';
import { Spotlight } from '@/components/motion/spotlight';
import { AnimatedText } from '@/components/motion/animated-text';
import { useAuth } from '@/contexts/AuthContext';
import { dur, ease, stagger, fadeUp } from '@/lib/motion';

const errorMessages: Record<string, string> = {
  oauth_failed: 'Google sign-in failed. Please try again.',
  missing_token: 'The sign-in callback was missing a token. Please try again.',
  auth_failed: 'Could not verify your sign-in. Please try again.',
  blocked: 'Your account has been blocked. Contact an admin for help.',
};

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get('error');
  const errorMessage = errorCode ? errorMessages[errorCode] ?? 'Sign-in failed.' : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AuroraBackground />
      <Spotlight />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        {/* Left — visual hero */}
        <div className="relative hidden overflow-hidden lg:block">
          <PhotoCollage />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/30 to-background" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-between p-10">
            <Link
              to="/"
              className="inline-flex w-fit items-center gap-2 text-xs text-white/80 transition-colors hover:text-white"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Back to home
            </Link>

            <motion.div
              initial="hidden"
              animate="show"
              variants={stagger(0.1, 0.2)}
              className="max-w-md"
            >
              <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-xs backdrop-blur">
                <Sparkles className="h-3 w-3 text-amber-300" />
                Premium photography portal
              </motion.div>
              <motion.h1 variants={fadeUp} className="font-display text-4xl font-semibold tracking-tight xl:text-5xl">
                <AnimatedText variant="brand">Capture</AnimatedText>
                <br />
                <span className="text-white/90">every moment.</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-3 text-sm leading-relaxed text-white/70">
                Sign in once with Google. Get instant access to photography requests,
                published albums, and the team roster.
              </motion.p>

              <motion.ul variants={fadeUp} className="mt-6 space-y-2.5 text-sm text-white/80">
                <Bullet icon={<ShieldCheck className="h-3.5 w-3.5" />}>
                  OAuth-secured · no passwords to remember
                </Bullet>
                <Bullet icon={<Users className="h-3.5 w-3.5" />}>
                  Approval-gated · first sign-in reviewed by an admin
                </Bullet>
                <Bullet icon={<ImageIcon className="h-3.5 w-3.5" />}>
                  Real-time uploads · pause, resume, retry, all tracked
                </Bullet>
              </motion.ul>
            </motion.div>
          </div>
        </div>

        {/* Right — form */}
        <div className="relative flex items-center justify-center px-6 py-12 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: dur.slow, ease }}
            className="w-full max-w-md"
          >
            <div className="mb-8 flex items-center gap-2 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-[0_8px_24px_-8px_rgba(99,102,241,0.6)]">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <p className="font-display text-sm font-semibold">Pixel Club</p>
            </div>

            <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] backdrop-blur-2xl sm:p-10">
              <div className="absolute inset-0 rounded-[inherit] bg-radial-highlight opacity-60" aria-hidden />

              <div className="relative">
                <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <Aperture className="h-3.5 w-3.5" />
                  Sign in
                </div>
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  Welcome back
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Continue with your Google account to access the portal.
                </p>

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 rounded-xl border border-red-500/30 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300"
                  >
                    {errorMessage}
                  </motion.div>
                )}

                <Button
                  onClick={loginWithGoogle}
                  size="xl"
                  className="mt-7 w-full text-base"
                  loading={false}
                >
                  <GoogleMark />
                  Continue with Google
                </Button>

                <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
                  By continuing, you agree to abide by the Pixel Club code of conduct.
                  New accounts are reviewed by an admin before gaining access.
                </p>

                <div className="my-7 flex items-center gap-3">
                  <span className="h-px flex-1 bg-white/[0.06]" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">secured by Google</span>
                  <span className="h-px flex-1 bg-white/[0.06]" />
                </div>

                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-emerald-400" /> Encrypted in transit
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-emerald-400" /> No password stored anywhere
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-emerald-400" /> Revoke access from your Google account
                  </li>
                </ul>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground lg:hidden">
              <Link to="/" className="hover:text-foreground">← Back to home</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Bullet({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.06] ring-1 ring-white/10 text-blue-300">
        {icon}
      </span>
      <span>{children}</span>
    </li>
  );
}

function GoogleMark() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 16.3 3 9.7 7.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.1 36.1 26.7 37 24 37c-5.3 0-9.7-3.1-11.3-7.7l-6.5 5C9.5 40.5 16.2 45 24 45z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.7l6.2 5.2C41.9 35.5 45 30.2 45 24c0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function PhotoCollage() {
  // Decorative gradient collage — no real images needed; uses Aurora + gradients.
  return (
    <div className="absolute inset-0">
      {/* Strong base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, #0a0a0f 0%, #14142b 40%, #2a1240 70%, #050505 100%)',
        }}
      />
      {/* Floating gradient tiles */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-3 p-6">
        {[
          'from-blue-500/30 to-indigo-700/30',
          'from-purple-500/30 to-pink-700/30',
          'from-amber-500/30 to-rose-700/30',
          'from-emerald-500/30 to-cyan-700/30',
          'from-pink-500/30 to-violet-700/30',
          'from-cyan-500/30 to-blue-700/30',
          'from-violet-500/30 to-fuchsia-700/30',
          'from-yellow-500/30 to-orange-700/30',
          'from-sky-500/30 to-indigo-700/30',
        ].map((g, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05, duration: dur.base, ease }}
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${g} ring-1 ring-white/10`}
          >
            <div className="absolute inset-0 bg-radial-highlight" aria-hidden />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
