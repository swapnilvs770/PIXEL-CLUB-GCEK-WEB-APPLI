import { io, Socket } from 'socket.io-client';
import { env } from './env';
import { getStoredToken } from '@/api/client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) return socket;
  socket = io(env.socketUrl, {
    transports: ['websocket', 'polling'],
    auth: { token: getStoredToken() },
    autoConnect: true,
  });
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
