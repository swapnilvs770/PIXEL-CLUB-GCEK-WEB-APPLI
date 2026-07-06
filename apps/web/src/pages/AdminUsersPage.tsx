import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ShieldOff,
  UserMinus,
  UserPlus,
  Users as UsersIcon,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardGlow } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { AuroraBackground } from '@/components/motion/aurora-background';
import { Spotlight } from '@/components/motion/spotlight';
import { AnimatedText } from '@/components/motion/animated-text';
import { dur, ease, fadeUp, stagger } from '@/lib/motion';
import { useUserAction, useUsersQuery, UsersListParams } from '@/api/users';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateTime } from '@/lib/utils';
import type { UserStatus } from '@/types/auth';

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
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -my-6 sm:-my-6 lg:-my-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-6 lg:py-8">
      <AuroraBackground />
      <Spotlight />

      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger(0.06, 0)}
        className="relative space-y-6"
      >
        <motion.div variants={fadeUp} className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              <AnimatedText variant="cool">Users</AnimatedText>
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Approve new accounts, manage roles, and block abusive users.
            </p>
          </div>
          {data && (
            <div className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs text-muted-foreground backdrop-blur sm:inline-flex">
              <Sparkles className="h-3 w-3 text-amber-300" />
              <span>{data.meta.total} total</span>
            </div>
          )}
        </motion.div>

        <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2">
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
        </motion.div>

        <Card>
          <CardGlow />
          <div className="relative divide-y divide-white/[0.04]">
            {isLoading && (
              <div className="space-y-4 p-6">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-32" />
                  </div>
                ))}
              </div>
            )}
            {isError && (
              <p className="p-6 text-sm text-destructive">
                Failed to load users: {(error as Error)?.message ?? 'unknown error'}
              </p>
            )}
            {data && data.data.length === 0 && (
              <div className="p-6">
                <EmptyState
                  icon={<UsersIcon className="h-6 w-6" />}
                  title="No users in this view"
                  description="Try a different status filter."
                />
              </div>
            )}
            {data && data.data.length > 0 && (
              <motion.div
                variants={stagger(0.04)}
                initial="hidden"
                animate="show"
                className="divide-y divide-white/[0.04]"
              >
                {data.data.map((u) => {
                  const isSelf = u.id === me?.id;
                  const isBusy = action.isPending && action.variables?.id === u.id;
                  return (
                    <motion.div
                      key={u.id}
                      variants={fadeUp}
                      transition={{ duration: dur.base, ease }}
                      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={u.name} src={u.avatarUrl} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium">{u.name}</p>
                            {isSelf && <Badge variant="gradient">you</Badge>}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            {u.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last login: {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : 'never'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            u.status === 'approved'
                              ? 'success'
                              : u.status === 'pending'
                              ? 'pending'
                              : 'danger'
                          }
                        >
                          {u.status}
                        </Badge>
                        {u.role === 'admin' && <Badge variant="info">admin</Badge>}

                        {u.status !== 'approved' && (
                          <Button
                            size="sm"
                            disabled={isBusy || isSelf}
                            onClick={() => action.mutate({ id: u.id, action: 'approve' })}
                          >
                            <ShieldCheck className="h-3.5 w-3.5" /> Approve
                          </Button>
                        )}
                        {u.status !== 'blocked' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={isBusy || isSelf}
                            onClick={() => action.mutate({ id: u.id, action: 'block' })}
                          >
                            <ShieldOff className="h-3.5 w-3.5" /> Block
                          </Button>
                        )}
                        {u.status === 'blocked' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isBusy || isSelf}
                            onClick={() => action.mutate({ id: u.id, action: 'unblock' })}
                          >
                            <ShieldCheck className="h-3.5 w-3.5" /> Unblock
                          </Button>
                        )}
                        {u.role !== 'admin' && u.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={isBusy || isSelf}
                            onClick={() => action.mutate({ id: u.id, action: 'promote' })}
                          >
                            <UserPlus className="h-3.5 w-3.5" /> Promote
                          </Button>
                        )}
                        {u.role === 'admin' && !isSelf && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isBusy}
                            onClick={() => action.mutate({ id: u.id, action: 'demote' })}
                          >
                            <UserMinus className="h-3.5 w-3.5" /> Demote
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
