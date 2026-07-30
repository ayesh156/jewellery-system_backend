import { eq, like, or, sql, asc, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { invoices, invoiceItems, payments, customers } from '../db/schema.js';
import { AppError } from '../middleware/errorHandler.js';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../config/constants.js';
import type { CreateInvoiceInput, PaymentInput } from '../validators/invoices.js';

export class InvoicesService {
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
          like(invoices.invoiceNumber, `%${search}%`),
          like(invoices.customerName, `%${search}%`),
        ) as any,
      );
    }
    if (status) conditions.push(eq(invoices.status, status as any) as any);

    const where =
      conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

    const sortColumn = (invoices as any)[sortBy] || invoices.createdAt;
    const orderByClause = sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn);

    const [allInvoices, [{ count }]] = await Promise.all([
      db
        .select()
        .from(invoices)
        .where(where)
        .orderBy(orderByClause)
        .limit(limitNum)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(invoices)
        .where(where),
    ]);

    const invoiceIds = allInvoices.map((inv) => inv.id);
    const allItems =
      invoiceIds.length > 0
        ? await db
            .select()
            .from(invoiceItems)
            .where(sql`${invoiceItems.invoiceId} IN ${invoiceIds}`)
        : [];

    const itemsByInvoice = new Map<string, typeof allItems>();
    for (const item of allItems) {
      const existing = itemsByInvoice.get(item.invoiceId) || [];
      existing.push(item);
      itemsByInvoice.set(item.invoiceId, existing);
    }

    const customerIds = [...new Set(allInvoices.map((inv) => inv.customerId))];
    const allCustomers =
      customerIds.length > 0
        ? await db
            .select()
            .from(customers)
            .where(sql`${customers.id} IN ${customerIds}`)
        : [];
    const customerMap = new Map(allCustomers.map((c) => [c.id, c]));

    return {
      data: allInvoices.map((inv) => {
        const cust = customerMap.get(inv.customerId);
        return {
          ...inv,
          ...(cust
            ? {
                customerName: cust.name,
                customerPhone: cust.phone,
                customerAddress: cust.address
                  ? `${cust.address}${cust.city ? ', ' + cust.city : ''}`
                  : inv.customerAddress,
              }
            : {}),
          items: itemsByInvoice.get(inv.id) || [],
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
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id));
    if (!invoice) throw new AppError(404, 'Invoice not found');

    const [items, invoicePayments, [customer]] = await Promise.all([
      db
        .select()
        .from(invoiceItems)
        .where(eq(invoiceItems.invoiceId, id)),
      db
        .select()
        .from(payments)
        .where(eq(payments.invoiceId, id)),
      db
        .select()
        .from(customers)
        .where(eq(customers.id, invoice.customerId)),
    ]);

    return {
      ...invoice,
      ...(customer
        ? {
            customerName: customer.name,
            customerPhone: customer.phone,
            customerAddress: customer.address
              ? `${customer.address}${customer.city ? ', ' + customer.city : ''}`
              : invoice.customerAddress,
          }
        : {}),
      items,
      payments: invoicePayments,
    };
  }

  async create(input: CreateInvoiceInput) {
    const { items, ...invoiceData } = input;

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, input.customerId));
    if (!customer) throw new AppError(400, 'Customer not found');

    await db.insert(invoices).values({
      ...invoiceData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const [created] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceData.id));

    await db
      .insert(invoiceItems)
      .values(items.map((item) => ({ ...item, invoiceId: created.id })));

    if (parseFloat(input.amountPaid) > 0 && input.paymentMethod) {
      await db.insert(payments).values({
        id: `pay-${Date.now()}`,
        invoiceId: created.id,
        amount: input.amountPaid,
        method: input.paymentMethod,
        date: input.issueDate,
        notes: 'Initial payment',
      });
    }

    const createdItems = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, created.id));

    return { ...created, items: createdItems };
  }

  async update(id: string, input: Partial<CreateInvoiceInput>) {
    const { items, ...invoiceData } = input;

    const result = await db
      .update(invoices)
      .set({ ...invoiceData, updatedAt: new Date() })
      .where(eq(invoices.id, id));
    if ((result as any)[0].affectedRows === 0) throw new AppError(404, 'Invoice not found');

    const [updated] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id));

    if (items) {
      await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
      if (items.length) {
        await db
          .insert(invoiceItems)
          .values(items.map((item) => ({ ...item, invoiceId: id })));
      }
    }

    const updatedItems = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id));

    return { ...updated, items: updatedItems };
  }

  async addPayment(id: string, input: PaymentInput) {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id));
    if (!invoice) throw new AppError(404, 'Invoice not found');

    await db.insert(payments).values({
      ...input,
      invoiceId: id,
      createdAt: new Date(),
    });

    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.invoiceId, id))
      .orderBy(desc(payments.createdAt))
      .limit(1);

    const newAmountPaid = parseFloat(invoice.amountPaid) + parseFloat(input.amount);
    const newBalanceDue = parseFloat(invoice.total) - newAmountPaid;
    const newStatus = newBalanceDue <= 0 ? 'paid' : 'partial';

    const updateResult = await db
      .update(invoices)
      .set({
        amountPaid: newAmountPaid.toFixed(2),
        balanceDue: Math.max(0, newBalanceDue).toFixed(2),
        status: newStatus,
        paymentMethod: input.method,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id));
    if ((updateResult as any)[0].affectedRows === 0)
      throw new AppError(404, 'Invoice not found');

    const [updatedInvoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id));

    return { payment, invoice: updatedInvoice };
  }

  async delete(id: string) {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id));
    if (!invoice) throw new AppError(404, 'Invoice not found');

    await db.delete(payments).where(eq(payments.invoiceId, id));
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    await db.delete(invoices).where(eq(invoices.id, id));

    return invoice;
  }
}

export const invoicesService = new InvoicesService();