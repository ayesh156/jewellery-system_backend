import { Router } from 'express';
import { eq, like, or, sql, asc, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { clearances, clearanceItems, clearancePayments, customers } from '../db/schema.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// ==========================================
// Validation Schemas
// ==========================================

const clearanceItemSchema = z.object({
  id: z.string().min(1).max(50),
  productId: z.string().max(50).nullish(),
  sku: z.string().max(50).nullish(),
  productName: z.string().min(1).max(200),
  description: z.string().nullish(),
  metalType: z.enum(['gold', 'silver', 'platinum', 'palladium', 'white-gold', 'rose-gold']).nullish(),
  karat: z.enum(['24K', '22K', '21K', '18K', '14K', '10K', '9K']).nullish(),
  metalWeight: z.string().nullish(),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.string(),
  originalPrice: z.string().nullish(),
  assessedValue: z.string().nullish(), // jeweller's appraised value for pawning
  discount: z.string().nullish(),
  discountType: z.string().max(20).nullish(),
  total: z.string(),
});

const createClearanceSchema = z.object({
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
  paymentMethod: z.enum(['cash', 'card', 'bank-transfer', 'cheque', 'credit', 'upi', 'other']).nullish(),
  issueDate: z.string().max(10),
  dueDate: z.string().max(10).nullish(),
  status: z.enum(['draft', 'pending', 'paid', 'partial', 'cancelled', 'refunded']).default('draft'),
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

const paymentSchema = z.object({
  id: z.string().min(1).max(50),
  amount: z.string(),
  method: z.enum(['cash', 'card', 'bank-transfer', 'cheque', 'credit', 'upi', 'other']),
  date: z.string().max(10),
  reference: z.string().max(100).nullish(),
  notes: z.string().nullish(),
});

// ==========================================
// GET /api/clearance — List with search, filter, pagination
// ==========================================

router.get('/', async (req, res, next) => {
  try {
    const {
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '20',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (search) {
      conditions.push(
        or(
          like(clearances.clearanceNumber, `%${search}%`),
          like(clearances.customerName, `%${search}%`),
        )
      );
    }
    if (status) conditions.push(eq(clearances.status, status as any));

    const where = conditions.length > 0
      ? sql`${sql.join(conditions, sql` AND `)}`
      : undefined;

    const sortColumn = clearances[sortBy as keyof typeof clearances] || clearances.createdAt;
    const orderBy = sortOrder === 'desc' ? desc(sortColumn as any) : asc(sortColumn as any);

    const [allClearances, [{ count }]] = await Promise.all([
      db.select().from(clearances).where(where).orderBy(orderBy).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(clearances).where(where),
    ]);

    // Fetch items for each clearance
    const clearanceIds = allClearances.map(c => c.id);
    const allItems = clearanceIds.length > 0
      ? await db.select().from(clearanceItems)
          .where(sql`${clearanceItems.clearanceId} IN ${clearanceIds}`)
      : [];

    const itemsByClearance = new Map<string, typeof allItems>();
    for (const item of allItems) {
      const existing = itemsByClearance.get(item.clearanceId) || [];
      existing.push(item);
      itemsByClearance.set(item.clearanceId, existing);
    }

    // Fetch latest customer data for all clearances
    const customerIds = [...new Set(allClearances.map(c => c.customerId))];
    const allCustomers = customerIds.length > 0
      ? await db.select().from(customers).where(sql`${customers.id} IN ${customerIds}`)
      : [];
    const customerMap = new Map(allCustomers.map(c => [c.id, c]));

    res.json({
      status: 'success',
      data: allClearances.map(c => {
        const cust = customerMap.get(c.customerId);
        return {
          ...c,
          // Override with latest customer data
          ...(cust ? {
            customerName: cust.name,
            customerPhone: cust.phone,
            customerAddress: cust.address ? `${cust.address}${cust.city ? ', ' + cust.city : ''}` : c.customerAddress,
            customerNic: cust.nic || c.customerNic,
          } : {}),
          items: itemsByClearance.get(c.id) || [],
        };
      }),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// GET /api/clearance/:id — Get clearance with items & payments
// ==========================================

router.get('/:id', async (req, res, next) => {
  try {
    const [clearance] = await db.select().from(clearances).where(eq(clearances.id, req.params.id));
    if (!clearance) throw new AppError(404, 'Clearance not found');

    const [items, clrPayments, [customer]] = await Promise.all([
      db.select().from(clearanceItems).where(eq(clearanceItems.clearanceId, req.params.id)),
      db.select().from(clearancePayments).where(eq(clearancePayments.clearanceId, req.params.id)),
      db.select().from(customers).where(eq(customers.id, clearance.customerId)),
    ]);

    res.json({
      status: 'success',
      data: {
        ...clearance,
        // Override with latest customer data
        ...(customer ? {
          customerName: customer.name,
          customerPhone: customer.phone,
          customerAddress: customer.address ? `${customer.address}${customer.city ? ', ' + customer.city : ''}` : clearance.customerAddress,
          customerNic: customer.nic || clearance.customerNic,
        } : {}),
        items,
        payments: clrPayments,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// POST /api/clearance — Create clearance with items
// ==========================================

router.post('/', async (req, res, next) => {
  try {
    const parsed = createClearanceSchema.parse(req.body);
    const { items, ...clearanceData } = parsed;

    // Verify customer exists
    const [customer] = await db.select().from(customers).where(eq(customers.id, parsed.customerId));
    if (!customer) throw new AppError(400, 'Customer not found');

    // Check for duplicate clearance number
    const [existing] = await db.select().from(clearances).where(eq(clearances.clearanceNumber, parsed.clearanceNumber));
    if (existing) throw new AppError(409, `Pawn ticket ${parsed.clearanceNumber} already exists. Please try again.`);

    // Insert clearance
    await db.insert(clearances).values({
      ...clearanceData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const [created] = await db.select().from(clearances).where(eq(clearances.id, clearanceData.id));

    // Insert items — use unique IDs to avoid collisions
    try {
      await db.insert(clearanceItems).values(
        items.map((item, idx) => ({
          ...item,
          id: `${created.id}-item-${idx + 1}`,
          clearanceId: created.id,
        }))
      );
    } catch (itemErr: any) {
      // If items insert fails, clean up the clearance to avoid orphan records
      console.error('Failed to insert clearance items, cleaning up:', itemErr?.message);
      await db.delete(clearances).where(eq(clearances.id, created.id));
      throw new AppError(500, 'Failed to save pawn ticket items. Please try again.');
    }

    // If there's a payment, record it
    if (parseFloat(parsed.amountPaid) > 0 && parsed.paymentMethod) {
      await db.insert(clearancePayments).values({
        id: `cpay-${created.id}-${Date.now()}`,
        clearanceId: created.id,
        amount: parsed.amountPaid,
        method: parsed.paymentMethod,
        date: parsed.issueDate,
        notes: 'Initial payment',
      });
    }

    const createdItems = await db.select().from(clearanceItems).where(eq(clearanceItems.clearanceId, created.id));

    res.status(201).json({
      status: 'success',
      data: { ...created, items: createdItems },
    });
  } catch (err) {
    console.error('POST /api/clearance error:', err);
    if (err instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Validation failed', errors: err.errors });
      return;
    }
    next(err);
  }
});

// ==========================================
// PUT /api/clearance/:id — Update clearance
// ==========================================

router.put('/:id', async (req, res, next) => {
  try {
    const parsed = createClearanceSchema.partial().omit({ id: true }).parse(req.body);
    const { items, ...clearanceData } = parsed;

    const result = await db
      .update(clearances)
      .set({ ...clearanceData, updatedAt: new Date() })
      .where(eq(clearances.id, req.params.id));

    if ((result as any)[0].affectedRows === 0) throw new AppError(404, 'Clearance not found');
    const [updated] = await db.select().from(clearances).where(eq(clearances.id, req.params.id));

    // Replace items if provided
    if (items) {
      await db.delete(clearanceItems).where(eq(clearanceItems.clearanceId, req.params.id));
      if (items.length) {
        await db.insert(clearanceItems).values(
          items.map(item => ({ ...item, clearanceId: req.params.id }))
        );
      }
    }

    const updatedItems = await db.select().from(clearanceItems).where(eq(clearanceItems.clearanceId, req.params.id));

    res.json({ status: 'success', data: { ...updated, items: updatedItems } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Validation failed', errors: err.errors });
      return;
    }
    next(err);
  }
});

// ==========================================
// POST /api/clearance/:id/payments — Record a payment
// ==========================================

router.post('/:id/payments', async (req, res, next) => {
  try {
    const parsed = paymentSchema.parse(req.body);

    const [clearance] = await db.select().from(clearances).where(eq(clearances.id, req.params.id));
    if (!clearance) throw new AppError(404, 'Clearance not found');

    // Insert payment
    await db.insert(clearancePayments).values({
      ...parsed,
      clearanceId: req.params.id,
      createdAt: new Date(),
    });
    const [payment] = await db.select().from(clearancePayments).where(eq(clearancePayments.clearanceId, req.params.id)).orderBy(desc(clearancePayments.createdAt)).limit(1);

    // Update clearance totals
    const newAmountPaid = parseFloat(clearance.amountPaid) + parseFloat(parsed.amount);
    const newBalanceDue = parseFloat(clearance.total) - newAmountPaid;
    const newStatus = newBalanceDue <= 0 ? 'paid' : 'partial';

    const updateResult = await db
      .update(clearances)
      .set({
        amountPaid: newAmountPaid.toFixed(2),
        balanceDue: Math.max(0, newBalanceDue).toFixed(2),
        status: newStatus,
        paymentMethod: parsed.method,
        updatedAt: new Date(),
      })
      .where(eq(clearances.id, req.params.id));
    if ((updateResult as any)[0].affectedRows === 0) throw new AppError(404, 'Clearance not found');

    const [updatedClearance] = await db.select().from(clearances).where(eq(clearances.id, req.params.id));

    res.status(201).json({
      status: 'success',
      data: { payment, clearance: updatedClearance },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Validation failed', errors: err.errors });
      return;
    }
    next(err);
  }
});

// ==========================================
// POST /api/clearance/:id/redeem — Redeem pawned items
// ==========================================

router.post('/:id/redeem', async (req, res, next) => {
  try {
    const parsed = z.object({
      redemptionDate: z.string().max(10),
      amountPaid: z.string(),
      paymentMethod: z.enum(['cash', 'card', 'bank-transfer', 'cheque', 'credit', 'upi', 'other']),
      reference: z.string().max(100).nullish(),
      notes: z.string().nullish(),
    }).parse(req.body);

    const [clearance] = await db.select().from(clearances).where(eq(clearances.id, req.params.id));
    if (!clearance) throw new AppError(404, 'Pawn ticket not found');

    // Record the payment
    await db.insert(clearancePayments).values({
      id: `cpay-redeem-${Date.now()}`,
      clearanceId: req.params.id,
      amount: parsed.amountPaid,
      method: parsed.paymentMethod,
      date: parsed.redemptionDate,
      reference: parsed.reference,
      notes: parsed.notes || 'Redemption payment',
      createdAt: new Date(),
    });

    // Update clearance as redeemed (paid)
    const totalPaid = parseFloat(clearance.amountPaid) + parseFloat(parsed.amountPaid);
    await db.update(clearances).set({
      status: 'paid',
      redemptionDate: parsed.redemptionDate,
      amountPaid: totalPaid.toFixed(2),
      balanceDue: '0',
      paymentMethod: parsed.paymentMethod,
      updatedAt: new Date(),
    }).where(eq(clearances.id, req.params.id));

    const [updated] = await db.select().from(clearances).where(eq(clearances.id, req.params.id));
    const items = await db.select().from(clearanceItems).where(eq(clearanceItems.clearanceId, req.params.id));

    res.json({ status: 'success', data: { ...updated, items } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Validation failed', errors: err.errors });
      return;
    }
    next(err);
  }
});

// ==========================================
// DELETE /api/clearance/:id — Delete clearance + items + payments
// =========================================

router.delete('/:id', async (req, res, next) => {
  try {
    const [clearance] = await db.select().from(clearances).where(eq(clearances.id, req.params.id));
    if (!clearance) throw new AppError(404, 'Clearance not found');
    await db.delete(clearancePayments).where(eq(clearancePayments.clearanceId, req.params.id));
    await db.delete(clearanceItems).where(eq(clearanceItems.clearanceId, req.params.id));
    await db.delete(clearances).where(eq(clearances.id, req.params.id));
    res.json({ status: 'success', data: clearance });
  } catch (err) {
    next(err);
  }
});

export default router;
