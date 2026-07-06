import type { Variants } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────
   Shared motion primitives. Apple/Linear-style easing.
   ───────────────────────────────────────────────────────────── */

// Cubic-bezier easing curves (typed as plain string arrays so we don't
// depend on the framer-motion `Transition['ease']` index signature,
// which differs across versions).
export const ease = [0.22, 1, 0.36, 1] as const; // expo out
export const easeIn = [0.64, 0, 0.78, 0] as const;
export const easeSmooth = [0.4, 0, 0.2, 1] as const;

export const dur = {
  fast: 0.2,
  base: 0.4,
  slow: 0.8,
  hero: 1.2,
} as const;

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: dur.base, ease: ease as unknown as number[] } },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: dur.base, ease: ease as unknown as number[] } },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  show: { opacity: 1, y: 0, transition: { duration: dur.base, ease: ease as unknown as number[] } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: dur.base, ease: ease as unknown as number[] } },
};

export const blurIn: Variants = {
  hidden: { opacity: 0, filter: 'blur(8px)' },
  show: { opacity: 1, filter: 'blur(0px)', transition: { duration: dur.slow, ease: ease as unknown as number[] } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0, transition: { duration: dur.base, ease: ease as unknown as number[] } },
};

export const stagger = (delay = 0.05, initial = 0.1): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: delay,
      delayChildren: initial,
    },
  },
});

/* Page transition wrapper preset — used by PageTransition component */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8, filter: 'blur(4px)' },
  enter: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: dur.base, ease: ease as unknown as number[] },
  },
  exit: {
    opacity: 0,
    y: -4,
    filter: 'blur(4px)',
    transition: { duration: dur.fast, ease: ease as unknown as number[] },
  },
};
