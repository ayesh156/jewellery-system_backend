import { z } from 'zod';

export const createUserSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9_]+$/, 'Username must be lowercase letters, numbers, or underscores'),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1).max(200),
  phone: z.string().max(20).optional(),
  role: z.enum(['admin', 'manager', 'sales', 'accountant']).default('sales'),
  shopCode: z.string().min(1).max(10).toUpperCase().default('A'),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  fullName: z.string().min(1).max(200).optional(),
  phone: z.string().max(20).optional(),
  role: z.enum(['admin', 'manager', 'sales', 'accountant']).optional(),
  shopCode: z.string().min(1).max(10).toUpperCase().optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
  pawnBillFormat: z.enum(['A4', '80mm']).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;