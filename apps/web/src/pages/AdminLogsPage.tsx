import { useState } from 'react';
import { FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogs, useLogActions } from '@/api/logs';
import { formatDateTime, cn } from '@/lib/utils';

export default function AdminLogsPage() {
  const [action, setAction] = useState('');
  const [result, setResult] = useState('');
  const [search, setSearch] = useState('');
  const { data: actions } = useLogActions();
  const { data, isLoading } = useLogs({
    action: action || undefined,
    result: (result as 'success' | 'failure') || undefined,
    search: search.trim() || undefined,
    limit: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <FileText className="h-7 w-7" /> Audit logs
        </h1>
        <p className="text-muted-foreground">
          Every admin action and authentication event is recorded here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px] space-y-1">
            <label className="text-xs font-medium uppercase text-muted-foreground">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="action, ip, user agent…"
                className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-muted-foreground">
              Action
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            >
              <option value="">All</option>
              {actions?.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-muted-foreground">
              Result
            </label>
            <select
              value={result}
              onChange={(e) => setResult(e.target.value)}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            >
              <option value="">All</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
            </select>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setAction('');
              setResult('');
              setSearch('');
            }}
          >
            Clear
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {data?.meta?.total ?? 0} entries
          </CardTitle>
          <CardDescription>Newest first. Auto-refreshes every 15s.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {isLoading && <p className="p-4 text-sm text-muted-foreground">Loading…</p>}
          {data && data.data.length === 0 && (
            <p className="p-12 text-center text-sm text-muted-foreground">
              No log entries match these filters.
            </p>
          )}
          {data?.data.map((l) => (
            <div key={l.id} className="grid grid-cols-1 gap-2 p-3 text-sm sm:grid-cols-[140px_1fr_120px]">
              <span className="text-xs text-muted-foreground">
                {formatDateTime(l.createdAt)}
              </span>
              <div className="min-w-0">
                <p className="truncate">
                  <span className="font-mono text-xs">{l.action}</span>
                  {l.user && (
                    <>
                      {' '}
                      by{' '}
                      <span className="font-medium">{l.user.name}</span>
                      {l.targetId && (
                        <span className="text-muted-foreground">
                          {' '}on {l.targetId.slice(-8)}
                        </span>
                      )}
                    </>
                  )}
                </p>
                {l.ip && (
                  <p className="truncate text-xs text-muted-foreground">
                    {l.ip}
                    {l.userAgent && ` · ${truncateUA(l.userAgent)}`}
                  </p>
                )}
              </div>
              <span
                className={cn(
                  'inline-block w-fit rounded-full px-2 py-0.5 text-xs font-medium',
                  l.result === 'success'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                )}
              >
                {l.result}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function truncateUA(ua: string): string {
  if (ua.length <= 60) return ua;
  return ua.slice(0, 57) + '…';
}
