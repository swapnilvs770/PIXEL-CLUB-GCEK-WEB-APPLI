import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { getSocket } from '@/lib/socket';

export type JobStatus = 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface JobLogEntry {
  ts: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface UploadJob {
  _id: string;
  albumId: string;
  status: JobStatus;
  startedBy: string;
  startedAt?: string;
  completedAt?: string;
  pausedAt?: string;
  totalPhotos: number;
  processedPhotos: number;
  uploadedPhotos: number;
  failedPhotos: number;
  currentFileName?: string;
  averageSpeed: number;
  etaSeconds?: number;
  logs: JobLogEntry[];
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobProgressEvent {
  type:
    | 'status'
    | 'totals'
    | 'progress'
    | 'current'
    | 'log';
  status?: JobStatus;
  error?: string;
  totalPhotos?: number;
  processedPhotos?: number;
  uploadedPhotos?: number;
  failedPhotos?: number;
  currentFileName?: string;
  fileName?: string;
  index?: number;
  averageSpeed?: number;
  etaSeconds?: number;
  entry?: JobLogEntry;
}

export function useJobs() {
  return useQuery({
    queryKey: ['upload-jobs'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: UploadJob[] }>('/admin/upload-jobs');
      return res.data.data;
    },
    refetchInterval: 5_000,
  });
}

export function useJob(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ['upload-jobs', id],
    queryFn: async () => {
      const res = await apiClient.get<{ data: UploadJob }>(`/admin/upload-jobs/${id}`);
      return res.data.data;
    },
    refetchInterval: 3_000,
  });
}

export function usePauseJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/admin/upload-jobs/pause');
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['upload-jobs'] }),
  });
}

export function useResumeJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/admin/upload-jobs/${id}/resume`);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['upload-jobs'] }),
  });
}

export function useCancelJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/admin/upload-jobs/cancel');
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['upload-jobs'] }),
  });
}

export function useRetryJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/admin/upload-jobs/${id}/retry`);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['upload-jobs'] }),
  });
}

/**
 * Subscribes to live progress events for a specific job via Socket.IO.
 * Returns the most recent event payload (or null) so the UI can react in real-time.
 */
export function useJobProgress(jobId: string | undefined): JobProgressEvent | null {
  const [latest, setLatest] = useState<JobProgressEvent | null>(null);

  useEffect(() => {
    if (!jobId) return;
    const socket = getSocket();
    const room = `upload:${jobId}`;
    const handler = (payload: JobProgressEvent) => setLatest(payload);
    socket.on(room, handler);
    return () => {
      socket.off(room, handler);
    };
  }, [jobId]);

  return latest;
}
