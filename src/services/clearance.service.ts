import { prisma } from '../lib/prisma.ts';
import { AppError } from '../middleware/errorHandler.ts';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../config/constants.ts';
import type {
  CreateClearanceInput,
  ClearancePaymentInput,
  RedeemInput,
} from '../validators/clearance.ts';

function toKaratString(k: string | null | undefined): string | null {
  if (!k) return null;
  return k.replace(/^K(\d+)$/, '$1K');
}

function toPrismaKarat(k: string | null | undefined): any {
  if (!k) return undefined;
  if (k.startsWith('K')) return k;
  return `K${k.replace('K', '')}`;
}

function formatClearance(
  c: any,
  items: any[] = c?.clearance_items || [],
  paymentsList: any[] = c?.clearance_payments || []
) {
  if (!c) return null;
  const cust = c.customers;
  return {
    id: c.id,
    clearanceNumber: c.clearance_number,
    customerId: c.customer_id,
    customerName: cust?.name || c.customer_name,
    customerPhone: cust?.phone || c.customer_phone,
    customerAddress: cust?.address
      ? `${cust.address}${cust.city ? ', ' + cust.city : ''}`
      : c.customer_address,
    customerNic: cust?.nic || c.customer_nic,
    subtotal: c.subtotal,
    discount: c.discount,
    discountType: c.discount_type,
    tax: c.tax,
    taxRate: c.tax_rate,
    total: c.total,
    amountPaid: c.amount_paid,
    balanceDue: c.balance_due,
    paymentMethod: c.payment_method,
    issueDate: c.issue_date,
    dueDate: c.due_date,
    status: c.invoice_status,
    clearanceReason: c.clearance_reason,
    notes: c.notes,
    createdBy: c.created_by,
    createdByUserId: c.created_by_user_id,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    monthlyInterestRate: c.monthly_interest_rate,
    interestEnabled: c.interest_enabled,
    pawnDate: c.pawn_date,
    redemptionDate: c.redemption_date,
    items: items.map((item) => ({
      id: item.id,
      clearanceId: item.clearance_id,
      productId: item.product_id,
      sku: item.sku,
      productName: item.product_name,
      description: item.description,
      metalType: item.metal_type,
      karat: toKaratString(item.gold_karat),
      metalWeight: item.metal_weight,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      originalPrice: item.original_price,
      assessedValue: item.assessed_value,
      discount: item.discount,
      discountType: item.discount_type,
      total: item.total,
    })),
    payments: paymentsList.map((p) => ({
      id: p.id,
      clearanceId: p.clearance_id,
      amount: p.amount,
      method: p.payment_method,
      date: p.date,
      reference: p.reference,
      notes: p.notes,
      createdAt: p.created_at,
    })),
  };
}

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

    const where: any = {};
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { clearance_number: { contains: q } },
        { customer_name: { contains: q } },
      ];
    }
    if (status) {
      where.invoice_status = status as any;
    }

    const sortFieldMap: Record<string, string> = {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      clearanceNumber: 'clearance_number',
      customerName: 'customer_name',
      total: 'total',
      amountPaid: 'amount_paid',
      balanceDue: 'balance_due',
      issueDate: 'issue_date',
      dueDate: 'due_date',
    };
    const orderColumn = sortFieldMap[sortBy] || sortBy;
    const orderBy: any = {};
    orderBy[orderColumn] = sortOrder === 'desc' ? 'desc' : 'asc';

    const [allClearances, count] = await Promise.all([
      prisma.clearances.findMany({
        where,
        orderBy,
        take: limitNum,
        skip: offset,
        include: {
          clearance_items: true,
          clearance_payments: true,
          customers: true,
        },
      }),
      prisma.clearances.count({ where }),
    ]);

    return {
      data: allClearances.map((c) => formatClearance(c)),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
      },
    };
  }

  async findById(id: string) {
    const clearance = await prisma.clearances.findUnique({
      where: { id },
      include: {
        clearance_items: true,
        clearance_payments: true,
        customers: true,
      },
    });

    if (!clearance) throw new AppError(404, 'Clearance not found');

    return formatClearance(clearance);
  }

  async create(input: CreateClearanceInput) {
    const { items, ...clearanceData } = input;

    const customer = await prisma.customers.findUnique({
      where: { id: input.customerId },
    });
    if (!customer) throw new AppError(400, 'Customer not found');

    const existing = await prisma.clearances.findUnique({
      where: { clearance_number: input.clearanceNumber },
    });
    if (existing) {
      throw new AppError(
        409,
        `Pawn ticket ${input.clearanceNumber} already exists. Please try again.`,
      );
    }

    const created = await prisma.$transaction(async (tx) => {
      const clr = await tx.clearances.create({
        data: {
          id: clearanceData.id,
          clearance_number: clearanceData.clearanceNumber,
          customer_id: clearanceData.customerId,
          customer_name: clearanceData.customerName,
          customer_phone: clearanceData.customerPhone,
          customer_address: clearanceData.customerAddress,
          subtotal: clearanceData.subtotal as any,
          discount: (clearanceData.discount || '0') as any,
          discount_type: clearanceData.discountType,
          tax: (clearanceData.tax || '0') as any,
          tax_rate: clearanceData.taxRate ? (clearanceData.taxRate as any) : undefined,
          total: clearanceData.total as any,
          amount_paid: (clearanceData.amountPaid || '0') as any,
          balance_due: (clearanceData.balanceDue || '0') as any,
          payment_method: clearanceData.paymentMethod as any,
          issue_date: clearanceData.issueDate,
          due_date: clearanceData.dueDate,
          invoice_status: (clearanceData.status || 'draft') as any,
          clearance_reason: clearanceData.clearanceReason,
          notes: clearanceData.notes,
          monthly_interest_rate: clearanceData.monthlyInterestRate ? (clearanceData.monthlyInterestRate as any) : undefined,
          interest_enabled: clearanceData.interestEnabled !== undefined ? clearanceData.interestEnabled : true,
          pawn_date: clearanceData.pawnDate,
          redemption_date: clearanceData.redemptionDate,
          customer_nic: clearanceData.customerNic,
          created_by: clearanceData.createdBy,
          created_by_user_id: clearanceData.createdByUserId,
        },
      });

      if (items && items.length) {
        await tx.clearance_items.createMany({
          data: items.map((item, idx) => ({
            id: item.id || `${clr.id}-item-${idx + 1}`,
            clearance_id: clr.id,
            product_id: item.productId,
            sku: item.sku,
            product_name: item.productName,
            description: item.description,
            metal_type: item.metalType as any,
            gold_karat: toPrismaKarat(item.karat),
            metal_weight: item.metalWeight ? (item.metalWeight as any) : undefined,
            quantity: item.quantity,
            unit_price: item.unitPrice as any,
            original_price: item.originalPrice ? (item.originalPrice as any) : undefined,
            assessed_value: item.assessedValue ? (item.assessedValue as any) : undefined,
            discount: item.discount ? (item.discount as any) : undefined,
            discount_type: item.discountType,
            total: item.total as any,
          })),
        });
      }

      if (parseFloat(input.amountPaid) > 0 && input.paymentMethod) {
        await tx.clearance_payments.create({
          data: {
            id: `cpay-${clr.id}-${Date.now()}`,
            clearance_id: clr.id,
            amount: input.amountPaid as any,
            payment_method: input.paymentMethod as any,
            date: input.issueDate,
            notes: 'Initial payment',
          },
        });
      }

      return tx.clearances.findUnique({
        where: { id: clr.id },
        include: {
          clearance_items: true,
          clearance_payments: true,
          customers: true,
        },
      });
    });

    return formatClearance(created!);
  }

  async update(id: string, input: Partial<CreateClearanceInput>) {
    const { items, ...clearanceData } = input;

    const existing = await prisma.clearances.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'Clearance not found');

    const updated = await prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (clearanceData.clearanceNumber !== undefined) updateData.clearance_number = clearanceData.clearanceNumber;
      if (clearanceData.customerId !== undefined) updateData.customer_id = clearanceData.customerId;
      if (clearanceData.customerName !== undefined) updateData.customer_name = clearanceData.customerName;
      if (clearanceData.customerPhone !== undefined) updateData.customer_phone = clearanceData.customerPhone;
      if (clearanceData.customerAddress !== undefined) updateData.customer_address = clearanceData.customerAddress;
      if (clearanceData.subtotal !== undefined) updateData.subtotal = clearanceData.subtotal as any;
      if (clearanceData.discount !== undefined) updateData.discount = clearanceData.discount as any;
      if (clearanceData.discountType !== undefined) updateData.discount_type = clearanceData.discountType;
      if (clearanceData.tax !== undefined) updateData.tax = clearanceData.tax as any;
      if (clearanceData.taxRate !== undefined) updateData.tax_rate = clearanceData.taxRate as any;
      if (clearanceData.total !== undefined) updateData.total = clearanceData.total as any;
      if (clearanceData.amountPaid !== undefined) updateData.amount_paid = clearanceData.amountPaid as any;
      if (clearanceData.balanceDue !== undefined) updateData.balance_due = clearanceData.balanceDue as any;
      if (clearanceData.paymentMethod !== undefined) updateData.payment_method = clearanceData.paymentMethod as any;
      if (clearanceData.issueDate !== undefined) updateData.issue_date = clearanceData.issueDate;
      if (clearanceData.dueDate !== undefined) updateData.due_date = clearanceData.dueDate;
      if (clearanceData.status !== undefined) updateData.invoice_status = clearanceData.status as any;
      if (clearanceData.clearanceReason !== undefined) updateData.clearance_reason = clearanceData.clearanceReason;
      if (clearanceData.notes !== undefined) updateData.notes = clearanceData.notes;
      if (clearanceData.monthlyInterestRate !== undefined) updateData.monthly_interest_rate = clearanceData.monthlyInterestRate as any;
      if (clearanceData.interestEnabled !== undefined) updateData.interest_enabled = clearanceData.interestEnabled;
      if (clearanceData.pawnDate !== undefined) updateData.pawn_date = clearanceData.pawnDate;
      if (clearanceData.redemptionDate !== undefined) updateData.redemption_date = clearanceData.redemptionDate;
      if (clearanceData.customerNic !== undefined) updateData.customer_nic = clearanceData.customerNic;

      await tx.clearances.update({
        where: { id },
        data: updateData,
      });

      if (items) {
        await tx.clearance_items.deleteMany({ where: { clearance_id: id } });
        if (items.length) {
          await tx.clearance_items.createMany({
            data: items.map((item, idx) => ({
              id: item.id || `${id}-item-${idx + 1}`,
              clearance_id: id,
              product_id: item.productId,
              sku: item.sku,
              product_name: item.productName,
              description: item.description,
              metal_type: item.metalType as any,
              gold_karat: toPrismaKarat(item.karat),
              metal_weight: item.metalWeight ? (item.metalWeight as any) : undefined,
              quantity: item.quantity,
              unit_price: item.unitPrice as any,
              original_price: item.originalPrice ? (item.originalPrice as any) : undefined,
              assessed_value: item.assessedValue ? (item.assessedValue as any) : undefined,
              discount: item.discount ? (item.discount as any) : undefined,
              discount_type: item.discountType,
              total: item.total as any,
            })),
          });
        }
      }

      return tx.clearances.findUnique({
        where: { id },
        include: {
          clearance_items: true,
          clearance_payments: true,
          customers: true,
        },
      });
    });

    return formatClearance(updated!);
  }

  async addPayment(id: string, input: ClearancePaymentInput) {
    const clearance = await prisma.clearances.findUnique({ where: { id } });
    if (!clearance) throw new AppError(404, 'Clearance not found');

    const payment = await prisma.clearance_payments.create({
      data: {
        id: input.id || `cpay-${id}-${Date.now()}`,
        clearance_id: id,
        amount: input.amount as any,
        payment_method: input.method as any,
        date: input.date,
        reference: input.reference,
        notes: input.notes,
      },
    });

    const newAmountPaid = parseFloat(String(clearance.amount_paid)) + parseFloat(input.amount);
    const newBalanceDue = parseFloat(String(clearance.total)) - newAmountPaid;
    const newStatus = newBalanceDue <= 0 ? 'paid' : 'partial';

    const updatedClearance = await prisma.clearances.update({
      where: { id },
      data: {
        amount_paid: newAmountPaid.toFixed(2) as any,
        balance_due: Math.max(0, newBalanceDue).toFixed(2) as any,
        invoice_status: newStatus as any,
        payment_method: input.method as any,
      },
      include: {
        clearance_items: true,
        clearance_payments: true,
        customers: true,
      },
    });

    return {
      payment: {
        id: payment.id,
        clearanceId: payment.clearance_id,
        amount: payment.amount,
        method: payment.payment_method,
        date: payment.date,
        reference: payment.reference,
        notes: payment.notes,
        createdAt: payment.created_at,
      },
      clearance: formatClearance(updatedClearance),
    };
  }

  async redeem(id: string, input: RedeemInput) {
    const clearance = await prisma.clearances.findUnique({ where: { id } });
    if (!clearance) throw new AppError(404, 'Pawn ticket not found');

    await prisma.clearance_payments.create({
      data: {
        id: `cpay-redeem-${Date.now()}`,
        clearance_id: id,
        amount: input.amountPaid as any,
        payment_method: input.paymentMethod as any,
        date: input.redemptionDate,
        reference: input.reference,
        notes: input.notes || 'Redemption payment',
      },
    });

    const totalPaid = parseFloat(String(clearance.amount_paid)) + parseFloat(input.amountPaid);
    const updated = await prisma.clearances.update({
      where: { id },
      data: {
        invoice_status: 'paid',
        redemption_date: input.redemptionDate,
        amount_paid: totalPaid.toFixed(2) as any,
        balance_due: '0' as any,
        payment_method: input.paymentMethod as any,
      },
      include: {
        clearance_items: true,
        clearance_payments: true,
        customers: true,
      },
    });

    return formatClearance(updated);
  }

  async delete(id: string) {
    const clearance = await prisma.clearances.findUnique({
      where: { id },
      include: {
        clearance_items: true,
        clearance_payments: true,
      },
    });
    if (!clearance) throw new AppError(404, 'Clearance not found');

    await prisma.clearance_payments.deleteMany({ where: { clearance_id: id } });
    await prisma.clearance_items.deleteMany({ where: { clearance_id: id } });
    await prisma.clearances.delete({ where: { id } });

    return formatClearance(clearance);
  }
}

export const clearanceService = new ClearanceService();
