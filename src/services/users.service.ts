import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.ts';
import { AppError } from '../middleware/errorHandler.ts';
import { BCRYPT_SALT_ROUNDS, DEFAULT_PREFIXES, ID_PREFIXES } from '../config/constants.ts';
import type { CreateUserInput, UpdateUserInput } from '../validators/users.ts';

function formatUser(u: any) {
  if (!u) return null;
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    fullName: u.full_name,
    phone: u.phone,
    role: u.user_role,
    shopCode: u.shop_code,
    isActive: u.is_active,
    pawnBillFormat: u.pawn_bill_format,
    lastLoginAt: u.last_login_at,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  };
}

export class UsersService {
  async findAll() {
    const list = await prisma.users.findMany({
      orderBy: { created_at: 'desc' },
    });
    return list.map(formatUser);
  }

  async findById(id: string) {
    const user = await prisma.users.findUnique({
      where: { id },
    });
    if (!user) throw new AppError(404, 'User not found');
    return formatUser(user);
  }

  async create(input: CreateUserInput) {
    // Check uniqueness
    const existingUsername = await prisma.users.findUnique({
      where: { username: input.username },
    });
    if (existingUsername) throw new AppError(409, 'Username already exists');

    const existingEmail = await prisma.users.findUnique({
      where: { email: input.email },
    });
    if (existingEmail) throw new AppError(409, 'Email already exists');

    // Hash password
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(input.password, salt);

    // Generate user ID
    const count = await prisma.users.count();
    const nextNum = count + 1;
    const userId = `${ID_PREFIXES.USER}-${String(nextNum).padStart(2, '0')}`;

    // Initialize counters for user's shop code
    await this.ensureShopCounters(input.shopCode);

    const created = await prisma.users.create({
      data: {
        id: userId,
        username: input.username,
        email: input.email,
        password_hash: passwordHash,
        full_name: input.fullName,
        phone: input.phone || null,
        user_role: input.role as any,
        shop_code: input.shopCode,
      },
    });

    return formatUser(created);
  }

  async update(id: string, input: UpdateUserInput) {
    const existing = await prisma.users.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'User not found');

    // Check email uniqueness if changed
    if (input.email && input.email !== existing.email) {
      const dup = await prisma.users.findUnique({
        where: { email: input.email },
      });
      if (dup) throw new AppError(409, 'Email already exists');
    }

    const updateData: any = {};
    if (input.email !== undefined) updateData.email = input.email;
    if (input.fullName !== undefined) updateData.full_name = input.fullName;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.role !== undefined) updateData.user_role = input.role as any;
    if (input.shopCode !== undefined) updateData.shop_code = input.shopCode;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;
    if (input.pawnBillFormat !== undefined) updateData.pawn_bill_format = input.pawnBillFormat;

    // Hash new password if provided
    if (input.password) {
      const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
      updateData.password_hash = await bcrypt.hash(input.password, salt);
    }

    // If shop code changed, auto-initialize counters
    if (input.shopCode && input.shopCode !== existing.shop_code) {
      await this.ensureShopCounters(input.shopCode);
    }

    const updated = await prisma.users.update({
      where: { id },
      data: updateData,
    });

    return formatUser(updated);
  }

  async delete(id: string, currentUserId: string) {
    const user = await this.findById(id);

    if (currentUserId === id) {
      throw new AppError(400, 'Cannot delete your own account');
    }

    await prisma.users.delete({ where: { id } });
    return user;
  }

  private async ensureShopCounters(shopCode: string) {
    const existingCounters = await prisma.counters.findMany({
      where: { shop_code: shopCode },
    });

    const existingTypes = new Set(existingCounters.map((c) => c.entity_type));
    const toCreate = Object.keys(DEFAULT_PREFIXES).filter(
      (t) => !existingTypes.has(t),
    );

    if (toCreate.length > 0) {
      await prisma.counters.createMany({
        data: toCreate.map((entityType) => ({
          id: `${ID_PREFIXES.COUNTER}-${shopCode}-${entityType}`,
          entity_type: entityType,
          shop_code: shopCode,
          prefix: DEFAULT_PREFIXES[entityType],
          last_number: 0,
          padding_length: 5,
        })),
      });
    }
  }
}

export const usersService = new UsersService();
