import type { Request, Response } from 'express';
import { categoriesService } from '../services/categories.service.js';
import { handleZodError } from '../utils/asyncHandler.js';
import { createCategorySchema, updateCategorySchema } from '../validators/categories.js';

export async function list(_req: Request, res: Response) {
  const data = await categoriesService.findAll();
  res.json({ status: 'success', data });
}

export async function getById(req: Request, res: Response) {
  const data = await categoriesService.findById(req.params.id as string);
  res.json({ status: 'success', data });
}

export async function create(req: Request, res: Response) {
  try {
    const input = createCategorySchema.parse(req.body);
    const data = await categoriesService.create(input);
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function update(req: Request, res: Response) {
  try {
    const input = updateCategorySchema.parse(req.body);
    const data = await categoriesService.update(req.params.id as string, input);
    res.json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function remove(req: Request, res: Response) {
  const data = await categoriesService.delete(req.params.id as string);
  res.json({ status: 'success', data });
}