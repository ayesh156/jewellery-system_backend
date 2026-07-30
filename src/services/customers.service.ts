import { eq, like, or, sql, asc, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { customers, invoices, clearances } from '../db/schema.js';
import { AppError } from '../middleware/errorHandler.js';
import { MAX_PAGE_SIZE } from '../config/constants.js';
import type { CreateCustomerInput, UpdateCustomerInput } from '../validators/customers.js';

export class CustomersService {
  async findAll(query: Record<string, string>) {
    const {
      search,
      customerType,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc',
      page = '1',
      limit = '50',
    } = query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limit) || 50));
    const offset = (pageNum - 1) * limitNum;

    const conditions: ReturnType<typeof sql>[] = [];
    if (search) {
      conditions.push(
        or(like(customers.name, `%${search}%`), like(customers.phone, `%${search}%`)) as any,
      );
    }
    if (customerType) conditions.push(eq(customers.customerType, customerType as any) as any);
    if (isActive !== undefined)
      conditions.push(eq(customers.isActive, isActive === 'true') as any);

    const where =
      conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

    const sortColumn = (customers as any)[sortBy] || customers.name;
    const orderByClause = sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn);

    const [allCustomers, [{ count }]] = await Promise.all([
      db
        .select()
        .from(customers)
        .where(where)
        .orderBy(orderByClause)
        .limit(limitNum)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(customers)
        .where(where),
    ]);

    return {
      data: allCustomers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limitNum),
      },
    };
  }

  async findById(id: string) {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id));
    if (!customer) throw new AppError(404, 'Customer not found');
    return customer;
  }

  async create(input: CreateCustomerInput) {
    await db.insert(customers).values({
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return this.findById(input.id);
  }

  async update(id: string, input: UpdateCustomerInput) {
    const result = await db
      .update(customers)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(customers.id, id));
    if ((result as any)[0].affectedRows === 0) throw new AppError(404, 'Customer not found');

    // Cascade customer detail changes to clearances & invoices
    const syncFields: Record<string, any> = {};
    if (input.name !== undefined) syncFields.customerName = input.name;
    if (input.phone !== undefined) syncFields.customerPhone = input.phone;
    if (input.address !== undefined) syncFields.customerAddress = input.address;

    const syncFieldsClearance: Record<string, any> = { ...syncFields };
    if (input.nic !== undefined) syncFieldsClearance.customerNic = input.nic;

    if (Object.keys(syncFields).length > 0) {
      await db.update(invoices).set(syncFields).where(eq(invoices.customerId, id));
    }
    if (Object.keys(syncFieldsClearance).length > 0) {
      await db.update(clearances).set(syncFieldsClearance).where(eq(clearances.customerId, id));
    }

    return this.findById(id);
  }

  async delete(id: string) {
    const customer = await this.findById(id);
    await db.delete(customers).where(eq(customers.id, id));
    return customer;
  }
}

export const customersService = new CustomersService();