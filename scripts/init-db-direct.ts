/**
 * Direct Database Initialization (works with Supabase/any Postgres)
 * Run with: npm run db:init:direct
 */

import pg from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

const { Client } = pg;

async function initializeDatabase(): Promise<void> {
  console.log('\n🗄️  Database Initialization (Direct Connection)\n');
  console.log('='.repeat(70));

  // Priority: POSTGRES_CONNECTION_STRING > DATABASE_URL > POSTGRES_URL_NON_POOLING > POSTGRES_URL
  const connectionString =
    process.env.POSTGRES_CONNECTION_STRING ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL;

  if (!connectionString) {
    console.log('\n❌ No database connection string found!');
    console.log('\nMake sure POSTGRES_URL_NON_POOLING or POSTGRES_URL is set in .env');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Connect
    console.log('\n1️⃣  Connecting to database...');
    await client.connect();
    console.log('   ✅ Connected!');

    // Test connection
    console.log('\n2️⃣  Testing connection...');
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`   ✅ Server time: ${result.rows[0].current_time}`);

    // Read schema
    console.log('\n3️⃣  Reading schema file...');
    const schemaPath = join(process.cwd(), 'lib', 'db', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    console.log('   ✅ Schema loaded');

    // Execute schema
    console.log('\n4️⃣  Creating tables...');

    // Split statements and execute
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let created = 0;
    for (const statement of statements) {
      try {
        await client.query(statement);

        if (statement.includes('CREATE TABLE')) {
          const match = statement.match(/CREATE TABLE.*?(\w+)/i);
          if (match) {
            console.log(`   ✅ Created table: ${match[1]}`);
            created++;
          }
        }
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message && error.message.includes('already exists')) {
          continue;
        }
        throw error;
      }
    }

    console.log(`\n   Created ${created} tables`);

    // Verify tables
    console.log('\n5️⃣  Verifying tables...');
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('chat_sessions', 'conversations', 'messages', 'leads', 'chat_events')
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map(r => r.table_name);
    const requiredTables = ['chat_sessions', 'conversations', 'messages', 'leads', 'chat_events'];

    console.log(`   Found ${tables.length}/${requiredTables.length} tables:`);
    for (const table of requiredTables) {
      const exists = tables.includes(table);
      console.log(`   ${exists ? '✅' : '❌'} ${table}`);
    }

    if (tables.length === requiredTables.length) {
      console.log('\n✅ Database initialized successfully!');
      console.log('\n💡 Next step: Test the chat on your website!');
    } else {
      console.log('\n⚠️  Some tables are missing. Check for errors above.');
    }

    console.log('\n' + '='.repeat(70));
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Database initialization failed!');
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initializeDatabase();
