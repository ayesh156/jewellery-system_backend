import type { Request, Response } from 'express';
import { pawningTermsService } from '../services/pawningTerms.service.js';
import { handleZodError } from '../utils/asyncHandler.js';

export async function getAll(_req: Request, res: Response) {
  const data = await pawningTermsService.getAll();
  res.json({ status: 'success', data });
}

export async function getFlat(req: Request, res: Response) {
  const lang = (req.query.lang as string) || 'en';
  const data = await pawningTermsService.getFlat(lang);
  res.json({ status: 'success', data });
}

export async function create(req: Request, res: Response) {
  try {
    const { groupId, sortOrder, en, si, ta } = req.body;
    if (!en) {
      res.status(400).json({ status: 'error', message: 'English text (en) is required' });
      return;
    }
    const data = await pawningTermsService.create({ groupId, sortOrder, en, si, ta });
    res.status(201).json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function update(req: Request, res: Response) {
  try {
    const groupId = parseInt(req.params.groupId as string);
    const { en, si, ta, sortOrder } = req.body;
    const data = await pawningTermsService.update(groupId, { en, si, ta, sortOrder });
    res.json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}

export async function remove(req: Request, res: Response) {
  const groupId = parseInt(req.params.groupId as string);
  const data = await pawningTermsService.delete(groupId);
  res.json({ status: 'success', data });
}