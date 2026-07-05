import { Link } from 'react-router-dom';
import { Camera, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMyRequests, RequestStatus } from '@/api/requests';
import { formatDate, formatDateTime, cn } from '@/lib/utils';
import { useState } from 'react';

const statusFilters: { label: string; value: RequestStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Completed', value: 'completed' },
  { label: 'Rejected', value: 'rejected' },
];

function statusBadge(status: RequestStatus) {
  const styles: Record<RequestStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    photography_completed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  };
  const label: Record<RequestStatus, string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    photography_completed: 'Photography done',
    completed: 'Completed',
  };
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
        styles[status]
      )}
    >
      {label[status]}
    </span>
  );
}

export default function RequestsPage() {
  const [status, setStatus] = useState<RequestStatus | 'all'>('all');
  const params = status === 'all' ? {} : { status };
  const { data, isLoading, isError, error } = useMyRequests(params);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Camera className="h-7 w-7" /> My requests
          </h1>
          <p className="text-muted-foreground">
            Submit and track your photography requests.
          </p>
        </div>
        <Button asChild>
          <Link to="/requests/new">
            <Plus className="mr-1 h-4 w-4" /> New request
          </Link>
        </Button>
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
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No requests yet.</p>
            <Button asChild className="mt-4">
              <Link to="/requests/new">Submit your first request</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {data && data.data.length > 0 && (
        <div className="grid gap-3">
          {data.data.map((r) => (
            <Card key={r.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-base">{r.title}</CardTitle>
                  <CardDescription className="mt-1">
                    Event {formatDate(r.eventDate)} · {r.venue}
                  </CardDescription>
                </div>
                {statusBadge(r.status)}
              </CardHeader>
              <CardContent className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">
                  Submitted {formatDateTime(r.createdAt)}
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/requests/${r.id}`}>View details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
