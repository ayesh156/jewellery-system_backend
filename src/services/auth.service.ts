import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { generateToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { BCRYPT_SALT_ROUNDS } from '../config/constants.js';
import type { LoginInput, ChangePasswordInput, PreferencesInput } from '../validators/auth.js';

export class AuthService {
  /**
   * Authenticate a user and return JWT token + user data.
   */
  async login(input: LoginInput) {
    const { username, password } = input;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username.toLowerCase().trim()));

    if (!user) {
      throw new AppError(401, 'Invalid username or password');
    }

    if (!user.isActive) {
      throw new AppError(403, 'Account is deactivated. Contact administrator.');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError(401, 'Invalid username or password');
    }

    // Update last login
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      shopCode: user.shopCode,
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        shopCode: user.shopCode,
        pawnBillFormat: user.pawnBillFormat || 'A4',
      },
    };
  }

  /**
   * Get the current user's profile.
   */
  async getMe(userId: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      shopCode: user.shopCode,
      isActive: user.isActive,
      pawnBillFormat: user.pawnBillFormat || 'A4',
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  /**
   * Change the current user's password.
   */
  async changePassword(userId: string, input: ChangePasswordInput) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const isValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AppError(400, 'Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(input.newPassword, salt);

    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, user.id));
  }

  /**
   * Update user preferences.
   */
  async updatePreferences(userId: string, input: PreferencesInput) {
    const setFields: Record<string, any> = { updatedAt: new Date() };
    if (input.pawnBillFormat !== undefined) setFields.pawnBillFormat = input.pawnBillFormat;

    await db
      .update(users)
      .set(setFields)
      .where(eq(users.id, userId));
  }
}

export const authService = new AuthService();