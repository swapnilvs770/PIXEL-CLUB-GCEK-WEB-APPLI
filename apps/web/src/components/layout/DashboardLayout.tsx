import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { PageTransition } from '@/components/motion/page-transition';
import { fadeIn } from '@/lib/motion';

/**
 * Premium dashboard shell:
 *  - Persistent sidebar (desktop) / drawer (mobile)
 *  - Glass topbar
 *  - Page transitions on every route change
 *  - Aurora background + spotlight on top of <body>
 */
export default function DashboardLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-background">
      <Sidebar />

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            >
              <Sidebar />
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute right-2 top-2 z-10"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMobileMenuToggle={() => setMobileOpen(true)} />

        <main className="relative flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={fadeIn}
                initial="hidden"
                animate="show"
              >
                <PageTransition>
                  <Outlet />
                </PageTransition>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
