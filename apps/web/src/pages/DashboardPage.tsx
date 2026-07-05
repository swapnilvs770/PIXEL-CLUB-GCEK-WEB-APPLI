import { Link } from 'react-router-dom';
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
  Users,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/api/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatDateTime } from '@/lib/utils';

const NOTIF_ICON: Record<string, string> = {
  account_approved: '✅',
  account_blocked: '🚫',
  request_approved: '✅',
  request_rejected: '❌',
  request_completed: '🎉',
  album_published: '📸',
};

type Accent = 'yellow' | 'blue' | 'emerald' | 'red' | 'muted' | 'purple';

const ACCENT_CLASS: Record<Accent, string> = {
  yellow: 'text-yellow-600 dark:text-yellow-400',
  blue: 'text-blue-600 dark:text-blue-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  red: 'text-red-600 dark:text-red-400',
  muted: 'text-muted-foreground',
  purple: 'text-purple-600 dark:text-purple-400',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { counts, recentNotifications, isLoading, hasAnyError } = useDashboardData(isAdmin);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {user?.name?.split(' ')[0] ?? 'there'}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with Pixel Club today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className="h-3 w-3" />
          <span>Auto-refreshes every 30s</span>
        </div>
      </div>

      {hasAnyError && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
          Some data could not be loaded. Numbers shown may be stale.
        </div>
      )}

      {/* Primary user stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          to="/requests?status=pending"
          icon={Clock}
          label="My pending requests"
          value={counts.myPendingRequests}
          loading={isLoading.counts}
          accent={counts.myPendingRequests > 0 ? 'yellow' : 'muted'}
          hint={counts.myPendingRequests > 0 ? 'Awaiting admin review' : 'None waiting'}
        />
        <StatCard
          to="/requests?status=approved"
          icon={CheckCircle2}
          label="My approved requests"
          value={counts.myApprovedRequests}
          loading={isLoading.counts}
          accent={counts.myApprovedRequests > 0 ? 'blue' : 'muted'}
          hint={counts.myApprovedRequests > 0 ? 'Scheduled or in progress' : 'None active'}
        />
        <StatCard
          to="/gallery"
          icon={ImageIcon}
          label="Published albums"
          value={counts.publishedAlbums}
          loading={isLoading.counts}
          accent={counts.publishedAlbums > 0 ? 'emerald' : 'muted'}
          hint={counts.publishedAlbums > 0 ? 'Browse the gallery' : 'No albums yet'}
        />
        <StatCard
          to="/notifications"
          icon={Bell}
          label="Unread notifications"
          value={counts.unreadNotifications}
          loading={isLoading.counts}
          accent={counts.unreadNotifications > 0 ? 'red' : 'muted'}
          hint={counts.unreadNotifications > 0 ? 'Tap to review' : "You're all caught up"}
        />
      </div>

      {/* Admin overview */}
      {isAdmin && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Admin overview</h2>
            <span className="text-xs text-muted-foreground">Visible to admins only</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              to="/admin/users?status=pending"
              icon={Users}
              label="Users awaiting approval"
              value={counts.pendingUsers}
              loading={isLoading.admin}
              accent={counts.pendingUsers > 0 ? 'yellow' : 'muted'}
              hint={
                counts.pendingUsers > 0
                  ? 'Review and approve'
                  : 'No pending sign-ups'
              }
            />
            <StatCard
              to="/admin/requests?status=pending"
              icon={ClipboardList}
              label="Requests awaiting review"
              value={counts.pendingAllRequests}
              loading={isLoading.admin}
              accent={counts.pendingAllRequests > 0 ? 'purple' : 'muted'}
              hint={
                counts.pendingAllRequests > 0
                  ? 'Approve or reject'
                  : 'No pending requests'
              }
            />
            <StatCard
              to="/admin/albums"
              icon={Camera}
              label="Published albums"
              value={counts.publishedAlbums}
              loading={isLoading.admin}
              accent={counts.publishedAlbums > 0 ? 'emerald' : 'muted'}
              hint="All albums (admin view)"
            />
          </div>
        </div>
      )}

      {/* Recent notifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Recent notifications</CardTitle>
            <CardDescription>
              {counts.unreadNotifications > 0
                ? `${counts.unreadNotifications} unread`
                : 'You’re all caught up'}
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/notifications">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading.notifications ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-md bg-secondary/60"
                />
              ))}
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-sm text-muted-foreground">
              <Inbox className="h-8 w-8 opacity-40" />
              <p>No notifications yet.</p>
              <p className="text-xs">
                You'll see request approvals, album publishes, and other updates here.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {recentNotifications.map((n) => {
                const inner = (
                  <div className="flex items-start gap-3 py-3">
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
                      <p className="mt-0.5 text-xs text-muted-foreground">
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
                        className="block transition-colors hover:bg-secondary/40 rounded-md px-2"
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div className="px-2">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  to: string;
  icon: typeof Clock;
  label: string;
  value: number;
  loading: boolean;
  accent: Accent;
  hint?: string;
}

function StatCard({ to, icon: Icon, label, value, loading, accent, hint }: StatCardProps) {
  return (
    <Link to={to} className="group block">
      <Card className="h-full transition-colors group-hover:bg-secondary/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{label}</CardTitle>
          <Icon className={cn('h-4 w-4', ACCENT_CLASS[accent])} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-8 w-14 animate-pulse rounded bg-secondary" />
          ) : (
            <div className="text-2xl font-bold tabular-nums">
              {value.toLocaleString()}
            </div>
          )}
          {hint && !loading && (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
