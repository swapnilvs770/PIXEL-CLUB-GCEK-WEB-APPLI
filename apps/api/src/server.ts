import http from 'http';
import { createApp } from './app';
import passport from './config/passport';
import { env } from './config/env';
import { connectDb, disconnectDb } from './config/db';
import { logger } from './config/logger';
import { initSocket } from './config/socket';
import { configureCloudinary } from './config/cloudinary';
import { configureMailer } from './config/mailer';

async function bootstrap(): Promise<void> {
  try {
    await connectDb();
    configureCloudinary();
    configureMailer();

    const app = createApp();
    app.use(passport.initialize());
    const server = http.createServer(app);
    initSocket(server);

    server.listen(env.PORT, () => {
      logger.info(`🚀 PCMP API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(() => logger.info('HTTP server closed'));
      try {
        await disconnectDb();
      } catch (err) {
        logger.error({ err }, 'Error during MongoDB disconnect');
      }
      process.exit(0);
    };

    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('unhandledRejection', (reason) => {
      logger.error({ reason }, 'Unhandled promise rejection');
    });
    process.on('uncaughtException', (err) => {
      logger.fatal({ err }, 'Uncaught exception');
      process.exit(1);
    });
  } catch (err) {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
  }
}

void bootstrap();
