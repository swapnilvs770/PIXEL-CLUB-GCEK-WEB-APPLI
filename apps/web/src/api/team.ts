import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

export interface TeamMemberSocials {
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  other?: string;
}

export interface TeamMember {
  id: string;
  userId: string | null;
  name: string;
  photoUrl: string | null;
  designation: string;
  bio: string;
  contributions: string[];
  socials: TeamMemberSocials;
  displayOrder: number;
}

export interface TeamBatch {
  id: string;
  batchName: string;
  batchYear: string;
  isActive: boolean;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamBatchSummary extends Omit<TeamBatch, 'members'> {
  memberCount: number;
}

export interface CreateBatchInput {
  batchName: string;
  batchYear: string;
  isActive?: boolean;
}

export interface MemberInput {
  userId?: string;
  name: string;
  photoUrl?: string;
  designation: string;
  bio?: string;
  contributions?: string[];
  socials?: TeamMemberSocials;
  displayOrder?: number;
}

// ── Public ──

export function useActiveTeam() {
  return useQuery({
    queryKey: ['team', 'active'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: TeamBatch | null }>('/team');
      return res.data.data;
    },
  });
}

// ── Admin ──

export function useAdminBatches() {
  return useQuery({
    queryKey: ['team', 'admin', 'batches'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: TeamBatchSummary[] }>('/team/batches');
      return res.data.data;
    },
  });
}

export function useAdminBatch(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ['team', 'admin', 'batches', id],
    queryFn: async () => {
      const res = await apiClient.get<{ data: TeamBatch }>(`/team/batches/${id}`);
      return res.data.data;
    },
  });
}

export function useCreateBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateBatchInput) => {
      const res = await apiClient.post<{ data: TeamBatch }>('/admin/team', input);
      return res.data.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['team'] });
    },
  });
}

export function useUpdateBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: Partial<CreateBatchInput>;
    }) => {
      const res = await apiClient.patch<{ data: TeamBatch }>(
        `/admin/team/batches/${id}`,
        input
      );
      return res.data.data;
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['team'] });
      void qc.invalidateQueries({ queryKey: ['team', 'admin', 'batches', data.id] });
    },
  });
}

export function useDeleteBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/team/batches/${id}`);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['team'] });
    },
  });
}

export function useActivateBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post<{ data: TeamBatch }>(
        `/admin/team/batches/${id}/activate`
      );
      return res.data.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['team'] });
    },
  });
}

export function useSyncBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post<{ data: TeamBatch }>(
        `/admin/team/batches/${id}/sync`
      );
      return res.data.data;
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['team'] });
      void qc.invalidateQueries({ queryKey: ['team', 'admin', 'batches', data.id] });
    },
  });
}

export function useAddMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ batchId, input }: { batchId: string; input: MemberInput }) => {
      const res = await apiClient.post<{ data: TeamBatch }>(
        `/admin/team/batches/${batchId}/members`,
        input
      );
      return res.data.data;
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['team'] });
      void qc.invalidateQueries({ queryKey: ['team', 'admin', 'batches', data.id] });
    },
  });
}

export function useUpdateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      batchId,
      memberId,
      input,
    }: {
      batchId: string;
      memberId: string;
      input: Partial<MemberInput>;
    }) => {
      const res = await apiClient.patch<{ data: TeamBatch }>(
        `/admin/team/batches/${batchId}/members/${memberId}`,
        input
      );
      return res.data.data;
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['team'] });
      void qc.invalidateQueries({ queryKey: ['team', 'admin', 'batches', data.id] });
    },
  });
}

export function useDeleteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ batchId, memberId }: { batchId: string; memberId: string }) => {
      const res = await apiClient.delete<{ data: TeamBatch }>(
        `/admin/team/batches/${batchId}/members/${memberId}`
      );
      return res.data.data;
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['team'] });
      void qc.invalidateQueries({ queryKey: ['team', 'admin', 'batches', data.id] });
    },
  });
}
