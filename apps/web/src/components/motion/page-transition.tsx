import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { pageVariants } from '@/lib/motion';

/**
 * PageTransition — wraps a route's content with a soft fade/blur/slide.
 * Usage: wrap <Outlet /> inside DashboardLayout (and the HomePage root)
 * with <PageTransition>...</PageTransition>.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
