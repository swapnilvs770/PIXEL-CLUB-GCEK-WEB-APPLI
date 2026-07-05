import { Readable } from 'stream';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary';
import { AppError } from '../utils/AppError';

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  bytes: number;
}

export async function uploadImage(
  buffer: Buffer,
  opts: {
    folder: string;
    publicId?: string;
  }
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new AppError({
      message: 'Cloudinary is not configured. Set CLOUDINARY_* env vars.',
      statusCode: 500,
      code: 'CLOUDINARY_NOT_CONFIGURED',
    });
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: opts.folder,
        public_id: opts.publicId,
        resource_type: 'image',
        overwrite: true,
      },
      (err, result) => {
        if (err) return reject(err);
        if (!result) return reject(new Error('No result from Cloudinary'));
        resolve({
          publicId: result.public_id,
          url: result.secure_url,
          thumbnailUrl: cloudinary.url(result.public_id, {
            width: 480,
            crop: 'scale',
            secure: true,
          }),
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      }
    );
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  if (!isCloudinaryConfigured()) return;
  await cloudinary.uploader.destroy(publicId);
}
