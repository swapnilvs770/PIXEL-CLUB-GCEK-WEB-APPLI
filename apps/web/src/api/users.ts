import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { User, UserStatus } from '@/types/auth';

export interface UsersListResponse {
  data: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UsersListParams {
  status?: UserStatus;
  page?: number;
  limit?: number;
}

export function useUsersQuery(params: UsersListParams = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const path = qs.toString() ? `/admin/users?${qs.toString()}` : '/admin/users';

  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const res = await apiClient.get<UsersListResponse>(path);
      return res.data;
    },
  });
}

type UserAction = 'approve' | 'block' | 'unblock' | 'promote' | 'demote';

export function useUserAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: UserAction }) => {
      const res = await apiClient.post<{ data: User }>(`/admin/users/${id}/${action}`);
      return res.data.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
