import { useState } from 'react';
import { Check, ShieldOff, ShieldCheck, UserMinus, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserAction, useUsersQuery, UsersListParams } from '@/api/users';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateTime } from '@/lib/utils';
import type { UserStatus } from '@/types/auth';
import { cn } from '@/lib/utils';

const statusFilters: { label: string; value: UserStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Blocked', value: 'blocked' },
];

export default function AdminUsersPage() {
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('pending');
  const params: UsersListParams =
    statusFilter === 'all' ? {} : { status: statusFilter };
  const { data, isLoading, isError, error } = useUsersQuery(params);
  const { user: me } = useAuth();
  const action = useUserAction();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Users className="h-7 w-7" /> Users
          </h1>
          <p className="text-muted-foreground">
            Approve new accounts, manage roles, and block abusive users.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {statusFilters.map((f) => (
          <Button
            key={f.value}
            variant={statusFilter === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {statusFilter === 'all' ? 'All users' : `${statusFilter} users`}
          </CardTitle>
          <CardDescription>
            {data?.meta?.total ?? 0} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {isError && (
            <p className="text-sm text-destructive">
              Failed to load users: {(error as Error)?.message ?? 'unknown error'}
            </p>
          )}
          {data && data.data.length === 0 && (
            <p className="text-sm text-muted-foreground">No users in this view.</p>
          )}
          {data && data.data.length > 0 && (
            <div className="divide-y">
              {data.data.map((u) => {
                const isSelf = u.id === me?.id;
                const isPending = action.isPending && action.variables?.id === u.id;
                return (
                  <div
                    key={u.id}
                    className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {u.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-medium">
                          {u.name
                            .split(' ')
                            .slice(0, 2)
                            .map((s) => s[0])
                            .join('')
                            .toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium">{u.name}</p>
                          {isSelf && (
                            <span className="rounded bg-secondary px-1.5 py-0.5 text-xs">you</span>
                          )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Last login: {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : 'never'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          u.status === 'approved' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
                          u.status === 'pending' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
                          u.status === 'blocked' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        )}
                      >
                        {u.status}
                      </span>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          u.role === 'admin'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                            : 'bg-secondary text-secondary-foreground'
                        )}
                      >
                        {u.role}
                      </span>

                      {u.status !== 'approved' && (
                        <Button
                          size="sm"
                          variant="default"
                          disabled={isPending || isSelf}
                          onClick={() => action.mutate({ id: u.id, action: 'approve' })}
                        >
                          <Check className="mr-1 h-4 w-4" /> Approve
                        </Button>
                      )}
                      {u.status !== 'blocked' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={isPending || isSelf}
                          onClick={() => action.mutate({ id: u.id, action: 'block' })}
                        >
                          <ShieldOff className="mr-1 h-4 w-4" /> Block
                        </Button>
                      )}
                      {u.status === 'blocked' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isPending || isSelf}
                          onClick={() => action.mutate({ id: u.id, action: 'unblock' })}
                        >
                          <ShieldCheck className="mr-1 h-4 w-4" /> Unblock
                        </Button>
                      )}
                      {u.role !== 'admin' && u.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={isPending || isSelf}
                          onClick={() => action.mutate({ id: u.id, action: 'promote' })}
                        >
                          <UserPlus className="mr-1 h-4 w-4" /> Promote
                        </Button>
                      )}
                      {u.role === 'admin' && !isSelf && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isPending}
                          onClick={() => action.mutate({ id: u.id, action: 'demote' })}
                        >
                          <UserMinus className="mr-1 h-4 w-4" /> Demote
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
