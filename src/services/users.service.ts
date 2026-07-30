import bcrypt from 'bcryptjs';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, counters } from '../db/schema.js';
import { AppError } from '../middleware/errorHandler.js';
import { BCRYPT_SALT_ROUNDS, DEFAULT_PREFIXES, ID_PREFIXES } from '../config/constants.js';
import type { CreateUserInput, UpdateUserInput } from '../validators/users.js';

export class UsersService {
  private readonly userColumns = {
    id: users.id,
    username: users.username,
    email: users.email,
    fullName: users.fullName,
    phone: users.phone,
    role: users.role,
    shopCode: users.shopCode,
    isActive: users.isActive,
    pawnBillFormat: users.pawnBillFormat,
    lastLoginAt: users.lastLoginAt,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
  } as const;

  async findAll() {
    return db
      .select(this.userColumns)
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async findById(id: string) {
    const [user] = await db
      .select(this.userColumns)
      .from(users)
      .where(eq(users.id, id));

    if (!user) throw new AppError(404, 'User not found');
    return user;
  }

  async create(input: CreateUserInput) {
    // Check uniqueness
    const [existingUsername] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, input.username));
    if (existingUsername) throw new AppError(409, 'Username already exists');

    const [existingEmail] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, input.email));
    if (existingEmail) throw new AppError(409, 'Email already exists');

    // Hash password
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(input.password, salt);

    // Generate user ID
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    const nextNum = Number(countResult.count) + 1;
    const userId = `${ID_PREFIXES.USER}-${String(nextNum).padStart(2, '0')}`;

    // Initialize counters for user's shop code
    await this.ensureShopCounters(input.shopCode);

    await db.insert(users).values({
      id: userId,
      username: input.username,
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      phone: input.phone || null,
      role: input.role,
      shopCode: input.shopCode,
    });

    return this.findById(userId);
  }

  async update(id: string, input: UpdateUserInput) {
    const existing = await this.findById(id);

    // Check email uniqueness if changed
    if (input.email && input.email !== existing.email) {
      const [dup] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, input.email));
      if (dup) throw new AppError(409, 'Email already exists');
    }

    const setFields: Record<string, any> = { updatedAt: new Date() };
    const fields: (keyof typeof input)[] = [
      'email', 'fullName', 'phone', 'role', 'shopCode', 'isActive', 'pawnBillFormat',
    ];
    for (const field of fields) {
      if (input[field] !== undefined) setFields[field] = input[field];
    }

    // Hash new password if provided
    if (input.password) {
      const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
      setFields.passwordHash = await bcrypt.hash(input.password, salt);
    }

    // If shop code changed, auto-initialize counters
    if (input.shopCode && input.shopCode !== existing.shopCode) {
      await this.ensureShopCounters(input.shopCode);
    }

    const result = await db
      .update(users)
      .set(setFields)
      .where(eq(users.id, id));
    if ((result as any)[0].affectedRows === 0) throw new AppError(404, 'User not found');

    return this.findById(id);
  }

  async delete(id: string, currentUserId: string) {
    const user = await this.findById(id);

    if (currentUserId === id) {
      throw new AppError(400, 'Cannot delete your own account');
    }

    await db.delete(users).where(eq(users.id, id));
    return user;
  }

  private async ensureShopCounters(shopCode: string) {
    const existingCounters = await db
      .select()
      .from(counters)
      .where(eq(counters.shopCode, shopCode));

    const existingTypes = new Set(existingCounters.map((c) => c.entityType));
    const toCreate = Object.keys(DEFAULT_PREFIXES).filter(
      (t) => !existingTypes.has(t),
    );

    if (toCreate.length > 0) {
      await db.insert(counters).values(
        toCreate.map((entityType) => ({
          id: `${ID_PREFIXES.COUNTER}-${shopCode}-${entityType}`,
          entityType,
          shopCode,
          prefix: DEFAULT_PREFIXES[entityType],
          lastNumber: 0,
          paddingLength: 5,
        })),
      );
    }
  }
}

export const usersService = new UsersService();