import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bell,
  Camera,
  CheckCircle2,
  Clock,
  ClipboardList,
  Image as ImageIcon,
  Inbox,
  RefreshCw,
  ShieldCheck,
  Users,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/api/dashboard';
import { Card, CardGlow } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { AuroraBackground } from '@/components/motion/aurora-background';
import { Spotlight } from '@/components/motion/spotlight';
import { AnimatedText } from '@/components/motion/animated-text';
import { dur, ease, stagger, fadeUp } from '@/lib/motion';
import { cn, formatDateTime } from '@/lib/utils';

const NOTIF_ICON: Record<string, string> = {
  account_approved: '✅',
  account_blocked: '🚫',
  request_approved: '✅',
  request_rejected: '❌',
  request_completed: '🎉',
  album_published: '📸',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { counts, recentNotifications, isLoading, hasAnyError } = useDashboardData(isAdmin);

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -my-6 sm:-my-6 lg:-my-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-6 lg:py-8">
      <AuroraBackground />
      <Spotlight />

      <div className="relative">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger(0.08, 0)}
          className="mb-10"
        >
          <motion.div variants={fadeUp} className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {isAdmin ? 'Admin workspace' : 'Your workspace'}
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Welcome back,{' '}
                <AnimatedText variant="brand">
                  {user?.name?.split(' ')[0] ?? 'there'}
                </AnimatedText>
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {isAdmin
                  ? 'Everything that needs your attention is below.'
                  : "Here's what's happening with your photography requests and the club."}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
              <RefreshCw className="h-3 w-3 animate-[spin_8s_linear_infinite]" />
              <span>Auto-refreshes every 30s</span>
            </div>
          </motion.div>
        </motion.div>

        {hasAnyError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur.base, ease }}
            className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-200"
          >
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Some data could not be loaded. Numbers shown may be stale.</span>
          </motion.div>
        )}

        {/* Primary stats */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger(0.05, 0.1)}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <motion.div variants={fadeUp}>
            <StatCard
              to="/requests?status=pending"
              icon={Clock}
              label="My pending"
              value={counts.myPendingRequests}
              loading={isLoading.counts}
              accent="amber"
              hint={counts.myPendingRequests > 0 ? 'Awaiting admin review' : 'Nothing waiting'}
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <StatCard
              to="/requests?status=approved"
              icon={CheckCircle2}
              label="My approved"
              value={counts.myApprovedRequests}
              loading={isLoading.counts}
              accent="blue"
              hint={counts.myApprovedRequests > 0 ? 'Scheduled or in progress' : 'None active'}
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <StatCard
              to="/gallery"
              icon={ImageIcon}
              label="Published albums"
              value={counts.publishedAlbums}
              loading={isLoading.counts}
              accent="emerald"
              hint={counts.publishedAlbums > 0 ? 'Browse the gallery' : 'No albums yet'}
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <StatCard
              to="/notifications"
              icon={Bell}
              label="Unread"
              value={counts.unreadNotifications}
              loading={isLoading.counts}
              accent={counts.unreadNotifications > 0 ? 'pink' : 'slate'}
              hint={counts.unreadNotifications > 0 ? 'Tap to review' : "You're all caught up"}
            />
          </motion.div>
        </motion.div>

        {/* Admin */}
        {isAdmin && (
          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin overview</p>
                <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">Needs your attention</h2>
              </div>
              <Badge variant="gradient">admin</Badge>
            </div>
            <motion.div
              initial="hidden"
              animate="show"
              variants={stagger(0.05, 0.15)}
              className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              <motion.div variants={fadeUp}>
                <StatCard
                  to="/admin/users?status=pending"
                  icon={Users}
                  label="Users to approve"
                  value={counts.pendingUsers}
                  loading={isLoading.admin}
                  accent={counts.pendingUsers > 0 ? 'amber' : 'slate'}
                  hint={counts.pendingUsers > 0 ? 'Review & approve' : 'No pending sign-ups'}
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatCard
                  to="/admin/requests?status=pending"
                  icon={ClipboardList}
                  label="Requests to review"
                  value={counts.pendingAllRequests}
                  loading={isLoading.admin}
                  accent={counts.pendingUsers > 0 ? 'purple' : 'slate'}
                  hint={counts.pendingAllRequests > 0 ? 'Approve or reject' : 'No pending requests'}
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatCard
                  to="/admin/albums"
                  icon={Camera}
                  label="Albums in system"
                  value={counts.publishedAlbums}
                  loading={isLoading.admin}
                  accent="cyan"
                  hint="All albums (admin view)"
                />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: dur.base, ease, delay: 0.3 }}
              className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
              <QuickAction to="/admin/users" icon={Users} label="Manage users" />
              <QuickAction to="/admin/albums/new" icon={Camera} label="Create album" />
              <QuickAction to="/admin/analytics" icon={Activity} label="View analytics" />
            </motion.div>
          </div>
        )}

        {/* Recent notifications */}
        <Card className="mt-10">
          <CardGlow />
          <div className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold tracking-tight">Recent activity</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {counts.unreadNotifications > 0
                  ? `${counts.unreadNotifications} unread ${counts.unreadNotifications === 1 ? 'notification' : 'notifications'}`
                  : "You're all caught up."}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/notifications">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="border-t border-white/[0.06]">
            {isLoading.notifications ? (
              <div className="space-y-3 p-6">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-9 w-9 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 ring-1 ring-white/10">
                  <Inbox className="h-5 w-5 text-white/80" />
                </div>
                <p className="text-sm text-muted-foreground">No notifications yet.</p>
                <p className="text-xs text-muted-foreground/70">
                  You'll see approvals, rejections, and album publishes here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-white/[0.04]">
                {recentNotifications.map((n) => {
                  const inner = (
                    <div className="flex items-start gap-3 px-6 py-4">
                      <span className="text-lg leading-none">
                        {NOTIF_ICON[n.type] ?? '🔔'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            'truncate text-sm',
                            !n.read && 'font-medium'
                          )}
                        >
                          {n.title}
                        </p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {n.message}
                        </p>
                        <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground/60">
                          {formatDateTime(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                  return (
                    <li key={n.id}>
                      {n.link ? (
                        <Link
                          to={n.link}
                          className="block transition-colors hover:bg-white/[0.03]"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <div>{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof Users;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm backdrop-blur transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 ring-1 ring-white/10">
          <Icon className="h-4 w-4" />
        </span>
        <span className="font-medium">{label}</span>
      </span>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}
