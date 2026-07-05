/// <reference types="vite/client" />

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api',
  socketUrl: import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000',
  appName: import.meta.env.VITE_APP_NAME ?? 'Pixel Club Management Portal',
} as const;
