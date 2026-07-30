import { z } from 'zod';

export const clearanceItemSchema = z.object({
  id: z.string().min(1).max(50),
  productId: z.string().max(50).nullish(),
  sku: z.string().max(50).nullish(),
  productName: z.string().min(1).max(200),
  description: z.string().nullish(),
  metalType: z
    .enum(['gold', 'silver', 'platinum', 'palladium', 'white-gold', 'rose-gold'])
    .nullish(),
  karat: z.enum(['24K', '22K', '21K', '18K', '14K', '10K', '9K']).nullish(),
  metalWeight: z.string().nullish(),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.string(),
  originalPrice: z.string().nullish(),
  assessedValue: z.string().nullish(),
  discount: z.string().nullish(),
  discountType: z.string().max(20).nullish(),
  total: z.string(),
});

export const createClearanceSchema = z.object({
  id: z.string().min(1).max(50),
  clearanceNumber: z.string().min(1).max(50),
  customerId: z.string().min(1).max(50),
  customerName: z.string().min(1).max(200),
  customerPhone: z.string().max(20).nullish(),
  customerAddress: z.string().max(300).nullish(),
  items: z.array(clearanceItemSchema).min(1),
  subtotal: z.string(),
  discount: z.string().default('0'),
  discountType: z.string().max(20).nullish(),
  tax: z.string().default('0'),
  taxRate: z.string().nullish(),
  total: z.string(),
  amountPaid: z.string().default('0'),
  balanceDue: z.string().default('0'),
  paymentMethod: z
    .enum(['cash', 'card', 'bank-transfer', 'cheque', 'credit', 'upi', 'other'])
    .nullish(),
  issueDate: z.string().max(10),
  dueDate: z.string().max(10).nullish(),
  status: z
    .enum(['draft', 'pending', 'paid', 'partial', 'cancelled', 'refunded'])
    .default('draft'),
  clearanceReason: z.string().nullish(),
  monthlyInterestRate: z.string().nullish(),
  interestEnabled: z.boolean().default(true),
  pawnDate: z.string().max(10).nullish(),
  redemptionDate: z.string().max(10).nullish(),
  customerNic: z.string().max(20).nullish(),
  notes: z.string().nullish(),
  createdBy: z.string().max(100).nullish(),
  createdByUserId: z.string().max(50).nullish(),
});

export const clearancePaymentSchema = z.object({
  id: z.string().min(1).max(50),
  amount: z.string(),
  method: z.enum(['cash', 'card', 'bank-transfer', 'cheque', 'credit', 'upi', 'other']),
  date: z.string().max(10),
  reference: z.string().max(100).nullish(),
  notes: z.string().nullish(),
});

export const redeemSchema = z.object({
  redemptionDate: z.string().max(10),
  amountPaid: z.string(),
  paymentMethod: z.enum(['cash', 'card', 'bank-transfer', 'cheque', 'credit', 'upi', 'other']),
  reference: z.string().max(100).nullish(),
  notes: z.string().nullish(),
});

export type CreateClearanceInput = z.infer<typeof createClearanceSchema>;
export type ClearancePaymentInput = z.infer<typeof clearancePaymentSchema>;
export type RedeemInput = z.infer<typeof redeemSchema>;