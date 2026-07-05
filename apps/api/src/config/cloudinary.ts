import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';
import { logger } from './logger';

let configured = false;

export function configureCloudinary(): void {
  if (configured) return;
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    logger.warn('Cloudinary credentials missing — image upload features will be disabled.');
    return;
  }
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
  logger.info('Cloudinary configured');
}

export function isCloudinaryConfigured(): boolean {
  return configured;
}

export { cloudinary };
