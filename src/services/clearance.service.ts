import { eq, like, or, sql, asc, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { clearances, clearanceItems, clearancePayments, customers } from '../db/schema.js';
import { AppError } from '../middleware/errorHandler.js';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../config/constants.js';
import type {
  CreateClearanceInput,
  ClearancePaymentInput,
  RedeemInput,
} from '../validators/clearance.js';

export class ClearanceService {
  async findAll(query: Record<string, string>) {
    const {
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = String(DEFAULT_PAGE_SIZE),
    } = query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limit) || DEFAULT_PAGE_SIZE));
    const offset = (pageNum - 1) * limitNum;

    const conditions: ReturnType<typeof sql>[] = [];
    if (search) {
      conditions.push(
        or(
          like(clearances.clearanceNumber, `%${search}%`),
          like(clearances.customerName, `%${search}%`),
        ) as any,
      );
    }
    if (status) conditions.push(eq(clearances.status, status as any) as any);

    const where =
      conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

    const sortColumn = (clearances as any)[sortBy] || clearances.createdAt;
    const orderByClause = sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn);

    const [allClearances, [{ count }]] = await Promise.all([
      db
        .select()
        .from(clearances)
        .where(where)
        .orderBy(orderByClause)
        .limit(limitNum)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(clearances)
        .where(where),
    ]);

    const clearanceIds = allClearances.map((c) => c.id);
    const allItems =
      clearanceIds.length > 0
        ? await db
            .select()
            .from(clearanceItems)
            .where(sql`${clearanceItems.clearanceId} IN ${clearanceIds}`)
        : [];

    const itemsByClearance = new Map<string, typeof allItems>();
    for (const item of allItems) {
      const existing = itemsByClearance.get(item.clearanceId) || [];
      existing.push(item);
      itemsByClearance.set(item.clearanceId, existing);
    }

    const customerIds = [...new Set(allClearances.map((c) => c.customerId))];
    const allCustomers =
      customerIds.length > 0
        ? await db
            .select()
            .from(customers)
            .where(sql`${customers.id} IN ${customerIds}`)
        : [];
    const customerMap = new Map(allCustomers.map((c) => [c.id, c]));

    return {
      data: allClearances.map((c) => {
        const cust = customerMap.get(c.customerId);
        return {
          ...c,
          ...(cust
            ? {
                customerName: cust.name,
                customerPhone: cust.phone,
                customerAddress: cust.address
                  ? `${cust.address}${cust.city ? ', ' + cust.city : ''}`
                  : c.customerAddress,
                customerNic: cust.nic || c.customerNic,
              }
            : {}),
          items: itemsByClearance.get(c.id) || [],
        };
      }),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limitNum),
      },
    };
  }

  async findById(id: string) {
    const [clearance] = await db
      .select()
      .from(clearances)
      .where(eq(clearances.id, id));
    if (!clearance) throw new AppError(404, 'Clearance not found');

    const [items, clrPayments, [customer]] = await Promise.all([
      db
        .select()
        .from(clearanceItems)
        .where(eq(clearanceItems.clearanceId, id)),
      db
        .select()
        .from(clearancePayments)
        .where(eq(clearancePayments.clearanceId, id)),
      db
        .select()
        .from(customers)
        .where(eq(customers.id, clearance.customerId)),
    ]);

    return {
      ...clearance,
      ...(customer
        ? {
            customerName: customer.name,
            customerPhone: customer.phone,
            customerAddress: customer.address
              ? `${customer.address}${customer.city ? ', ' + customer.city : ''}`
              : clearance.customerAddress,
            customerNic: customer.nic || clearance.customerNic,
          }
        : {}),
      items,
      payments: clrPayments,
    };
  }

  async create(input: CreateClearanceInput) {
    const { items, ...clearanceData } = input;

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, input.customerId));
    if (!customer) throw new AppError(400, 'Customer not found');

    const [existing] = await db
      .select()
      .from(clearances)
      .where(eq(clearances.clearanceNumber, input.clearanceNumber));
    if (existing)
      throw new AppError(
        409,
        `Pawn ticket ${input.clearanceNumber} already exists. Please try again.`,
      );

    await db.insert(clearances).values({
      ...clearanceData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const [created] = await db
      .select()
      .from(clearances)
      .where(eq(clearances.id, clearanceData.id));

    try {
      await db.insert(clearanceItems).values(
        items.map((item, idx) => ({
          ...item,
          id: `${created.id}-item-${idx + 1}`,
          clearanceId: created.id,
        })),
      );
    } catch (itemErr: any) {
      await db.delete(clearances).where(eq(clearances.id, created.id));
      throw new AppError(500, 'Failed to save pawn ticket items. Please try again.');
    }

    if (parseFloat(input.amountPaid) > 0 && input.paymentMethod) {
      await db.insert(clearancePayments).values({
        id: `cpay-${created.id}-${Date.now()}`,
        clearanceId: created.id,
        amount: input.amountPaid,
        method: input.paymentMethod,
        date: input.issueDate,
        notes: 'Initial payment',
      });
    }

    const createdItems = await db
      .select()
      .from(clearanceItems)
      .where(eq(clearanceItems.clearanceId, created.id));

    return { ...created, items: createdItems };
  }

  async update(id: string, input: Partial<CreateClearanceInput>) {
    const { items, ...clearanceData } = input;

    const result = await db
      .update(clearances)
      .set({ ...clearanceData, updatedAt: new Date() })
      .where(eq(clearances.id, id));
    if ((result as any)[0].affectedRows === 0)
      throw new AppError(404, 'Clearance not found');

    const [updated] = await db
      .select()
      .from(clearances)
      .where(eq(clearances.id, id));

    if (items) {
      await db.delete(clearanceItems).where(eq(clearanceItems.clearanceId, id));
      if (items.length) {
        await db
          .insert(clearanceItems)
          .values(items.map((item) => ({ ...item, clearanceId: id })));
      }
    }

    const updatedItems = await db
      .select()
      .from(clearanceItems)
      .where(eq(clearanceItems.clearanceId, id));

    return { ...updated, items: updatedItems };
  }

  async addPayment(id: string, input: ClearancePaymentInput) {
    const [clearance] = await db
      .select()
      .from(clearances)
      .where(eq(clearances.id, id));
    if (!clearance) throw new AppError(404, 'Clearance not found');

    await db.insert(clearancePayments).values({
      ...input,
      clearanceId: id,
      createdAt: new Date(),
    });

    const [payment] = await db
      .select()
      .from(clearancePayments)
      .where(eq(clearancePayments.clearanceId, id))
      .orderBy(desc(clearancePayments.createdAt))
      .limit(1);

    const newAmountPaid = parseFloat(clearance.amountPaid) + parseFloat(input.amount);
    const newBalanceDue = parseFloat(clearance.total) - newAmountPaid;
    const newStatus = newBalanceDue <= 0 ? 'paid' : 'partial';

    await db
      .update(clearances)
      .set({
        amountPaid: newAmountPaid.toFixed(2),
        balanceDue: Math.max(0, newBalanceDue).toFixed(2),
        status: newStatus,
        paymentMethod: input.method,
        updatedAt: new Date(),
      })
      .where(eq(clearances.id, id));

    const [updatedClearance] = await db
      .select()
      .from(clearances)
      .where(eq(clearances.id, id));

    return { payment, clearance: updatedClearance };
  }

  async redeem(id: string, input: RedeemInput) {
    const [clearance] = await db
      .select()
      .from(clearances)
      .where(eq(clearances.id, id));
    if (!clearance) throw new AppError(404, 'Pawn ticket not found');

    await db.insert(clearancePayments).values({
      id: `cpay-redeem-${Date.now()}`,
      clearanceId: id,
      amount: input.amountPaid,
      method: input.paymentMethod,
      date: input.redemptionDate,
      reference: input.reference,
      notes: input.notes || 'Redemption payment',
      createdAt: new Date(),
    });

    const totalPaid = parseFloat(clearance.amountPaid) + parseFloat(input.amountPaid);
    await db
      .update(clearances)
      .set({
        status: 'paid',
        redemptionDate: input.redemptionDate,
        amountPaid: totalPaid.toFixed(2),
        balanceDue: '0',
        paymentMethod: input.paymentMethod,
        updatedAt: new Date(),
      })
      .where(eq(clearances.id, id));

    const [updated] = await db
      .select()
      .from(clearances)
      .where(eq(clearances.id, id));
    const items = await db
      .select()
      .from(clearanceItems)
      .where(eq(clearanceItems.clearanceId, id));

    return { ...updated, items };
  }

  async delete(id: string) {
    const [clearance] = await db
      .select()
      .from(clearances)
      .where(eq(clearances.id, id));
    if (!clearance) throw new AppError(404, 'Clearance not found');

    await db.delete(clearancePayments).where(eq(clearancePayments.clearanceId, id));
    await db.delete(clearanceItems).where(eq(clearanceItems.clearanceId, id));
    await db.delete(clearances).where(eq(clearances.id, id));

    return clearance;
  }
}

export const clearanceService = new ClearanceService();