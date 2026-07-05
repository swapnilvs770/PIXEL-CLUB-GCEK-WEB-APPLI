import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

export type RequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'photography_completed'
  | 'completed';

export interface RequestUserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface PhotographyRequest {
  id: string;
  userId: string;
  user?: RequestUserSummary | null;
  title: string;
  description: string | null;
  eventDate: string;
  venue: string;
  expectedAttendees: number | null;
  contactPhone: string | null;
  notes: string | null;
  status: RequestStatus;
  albumId: string | null;
  rejectionReason: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectedBy: string | null;
  rejectedAt: string | null;
  completedBy: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RequestListResponse {
  data: PhotographyRequest[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateRequestInput {
  title: string;
  description?: string;
  eventDate: string;
  venue: string;
  expectedAttendees?: number;
  contactPhone?: string;
  notes?: string;
}

export type UpdateRequestInput = Partial<CreateRequestInput>;

export interface ListRequestsParams {
  status?: RequestStatus;
  page?: number;
  limit?: number;
  mine?: boolean;
}

// ── User endpoints ──

export function useMyRequests(params: Omit<ListRequestsParams, 'mine'> = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const path = qs.toString() ? `/requests?${qs.toString()}` : '/requests';

  return useQuery({
    queryKey: ['requests', 'mine', params],
    queryFn: async () => {
      const res = await apiClient.get<RequestListResponse>(path);
      return res.data;
    },
  });
}

export function useMyRequest(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ['requests', 'mine', id],
    queryFn: async () => {
      const res = await apiClient.get<{ data: PhotographyRequest }>(`/requests/${id}`);
      return res.data.data;
    },
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateRequestInput) => {
      const res = await apiClient.post<{ data: PhotographyRequest }>('/requests', input);
      return res.data.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}

export function useUpdateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateRequestInput }) => {
      const res = await apiClient.patch<{ data: PhotographyRequest }>(
        `/requests/${id}`,
        input
      );
      return res.data.data;
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['requests'] });
      void qc.invalidateQueries({ queryKey: ['requests', 'mine', data.id] });
    },
  });
}

export function useWithdrawRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/requests/${id}`);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}

// ── Admin endpoints ──

export function useAdminRequests(params: ListRequestsParams = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const path = qs.toString() ? `/admin/requests?${qs.toString()}` : '/admin/requests';

  return useQuery({
    queryKey: ['requests', 'admin', params],
    queryFn: async () => {
      const res = await apiClient.get<RequestListResponse>(path);
      return res.data;
    },
  });
}

export function useAdminRequest(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ['requests', 'admin', id],
    queryFn: async () => {
      const res = await apiClient.get<{ data: PhotographyRequest }>(`/admin/requests/${id}`);
      return res.data.data;
    },
  });
}

type AdminAction = 'approve' | 'reject' | 'photography-completed' | 'link-album' | 'complete';

export function useAdminRequestAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      action,
      payload,
    }: {
      id: string;
      action: AdminAction;
      payload?: Record<string, unknown>;
    }) => {
      const res = await apiClient.post<{ data: PhotographyRequest }>(
        `/admin/requests/${id}/${action}`,
        payload ?? {}
      );
      return res.data.data;
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['requests'] });
      void qc.invalidateQueries({ queryKey: ['requests', 'admin', data.id] });
    },
  });
}
