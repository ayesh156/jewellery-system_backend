import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { companyInfo } from '../db/schema.js';
import { AppError } from '../middleware/errorHandler.js';
import type { UpdateCompanyInput } from '../validators/company.js';

export class CompanyService {
  async get() {
    const [company] = await db
      .select()
      .from(companyInfo)
      .where(eq(companyInfo.id, 'default'));
    if (!company) throw new AppError(404, 'Company info not found');
    return company;
  }

  async update(input: UpdateCompanyInput) {
    const result = await db
      .update(companyInfo)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(companyInfo.id, 'default'));
    if ((result as any)[0].affectedRows === 0)
      throw new AppError(404, 'Company info not found');

    return this.get();
  }
}

export const companyService = new CompanyService();