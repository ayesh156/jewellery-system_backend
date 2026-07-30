import type { Request, Response } from 'express';
import { goldService } from '../services/gold.service.js';
import { handleZodError } from '../utils/asyncHandler.js';

export async function getRates(_req: Request, res: Response) {
  const data = await goldService.getRates();
  res.json({ status: 'success', data });
}

export async function updateRate(req: Request, res: Response) {
  try {
    const { buyingRate, sellingRate, date, updatedBy } = req.body;
    const data = await goldService.updateRate(req.params.id as string, {
      buyingRate,
      sellingRate,
      date,
      updatedBy,
    });
    res.json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function getTypes(_req: Request, res: Response) {
  const data = await goldService.getTypes();
  res.json({ status: 'success', data });
}

export async function createType(req: Request, res: Response) {
  try {
    const { id, karat, purityPercentage, description, isActive, defaultWastagePercentage, color } =
      req.body;
    const data = await goldService.createType({
      id,
      karat,
      purityPercentage,
      description,
      isActive,
      defaultWastagePercentage,
      color,
    });
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function updateType(req: Request, res: Response) {
  try {
    const { purityPercentage, description, isActive, defaultWastagePercentage, color } = req.body;
    const data = await goldService.updateType(req.params.id as string, {
      purityPercentage,
      description,
      isActive,
      defaultWastagePercentage,
      color,
    });
    res.json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function deleteType(req: Request, res: Response) {
  const data = await goldService.deleteType(req.params.id as string);
  res.json({ status: 'success', data });
}