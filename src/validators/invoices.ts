import { z } from 'zod';

export const invoiceItemSchema = z.object({
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
  discount: z.string().nullish(),
  discountType: z.string().max(20).nullish(),
  total: z.string(),
});

export const createInvoiceSchema = z.object({
  id: z.string().min(1).max(50),
  invoiceNumber: z.string().min(1).max(50),
  customerId: z.string().min(1).max(50),
  customerName: z.string().min(1).max(200),
  customerPhone: z.string().max(20).nullish(),
  customerAddress: z.string().max(300).nullish(),
  items: z.array(invoiceItemSchema).min(1),
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
  notes: z.string().nullish(),
  createdBy: z.string().max(100).nullish(),
  createdByUserId: z.string().max(50).nullish(),
});

export const paymentSchema = z.object({
  id: z.string().min(1).max(50),
  amount: z.string(),
  method: z.enum(['cash', 'card', 'bank-transfer', 'cheque', 'credit', 'upi', 'other']),
  date: z.string().max(10),
  reference: z.string().max(100).nullish(),
  notes: z.string().nullish(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;