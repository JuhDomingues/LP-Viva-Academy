/**
 * Database Configuration
 * This file handles the database connection string priority
 * to work around locked Vercel environment variables
 */

// Priority order for database connection:
// 1. POSTGRES_CONNECTION_STRING (custom override)
// 2. DATABASE_URL (alternative)
// 3. POSTGRES_URL (Vercel default, but may be locked/incorrect)
const connectionString =
  process.env.POSTGRES_CONNECTION_STRING ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL;

if (connectionString && !process.env.POSTGRES_URL) {
  // Set POSTGRES_URL for @vercel/postgres to use
  process.env.POSTGRES_URL = connectionString;
} else if (connectionString && process.env.POSTGRES_URL &&
           (process.env.POSTGRES_CONNECTION_STRING || process.env.DATABASE_URL)) {
  // Override POSTGRES_URL if we have a custom variable
  process.env.POSTGRES_URL = connectionString;
}

export { connectionString };
