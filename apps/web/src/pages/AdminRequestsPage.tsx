import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminRequests, RequestStatus } from '@/api/requests';
import { formatDate, formatDateTime, cn } from '@/lib/utils';

const statusFilters: { label: string; value: RequestStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Photography done', value: 'photography_completed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Rejected', value: 'rejected' },
];

function statusBadge(status: RequestStatus) {
  const styles: Record<RequestStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    photography_completed:
      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    completed:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  };
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        styles[status]
      )}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

export default function AdminRequestsPage() {
  const [status, setStatus] = useState<RequestStatus | 'all'>('all');
  const params = status === 'all' ? {} : { status };
  const { data, isLoading, isError, error } = useAdminRequests(params);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <ClipboardList className="h-7 w-7" /> All requests
        </h1>
        <p className="text-muted-foreground">
          Manage photography requests across all users.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {statusFilters.map((f) => (
          <Button
            key={f.value}
            variant={status === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatus(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {isError && (
        <p className="text-sm text-destructive">
          Failed to load: {(error as Error)?.message ?? 'unknown error'}
        </p>
      )}

      {data && data.data.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No requests in this view.
          </CardContent>
        </Card>
      )}

      {data && data.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {data.meta.total} request{data.meta.total === 1 ? '' : 's'}
            </CardTitle>
            <CardDescription>
              Showing page {data.meta.page} of {data.meta.pages}
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {data.data.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{r.title}</p>
                    {statusBadge(r.status)}
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {r.user?.name ?? 'Unknown user'} · {r.user?.email ?? ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Event {formatDate(r.eventDate)} · {r.venue} · Submitted{' '}
                    {formatDateTime(r.createdAt)}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/admin/requests/${r.id}`}>Manage</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
