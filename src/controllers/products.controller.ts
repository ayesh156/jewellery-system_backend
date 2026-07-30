import type { Request, Response } from 'express';
import { productsService } from '../services/products.service.js';
import { handleZodError } from '../utils/asyncHandler.js';
import {
  createProductSchema,
  updateProductSchema,
  stockUpdateSchema,
} from '../validators/products.js';

export async function getCounts(_req: Request, res: Response) {
  const data = await productsService.getCounts();
  res.json({ status: 'success', data });
}

export async function list(req: Request, res: Response) {
  const result = await productsService.findAll(req.query as Record<string, string>);
  res.json({ status: 'success', ...result });
}

export async function getById(req: Request, res: Response) {
  const data = await productsService.findById(req.params.id as string);
  res.json({ status: 'success', data });
}

export async function create(req: Request, res: Response) {
  try {
    const input = createProductSchema.parse(req.body);
    const data = await productsService.create(input);
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function update(req: Request, res: Response) {
  try {
    const input = updateProductSchema.parse(req.body);
    const data = await productsService.update(req.params.id as string, input);
    res.json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function remove(req: Request, res: Response) {
  const data = await productsService.delete(req.params.id as string);
  res.json({ status: 'success', data });
}

export async function updateStock(req: Request, res: Response) {
  try {
    const input = stockUpdateSchema.parse(req.body);
    const data = await productsService.updateStock(req.params.id as string, input);
    res.json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}