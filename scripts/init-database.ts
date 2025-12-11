/**
 * Database Initialization Script
 * Creates all required tables and indexes
 * Run with: npx tsx scripts/init-database.ts
 */

import { sql } from '@vercel/postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

async function initializeDatabase(): Promise<void> {
  console.log('\n🗄️  Database Initialization\n');
  console.log('='.repeat(70));

  try {
    // Test connection first
    console.log('\n1️⃣  Testing database connection...');
    await sql`SELECT NOW() as current_time`;
    console.log('   ✅ Connection successful');

    // Read schema file
    console.log('\n2️⃣  Reading schema file...');
    const schemaPath = join(process.cwd(), 'lib', 'db', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    console.log('   ✅ Schema loaded');

    // Execute schema
    console.log('\n3️⃣  Executing schema (creating tables, indexes, triggers)...');
    console.log('   This may take a few moments...\n');

    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments
      if (statement.startsWith('--')) continue;

      try {
        await sql.query(statement);

        // Log progress for major operations
        if (statement.includes('CREATE TABLE')) {
          const match = statement.match(/CREATE TABLE.*?(\w+)/i);
          if (match) {
            console.log(`   ✅ Created table: ${match[1]}`);
          }
        } else if (statement.includes('CREATE INDEX')) {
          const match = statement.match(/CREATE INDEX.*?(\w+)/i);
          if (match) {
            console.log(`   ✅ Created index: ${match[1]}`);
          }
        } else if (statement.includes('CREATE TRIGGER')) {
          const match = statement.match(/CREATE TRIGGER.*?(\w+)/i);
          if (match) {
            console.log(`   ✅ Created trigger: ${match[1]}`);
          }
        }
      } catch (error) {
        // Check if error is due to object already existing
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage.includes('already exists')) {
          // Silently skip - object already exists
          continue;
        } else {
          console.error(`   ❌ Error executing statement: ${statement.substring(0, 100)}...`);
          throw error;
        }
      }
    }

    // Verify tables were created
    console.log('\n4️⃣  Verifying tables...');
    const result = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('chat_sessions', 'conversations', 'messages', 'leads', 'chat_events')
      ORDER BY table_name
    `;

    const tables = result.rows.map((r) => r.table_name);
    const requiredTables = ['chat_sessions', 'conversations', 'messages', 'leads', 'chat_events'];

    console.log(`   Found ${tables.length}/${requiredTables.length} tables:`);
    for (const table of requiredTables) {
      const exists = tables.includes(table);
      console.log(`   ${exists ? '✅' : '❌'} ${table}`);
    }

    // Get table statistics
    console.log('\n5️⃣  Database statistics:');
    for (const table of tables) {
      const countResult = await sql.query(`SELECT COUNT(*) as count FROM ${table}`);
      const count = countResult.rows[0].count;
      console.log(`   📊 ${table}: ${count} rows`);
    }

    console.log('\n='.repeat(70));
    console.log('✅ Database initialization completed successfully!');
    console.log('='.repeat(70));
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database initialization failed!');
    console.error('Error:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check POSTGRES_URL is set in your .env file');
    console.log('   2. Verify you have permissions to create tables');
    console.log('   3. Check that lib/db/schema.sql exists');
    console.log('');
    process.exit(1);
  }
}

// Add reset functionality
async function resetDatabase(): Promise<void> {
  console.log('\n⚠️  Database Reset\n');
  console.log('='.repeat(70));
  console.log('WARNING: This will DELETE ALL DATA!');
  console.log('='.repeat(70));

  try {
    console.log('\n1️⃣  Dropping existing tables...');

    const tables = ['chat_events', 'leads', 'messages', 'conversations', 'chat_sessions'];

    for (const table of tables) {
      try {
        await sql.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`   ✅ Dropped table: ${table}`);
      } catch (error) {
        console.log(`   ⚠️  Could not drop ${table}:`, error);
      }
    }

    console.log('\n2️⃣  Dropping functions...');
    try {
      await sql`DROP FUNCTION IF EXISTS update_updated_at_column CASCADE`;
      console.log('   ✅ Dropped function: update_updated_at_column');
    } catch (error) {
      console.log('   ⚠️  Could not drop function:', error);
    }

    console.log('\n✅ Database reset completed!');
    console.log('\nNow run: npm run db:init');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database reset failed!');
    console.error('Error:', error);
    process.exit(1);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === 'reset') {
  resetDatabase();
} else {
  initializeDatabase();
}
