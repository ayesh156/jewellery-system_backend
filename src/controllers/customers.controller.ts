import type { Request, Response } from 'express';
import { customersService } from '../services/customers.service.js';
import { handleZodError } from '../utils/asyncHandler.js';
import { createCustomerSchema, updateCustomerSchema } from '../validators/customers.js';

export async function list(req: Request, res: Response) {
  const result = await customersService.findAll(req.query as Record<string, string>);
  res.json({ status: 'success', ...result });
}

export async function getById(req: Request, res: Response) {
  const data = await customersService.findById(req.params.id as string);
  res.json({ status: 'success', data });
}

export async function create(req: Request, res: Response) {
  try {
    const input = createCustomerSchema.parse(req.body);
    const data = await customersService.create(input);
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function update(req: Request, res: Response) {
  try {
    const input = updateCustomerSchema.parse(req.body);
    const data = await customersService.update(req.params.id as string, input);
    res.json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function remove(req: Request, res: Response) {
  const data = await customersService.delete(req.params.id as string);
  res.json({ status: 'success', data });
}