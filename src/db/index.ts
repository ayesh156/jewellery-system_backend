import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema.js';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    '❌ DATABASE_URL is not defined. Check your .env file or environment variables.',
  );
}

// [FIX] Concurrency-Safe Universal Singleton Pool for Drizzle & mysql2 to eliminate duplicate instances & memory leaks
interface GlobalDrizzle {
  poolConnection?: mysql.Pool;
  db?: ReturnType<typeof drizzle>;
}

const globalForDb = globalThis as unknown as GlobalDrizzle;

export const poolConnection =
  globalForDb.poolConnection ??
  mysql.createPool({
    uri: DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 5,       // Safe VPS connection pool limit per worker (Max 5)
    queueLimit: 0,
    connectTimeout: 15000,    // Standard 15s handshake timeout matching VPS backends
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  });

export const db =
  globalForDb.db ??
  drizzle(poolConnection, { schema, mode: 'default' });

// Cache unconditionally across reloads
globalForDb.poolConnection = poolConnection;
globalForDb.db = db;

export type Database = typeof db;