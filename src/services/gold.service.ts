import { z } from 'zod';
import { prisma } from '../lib/prisma.ts';
import { AppError } from '../middleware/errorHandler.ts';

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

function toKaratString(k: string | null | undefined): string | null {
  if (!k) return null;
  return k.replace(/^K(\d+)$/, '$1K');
}

function toPrismaKarat(k: string | null | undefined): any {
  if (!k) return undefined;
  if (k.startsWith('K')) return k;
  return `K${k.replace('K', '')}`;
}

function formatGoldRate(r: any) {
  if (!r) return null;
  return {
    id: r.id,
    karat: toKaratString(r.gold_karat),
    buyingRate: r.buying_rate,
    sellingRate: r.selling_rate,
    date: r.date,
    updatedBy: r.updated_by,
  };
}

function formatGoldType(t: any) {
  if (!t) return null;
  return {
    id: t.id,
    karat: toKaratString(t.gold_karat),
    purityPercentage: t.purity_percentage,
    description: t.description,
    isActive: t.is_active,
    defaultWastagePercentage: t.default_wastage_percentage,
    color: t.color,
  };
}

export class GoldService {
  // Gold Rates
  async getRates() {
    const rates = await prisma.gold_rates.findMany();
    return rates.map(formatGoldRate);
  }

  async updateRate(id: string, input: z.infer<typeof updateRateSchema>) {
    const existing = await prisma.gold_rates.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'Gold rate not found');

    const updateData: any = {};
    if (input.buyingRate !== undefined) updateData.buying_rate = input.buyingRate as any;
    if (input.sellingRate !== undefined) updateData.selling_rate = input.sellingRate as any;
    if (input.date !== undefined) updateData.date = input.date;
    if (input.updatedBy !== undefined) updateData.updated_by = input.updatedBy;

    const updated = await prisma.gold_rates.update({
      where: { id },
      data: updateData,
    });
    return formatGoldRate(updated);
  }

  // Gold Type Configs
  async getTypes() {
    const types = await prisma.gold_type_configs.findMany();
    return types.map(formatGoldType);
  }

  async createType(input: z.infer<typeof createGoldTypeSchema>) {
    const created = await prisma.gold_type_configs.create({
      data: {
        id: input.id,
        gold_karat: toPrismaKarat(input.karat),
        purity_percentage: input.purityPercentage as any,
        description: input.description,
        is_active: input.isActive !== undefined ? input.isActive : true,
        default_wastage_percentage: input.defaultWastagePercentage as any,
        color: input.color,
      },
    });
    return formatGoldType(created);
  }

  async updateType(id: string, input: z.infer<typeof updateGoldTypeSchema>) {
    const existing = await prisma.gold_type_configs.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'Gold type config not found');

    const updateData: any = {};
    if (input.purityPercentage !== undefined) updateData.purity_percentage = input.purityPercentage as any;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;
    if (input.defaultWastagePercentage !== undefined) updateData.default_wastage_percentage = input.defaultWastagePercentage as any;
    if (input.color !== undefined) updateData.color = input.color;

    const updated = await prisma.gold_type_configs.update({
      where: { id },
      data: updateData,
    });
    return formatGoldType(updated);
  }

  async deleteType(id: string) {
    const existing = await prisma.gold_type_configs.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'Gold type config not found');

    await prisma.gold_type_configs.delete({ where: { id } });
    return formatGoldType(existing);
  }
}

export const goldService = new GoldService();
