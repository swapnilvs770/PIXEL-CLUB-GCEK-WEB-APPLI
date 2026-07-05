import pino from 'pino';
import { env, isDev } from './env';

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: 'pcmp-api' },
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname,service',
        },
      }
    : undefined,
});

export type Logger = typeof logger;
