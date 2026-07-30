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

const poolConnection = mysql.createPool(DATABASE_URL);

export const db = drizzle(poolConnection, { schema, mode: 'default' });

export type Database = typeof db;