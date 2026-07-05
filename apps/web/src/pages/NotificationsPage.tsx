import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
} from '@/api/notifications';
import { cn, formatDateTime } from '@/lib/utils';

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications({ limit: 100 });
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const del = useDeleteNotification();

  const items = data?.data ?? [];
  const unread = data?.meta?.unreadCount ?? 0;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/dashboard">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to dashboard
        </Link>
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Bell className="h-7 w-7" /> Notifications
          </h1>
          <p className="text-muted-foreground">
            {unread} unread · {items.length} total shown
          </p>
        </div>
        {unread > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="mr-1 h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All notifications</CardTitle>
          <CardDescription>
            Notifications are also emailed to you when SMTP is configured.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {isLoading && <p className="p-4 text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && items.length === 0 && (
            <p className="p-12 text-center text-sm text-muted-foreground">
              No notifications yet.
            </p>
          )}
          {items.map((n) => {
            const inner = (
              <div
                className={cn(
                  'flex items-start gap-3 p-4',
                  !n.read && 'bg-secondary/30'
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm', !n.read && 'font-medium')}>{n.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(n.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!n.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markRead.mutate(n.id)}
                    >
                      Mark read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete"
                    onClick={() => del.mutate(n.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
            if (n.link) {
              return (
                <Link
                  key={n.id}
                  to={n.link}
                  onClick={() => !n.read && markRead.mutate(n.id)}
                >
                  {inner}
                </Link>
              );
            }
            return <div key={n.id}>{inner}</div>;
          })}
        </CardContent>
      </Card>
    </div>
  );
}
