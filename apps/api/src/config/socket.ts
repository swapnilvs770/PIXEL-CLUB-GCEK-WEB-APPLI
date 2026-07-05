import { Server as HttpServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import { env, isProd } from './env';
import { logger } from './logger';
import { verifyAccessToken } from '../utils/jwt';

let io: IOServer | null = null;

export function initSocket(server: HttpServer): IOServer {
  io = new IOServer(server, {
    cors: {
      origin: isProd ? env.CLIENT_BASE_URL : true,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.use((socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers.authorization?.startsWith('Bearer ')
          ? socket.handshake.headers.authorization.slice(7)
          : undefined);

      if (!token) {
        return next(new Error('Missing auth token'));
      }
      const payload = verifyAccessToken(token);
      (socket.data as { userId?: string; role?: string }).userId = payload.sub;
      (socket.data as { userId?: string; role?: string }).role = payload.role;
      next();
    } catch (err) {
      next(new Error('Invalid auth token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket.data as { userId?: string }).userId;
    if (userId) {
      socket.join(`user:${userId}`);
    }
    if ((socket.data as { role?: string }).role === 'admin') {
      socket.join('admins');
    }
    logger.info({ socketId: socket.id, userId }, 'socket connected');
    socket.on('disconnect', (reason) => {
      logger.info({ socketId: socket.id, reason }, 'socket disconnected');
    });
  });

  logger.info('Socket.IO initialized');
  return io;
}

export function getIO(): IOServer {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initSocket() first.');
  }
  return io;
}

export function emitToUser(userId: string, event: string, payload: unknown): void {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

export function emitToAdmins(event: string, payload: unknown): void {
  if (!io) return;
  io.to('admins').emit(event, payload);
}

export function emitUploadProgress(jobId: string, payload: unknown): void {
  if (!io) return;
  io.to(`upload:${jobId}`).emit('upload:progress', payload);
}
