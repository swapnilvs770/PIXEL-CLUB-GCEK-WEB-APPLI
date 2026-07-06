import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check,
  Clock,
  Hourglass,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardGlow } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { AuroraBackground } from '@/components/motion/aurora-background';
import { Spotlight } from '@/components/motion/spotlight';
import { AnimatedText } from '@/components/motion/animated-text';
import { dur, ease, fadeUp, stagger } from '@/lib/motion';

export default function PendingApprovalPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const steps = [
    {
      icon: Check,
      title: 'Account created',
      desc: 'Your Google sign-in was successful and your profile is in the database.',
      state: 'done' as const,
    },
    {
      icon: Hourglass,
      title: 'Awaiting admin review',
      desc: 'An admin needs to approve your account. Most reviews happen within 24 hours.',
      state: 'active' as const,
    },
    {
      icon: ShieldCheck,
      title: 'You\'re in',
      desc: 'Once approved, you can submit photography requests, browse albums, and join the team.',
      state: 'pending' as const,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AuroraBackground />
      <Spotlight />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger(0.1, 0)}
          className="w-full max-w-lg text-center"
        >
          <motion.div
            variants={fadeUp}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-orange-500/20 ring-1 ring-white/10"
          >
            <Clock className="h-9 w-9 text-amber-300" />
          </motion.div>

          <motion.div variants={fadeUp}>
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <Sparkles className="mr-1 inline h-3 w-3 text-amber-300" /> Almost there
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Hi {user?.name?.split(' ')[0] ?? 'there'},{' '}
              <AnimatedText variant="gold">you're pending</AnimatedText>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
              Your account has been created. An admin needs to approve it before
              you can access the full portal.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8">
            <Card>
              <CardGlow />
              <div className="relative p-6 text-left">
                <ol className="space-y-4">
                  {steps.map((s, i) => (
                    <li key={s.title} className="flex gap-4">
                      <div className="relative flex flex-col items-center">
                        <div
                          className={
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ' +
                            (s.state === 'done'
                              ? 'bg-emerald-500/15 ring-emerald-400/30 text-emerald-300'
                              : s.state === 'active'
                              ? 'bg-amber-500/15 ring-amber-400/30 text-amber-300'
                              : 'bg-white/[0.04] ring-white/10 text-muted-foreground')
                          }
                        >
                          <s.icon className="h-4 w-4" />
                        </div>
                        {i < steps.length - 1 && (
                          <div className="mt-1 h-6 w-px bg-white/10" />
                        )}
                      </div>
                      <div className="pb-2">
                        <p
                          className={
                            'text-sm font-medium ' +
                            (s.state === 'pending' ? 'text-muted-foreground' : 'text-foreground')
                          }
                        >
                          {s.title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                          {s.desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </Card>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button variant="outline" size="lg" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
            <Button asChild variant="ghost" size="lg">
              <a href="mailto:admin@pixelclub.in">
                <Mail className="h-4 w-4" /> Contact an admin
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
