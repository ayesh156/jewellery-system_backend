import type { Request, Response } from 'express';
import { clearanceService } from '../services/clearance.service.js';
import { handleZodError } from '../utils/asyncHandler.js';
import {
  createClearanceSchema,
  clearancePaymentSchema,
  redeemSchema,
} from '../validators/clearance.js';

export async function list(req: Request, res: Response) {
  const result = await clearanceService.findAll(req.query as Record<string, string>);
  res.json({ status: 'success', ...result });
}

export async function getById(req: Request, res: Response) {
  const data = await clearanceService.findById(req.params.id as string);
  res.json({ status: 'success', data });
}

export async function create(req: Request, res: Response) {
  try {
    const input = createClearanceSchema.parse(req.body);
    const data = await clearanceService.create(input);
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function update(req: Request, res: Response) {
  try {
    const input = createClearanceSchema.partial().omit({ id: true }).parse(req.body);
    const data = await clearanceService.update(req.params.id as string, input);
    res.json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function addPayment(req: Request, res: Response) {
  try {
    const input = clearancePaymentSchema.parse(req.body);
    const data = await clearanceService.addPayment(req.params.id as string, input);
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function redeem(req: Request, res: Response) {
  try {
    const input = redeemSchema.parse(req.body);
    const data = await clearanceService.redeem(req.params.id as string, input);
    res.json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function remove(req: Request, res: Response) {
  const data = await clearanceService.delete(req.params.id as string);
  res.json({ status: 'success', data });
}