import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import { rateLimit } from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/error';
import { notFoundHandler } from './middleware/notFound';
import apiRouter from './routes';

export function createApp(): Application {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(
    cors({
      origin: env.NODE_ENV === 'production' ? env.CLIENT_BASE_URL : true,
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());
  app.use(hpp());
  app.use(mongoSanitize());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 600,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  app.get('/', (_req, res) => {
    res.json({
      name: 'PCMP API',
      version: '1.0.0',
      docs: '/api/health',
    });
  });

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
