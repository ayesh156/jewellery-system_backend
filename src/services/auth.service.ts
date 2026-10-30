import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.ts';
import { generateToken } from '../middleware/auth.ts';
import { AppError } from '../middleware/errorHandler.ts';
import { BCRYPT_SALT_ROUNDS } from '../config/constants.ts';
import type { LoginInput, ChangePasswordInput, PreferencesInput } from '../validators/auth.ts';

export class AuthService {
  /**
   * Authenticate a user and return JWT token + user data.
   */
  async login(input: LoginInput) {
    const { username, password } = input;

    const user = await prisma.users.findUnique({
      where: { username: username.toLowerCase().trim() },
    });

    if (!user) {
      throw new AppError(401, 'Invalid username or password');
    }

    if (!user.is_active) {
      throw new AppError(403, 'Account is deactivated. Contact administrator.');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError(401, 'Invalid username or password');
    }

    // Update last login
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.user_role,
      shopCode: user.shop_code,
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.user_role,
        shopCode: user.shop_code,
        pawnBillFormat: user.pawn_bill_format || 'A4',
      },
    };
  }

  /**
   * Get the current user's profile.
   */
  async getMe(userId: string) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      role: user.user_role,
      shopCode: user.shop_code,
      isActive: user.is_active,
      pawnBillFormat: user.pawn_bill_format || 'A4',
      lastLoginAt: user.last_login_at,
      createdAt: user.created_at,
    };
  }

  /**
   * Change the current user's password.
   */
  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const isValid = await bcrypt.compare(input.currentPassword, user.password_hash);
    if (!isValid) {
      throw new AppError(400, 'Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(input.newPassword, salt);

    await prisma.users.update({
      where: { id: user.id },
      data: { password_hash: passwordHash },
    });
  }

  /**
   * Update user preferences.
   */
  async updatePreferences(userId: string, input: PreferencesInput) {
    const updateData: any = {};
    if (input.pawnBillFormat !== undefined) updateData.pawn_bill_format = input.pawnBillFormat;

    await prisma.users.update({
      where: { id: userId },
      data: updateData,
    });
  }
}

export const authService = new AuthService();
