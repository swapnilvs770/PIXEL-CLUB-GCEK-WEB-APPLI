import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

export interface AnalyticsOverview {
  users: {
    total: number;
    admins: number;
    byStatus: Record<string, number>;
  };
  requests: {
    total: number;
    byStatus: Record<string, number>;
    last7Days: number;
  };
  albums: {
    total: number;
    byStatus: Record<string, number>;
    publishedLast30Days: number;
  };
  photos: {
    total: number;
    uploaded: number;
    failed: number;
  };
  notifications: {
    total: number;
  };
  uploadJobs: {
    byStatus: Record<string, number>;
  };
  activity: {
    loginsLast7Days: number;
    topActions: Array<{ action: string; count: number; failures: number }>;
  };
}

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: AnalyticsOverview }>('/analytics/overview');
      return res.data.data;
    },
    refetchInterval: 30_000,
  });
}

export function useRequestsTimeline(days = 30) {
  return useQuery({
    queryKey: ['analytics', 'requests-timeline', days],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { days: number; points: Array<{ date: string; count: number }> } }>(
        `/analytics/requests-timeline?days=${days}`
      );
      return res.data.data;
    },
    refetchInterval: 60_000,
  });
}

export function useAlbumsByYear() {
  return useQuery({
    queryKey: ['analytics', 'albums-by-year'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Array<{ year: number; total: number; published: number }> }>(
        '/analytics/albums-by-year'
      );
      return res.data.data;
    },
    staleTime: 5 * 60_000,
  });
}
