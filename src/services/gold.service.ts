import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { goldRates, goldTypeConfigs } from '../db/schema.js';
import { AppError } from '../middleware/errorHandler.js';

const createGoldTypeSchema = z.object({
  id: z.string().min(1).max(50),
  karat: z.enum(['24K', '22K', '21K', '18K', '14K', '10K', '9K']),
  purityPercentage: z.string(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  defaultWastagePercentage: z.string(),
  color: z.string().max(20).optional(),
});

const updateGoldTypeSchema = createGoldTypeSchema.partial().omit({ id: true, karat: true });

const updateRateSchema = z.object({
  buyingRate: z.string(),
  sellingRate: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  updatedBy: z.string().optional(),
});

export class GoldService {
  // Gold Rates
  async getRates() {
    return db.select().from(goldRates);
  }

  async updateRate(id: string, input: z.infer<typeof updateRateSchema>) {
    const result = await db
      .update(goldRates)
      .set(input)
      .where(eq(goldRates.id, id));
    if ((result as any)[0].affectedRows === 0) throw new AppError(404, 'Gold rate not found');

    const [updated] = await db
      .select()
      .from(goldRates)
      .where(eq(goldRates.id, id));
    return updated;
  }

  // Gold Type Configs
  async getTypes() {
    return db.select().from(goldTypeConfigs);
  }

  async createType(input: z.infer<typeof createGoldTypeSchema>) {
    await db.insert(goldTypeConfigs).values(input);
    return input;
  }

  async updateType(id: string, input: z.infer<typeof updateGoldTypeSchema>) {
    const result = await db
      .update(goldTypeConfigs)
      .set(input)
      .where(eq(goldTypeConfigs.id, id));
    if ((result as any)[0].affectedRows === 0)
      throw new AppError(404, 'Gold type config not found');

    const [updated] = await db
      .select()
      .from(goldTypeConfigs)
      .where(eq(goldTypeConfigs.id, id));
    return updated;
  }

  async deleteType(id: string) {
    const [typeConfig] = await db
      .select()
      .from(goldTypeConfigs)
      .where(eq(goldTypeConfigs.id, id));
    if (!typeConfig) throw new AppError(404, 'Gold type config not found');
    await db.delete(goldTypeConfigs).where(eq(goldTypeConfigs.id, id));
    return typeConfig;
  }
}

export const goldService = new GoldService();