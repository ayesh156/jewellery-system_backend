import type { Request, Response } from 'express';
import { usersService } from '../services/users.service.js';
import { handleZodError } from '../utils/asyncHandler.js';
import { createUserSchema, updateUserSchema } from '../validators/users.js';

export async function list(_req: Request, res: Response) {
  const data = await usersService.findAll();
  res.json({ status: 'success', data });
}

export async function getById(req: Request, res: Response) {
  const data = await usersService.findById(req.params.id as string);
  res.json({ status: 'success', data });
}

export async function create(req: Request, res: Response) {
  try {
    const input = createUserSchema.parse(req.body);
    const data = await usersService.create(input);
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function update(req: Request, res: Response) {
  try {
    const input = updateUserSchema.parse(req.body);
  const data = await usersService.update(req.params.id as string, input);
    res.json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function remove(req: Request, res: Response) {
  const data = await usersService.delete(req.params.id as string, req.user!.userId);
  res.json({ status: 'success', data });
}