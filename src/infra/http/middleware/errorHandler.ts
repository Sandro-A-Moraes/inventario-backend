import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '../../../generated/prisma/client';
import { AppError } from '../../../shared/errors/AppError';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error('[ERROR]', err.message);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code == 'P2002') {
      return res.status(409).json({ error: 'This value already exists' });
    }

    return res.status(500).json({ error: 'Database operation failed' });
  }

  res.status(500).json({ error: 'Internal server error' });
}
