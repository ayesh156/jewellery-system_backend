import { z } from 'zod';

export const createCustomerSchema = z.object({
  id: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  businessName: z.string().max(200).nullish(),
  email: z.string().max(200).nullish(),
  phone: z.string().min(1).max(20),
  phone2: z.string().max(20).nullish(),
  nic: z.string().max(20).nullish(),
  address: z.string().max(300).nullish(),
  city: z.string().max(100).nullish(),
  photo: z.string().nullish(),
  registrationDate: z.string().max(10),
  totalPurchased: z.string().default('0'),
  customerType: z.enum(['retail', 'wholesale', 'vip', 'credit']).default('retail'),
  isActive: z.boolean().default(true),
  creditLimit: z.string().nullish(),
  creditBalance: z.string().nullish(),
});

export const updateCustomerSchema = createCustomerSchema.partial().omit({ id: true });

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;