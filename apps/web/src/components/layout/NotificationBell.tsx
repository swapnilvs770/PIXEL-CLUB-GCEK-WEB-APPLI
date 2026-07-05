import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
  Notification,
} from '@/api/notifications';

const typeIcons: Record<string, string> = {
  account_approved: '',
  account_blocked: '🚫',
  request_approved: '',
  request_rejected: '❌',
  request_completed: '🎉',
  album_published: '📸',
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useNotifications({ limit: 8 });
  const { data: count = 0 } = useUnreadCount();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const del = useDeleteNotification();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const items = data?.data ?? [];

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span
            className={cn(
              'absolute -right-1 -top-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium leading-none text-destructive-foreground'
            )}
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-md border bg-popover p-2 shadow-lg sm:w-96">
          <div className="flex items-center justify-between border-b px-2 pb-2">
            <p className="text-sm font-medium">Notifications</p>
            {count > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
              >
                <CheckCheck className="mr-1 h-3 w-3" /> Mark all read
              </Button>
            )}
          </div>

          <div className="max-h-[400px] overflow-auto">
            {items.length === 0 && (
              <p className="p-4 text-center text-sm text-muted-foreground">
                No notifications yet.
              </p>
            )}
            {items.map((n) => (
              <NotificationRow
                key={n.id}
                n={n}
                onRead={() => markRead.mutate(n.id)}
                onDelete={() => del.mutate(n.id)}
              />
            ))}
          </div>

          <div className="border-t pt-2">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="block rounded-sm px-2 py-1.5 text-center text-sm font-medium hover:bg-secondary"
            >
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationRow({
  n,
  onRead,
  onDelete,
}: {
  n: Notification;
  onRead: () => void;
  onDelete: () => void;
}) {
  const inner = (
    <div
      className={cn(
        'flex items-start gap-2 rounded-sm p-2 text-sm',
        !n.read && 'bg-secondary/40',
        'hover:bg-secondary/60'
      )}
    >
      <span className="text-lg leading-none">{typeIcons[n.type] ?? '🔔'}</span>
      <div className="min-w-0 flex-1">
        <p className={cn('truncate', !n.read && 'font-medium')}>{n.title}</p>
        <p className="line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {!n.read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label="Mark read"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRead();
            }}
          >
            <Check className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          aria-label="Delete"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  if (n.link) {
    return (
      <Link to={n.link} onClick={onRead}>
        {inner}
      </Link>
    );
  }
  return inner;
}
