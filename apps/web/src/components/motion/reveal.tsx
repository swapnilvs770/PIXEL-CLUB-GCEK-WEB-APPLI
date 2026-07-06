import { motion, useInView } from 'framer-motion';
import { ReactNode, useRef } from 'react';
import { fadeUp, stagger } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Render as a list-staggered group instead of a single fade-up. */
  as?: 'div' | 'ul' | 'section' | 'span';
}

export function Reveal({ children, className, delay = 0, as = 'div' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const MotionTag = (motion as Record<string, any>)[as] ?? motion.div;
  return (
    <MotionTag
      ref={ref}
      variants={stagger(0.06, delay)}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className={cn(className)}
    >
      {children}
    </MotionTag>
  );
}

/**
 * RevealItem — direct children of <Reveal> animate one by one.
 */
export function RevealItem({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'li' | 'span' | 'article';
}) {
  const MotionTag = (motion as Record<string, any>)[as] ?? motion.div;
  return (
    <MotionTag variants={fadeUp} className={className}>
      {children}
    </MotionTag>
  );
}
