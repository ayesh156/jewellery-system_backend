import type { Request, Response } from 'express';
import { countersService } from '../services/counters.service.js';
import { handleZodError } from '../utils/asyncHandler.js';

export async function list(req: Request, res: Response) {
  const { shopCode } = req.query as { shopCode?: string };
  const data = await countersService.list(shopCode);
  res.json({ status: 'success', data });
}

export async function getNext(req: Request, res: Response) {
  try {
    const { entityType, shopCode } = req.body;
    if (!entityType || !shopCode) {
      res.status(400).json({ status: 'error', message: 'entityType and shopCode are required' });
      return;
    }
    const data = await countersService.getNext(entityType, shopCode);
    res.json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function initShop(req: Request, res: Response) {
  try {
    const { shopCode } = req.body;
    if (!shopCode) {
      res.status(400).json({ status: 'error', message: 'shopCode is required' });
      return;
    }
    const result = await countersService.initShop(shopCode);
    res.json({ status: 'success', data: result.data, created: result.created });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function update(req: Request, res: Response) {
  try {
    const { entityType } = req.params;
    const { shopCode, prefix, paddingLength, lastNumber } = req.body;
    if (!shopCode) {
      res.status(400).json({ status: 'error', message: 'shopCode is required' });
      return;
    }
    const data = await countersService.update(entityType as string, {
      shopCode,
      prefix,
      paddingLength,
      lastNumber,
    });
    res.json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}