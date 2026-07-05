import { RequestHandler } from 'express';
import { AppError } from '../utils/AppError';

export const notFoundHandler: RequestHandler = (req) => {
  throw new AppError({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    statusCode: 404,
    code: 'NOT_FOUND',
  });
};
