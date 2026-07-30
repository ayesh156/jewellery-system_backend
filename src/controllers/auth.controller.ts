import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { handleZodError } from '../utils/asyncHandler.js';
import {
  loginSchema,
  changePasswordSchema,
  preferencesSchema,
} from '../validators/auth.js';

export async function login(req: Request, res: Response) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.json({ status: 'success', data: result });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function getMe(req: Request, res: Response) {
  const user = await authService.getMe(req.user!.userId);
  res.json({ status: 'success', data: user });
}

export async function changePassword(req: Request, res: Response) {
  try {
    const input = changePasswordSchema.parse(req.body);
    await authService.changePassword(req.user!.userId, input);
    res.json({ status: 'success', message: 'Password changed successfully' });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function updatePreferences(req: Request, res: Response) {
  try {
    const input = preferencesSchema.parse(req.body);
    await authService.updatePreferences(req.user!.userId, input);
    res.json({ status: 'success', message: 'Preferences updated' });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}