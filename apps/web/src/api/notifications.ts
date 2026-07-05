import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

export type NotificationType =
  | 'account_approved'
  | 'account_blocked'
  | 'request_approved'
  | 'request_rejected'
  | 'request_completed'
  | 'album_published';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    unreadCount: number;
  };
}

export interface NotificationListParams {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}

export function useNotifications(params: NotificationListParams = {}) {
  const qs = new URLSearchParams();
  if (params.unreadOnly) qs.set('unreadOnly', 'true');
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const path = qs.toString() ? `/notifications?${qs.toString()}` : '/notifications';

  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const res = await apiClient.get<NotificationListResponse>(path);
      return res.data;
    },
    refetchInterval: 30_000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { count: number } }>('/notifications/unread-count');
      return res.data.data.count;
    },
    refetchInterval: 30_000,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.patch('/notifications/read-all');
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/notifications/${id}`);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
