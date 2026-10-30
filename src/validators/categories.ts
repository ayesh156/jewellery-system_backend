import { z } from 'zod';

export const createCategorySchema = z.object({
  id: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().max(1000).nullish(),
  parentId: z.string().max(50).nullish(),
  icon: z.string().max(100).nullish(),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial().omit({ id: true });

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;