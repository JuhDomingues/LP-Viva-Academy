/**
 * Database Configuration
 * Uses native pg Pool for better connection string compatibility
 */

// Disable SSL certificate validation for Supabase self-signed certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import pkg from 'pg';
const { Pool } = pkg;

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

// Create pool using native pg with SSL always enabled
const pool = new Pool({
  connectionString,
  // Always use SSL with permissive settings for Supabase
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Create sql template tag function compatible with @vercel/postgres
export const sql = async (strings: TemplateStringsArray, ...values: any[]) => {
  const client = await pool.connect();
  try {
    // Build query from template strings
    let query = strings[0];
    const params: any[] = [];

    for (let i = 0; i < values.length; i++) {
      params.push(values[i]);
      query += `$${i + 1}${strings[i + 1]}`;
    }

    const result = await client.query(query, params);
    return result;
  } finally {
    client.release();
  }
};

// Add query method for non-template queries
(sql as any).query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

export { pool };
