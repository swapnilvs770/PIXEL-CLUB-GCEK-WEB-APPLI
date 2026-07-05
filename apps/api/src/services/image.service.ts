import sharp from 'sharp';

export interface CompressOptions {
  maxWidth?: number;
  quality?: number;
  format?: 'webp' | 'jpeg';
}

export interface CompressResult {
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
}

/**
 * Resize and re-encode an image to a web-friendly format for Cloudinary preview storage.
 * Originals remain untouched on Google Drive.
 */
export async function compressImage(
  input: Buffer,
  opts: CompressOptions = {}
): Promise<CompressResult> {
  const { maxWidth = 1920, quality = 80, format = 'webp' } = opts;

  const pipeline = sharp(input).rotate().resize({
    width: maxWidth,
    withoutEnlargement: true,
    fit: 'inside',
  });

  const result =
    format === 'webp'
      ? pipeline.webp({ quality })
      : pipeline.jpeg({ quality, mozjpeg: true });

  const meta = await result.metadata();
  const buffer = await result.toBuffer();

  return {
    buffer,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    size: buffer.length,
  };
}

export async function makeThumbnail(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize({ width: 480, withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: 70 })
    .toBuffer();
}
