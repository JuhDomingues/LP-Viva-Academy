/**
 * Database Configuration
 * This file handles the database connection string priority
 * to work around locked Vercel environment variables
 */

import { createPool } from '@vercel/postgres';

// Priority order for database connection:
// 1. POSTGRES_CONNECTION_STRING (custom override)
// 2. DATABASE_URL (alternative)
// 3. POSTGRES_URL (Vercel default, but may be locked/incorrect)
const connectionString =
  process.env.POSTGRES_CONNECTION_STRING ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL;

console.log('[DB Config] Using connection string from:',
  process.env.POSTGRES_CONNECTION_STRING ? 'POSTGRES_CONNECTION_STRING' :
  process.env.DATABASE_URL ? 'DATABASE_URL' : 'POSTGRES_URL'
);

// Create custom pool with our connection string
export const db = createPool({
  connectionString,
});

export const sql = db.sql;
