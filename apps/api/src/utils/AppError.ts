export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(opts: {
    message: string;
    statusCode?: number;
    code?: string;
    details?: unknown;
    isOperational?: boolean;
  }) {
    super(opts.message);
    this.name = 'AppError';
    this.statusCode = opts.statusCode ?? 500;
    this.code = opts.code ?? 'INTERNAL_ERROR';
    this.details = opts.details;
    this.isOperational = opts.isOperational ?? true;
    Error.captureStackTrace?.(this, this.constructor);
  }
}
