import { z } from 'zod';

export const gemstoneSchema = z.object({
  id: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  type: z.enum([
    'diamond', 'ruby', 'sapphire', 'emerald', 'pearl', 'topaz', 'amethyst', 'opal', 'other',
  ]),
  carat: z.string().optional(),
  clarity: z.string().max(50).optional(),
  cut: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
  origin: z.string().max(100).optional(),
  certified: z.boolean().default(false),
  certificateNumber: z.string().max(100).optional(),
});

export const createProductSchema = z.object({
  id: z.string().min(1).max(50),
  sku: z.string().min(1).max(50),
  barcode: z.string().max(100).nullish(),
  name: z.string().min(1).max(200),
  description: z.string().nullish(),
  categoryId: z.string().min(1).max(50),
  metalType: z.enum(['gold', 'silver', 'platinum', 'palladium', 'white-gold', 'rose-gold']),
  karat: z.enum(['24K', '22K', '21K', '18K', '14K', '10K', '9K']).nullish(),
  metalWeight: z.string(),
  metalPurity: z.string().nullish(),
  hasGemstones: z.boolean().default(false),
  totalGemstoneWeight: z.string().nullish(),
  metalRate: z.string(),
  makingCharges: z.string(),
  gemstoneValue: z.string().nullish(),
  otherCharges: z.string().nullish(),
  sellingPrice: z.string(),
  costPrice: z.string(),
  stockQuantity: z.number().int().min(0).default(0),
  reorderLevel: z.number().int().min(0).nullish(),
  images: z.array(z.string()).nullish(),
  supplierId: z.string().max(50).nullish(),
  supplierName: z.string().max(200).nullish(),
  isActive: z.boolean().default(true),
  gemstones: z.array(gemstoneSchema).nullish(),
});

export const updateProductSchema = createProductSchema.partial().omit({ id: true });

export const stockUpdateSchema = z.object({
  quantity: z.number().int().min(0),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type StockUpdateInput = z.infer<typeof stockUpdateSchema>;