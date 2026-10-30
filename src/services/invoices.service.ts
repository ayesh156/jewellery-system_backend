import { prisma } from '../lib/prisma.ts';
import { AppError } from '../middleware/errorHandler.ts';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../config/constants.ts';
import type { CreateInvoiceInput, PaymentInput } from '../validators/invoices.ts';

function toKaratString(k: string | null | undefined): string | null {
  if (!k) return null;
  return k.replace(/^K(\d+)$/, '$1K');
}

function toPrismaKarat(k: string | null | undefined): any {
  if (!k) return undefined;
  if (k.startsWith('K')) return k;
  return `K${k.replace('K', '')}`;
}

function formatInvoice(inv: any, items: any[] = inv?.invoice_items || [], paymentsList: any[] = inv?.payments || []) {
  if (!inv) return null;
  const cust = inv.customers;
  return {
    id: inv.id,
    invoiceNumber: inv.invoice_number,
    customerId: inv.customer_id,
    customerName: cust?.name || inv.customer_name,
    customerPhone: cust?.phone || inv.customer_phone,
    customerAddress: cust?.address
      ? `${cust.address}${cust.city ? ', ' + cust.city : ''}`
      : inv.customer_address,
    subtotal: inv.subtotal,
    discount: inv.discount,
    discountType: inv.discount_type,
    tax: inv.tax,
    taxRate: inv.tax_rate,
    total: inv.total,
    amountPaid: inv.amount_paid,
    balanceDue: inv.balance_due,
    paymentMethod: inv.payment_method,
    issueDate: inv.issue_date,
    dueDate: inv.due_date,
    status: inv.invoice_status,
    notes: inv.notes,
    createdBy: inv.created_by,
    createdByUserId: inv.created_by_user_id,
    createdAt: inv.created_at,
    updatedAt: inv.updated_at,
    items: items.map((item) => ({
      id: item.id,
      invoiceId: item.invoice_id,
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
      discount: item.discount,
      discountType: item.discount_type,
      total: item.total,
    })),
    payments: paymentsList.map((p) => ({
      id: p.id,
      invoiceId: p.invoice_id,
      amount: p.amount,
      method: p.payment_method,
      date: p.date,
      reference: p.reference,
      notes: p.notes,
      createdAt: p.created_at,
    })),
  };
}

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

    const where: any = {};
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { invoice_number: { contains: q } },
        { customer_name: { contains: q } },
      ];
    }
    if (status) {
      where.invoice_status = status as any;
    }

    const sortFieldMap: Record<string, string> = {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      invoiceNumber: 'invoice_number',
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

    const [allInvoices, count] = await Promise.all([
      prisma.invoices.findMany({
        where,
        orderBy,
        take: limitNum,
        skip: offset,
        include: {
          invoice_items: true,
          payments: true,
          customers: true,
        },
      }),
      prisma.invoices.count({ where }),
    ]);

    return {
      data: allInvoices.map((inv) => formatInvoice(inv)),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
      },
    };
  }

  async findById(id: string) {
    const invoice = await prisma.invoices.findUnique({
      where: { id },
      include: {
        invoice_items: true,
        payments: true,
        customers: true,
      },
    });

    if (!invoice) throw new AppError(404, 'Invoice not found');

    return formatInvoice(invoice);
  }

  async create(input: CreateInvoiceInput) {
    const { items, ...invoiceData } = input;

    const customer = await prisma.customers.findUnique({
      where: { id: input.customerId },
    });
    if (!customer) throw new AppError(400, 'Customer not found');

    const created = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoices.create({
        data: {
          id: invoiceData.id,
          invoice_number: invoiceData.invoiceNumber,
          customer_id: invoiceData.customerId,
          customer_name: invoiceData.customerName,
          customer_phone: invoiceData.customerPhone,
          customer_address: invoiceData.customerAddress,
          subtotal: invoiceData.subtotal as any,
          discount: (invoiceData.discount || '0') as any,
          discount_type: invoiceData.discountType,
          tax: (invoiceData.tax || '0') as any,
          tax_rate: invoiceData.taxRate ? (invoiceData.taxRate as any) : undefined,
          total: invoiceData.total as any,
          amount_paid: (invoiceData.amountPaid || '0') as any,
          balance_due: (invoiceData.balanceDue || '0') as any,
          payment_method: invoiceData.paymentMethod as any,
          issue_date: invoiceData.issueDate,
          due_date: invoiceData.dueDate,
          invoice_status: (invoiceData.status || 'draft') as any,
          notes: invoiceData.notes,
          created_by: invoiceData.createdBy,
          created_by_user_id: invoiceData.createdByUserId,
        },
      });

      if (items && items.length) {
        await tx.invoice_items.createMany({
          data: items.map((item) => ({
            id: item.id,
            invoice_id: inv.id,
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
            discount: item.discount ? (item.discount as any) : undefined,
            discount_type: item.discountType,
            total: item.total as any,
          })),
        });
      }

      if (parseFloat(input.amountPaid) > 0 && input.paymentMethod) {
        await tx.payments.create({
          data: {
            id: `pay-${Date.now()}`,
            invoice_id: inv.id,
            amount: input.amountPaid as any,
            payment_method: input.paymentMethod as any,
            date: input.issueDate,
            notes: 'Initial payment',
          },
        });
      }

      return tx.invoices.findUnique({
        where: { id: inv.id },
        include: {
          invoice_items: true,
          payments: true,
          customers: true,
        },
      });
    });

    return formatInvoice(created!);
  }

  async update(id: string, input: Partial<CreateInvoiceInput>) {
    const { items, ...invoiceData } = input;

    const existing = await prisma.invoices.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'Invoice not found');

    const updated = await prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (invoiceData.invoiceNumber !== undefined) updateData.invoice_number = invoiceData.invoiceNumber;
      if (invoiceData.customerId !== undefined) updateData.customer_id = invoiceData.customerId;
      if (invoiceData.customerName !== undefined) updateData.customer_name = invoiceData.customerName;
      if (invoiceData.customerPhone !== undefined) updateData.customer_phone = invoiceData.customerPhone;
      if (invoiceData.customerAddress !== undefined) updateData.customer_address = invoiceData.customerAddress;
      if (invoiceData.subtotal !== undefined) updateData.subtotal = invoiceData.subtotal as any;
      if (invoiceData.discount !== undefined) updateData.discount = invoiceData.discount as any;
      if (invoiceData.discountType !== undefined) updateData.discount_type = invoiceData.discountType;
      if (invoiceData.tax !== undefined) updateData.tax = invoiceData.tax as any;
      if (invoiceData.taxRate !== undefined) updateData.tax_rate = invoiceData.taxRate as any;
      if (invoiceData.total !== undefined) updateData.total = invoiceData.total as any;
      if (invoiceData.amountPaid !== undefined) updateData.amount_paid = invoiceData.amountPaid as any;
      if (invoiceData.balanceDue !== undefined) updateData.balance_due = invoiceData.balanceDue as any;
      if (invoiceData.paymentMethod !== undefined) updateData.payment_method = invoiceData.paymentMethod as any;
      if (invoiceData.issueDate !== undefined) updateData.issue_date = invoiceData.issueDate;
      if (invoiceData.dueDate !== undefined) updateData.due_date = invoiceData.dueDate;
      if (invoiceData.status !== undefined) updateData.invoice_status = invoiceData.status as any;
      if (invoiceData.notes !== undefined) updateData.notes = invoiceData.notes;

      await tx.invoices.update({
        where: { id },
        data: updateData,
      });

      if (items) {
        await tx.invoice_items.deleteMany({ where: { invoice_id: id } });
        if (items.length) {
          await tx.invoice_items.createMany({
            data: items.map((item) => ({
              id: item.id,
              invoice_id: id,
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
              discount: item.discount ? (item.discount as any) : undefined,
              discount_type: item.discountType,
              total: item.total as any,
            })),
          });
        }
      }

      return tx.invoices.findUnique({
        where: { id },
        include: {
          invoice_items: true,
          payments: true,
          customers: true,
        },
      });
    });

    return formatInvoice(updated!);
  }

  async addPayment(id: string, input: PaymentInput) {
    const invoice = await prisma.invoices.findUnique({ where: { id } });
    if (!invoice) throw new AppError(404, 'Invoice not found');

    const payment = await prisma.payments.create({
      data: {
        id: input.id,
        invoice_id: id,
        amount: input.amount as any,
        payment_method: input.method as any,
        date: input.date,
        reference: input.reference,
        notes: input.notes,
      },
    });

    const newAmountPaid = parseFloat(String(invoice.amount_paid)) + parseFloat(input.amount);
    const newBalanceDue = parseFloat(String(invoice.total)) - newAmountPaid;
    const newStatus = newBalanceDue <= 0 ? 'paid' : 'partial';

    const updatedInvoice = await prisma.invoices.update({
      where: { id },
      data: {
        amount_paid: newAmountPaid.toFixed(2) as any,
        balance_due: Math.max(0, newBalanceDue).toFixed(2) as any,
        invoice_status: newStatus as any,
        payment_method: input.method as any,
      },
      include: {
        invoice_items: true,
        payments: true,
        customers: true,
      },
    });

    return {
      payment: {
        id: payment.id,
        invoiceId: payment.invoice_id,
        amount: payment.amount,
        method: payment.payment_method,
        date: payment.date,
        reference: payment.reference,
        notes: payment.notes,
        createdAt: payment.created_at,
      },
      invoice: formatInvoice(updatedInvoice),
    };
  }

  async delete(id: string) {
    const invoice = await prisma.invoices.findUnique({
      where: { id },
      include: {
        invoice_items: true,
        payments: true,
      },
    });
    if (!invoice) throw new AppError(404, 'Invoice not found');

    await prisma.payments.deleteMany({ where: { invoice_id: id } });
    await prisma.invoice_items.deleteMany({ where: { invoice_id: id } });
    await prisma.invoices.delete({ where: { id } });

    return formatInvoice(invoice);
  }
}

export const invoicesService = new InvoicesService();
