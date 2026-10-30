import { prisma } from '../lib/prisma.ts';
import { AppError } from '../middleware/errorHandler.ts';
import { MAX_PAGE_SIZE } from '../config/constants.ts';
import type { CreateCustomerInput, UpdateCustomerInput } from '../validators/customers.ts';

function formatCustomer(c: any) {
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    businessName: c.business_name,
    email: c.email,
    phone: c.phone,
    phone2: c.phone2,
    nic: c.nic,
    address: c.address,
    city: c.city,
    photo: c.photo,
    registrationDate: c.registration_date,
    totalPurchased: c.total_purchased,
    customerType: c.customer_type,
    isActive: c.is_active,
    creditLimit: c.credit_limit,
    creditBalance: c.credit_balance,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

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

    const where: any = {};
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
        { business_name: { contains: q } },
      ];
    }
    if (customerType) where.customer_type = customerType as any;
    if (isActive !== undefined) where.is_active = isActive === 'true';

    const sortFieldMap: Record<string, string> = {
      name: 'name',
      phone: 'phone',
      registrationDate: 'registration_date',
      totalPurchased: 'total_purchased',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };
    const orderColumn = sortFieldMap[sortBy] || sortBy;
    const orderBy: any = {};
    orderBy[orderColumn] = sortOrder === 'desc' ? 'desc' : 'asc';

    const [allCustomers, count] = await Promise.all([
      prisma.customers.findMany({
        where,
        orderBy,
        take: limitNum,
        skip: offset,
      }),
      prisma.customers.count({ where }),
    ]);

    return {
      data: allCustomers.map(formatCustomer),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
      },
    };
  }

  async findById(id: string) {
    const customer = await prisma.customers.findUnique({
      where: { id },
    });
    if (!customer) throw new AppError(404, 'Customer not found');
    return formatCustomer(customer);
  }

  async create(input: CreateCustomerInput) {
    const created = await prisma.customers.create({
      data: {
        id: input.id,
        name: input.name,
        business_name: input.businessName,
        email: input.email,
        phone: input.phone,
        phone2: input.phone2,
        nic: input.nic,
        address: input.address,
        city: input.city,
        photo: input.photo,
        registration_date: input.registrationDate,
        total_purchased: (input.totalPurchased || '0') as any,
        customer_type: (input.customerType || 'retail') as any,
        is_active: input.isActive !== undefined ? input.isActive : true,
        credit_limit: input.creditLimit ? (input.creditLimit as any) : undefined,
        credit_balance: input.creditBalance ? (input.creditBalance as any) : undefined,
      },
    });
    return formatCustomer(created);
  }

  async update(id: string, input: UpdateCustomerInput) {
    const existing = await prisma.customers.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'Customer not found');

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.businessName !== undefined) updateData.business_name = input.businessName;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.phone2 !== undefined) updateData.phone2 = input.phone2;
    if (input.nic !== undefined) updateData.nic = input.nic;
    if (input.address !== undefined) updateData.address = input.address;
    if (input.city !== undefined) updateData.city = input.city;
    if (input.photo !== undefined) updateData.photo = input.photo;
    if (input.registrationDate !== undefined) updateData.registration_date = input.registrationDate;
    if (input.totalPurchased !== undefined) updateData.total_purchased = input.totalPurchased as any;
    if (input.customerType !== undefined) updateData.customer_type = input.customerType as any;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;
    if (input.creditLimit !== undefined) updateData.credit_limit = input.creditLimit as any;
    if (input.creditBalance !== undefined) updateData.credit_balance = input.creditBalance as any;

    const updated = await prisma.customers.update({
      where: { id },
      data: updateData,
    });

    // Cascade customer detail changes to clearances & invoices
    const syncFields: Record<string, any> = {};
    if (input.name !== undefined) syncFields.customer_name = input.name;
    if (input.phone !== undefined) syncFields.customer_phone = input.phone;
    if (input.address !== undefined) syncFields.customer_address = input.address;

    const syncFieldsClearance: Record<string, any> = { ...syncFields };
    if (input.nic !== undefined) syncFieldsClearance.customer_nic = input.nic;

    if (Object.keys(syncFields).length > 0) {
      await prisma.invoices.updateMany({
        where: { customer_id: id },
        data: syncFields,
      });
    }
    if (Object.keys(syncFieldsClearance).length > 0) {
      await prisma.clearances.updateMany({
        where: { customer_id: id },
        data: syncFieldsClearance,
      });
    }

    return formatCustomer(updated);
  }

  async delete(id: string) {
    const customer = await this.findById(id);
    await prisma.customers.delete({ where: { id } });
    return customer;
  }
}

export const customersService = new CustomersService();
