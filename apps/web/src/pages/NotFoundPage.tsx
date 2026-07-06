import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Aperture, ArrowLeft, Home, ImageIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardGlow } from '@/components/ui/card';
import { AuroraBackground } from '@/components/motion/aurora-background';
import { Spotlight } from '@/components/motion/spotlight';
import { AnimatedText } from '@/components/motion/animated-text';
import { dur, ease, fadeUp, stagger } from '@/lib/motion';

export default function NotFoundPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AuroraBackground />
      <Spotlight />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger(0.08, 0)}
          className="w-full max-w-2xl text-center"
        >
          <motion.div variants={fadeUp} className="relative mx-auto mb-8 h-40 w-40 sm:h-52 sm:w-52">
            {/* Floating camera/aperture mark */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'conic-gradient(from 0deg, rgba(96,165,250,0.4), rgba(168,85,247,0.4), rgba(236,72,153,0.4), rgba(96,165,250,0.4))',
                mask: 'radial-gradient(circle, transparent 65%, black 67%, black 70%, transparent 72%)',
                WebkitMask: 'radial-gradient(circle, transparent 65%, black 67%, black 70%, transparent 72%)',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-[0_20px_60px_-20px_rgba(99,102,241,0.7)]"
              >
                <Aperture className="h-10 w-10 text-white" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <Sparkles className="mr-1 inline h-3 w-3 text-amber-300" /> Error 404 · Frame not found
            </p>
            <h1 className="font-display text-5xl font-semibold tracking-tight sm:text-6xl">
              <AnimatedText variant="brand">Out of frame</AnimatedText>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              The page you're looking for doesn't exist or has been moved.
              Let's get you back to something worth framing.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button asChild size="lg">
              <Link to="/">
                <Home className="h-4 w-4" /> Back home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/gallery">
                <ImageIcon className="h-4 w-4" /> Browse gallery
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4" /> Dashboard
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
