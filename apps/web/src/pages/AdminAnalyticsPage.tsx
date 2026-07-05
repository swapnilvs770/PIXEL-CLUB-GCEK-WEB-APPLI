import {
  BarChart3,
  Image as ImageIcon,
  Camera,
  Users,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useAlbumsByYear,
  useAnalyticsOverview,
  useRequestsTimeline,
} from '@/api/analytics';

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useAnalyticsOverview();
  const { data: timeline } = useRequestsTimeline(30);
  const { data: byYear } = useAlbumsByYear();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <BarChart3 className="h-7 w-7" /> Analytics
        </h1>
        <p className="text-muted-foreground">
          Overview of users, requests, albums, and recent activity.
        </p>
      </div>

      {isLoading || !data ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              icon={Users}
              label="Users"
              value={data.users.total}
              hint={`${data.users.admins} admins`}
            />
            <Stat
              icon={Camera}
              label="Requests"
              value={data.requests.total}
              hint={`${data.requests.last7Days} in last 7d`}
            />
            <Stat
              icon={ImageIcon}
              label="Albums"
              value={data.albums.total}
              hint={`${data.albums.publishedLast30Days} published in last 30d`}
            />
            <Stat
              icon={Activity}
              label="Logins (7d)"
              value={data.activity.loginsLast7Days}
              hint={`${data.notifications.total} notifications sent`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Breakdown title="Requests by status" data={data.requests.byStatus} />
            <Breakdown title="Albums by status" data={data.albums.byStatus} />
            <Breakdown title="Users by status" data={data.users.byStatus} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Photos</CardTitle>
              <CardDescription>
                {data.photos.uploaded} uploaded · {data.photos.failed} failed ·{' '}
                {data.photos.total} total records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-emerald-500"
                  style={{
                    width: `${
                      data.photos.total > 0
                        ? Math.round((data.photos.uploaded / data.photos.total) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {timeline && timeline.points.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Requests over the last {timeline.days} days</CardTitle>
              </CardHeader>
              <CardContent>
                <Sparkline points={timeline.points} />
              </CardContent>
            </Card>
          )}

          {byYear && byYear.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Albums by year</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {byYear.map((y) => {
                    const pct = Math.min(
                      Math.round((y.published / Math.max(y.total, 1)) * 100),
                      100
                    );
                    return (
                      <div key={y.year} className="flex items-center gap-3">
                        <span className="w-16 text-sm font-medium">{y.year}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-24 text-right text-xs text-muted-foreground">
                          {y.published}/{y.total} published
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {data.activity.topActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top actions (all time)</CardTitle>
              </CardHeader>
              <CardContent className="divide-y p-0">
                {data.activity.topActions.map((a) => (
                  <div key={a.action} className="flex items-center justify-between p-3 text-sm">
                    <span className="font-mono text-xs">{a.action}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground">
                        {a.failures} failures
                      </span>
                      <span className="font-medium">{a.count}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function Breakdown({ title, data }: { title: string; data: Record<string, number> }) {
  const total = Object.values(data).reduce((s, v) => s + v, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{total} total</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {Object.entries(data).map(([k, v]) => {
          const pct = total > 0 ? Math.round((v / total) * 100) : 0;
          return (
            <div key={k}>
              <div className="flex items-center justify-between text-xs">
                <span className="capitalize">{k.replace('_', ' ')}</span>
                <span className="text-muted-foreground">
                  {v} · {pct}%
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function Sparkline({ points }: { points: Array<{ date: string; count: number }> }) {
  if (points.length === 0) return null;
  const max = Math.max(...points.map((p) => p.count), 1);
  const w = 600;
  const h = 80;
  const stepX = points.length > 1 ? w / (points.length - 1) : w;
  const path = points
    .map((p, i) => {
      const x = i * stepX;
      const y = h - (p.count / max) * h;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full max-w-full" preserveAspectRatio="none">
        <path d={path} fill="none" stroke="currentColor" strokeWidth={2} className="text-primary" />
      </svg>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{points[0]?.date}</span>
        <span>{points[points.length - 1]?.date}</span>
      </div>
    </div>
  );
}
