/**
 * OpenAI Connection Test
 * Simple script to test OpenAI API connection
 * Run with: npm run test:openai
 */

import OpenAI from 'openai';

async function testOpenAI(): Promise<void> {
  console.log('\n🤖 Testing OpenAI Connection\n');
  console.log('='.repeat(70));

  // Check if API key is configured
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'sk-proj-xxxxx') {
    console.log('\n❌ OpenAI API Key not configured!\n');
    console.log('📝 Steps to get your API key:\n');
    console.log('1. Go to: https://platform.openai.com/api-keys');
    console.log('2. Click "Create new secret key"');
    console.log('3. Copy the key (starts with sk-proj- or sk-)');
    console.log('4. Add to .env file: OPENAI_API_KEY=your-key-here');
    console.log('\n💡 After adding the key, run: npm run test:openai\n');
    console.log('='.repeat(70));
    process.exit(1);
  }

  console.log('\n✅ API Key found');
  console.log(`📦 Model: ${process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'}`);
  console.log(`🌡️  Temperature: ${process.env.OPENAI_TEMPERATURE || '0.7'}`);

  try {
    console.log('\n🔄 Connecting to OpenAI...');

    const openai = new OpenAI({ apiKey });

    // Test 1: List models (quick check)
    console.log('\n1️⃣  Testing authentication...');
    const models = await openai.models.list();
    console.log(`   ✅ Authentication successful! Found ${models.data.length} models`);

    // Test 2: Send a test message
    console.log('\n2️⃣  Sending test message...');
    const startTime = Date.now();

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Respond in Portuguese Brazilian.',
        },
        {
          role: 'user',
          content: 'Responda apenas "Conexão estabelecida com sucesso!" para confirmar que está funcionando.',
        },
      ],
      max_tokens: 50,
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    });

    const duration = Date.now() - startTime;
    const response = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;

    console.log(`   ✅ Response received!`);
    console.log(`   📝 Message: "${response}"`);
    console.log(`   ⏱️  Duration: ${duration}ms`);
    console.log(`   🎫 Tokens used: ${tokensUsed}`);

    // Test 3: Context with Viva Academy
    console.log('\n3️⃣  Testing with Viva Academy context...');
    const startTime2 = Date.now();

    const completion2 = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'Você é o assistente virtual da Viva Academy, especializado em ajudar famílias brasileiras que desejam imigrar para os Estados Unidos.',
        },
        {
          role: 'user',
          content: 'Olá! Quero saber sobre imigração para os EUA.',
        },
      ],
      max_tokens: 150,
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    });

    const duration2 = Date.now() - startTime2;
    const response2 = completion2.choices[0]?.message?.content || '';
    const tokensUsed2 = completion2.usage?.total_tokens || 0;

    console.log(`   ✅ Context working!`);
    console.log(`   📝 Preview: "${response2.substring(0, 100)}..."`);
    console.log(`   ⏱️  Duration: ${duration2}ms`);
    console.log(`   🎫 Tokens used: ${tokensUsed2}`);

    // Success summary
    console.log('\n📊 Summary');
    console.log('='.repeat(70));
    console.log(`✅ Authentication: OK`);
    console.log(`✅ API Response: OK`);
    console.log(`✅ Viva Academy Context: OK`);
    console.log(`\n💰 Estimated cost: ~$${((tokensUsed + tokensUsed2) * 0.00003).toFixed(4)}`);
    console.log(`   (Based on GPT-4 Turbo pricing: $0.03/1K tokens)`);

    console.log('\n🎉 OpenAI is ready to use!');
    console.log('\n💡 Next steps:');
    console.log('   1. Configure Vercel Postgres: npm run db:init');
    console.log('   2. Configure Vercel KV for rate limiting');
    console.log('   3. Test full integration: npm run test:integrations');
    console.log('\n='.repeat(70));
    console.log('');

    process.exit(0);
  } catch (error) {
    console.log('\n❌ Connection failed!\n');

    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      if (errorMessage.includes('invalid api key') || errorMessage.includes('incorrect api key')) {
        console.log('🔑 Invalid API Key');
        console.log('\nThe API key is not valid. Please check:');
        console.log('1. The key is complete (not truncated)');
        console.log('2. The key starts with "sk-proj-" or "sk-"');
        console.log('3. You copied it correctly from OpenAI dashboard');
        console.log('\n💡 Get a new key: https://platform.openai.com/api-keys');
      } else if (errorMessage.includes('quota') || errorMessage.includes('insufficient_quota')) {
        console.log('💳 Insufficient Quota');
        console.log('\nYour OpenAI account has no credits available.');
        console.log('\n💡 Next steps:');
        console.log('1. Add payment method: https://platform.openai.com/account/billing');
        console.log('2. Add credits to your account');
        console.log('3. Check usage limits: https://platform.openai.com/account/limits');
      } else if (errorMessage.includes('rate limit')) {
        console.log('⏱️  Rate Limit Exceeded');
        console.log('\nYou are sending too many requests.');
        console.log('Wait a moment and try again.');
      } else if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
        console.log('🌐 Network Error');
        console.log('\nCould not connect to OpenAI servers.');
        console.log('Check your internet connection and try again.');
      } else {
        console.log('Error:', error.message);
      }
    } else {
      console.log('Unknown error:', error);
    }

    console.log('\n='.repeat(70));
    console.log('');
    process.exit(1);
  }
}

// Run the test
testOpenAI();
