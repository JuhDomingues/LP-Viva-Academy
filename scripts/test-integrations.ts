/**
 * API Integration Testing Script
 * Tests all external API connections
 * Run with: npx tsx scripts/test-integrations.ts
 */

import OpenAI from 'openai';
import axios from 'axios';
import { sql } from '@vercel/postgres';
import { kv } from '@vercel/kv';

interface TestResult {
  service: string;
  status: 'success' | 'failed' | 'skipped';
  message: string;
  duration?: number;
  error?: string;
}

const results: TestResult[] = [];

// Helper to measure execution time
async function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;
  return { result, duration };
}

// Test OpenAI API
async function testOpenAI(): Promise<TestResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      service: 'OpenAI API',
      status: 'skipped',
      message: 'OPENAI_API_KEY not configured',
    };
  }

  try {
    const openai = new OpenAI({ apiKey });

    const { result, duration } = await measureTime(async () => {
      return await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'user',
            content: 'Responda apenas "OK" para confirmar que está funcionando.',
          },
        ],
        max_tokens: 10,
      });
    });

    const content = result.choices[0]?.message?.content || '';

    return {
      service: 'OpenAI API',
      status: 'success',
      message: `Connected successfully. Response: "${content}"`,
      duration,
    };
  } catch (error) {
    return {
      service: 'OpenAI API',
      status: 'failed',
      message: 'Failed to connect to OpenAI',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Test Evolution API (WhatsApp)
async function testEvolutionAPI(): Promise<TestResult> {
  const apiUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instanceName = process.env.EVOLUTION_INSTANCE_NAME;

  if (!apiUrl || !apiKey || !instanceName) {
    return {
      service: 'Evolution API (WhatsApp)',
      status: 'skipped',
      message: 'Evolution API credentials not configured',
    };
  }

  try {
    const { result, duration } = await measureTime(async () => {
      return await axios.get(`${apiUrl}/instance/connectionState/${instanceName}`, {
        headers: {
          apikey: apiKey,
        },
        timeout: 10000,
      });
    });

    const state = result.data.state;
    const isConnected = state === 'open';

    return {
      service: 'Evolution API (WhatsApp)',
      status: isConnected ? 'success' : 'failed',
      message: isConnected
        ? `Connected successfully. WhatsApp state: ${state}`
        : `WhatsApp not connected. State: ${state}`,
      duration,
    };
  } catch (error) {
    return {
      service: 'Evolution API (WhatsApp)',
      status: 'failed',
      message: 'Failed to connect to Evolution API',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Test Vercel Postgres
async function testPostgres(): Promise<TestResult> {
  const postgresUrl = process.env.POSTGRES_URL;

  if (!postgresUrl) {
    return {
      service: 'Vercel Postgres',
      status: 'skipped',
      message: 'POSTGRES_URL not configured',
    };
  }

  try {
    const { result, duration } = await measureTime(async () => {
      // Test connection
      const connectionTest = await sql`SELECT NOW() as current_time`;

      // Check if tables exist
      const tablesResult = await sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN ('chat_sessions', 'conversations', 'messages', 'leads', 'chat_events')
        ORDER BY table_name
      `;

      return {
        connectionTest,
        tables: tablesResult.rows.map((r) => r.table_name),
      };
    });

    const requiredTables = ['chat_sessions', 'conversations', 'messages', 'leads', 'chat_events'];
    const missingTables = requiredTables.filter((t) => !result.tables.includes(t));

    if (missingTables.length > 0) {
      return {
        service: 'Vercel Postgres',
        status: 'failed',
        message: `Connected but missing tables: ${missingTables.join(', ')}`,
        duration,
        error: 'Run database initialization script: npm run db:init',
      };
    }

    return {
      service: 'Vercel Postgres',
      status: 'success',
      message: `Connected successfully. Found ${result.tables.length}/5 required tables`,
      duration,
    };
  } catch (error) {
    return {
      service: 'Vercel Postgres',
      status: 'failed',
      message: 'Failed to connect to Postgres',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Test Vercel KV (Redis)
async function testVercelKV(): Promise<TestResult> {
  const kvUrl = process.env.KV_URL;

  if (!kvUrl) {
    return {
      service: 'Vercel KV (Redis)',
      status: 'skipped',
      message: 'KV_URL not configured',
    };
  }

  try {
    const testKey = 'test_connection';
    const testValue = { timestamp: Date.now(), test: true };

    const { duration } = await measureTime(async () => {
      // Test write
      await kv.set(testKey, testValue, { ex: 10 }); // Expire in 10 seconds

      // Test read
      const retrieved = await kv.get(testKey);

      // Test delete
      await kv.del(testKey);

      return retrieved;
    });

    return {
      service: 'Vercel KV (Redis)',
      status: 'success',
      message: 'Connected successfully. Read/write operations working',
      duration,
    };
  } catch (error) {
    return {
      service: 'Vercel KV (Redis)',
      status: 'failed',
      message: 'Failed to connect to Vercel KV',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Test Rate Limiter (uses Vercel KV)
async function testRateLimiter(): Promise<TestResult> {
  const kvUrl = process.env.KV_URL;

  if (!kvUrl) {
    return {
      service: 'Rate Limiter',
      status: 'skipped',
      message: 'KV_URL not configured (required for rate limiting)',
    };
  }

  try {
    const testIdentifier = 'test_rate_limit_' + Date.now();
    const key = `rate_limit:${testIdentifier}`;

    const { duration } = await measureTime(async () => {
      // Simulate rate limit tracking
      await kv.set(key, { count: 1, resetAt: Date.now() + 60000 }, { ex: 60 });
      const data = await kv.get(key);
      await kv.del(key);
      return data;
    });

    return {
      service: 'Rate Limiter',
      status: 'success',
      message: 'Rate limiting system operational',
      duration,
    };
  } catch (error) {
    return {
      service: 'Rate Limiter',
      status: 'failed',
      message: 'Rate limiter test failed',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Print results
function printResults(): void {
  console.log('\n🧪 API Integration Tests\n');
  console.log('='.repeat(70));

  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (const result of results) {
    let icon = '';
    let statusColor = '';

    switch (result.status) {
      case 'success':
        icon = '✅';
        successCount++;
        break;
      case 'failed':
        icon = '❌';
        failedCount++;
        break;
      case 'skipped':
        icon = '⏭️';
        skippedCount++;
        break;
    }

    console.log(`\n${icon} ${result.service}`);
    console.log('-'.repeat(70));
    console.log(`Status: ${result.status.toUpperCase()}`);
    console.log(`Message: ${result.message}`);

    if (result.duration) {
      console.log(`Duration: ${result.duration}ms`);
    }

    if (result.error) {
      console.log(`Error: ${result.error}`);
    }
  }

  // Summary
  console.log('\n📊 Summary');
  console.log('='.repeat(70));
  console.log(`Total tests: ${results.length}`);
  console.log(`✅ Passed: ${successCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log(`⏭️  Skipped: ${skippedCount}`);

  if (failedCount > 0) {
    console.log('\n❌ Some integrations failed!');
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check your .env file has all required variables');
    console.log('   2. Verify API credentials are correct');
    console.log('   3. For database: run npm run db:init to create tables');
    console.log('   4. For Evolution API: ensure WhatsApp instance is connected');
  } else if (skippedCount === results.length) {
    console.log('\n⚠️  All tests were skipped (no credentials configured)');
  } else {
    console.log('\n✅ All configured integrations are working!');
  }

  console.log('='.repeat(70));
  console.log('');
}

// Main execution
async function runTests(): Promise<void> {
  console.log('Starting integration tests...\n');

  // Run all tests in sequence
  results.push(await testOpenAI());
  results.push(await testEvolutionAPI());
  results.push(await testPostgres());
  results.push(await testVercelKV());
  results.push(await testRateLimiter());

  printResults();

  // Exit with error code if any test failed
  const hasFailures = results.some((r) => r.status === 'failed');
  process.exit(hasFailures ? 1 : 0);
}

// Run the tests
runTests().catch((error) => {
  console.error('❌ Fatal error running tests:', error);
  process.exit(1);
});
