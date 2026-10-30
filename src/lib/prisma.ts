import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

function getDatabaseUrl(): string {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    return '';
  }

  try {
    const url = new URL(rawUrl);
    url.searchParams.set('connection_limit', '15');
    url.searchParams.set('connect_timeout', '20');
    url.searchParams.set('pool_timeout', '30');
    return url.toString();
  } catch {
    const separator = rawUrl.includes('?') ? '&' : '?';
    return `${rawUrl}${separator}connection_limit=15&connect_timeout=20&pool_timeout=30`;
  }
}

const connectionUrl = getDatabaseUrl();

interface CustomNodeGlobal {
  prisma?: PrismaClient;
}

declare const globalThis: CustomNodeGlobal;

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    datasources: connectionUrl
      ? {
          db: {
            url: connectionUrl,
          },
        }
      : undefined,
    log:
      process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

/**
 * Gracefully attempts to connect the Prisma client to avoid instant
 * process crashes on database unavailability.
 */
export async function connectDB(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log('✅ Connected to MySQL database via Prisma');
    return true;
  } catch (error) {
    console.error('⚠️ Database connection warning via Prisma:', (error as Error).message);
    console.warn('⚠️ Server will start, but database operations may fail until MySQL is reachable.');
    return false;
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('🔌 Prisma client disconnected cleanly');
  } catch (error) {
    console.error('Error disconnecting Prisma:', error);
  }
}

export default prisma;

