import { z } from 'zod';

export const updateCompanySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  tagline: z.string().max(300).optional(),
  logo: z.string().optional(),
  address: z.string().min(1).max(300).optional(),
  city: z.string().min(1).max(100).optional(),
  country: z.string().min(1).max(100).optional(),
  phone: z.string().min(1).max(20).optional(),
  phone2: z.string().max(20).optional(),
  email: z.string().email().max(200).optional(),
  website: z.string().max(200).optional(),
  registrationNumber: z.string().max(50).optional(),
  taxNumber: z.string().max(50).optional(),
  defaultTaxRate: z.string().max(10).optional(),
  currency: z.string().max(10).optional(),
  invoiceTerms: z.string().max(2000).optional().nullable(),
  clearanceTerms: z.string().max(2000).optional().nullable(),
  pawnTerms: z.string().max(2000).optional().nullable(),
  pawnInterestRate: z.string().max(10).optional(),
  pawnInterestEnabled: z.boolean().optional(),
});

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;