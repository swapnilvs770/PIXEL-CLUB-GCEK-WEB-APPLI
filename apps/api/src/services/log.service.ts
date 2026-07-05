import { Request } from 'express';
import { Log } from '../models/Log';
import { logger } from '../config/logger';

export interface LogActionInput {
  userId?: string;
  action: string;
  targetId?: string;
  result?: 'success' | 'failure';
  meta?: Record<string, unknown>;
}

/**
 * Extract a best-effort IP and User-Agent from the incoming request.
 */
function extractRequestMeta(req?: Request): { ip?: string; userAgent?: string } {
  if (!req) return {};
  const ip =
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    undefined;
  const userAgent = req.headers['user-agent'];
  return { ip, userAgent };
}

/**
 * Persist an audit-log entry. Never throws — logging failures must not break the request.
 */
export async function logAction(
  input: LogActionInput,
  req?: Request
): Promise<void> {
  try {
    const { ip, userAgent } = extractRequestMeta(req);
    await Log.create({
      userId: input.userId,
      action: input.action,
      targetId: input.targetId,
      result: input.result ?? 'success',
      meta: input.meta,
      ip,
      userAgent,
    });
  } catch (err) {
    logger.error({ err, action: input.action }, 'Failed to write audit log');
  }
}
