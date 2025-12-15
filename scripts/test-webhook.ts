import axios from 'axios';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const WEBHOOK_URL = process.argv[2] || 'https://www.vivaacademy.app/api/webhook';
const TEST_PHONE = process.argv[3] || '5511999999999';

console.log('\n🧪 TESTE DO WEBHOOK - Simulando Evolution API\n');
console.log('━'.repeat(50));
console.log(`\nWebhook URL: ${WEBHOOK_URL}`);
console.log(`Telefone de teste: ${TEST_PHONE}\n`);

// Simular payload da Evolution API
const mockPayload = {
  event: 'MESSAGES_UPSERT', // Usando o formato que a Evolution API envia
  instance: 'Viva_academy',
  data: {
    key: {
      remoteJid: `${TEST_PHONE}@s.whatsapp.net`,
      fromMe: false,
      id: 'TEST_MESSAGE_ID_' + Date.now(),
    },
    message: {
      conversation: 'Olá! Este é um teste do webhook.',
    },
    messageTimestamp: Math.floor(Date.now() / 1000),
    pushName: 'Teste',
  },
};

console.log('📦 Payload de teste:');
console.log(JSON.stringify(mockPayload, null, 2));
console.log('');

async function testWebhook() {
  try {
    console.log('📤 Enviando requisição para o webhook...\n');

    const response = await axios.post(WEBHOOK_URL, mockPayload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    console.log('✅ Webhook respondeu com sucesso!\n');
    console.log(`Status: ${response.status}`);
    console.log('Resposta:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('');

    if (response.data.status === 'processed') {
      console.log('🎉 SUCESSO! O webhook processou a mensagem corretamente!');
      console.log(`   Conversation ID: ${response.data.conversationId}`);
      console.log(`   Lead Qualified: ${response.data.leadQualified}`);
    } else if (response.data.status === 'ignored') {
      console.log(`⚠️  Mensagem ignorada: ${response.data.reason}`);
    }

  } catch (error: any) {
    console.log('❌ ERRO ao chamar o webhook:\n');

    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Resposta: ${JSON.stringify(error.response.data, null, 2)}`);

      if (error.response.status === 401) {
        console.log('\n⚠️  ATENÇÃO: Webhook signature validation falhou!');
        console.log('   O webhook está validando assinatura mas o teste não enviou.');
        console.log('   Isso é normal em produção por segurança.');
      } else if (error.response.status === 500) {
        console.log('\n⚠️  ERRO INTERNO no webhook!');
        console.log('   Verifique os logs da Vercel para mais detalhes.');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`Não foi possível conectar: ${WEBHOOK_URL}`);
      console.log('Verifique se a URL está correta e acessível.');
    } else {
      console.log(error.message);
    }
  }
}

console.log('━'.repeat(50));
console.log('');

await testWebhook();

console.log('\n━'.repeat(50));
console.log('\n💡 DICAS:\n');
console.log('1. Se recebeu erro 401 (Unauthorized):');
console.log('   → É normal! O webhook valida assinatura em produção');
console.log('   → Significa que o webhook está acessível\n');
console.log('2. Se recebeu erro 500:');
console.log('   → Há um erro no código do webhook');
console.log('   → Verifique os logs da Vercel\n');
console.log('3. Se deu timeout ou connection refused:');
console.log('   → O webhook não está acessível');
console.log('   → Verifique o deploy da Vercel\n');
console.log('4. Se processou com sucesso:');
console.log('   → O webhook está funcionando!');
console.log('   → O problema está na Evolution API não chamar o webhook\n');
