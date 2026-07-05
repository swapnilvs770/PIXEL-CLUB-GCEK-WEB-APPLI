import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

export type AlbumStatus = 'draft' | 'published' | 'archived';

export interface Album {
  id: string;
  title: string;
  description: string | null;
  year: number;
  coverPhotoId: string | null;
  status: AlbumStatus;
  driveFolderId: string | null;
  driveFolderUrl: string | null;
  eventDate: string | null;
  totalPhotos: number;
  uploadedPhotos: number;
  failedPhotos: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  createdBy: string | null;
  publishedBy: string | null;
}

export interface AlbumPhoto {
  id: string;
  albumId: string;
  driveFileId: string;
  driveFileName: string;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  originalSize: number | null;
  compressedSize: number | null;
  cloudinaryUrl: string | null;
  cloudinaryThumbnailUrl: string | null;
  status: 'pending' | 'compressed' | 'uploaded' | 'failed';
  error: string | null;
  uploadedAt: string | null;
  originalDownloadUrl: string;
}

export interface AlbumListResponse {
  data: Album[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export interface PhotoListResponse {
  data: AlbumPhoto[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export interface ListAlbumsParams {
  status?: AlbumStatus;
  year?: number;
  search?: string;
  page?: number;
  limit?: number;
}

// ── Public ──

export function usePublishedAlbums(params: ListAlbumsParams = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.year) qs.set('year', String(params.year));
  if (params.search) qs.set('search', params.search);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const path = qs.toString() ? `/albums?${qs.toString()}` : '/albums';
  return useQuery({
    queryKey: ['albums', 'public', params],
    queryFn: async () => {
      const res = await apiClient.get<AlbumListResponse>(path);
      return res.data;
    },
  });
}

export function usePublishedAlbumYears() {
  return useQuery({
    queryKey: ['albums', 'years'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: number[] }>('/albums/years');
      return res.data.data;
    },
  });
}

export function usePublishedAlbum(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ['albums', 'public', id],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Album }>(`/albums/${id}`);
      return res.data.data;
    },
  });
}

export function usePublishedAlbumPhotos(
  id: string | undefined,
  params: { page?: number; limit?: number } = {}
) {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const path = qs.toString()
    ? `/albums/${id}/photos?${qs.toString()}`
    : `/albums/${id}/photos`;
  return useQuery({
    enabled: !!id,
    queryKey: ['albums', 'public', id, 'photos', params],
    queryFn: async () => {
      const res = await apiClient.get<PhotoListResponse>(path);
      return res.data;
    },
  });
}

// ── Admin ──

export function useAdminAlbums(params: ListAlbumsParams = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.year) qs.set('year', String(params.year));
  if (params.search) qs.set('search', params.search);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const path = qs.toString() ? `/admin/albums?${qs.toString()}` : '/admin/albums';
  return useQuery({
    queryKey: ['albums', 'admin', params],
    queryFn: async () => {
      const res = await apiClient.get<AlbumListResponse>(path);
      return res.data;
    },
  });
}

export function useAdminAlbum(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ['albums', 'admin', id],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Album }>(`/admin/albums/${id}`);
      return res.data.data;
    },
  });
}

export interface CreateAlbumInput {
  title: string;
  description?: string;
  year: number;
  driveFolderUrl: string;
  eventDate?: string;
  tags?: string[];
}

export function useCreateAlbum() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAlbumInput) => {
      const res = await apiClient.post<{ data: Album }>('/admin/albums', input);
      return res.data.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['albums'] });
    },
  });
}

export function useUpdateAlbum() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<CreateAlbumInput> }) => {
      const res = await apiClient.patch<{ data: Album }>(`/admin/albums/${id}`, input);
      return res.data.data;
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['albums'] });
      void qc.invalidateQueries({ queryKey: ['albums', 'admin', data.id] });
    },
  });
}

export function useDeleteAlbum() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/albums/${id}`);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['albums'] });
    },
  });
}

export function useStartImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post<{ data: { jobId: string } }>(
        `/admin/albums/${id}/start-import`
      );
      return res.data.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['albums'] });
      void qc.invalidateQueries({ queryKey: ['upload-jobs'] });
    },
  });
}

export function usePublishAlbum() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post<{ data: Album }>(`/admin/albums/${id}/publish`);
      return res.data.data;
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['albums'] });
      void qc.invalidateQueries({ queryKey: ['albums', 'admin', data.id] });
    },
  });
}

export function useUnpublishAlbum() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post<{ data: Album }>(`/admin/albums/${id}/unpublish`);
      return res.data.data;
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['albums'] });
      void qc.invalidateQueries({ queryKey: ['albums', 'admin', data.id] });
    },
  });
}
