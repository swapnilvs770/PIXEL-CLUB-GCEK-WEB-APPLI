import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

export interface PublicSettings {
  websiteName: string;
  websiteDescription: string;
  contactEmail: string;
  socials: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    website?: string;
  };
  theme: 'light' | 'dark' | 'system';
  homepage: {
    heroTitle: string;
    heroSubtitle: string;
    heroImageUrl: string | null;
  };
  maintenance: {
    enabled: boolean;
    message: string;
  };
  featureToggles: {
    requestsEnabled: boolean;
    albumsEnabled: boolean;
    galleryEnabled: boolean;
    teamEnabled: boolean;
  };
}

export interface AdminSettings extends PublicSettings {
  _id: string;
  smtp: {
    from: string;
    host: string;
    port: number;
    user: string;
  };
  googleDrive: {
    serviceAccountEmail?: string;
  };
  cloudinary: {
    cloudName?: string;
  };
  updatedBy?: string;
  updatedAt?: string;
}

export function usePublicSettings() {
  return useQuery({
    queryKey: ['settings', 'public'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: PublicSettings }>('/settings');
      return res.data.data;
    },
    staleTime: 60_000,
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ['settings', 'admin'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: AdminSettings }>('/admin/settings');
      return res.data.data;
    },
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<AdminSettings>) => {
      const res = await apiClient.put<{ data: AdminSettings }>('/admin/settings', input);
      return res.data.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
