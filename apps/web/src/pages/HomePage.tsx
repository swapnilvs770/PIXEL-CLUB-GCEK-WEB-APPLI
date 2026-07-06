import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Shield,
  Users,
  ArrowUpRight,
  Aperture,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardGlow } from '@/components/ui/card';
import { AuroraBackground } from '@/components/motion/aurora-background';
import { Spotlight } from '@/components/motion/spotlight';
import { AnimatedText } from '@/components/motion/animated-text';
import { Reveal, RevealItem } from '@/components/motion/reveal';
import { dur, ease, stagger, fadeUp } from '@/lib/motion';
import { env } from '@/lib/env';

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AuroraBackground />
      <Spotlight />

      {/* Top nav */}
      <header className="relative z-20">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-[0_8px_24px_-8px_rgba(99,102,241,0.6)]">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold tracking-tight">Pixel Club</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">GCE Karad</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <a href="#features">Features</a>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <a href="#gallery">Gallery</a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/login">
                Sign in <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger(0.1, 0.05)}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div
            variants={fadeUp}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Premium photography platform · v1.0</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-display text-balance text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl"
          >
            <AnimatedText variant="brand">{env.appName.split(' ').slice(0, 2).join(' ')}</AnimatedText>
            <br />
            <span className="text-foreground/90">built for creators</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            A centralized portal for Pixel Club, Government College of Engineering, Karad.
            Submit photography requests, browse published albums, and stay in sync with the team.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild size="lg">
              <Link to="/login">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#features">See what's inside</a>
            </Button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground"
          >
            <Pill icon={<Shield className="h-3 w-3" />}>Google OAuth</Pill>
            <Pill icon={<ImageIcon className="h-3 w-3" />}>Cloudinary previews</Pill>
            <Pill icon={<Users className="h-3 w-3" />}>Team batches</Pill>
            <Pill icon={<Aperture className="h-3 w-3" />}>Drive imports</Pill>
          </motion.div>
        </motion.div>

        {/* Hero visual */}
        <motion.div
          initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: dur.hero, ease, delay: 0.3 }}
          className="relative mx-auto mt-20 max-w-5xl"
        >
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 shadow-[0_30px_120px_-30px_rgba(99,102,241,0.5)] backdrop-blur-xl">
            <CardGlow />
            {/* Faux gallery grid */}
            <div className="absolute inset-0 grid grid-cols-3 gap-2 p-3 sm:gap-3 sm:p-4">
              {[
                'from-blue-500/30 to-indigo-500/30',
                'from-purple-500/30 to-pink-500/30',
                'from-amber-500/30 to-rose-500/30',
                'from-emerald-500/30 to-cyan-500/30',
                'from-pink-500/30 to-violet-500/30',
                'from-cyan-500/30 to-blue-500/30',
              ].map((g, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.08, duration: dur.base, ease }}
                  className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${g} ring-1 ring-white/10`}
                >
                  <div className="absolute inset-0 bg-radial-highlight" aria-hidden />
                </motion.div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full border border-white/15 bg-black/40 px-4 py-2 text-xs uppercase tracking-widest text-white/80 backdrop-blur-xl">
                Live gallery
              </div>
            </div>
          </div>
          {/* Glow halos */}
          <div className="pointer-events-none absolute -inset-12 -z-10">
            <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl opacity-50" />
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <Reveal className="mb-12">
          <RevealItem>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">What's inside</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              <AnimatedText variant="cool">Everything your club needs.</AnimatedText>
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Replace the WhatsApp + Google Drive shuffle with one premium workflow.
            </p>
          </RevealItem>
        </Reveal>

        <Reveal className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <RevealItem key={f.title}>
              <Card interactive className="h-full">
                <CardGlow />
                <div className="relative p-6">
                  <div
                    className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} ring-1 ring-white/10`}
                  >
                    <f.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-semibold tracking-tight">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </Card>
            </RevealItem>
          ))}
        </Reveal>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <Card className="relative overflow-hidden">
          <CardGlow />
          <div className="relative grid gap-6 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ready when you are</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Sign in with Google and start <AnimatedText variant="gold">creating</AnimatedText>.
              </h2>
              <p className="mt-3 max-w-md text-muted-foreground">
                New accounts need admin approval. Once approved, you can submit requests, browse albums,
                and stay in the loop.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Button asChild size="lg">
                <Link to="/login">
                  Sign in <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">Learn more</Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Pixel Club, GCE Karad.</p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 animate-glow rounded-full bg-emerald-400" />
            All systems operational
          </p>
        </div>
      </footer>
    </div>
  );
}

function Pill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 backdrop-blur">
      {icon}
      {children}
    </span>
  );
}

const features = [
  {
    icon: Camera,
    title: 'Photography requests',
    description: 'Submit and track event coverage requests with a clean approval workflow.',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: ImageIcon,
    title: 'Albums',
    description: 'Year-wise gallery of published albums with original-quality downloads.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Users,
    title: 'Team',
    description: 'Batch-wise history of all contributors to the club — never overwritten.',
    gradient: 'from-amber-500 to-rose-500',
  },
  {
    icon: Shield,
    title: 'Approval-gated access',
    description: 'Manual admin approval keeps the portal invite-only and trustworthy.',
    gradient: 'from-emerald-500 to-cyan-500',
  },
  {
    icon: Aperture,
    title: 'Drive → Cloudinary',
    description: 'Paste a Drive folder; we compress originals and stream previews automatically.',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Sparkles,
    title: 'Real-time progress',
    description: 'Live upload progress, pause/resume, retry — straight from the dashboard.',
    gradient: 'from-pink-500 to-violet-500',
  },
];
