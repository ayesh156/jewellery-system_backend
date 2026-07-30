import type { Request, Response } from 'express';
import { companyService } from '../services/company.service.js';
import { handleZodError } from '../utils/asyncHandler.js';
import { updateCompanySchema } from '../validators/company.js';

export async function get(_req: Request, res: Response) {
  const data = await companyService.get();
  res.json({ status: 'success', data });
}

export async function update(req: Request, res: Response) {
  try {
    const input = updateCompanySchema.parse(req.body);
    const data = await companyService.update(input);
    res.json({ status: 'success', data });
  } catch (err) {
    if (handleZodError(err, res)) return;
    throw err;
  }
}