import type { Response } from 'express';

interface SendOptions {
  message?: string;
  meta?: Record<string, unknown>;
}

export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  data: T,
  options: SendOptions = {},
): Response {
  return res.status(statusCode).json({
    success: true,
    message: options.message,
    data,
    ...(options.meta ? { meta: options.meta } : {}),
  });
}
