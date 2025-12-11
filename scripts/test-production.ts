/**
 * Production Environment Test
 * Tests the deployed API endpoints
 * Run with: npm run test:production
 */

import axios from 'axios';

const BASE_URL = process.argv[2] || 'https://www.vivaacademy.app';

interface HealthResponse {
  status: string;
  timestamp: string;
  services: {
    database: string;
    evolutionAPI: string;
    openai: string;
  };
}

async function testHealth(): Promise<void> {
  console.log('\n🏥 Testing Production Health\n');
  console.log('='.repeat(70));
  console.log(`URL: ${BASE_URL}/api/health`);

  try {
    const response = await axios.get<HealthResponse>(`${BASE_URL}/api/health`, {
      timeout: 10000,
    });

    console.log('\n✅ API is responding!');
    console.log('\n📊 Health Status:');
    console.log('='.repeat(70));
    console.log(`Overall Status: ${response.data.status}`);
    console.log(`Timestamp: ${response.data.timestamp}`);
    console.log('\n🔧 Services:');
    console.log(`  OpenAI: ${response.data.services.openai}`);
    console.log(`  Database: ${response.data.services.database}`);
    console.log(`  Evolution API: ${response.data.services.evolutionAPI}`);

    // Check each service
    let hasErrors = false;

    if (response.data.services.openai === 'not configured') {
      console.log('\n❌ OpenAI is not configured!');
      console.log('   Check OPENAI_API_KEY in Vercel environment variables');
      hasErrors = true;
    } else if (response.data.services.openai === 'configured') {
      console.log('\n✅ OpenAI is configured!');
    }

    if (response.data.services.database === 'unhealthy') {
      console.log('\n❌ Database is not healthy!');
      console.log('   Check Postgres configuration in Vercel');
      hasErrors = true;
    } else if (response.data.services.database === 'healthy') {
      console.log('✅ Database is healthy!');
    } else if (response.data.services.database === 'unknown') {
      console.log('\n⚠️  Database not configured yet');
    }

    if (response.data.services.evolutionAPI === 'unhealthy') {
      console.log('\n⚠️  Evolution API (WhatsApp) is not connected');
      console.log('   This is optional - only needed for WhatsApp integration');
    } else if (response.data.services.evolutionAPI === 'healthy') {
      console.log('✅ Evolution API is healthy!');
    }

    console.log('\n='.repeat(70));

    if (hasErrors) {
      console.log('\n⚠️  Some services need configuration');
      process.exit(1);
    } else {
      console.log('\n🎉 Production environment is ready!');
      process.exit(0);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.log(`\n❌ API returned error: ${error.response.status}`);
        console.log('Response:', error.response.data);
      } else if (error.code === 'ECONNREFUSED') {
        console.log('\n❌ Cannot connect to server');
        console.log('   Check if the URL is correct');
      } else if (error.code === 'ETIMEDOUT') {
        console.log('\n❌ Request timeout');
        console.log('   Server is not responding');
      } else {
        console.log('\n❌ Network error:', error.message);
      }
    } else {
      console.log('\n❌ Unknown error:', error);
    }

    console.log('\n💡 Make sure:');
    console.log('   1. Project is deployed on Vercel');
    console.log('   2. URL is correct (use: npm run test:production https://your-url.com)');
    console.log('   3. Health endpoint exists at /api/health');

    console.log('\n='.repeat(70));
    process.exit(1);
  }
}

async function testChat(): Promise<void> {
  console.log('\n💬 Testing Chat Endpoint\n');
  console.log('='.repeat(70));
  console.log(`URL: ${BASE_URL}/api/chat`);

  try {
    const response = await axios.post(
      `${BASE_URL}/api/chat`,
      {
        sessionId: 'test-session-' + Date.now(),
        message: 'Olá, apenas testando a conexão!',
      },
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('\n✅ Chat is working!');
    console.log('\n📝 Response:');
    console.log('='.repeat(70));
    console.log(response.data.response);
    console.log('\n🎫 Conversation ID:', response.data.conversationId);

    if (response.data.leadQualified) {
      console.log('🎯 Lead qualified:', response.data.leadQualified);
    }

    console.log('\n='.repeat(70));
    console.log('\n🎉 Chat endpoint is fully functional!');
    console.log('   OpenAI integration is working correctly.');
    console.log('\n='.repeat(70));

    process.exit(0);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.log(`\n❌ Chat endpoint error: ${error.response.status}`);
        console.log('Response:', JSON.stringify(error.response.data, null, 2));

        if (error.response.status === 500) {
          console.log('\n💡 Possible issues:');
          console.log('   - OpenAI API key invalid or missing');
          console.log('   - Database connection failed');
          console.log('   - Missing environment variables');
        } else if (error.response.status === 429) {
          console.log('\n⚠️  Rate limit exceeded - this is normal behavior');
        }
      } else {
        console.log('\n❌ Network error:', error.message);
      }
    } else {
      console.log('\n❌ Unknown error:', error);
    }

    console.log('\n='.repeat(70));
    process.exit(1);
  }
}

async function main(): Promise<void> {
  console.log('\n🧪 Testing Viva Academy Production Environment');
  console.log('='.repeat(70));

  // Test health first
  await testHealth();

  // If health passes, test chat
  await testChat();
}

main();
