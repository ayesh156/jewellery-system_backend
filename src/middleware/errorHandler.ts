import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export class AppError extends Error {
  public statusCode: number;

  constructor(
    statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  if (err instanceof z.ZodError) {
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.errors,
    });
    return;
  }

  // Handle Prisma Known Request Errors (P2002, P2003, P2025, etc.)
  if (err && typeof err === 'object' && 'code' in err && typeof (err as any).code === 'string') {
    const prismaErr = err as any;
    if (prismaErr.code === 'P2002') {
      const target = Array.isArray(prismaErr.meta?.target)
        ? prismaErr.meta.target.join(', ')
        : (prismaErr.meta?.target || 'field');
      res.status(409).json({
        status: 'error',
        message: `A record with this ${target} already exists.`,
      });
      return;
    }
    if (prismaErr.code === 'P2003') {
      const field = prismaErr.meta?.field_name || prismaErr.meta?.modelName || 'relation';
      res.status(400).json({
        status: 'error',
        message: `Invalid reference constraint on ${field}.`,
      });
      return;
    }
    if (prismaErr.code === 'P2025') {
      res.status(404).json({
        status: 'error',
        message: 'The requested record was not found or was already deleted.',
      });
      return;
    }
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : (err.message || 'Internal server error'),
  });
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
}
