import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

mongoose.set('strictQuery', true);

export async function connectDb(): Promise<void> {
  if (!env.MONGO_URI) {
    throw new Error('MONGO_URI is not set');
  }

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected');
  });
  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'MongoDB connection error');
  });
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  await mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 20,
  });
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
