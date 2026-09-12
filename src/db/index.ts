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

// Explicit connection pooling matching Ecotec/Microvision VPS architectural limits
export const poolConnection = mysql.createPool({
  uri: DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 5,       // Safe VPS connection pool limit per worker (Max 5)
  queueLimit: 0,
  connectTimeout: 5000,     // 5s connect timeout to prevent hang
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

export const db = drizzle(poolConnection, { schema, mode: 'default' });

export type Database = typeof db;