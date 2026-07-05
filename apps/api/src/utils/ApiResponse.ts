import { Response } from 'express';

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function sendOk<T>(res: Response, data: T, meta?: Record<string, unknown>): Response {
  const body: ApiSuccess<T> = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(200).json(body);
}

export function sendCreated<T>(res: Response, data: T): Response {
  return res.status(201).json({ success: true, data });
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}
