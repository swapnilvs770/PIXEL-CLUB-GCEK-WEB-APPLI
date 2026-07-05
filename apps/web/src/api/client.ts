import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/lib/env';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  timeout: 30_000,
});

const TOKEN_KEY = 'pcmp_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken();
  if (token) {
    config.headers.set?.('Authorization', `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (r) => r,
  (err: AxiosError<{ error?: { code?: string; message?: string } }>) => {
    if (typeof window !== 'undefined') {
      const code = err.response?.data?.error?.code;
      if (err.response?.status === 401) {
        if (code === 'INVALID_TOKEN' || code === 'NOT_AUTHENTICATED' || code === 'USER_NOT_FOUND') {
          setStoredToken(null);
          if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/auth/')) {
            window.location.assign('/login');
          }
        }
      }
      if (err.response?.status === 403 && code === 'BLOCKED') {
        setStoredToken(null);
        if (!window.location.pathname.startsWith('/login')) {
          window.location.assign('/login?error=blocked');
        }
      }
    }
    return Promise.reject(err);
  }
);

export interface ApiErrorShape {
  code: string;
  message: string;
  details?: unknown;
}

export function toApiError(err: unknown): ApiErrorShape {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data?.error;
    if (data) return { code: data.code ?? 'UNKNOWN', message: data.message ?? err.message, details: data.details };
    return { code: 'NETWORK_ERROR', message: err.message };
  }
  if (err instanceof Error) return { code: 'UNKNOWN', message: err.message };
  return { code: 'UNKNOWN', message: 'Unexpected error' };
}
