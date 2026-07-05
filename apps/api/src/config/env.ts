import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const booleanFromString = z
  .union([z.string(), z.boolean()])
  .transform((v) => v === true || v === 'true' || v === '1');

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  API_BASE_URL: z.string().url().default('http://localhost:5000'),
  CLIENT_BASE_URL: z.string().url().default('http://localhost:5173'),

  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  GOOGLE_REDIRECT_URI: z.string().url().default('http://localhost:5000/api/auth/google/callback'),
  ADMIN_BOOTSTRAP_EMAILS: z.string().optional().default(''),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),

  GOOGLE_SERVICE_ACCOUNT_JSON: z.string().optional().default(''),

  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().int().positive().default(465),
  SMTP_SECURE: booleanFromString.default('true'),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  MAIL_FROM: z.string().default('Pixel Club <noreply@pixelclub.in>'),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;

export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';

export const adminBootstrapEmails = parseAdminEmails(env.ADMIN_BOOTSTRAP_EMAILS);

/**
 * Pure helper, exported for testability. Splits a comma-separated email list,
 * trims whitespace, lowercases each entry, and drops empties.
 */
export function parseAdminEmails(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}
