import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Wraps async route handlers / controller methods
 * to catch promise rejections and forward to Express error handler.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Handles Zod validation errors centrally.
 * Call this from controllers after parsing.
 */
export function handleZodError(err: unknown, res: Response): boolean {
  if (err instanceof z.ZodError) {
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.errors,
    });
    return true;
  }
  return false;
}