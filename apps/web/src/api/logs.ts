import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

export interface LogEntry {
  id: string;
  userId: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  } | null;
  action: string;
  targetId: string | null;
  result: 'success' | 'failure';
  ip: string | null;
  userAgent: string | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
}

export interface LogListResponse {
  data: LogEntry[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export interface LogListParams {
  action?: string;
  userId?: string;
  result?: 'success' | 'failure';
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useLogs(params: LogListParams = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') qs.set(k, String(v));
  });
  const path = qs.toString() ? `/admin/logs?${qs.toString()}` : '/admin/logs';

  return useQuery({
    queryKey: ['logs', params],
    queryFn: async () => {
      const res = await apiClient.get<LogListResponse>(path);
      return res.data;
    },
    refetchInterval: 15_000,
  });
}

export function useLogActions() {
  return useQuery({
    queryKey: ['logs', 'actions'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: string[] }>('/admin/logs/actions');
      return res.data.data;
    },
    staleTime: 5 * 60_000,
  });
}
