import type { Request, Response } from 'express';
import { invoicesService } from '../services/invoices.service.js';
import { handleZodError } from '../utils/asyncHandler.js';
import { createInvoiceSchema, paymentSchema } from '../validators/invoices.js';

export async function list(req: Request, res: Response) {
  const result = await invoicesService.findAll(req.query as Record<string, string>);
  res.json({ status: 'success', ...result });
}

export async function getById(req: Request, res: Response) {
  const data = await invoicesService.findById(req.params.id as string);
  res.json({ status: 'success', data });
}

export async function create(req: Request, res: Response) {
  try {
    const input = createInvoiceSchema.parse(req.body);
    const data = await invoicesService.create(input);
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function update(req: Request, res: Response) {
  try {
    const input = createInvoiceSchema.partial().omit({ id: true }).parse(req.body);
    const data = await invoicesService.update(req.params.id as string, input);
    res.json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function addPayment(req: Request, res: Response) {
  try {
    const input = paymentSchema.parse(req.body);
    const data = await invoicesService.addPayment(req.params.id as string, input);
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function remove(req: Request, res: Response) {
  const data = await invoicesService.delete(req.params.id as string);
  res.json({ status: 'success', data });
}