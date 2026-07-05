import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Notification } from './notifications';

const REFRESH_MS = 30_000;

export interface DashboardCounts {
  // For every user
  myPendingRequests: number;
  myApprovedRequests: number;
  myCompletedRequests: number;
  publishedAlbums: number;
  unreadNotifications: number;
  // Admin-only
  pendingUsers: number;
  pendingAllRequests: number;
}

export interface DashboardData {
  counts: DashboardCounts;
  recentNotifications: Notification[];
  isLoading: {
    counts: boolean;
    admin: boolean;
    notifications: boolean;
  };
  hasAnyError: boolean;
}

/**
 * Fetch just the total count for a given endpoint+filter, without
 * pulling the full result list. Uses limit=1 to keep payload tiny.
 */
async function fetchCount(path: string): Promise<number> {
  const sep = path.includes('?') ? '&' : '?';
  const res = await apiClient.get(`${path}${sep}limit=1`);
  return (res.data?.meta?.total as number) ?? 0;
}

/**
 * Single hook that aggregates everything the dashboard needs.
 * Each underlying query refreshes every 30s (and on window focus).
 * Safe to call from a regular component - admin-only queries are
 * gated via the `enabled` flag.
 */
export function useDashboardData(isAdmin: boolean): DashboardData {
  const myPending = useQuery({
    queryKey: ['dashboard', 'my-requests', 'pending'],
    queryFn: () => fetchCount('/requests?status=pending'),
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: true,
  });

  const myApproved = useQuery({
    queryKey: ['dashboard', 'my-requests', 'approved'],
    queryFn: () => fetchCount('/requests?status=approved'),
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: true,
  });

  const myCompleted = useQuery({
    queryKey: ['dashboard', 'my-requests', 'completed'],
    queryFn: () => fetchCount('/requests?status=completed'),
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: true,
  });

  const publishedAlbums = useQuery({
    queryKey: ['dashboard', 'published-albums'],
    queryFn: () => fetchCount('/albums?limit=1'),
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: true,
  });

  const unread = useQuery({
    queryKey: ['dashboard', 'unread-notifications'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { count: number } }>(
        '/notifications/unread-count'
      );
      return res.data.data.count;
    },
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: true,
  });

  const recentNotifications = useQuery({
    queryKey: ['dashboard', 'recent-notifications'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Notification[] }>(
        '/notifications?limit=5'
      );
      return res.data.data;
    },
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: true,
  });

  // Admin-only
  const pendingUsers = useQuery({
    enabled: isAdmin,
    queryKey: ['dashboard', 'pending-users'],
    queryFn: () => fetchCount('/admin/users?status=pending'),
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: true,
  });

  const pendingAllRequests = useQuery({
    enabled: isAdmin,
    queryKey: ['dashboard', 'pending-all-requests'],
    queryFn: () => fetchCount('/admin/requests?status=pending'),
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: true,
  });

  return {
    counts: {
      myPendingRequests: myPending.data ?? 0,
      myApprovedRequests: myApproved.data ?? 0,
      myCompletedRequests: myCompleted.data ?? 0,
      publishedAlbums: publishedAlbums.data ?? 0,
      unreadNotifications: unread.data ?? 0,
      pendingUsers: pendingUsers.data ?? 0,
      pendingAllRequests: pendingAllRequests.data ?? 0,
    },
    recentNotifications: recentNotifications.data ?? [],
    isLoading: {
      counts:
        myPending.isLoading ||
        myApproved.isLoading ||
        myCompleted.isLoading ||
        publishedAlbums.isLoading ||
        unread.isLoading,
      admin: isAdmin && (pendingUsers.isLoading || pendingAllRequests.isLoading),
      notifications: recentNotifications.isLoading,
    },
    hasAnyError:
      myPending.isError ||
      myApproved.isError ||
      myCompleted.isError ||
      publishedAlbums.isError ||
      unread.isError ||
      recentNotifications.isError ||
      (isAdmin && (pendingUsers.isError || pendingAllRequests.isError)),
  };
}
