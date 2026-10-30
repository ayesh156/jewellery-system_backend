import { z } from 'zod';

export const updateCompanySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  tagline: z.string().max(300).nullish(),
  logo: z.string().nullish(),
  address: z.string().min(1).max(300).optional(),
  city: z.string().min(1).max(100).optional(),
  country: z.string().min(1).max(100).optional(),
  phone: z.string().min(1).max(20).optional(),
  phone2: z.string().max(20).nullish(),
  email: z.string().email().max(200).optional(),
  website: z.string().max(200).nullish(),
  registrationNumber: z.string().max(50).nullish(),
  taxNumber: z.string().max(50).nullish(),
  defaultTaxRate: z.string().max(10).nullish(),
  currency: z.string().max(10).nullish(),
  invoiceTerms: z.string().max(2000).nullish(),
  clearanceTerms: z.string().max(2000).nullish(),
  pawnTerms: z.string().max(2000).nullish(),
  pawnInterestRate: z.string().max(10).nullish(),
  pawnInterestEnabled: z.boolean().optional(),
});

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;