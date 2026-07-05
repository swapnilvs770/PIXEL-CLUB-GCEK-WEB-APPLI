import { google } from 'googleapis';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { logger } from '../config/logger';

const FOLDER_URL_PATTERNS: RegExp[] = [
  /drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/,
  /drive\.google\.com\/folder\/([a-zA-Z0-9_-]+)/,
  /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
];

let driveClient: ReturnType<typeof google.drive> | null = null;

export function extractDriveFolderId(input: string): string {
  const trimmed = input.trim();
  for (const pattern of FOLDER_URL_PATTERNS) {
    const m = trimmed.match(pattern);
    if (m) return m[1];
  }
  // Treat as a raw ID if it looks like one
  if (/^[a-zA-Z0-9_-]{15,}$/.test(trimmed)) return trimmed;
  throw new AppError({
    message:
      'Could not extract a Drive folder ID. Paste a folder link like https://drive.google.com/drive/folders/<id>',
    statusCode: 400,
    code: 'INVALID_DRIVE_URL',
  });
}

function getCredentials(): Record<string, unknown> {
  if (!env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new AppError({
      message:
        'GOOGLE_SERVICE_ACCOUNT_JSON is not configured. Create a service account in Google Cloud, share the source folder with its email, and paste the JSON here.',
      statusCode: 500,
      code: 'DRIVE_NOT_CONFIGURED',
    });
  }
  try {
    return JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  } catch {
    throw new AppError({
      message: 'GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON',
      statusCode: 500,
      code: 'DRIVE_CONFIG_INVALID',
    });
  }
}

function getDrive(): ReturnType<typeof google.drive> {
  if (driveClient) return driveClient;
  const auth = new google.auth.GoogleAuth({
    credentials: getCredentials(),
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  driveClient = google.drive({ version: 'v3', auth });
  return driveClient;
}

export interface DriveImageFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  thumbnailLink?: string;
  webViewLink?: string;
}

export async function verifyFolderAccess(folderId: string): Promise<void> {
  const drive = getDrive();
  try {
    await drive.files.get({
      fileId: folderId,
      fields: 'id,name,mimeType',
      supportsAllDrives: true,
    });
  } catch (err) {
    const code = (err as { code?: number }).code;
    if (code === 404) {
      throw new AppError({
        message:
          'Drive folder not found, or the service account does not have access. Share the folder with the service account email.',
        statusCode: 404,
        code: 'DRIVE_FOLDER_NOT_FOUND',
      });
    }
    throw err;
  }
}

export async function listImagesInFolder(folderId: string): Promise<DriveImageFile[]> {
  const drive = getDrive();
  await verifyFolderAccess(folderId);

  const files: DriveImageFile[] = [];
  let pageToken: string | undefined;

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields:
        'nextPageToken, files(id,name,mimeType,size,thumbnailLink,webViewLink)',
      pageSize: 1000,
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    for (const f of res.data.files ?? []) {
      files.push({
        id: f.id!,
        name: f.name!,
        mimeType: f.mimeType!,
        size: f.size ? parseInt(f.size, 10) : undefined,
        thumbnailLink: f.thumbnailLink ?? undefined,
        webViewLink: f.webViewLink ?? undefined,
      });
    }
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);

  logger.info({ folderId, count: files.length }, 'Listed Drive images');
  return files;
}

export async function downloadDriveFile(fileId: string): Promise<Buffer> {
  const drive = getDrive();
  const res = await drive.files.get(
    { fileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(res.data as ArrayBuffer);
}

export function getDriveFileWebViewLink(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

export function getDriveFileDirectDownloadLink(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}
