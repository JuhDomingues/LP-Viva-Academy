import axios from 'axios';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME;
const WHATSAPP_PHONE_NUMBER = process.env.WHATSAPP_PHONE_NUMBER;

console.log('\n🔍 DIAGNÓSTICO DA INTEGRAÇÃO WHATSAPP\n');
console.log('━'.repeat(50));

// 1. Verificar variáveis de ambiente
console.log('\n1️⃣  VERIFICANDO VARIÁVEIS DE AMBIENTE...\n');

const requiredVars = {
  'EVOLUTION_API_URL': EVOLUTION_API_URL,
  'EVOLUTION_API_KEY': EVOLUTION_API_KEY,
  'EVOLUTION_INSTANCE_NAME': EVOLUTION_INSTANCE_NAME,
  'WHATSAPP_PHONE_NUMBER': WHATSAPP_PHONE_NUMBER,
};

let hasAllVars = true;
for (const [key, value] of Object.entries(requiredVars)) {
  if (!value || value.includes('xxxxx') || value.includes('your-')) {
    console.log(`❌ ${key}: NÃO CONFIGURADA`);
    hasAllVars = false;
  } else {
    console.log(`✅ ${key}: ${key === 'EVOLUTION_API_KEY' ? '***' + value.slice(-8) : value}`);
  }
}

if (!hasAllVars) {
  console.log('\n❌ ERRO: Variáveis de ambiente não configuradas corretamente!');
  process.exit(1);
}

// 2. Testar conexão com Evolution API
console.log('\n2️⃣  TESTANDO CONEXÃO COM EVOLUTION API...\n');

const client = axios.create({
  baseURL: EVOLUTION_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'apikey': EVOLUTION_API_KEY || '',
  },
  timeout: 10000,
});

try {
  const response = await client.get(`/instance/connectionState/${EVOLUTION_INSTANCE_NAME}`);
  const state = response.data.instance?.state;

  if (state === 'open') {
    console.log(`✅ Instância conectada: ${EVOLUTION_INSTANCE_NAME}`);
    console.log(`   Status: ${state}`);
  } else {
    console.log(`⚠️  Instância NÃO está conectada!`);
    console.log(`   Status atual: ${state}`);
    console.log('\n📱 AÇÃO NECESSÁRIA: Escaneie o QR Code na Evolution API para conectar o WhatsApp');
  }
} catch (error: any) {
  console.log(`❌ Erro ao conectar com Evolution API:`);
  if (error.response) {
    console.log(`   Status: ${error.response.status}`);
    console.log(`   Mensagem: ${error.response.data?.message || error.message}`);
  } else if (error.code === 'ECONNREFUSED') {
    console.log(`   URL não acessível: ${EVOLUTION_API_URL}`);
  } else {
    console.log(`   ${error.message}`);
  }
  console.log('\n⚠️  Verifique se a URL e API Key estão corretas!');
}

// 3. Verificar configuração do webhook
console.log('\n3️⃣  VERIFICANDO CONFIGURAÇÃO DO WEBHOOK...\n');

try {
  const response = await client.get(`/webhook/find/${EVOLUTION_INSTANCE_NAME}`);
  const webhook = response.data;

  if (webhook && webhook.url) {
    console.log(`✅ Webhook configurado:`);
    console.log(`   URL: ${webhook.url}`);
    console.log(`   Enabled: ${webhook.enabled}`);
    console.log(`   Events: ${webhook.events?.join(', ') || 'N/A'}`);

    // Verificar se é a URL correta
    if (!webhook.url.includes('/api/webhook')) {
      console.log(`\n⚠️  ATENÇÃO: URL do webhook pode estar incorreta!`);
      console.log(`   Esperado: https://www.vivaacademy.app/api/webhook`);
    }

    if (!webhook.enabled) {
      console.log(`\n⚠️  ATENÇÃO: Webhook está desabilitado!`);
    }

    if (!webhook.events?.includes('messages.upsert')) {
      console.log(`\n⚠️  ATENÇÃO: Evento 'messages.upsert' não está configurado!`);
    }
  } else {
    console.log(`⚠️  Webhook NÃO configurado para esta instância!`);
    console.log('\n📝 Configure o webhook com:');
    console.log(`   URL: https://www.vivaacademy.app/api/webhook`);
    console.log(`   Events: messages.upsert`);
  }
} catch (error: any) {
  console.log(`❌ Erro ao verificar webhook:`);
  console.log(`   ${error.response?.data?.message || error.message}`);
}

// 4. Teste de envio de mensagem (opcional)
console.log('\n4️⃣  TESTE DE ENVIO DE MENSAGEM\n');

const testPhone = process.argv[2];

if (testPhone) {
  try {
    console.log(`Enviando mensagem de teste para: ${testPhone}...`);

    await client.post(`/message/sendText/${EVOLUTION_INSTANCE_NAME}`, {
      number: testPhone,
      text: '🤖 Teste de diagnóstico - Se você recebeu esta mensagem, a integração está funcionando!',
    });

    console.log(`✅ Mensagem enviada com sucesso!`);
    console.log(`   Verifique o WhatsApp do número: ${testPhone}`);
  } catch (error: any) {
    console.log(`❌ Erro ao enviar mensagem:`);
    console.log(`   ${error.response?.data?.message || error.message}`);
  }
} else {
  console.log(`ℹ️  Para testar envio de mensagem, execute:`);
  console.log(`   npm run diagnose -- 5511999999999`);
}

// 5. Resumo e próximos passos
console.log('\n━'.repeat(50));
console.log('\n📋 PRÓXIMOS PASSOS:\n');
console.log('1. Se a instância NÃO está conectada:');
console.log('   → Acesse o painel da Evolution API e escaneie o QR Code');
console.log('');
console.log('2. Se o webhook NÃO está configurado:');
console.log('   → Configure na Evolution API:');
console.log('      URL: https://www.vivaacademy.app/api/webhook');
console.log('      Event: messages.upsert');
console.log('');
console.log('3. Se tudo está OK mas ainda não responde:');
console.log('   → Verifique os logs da Vercel em:');
console.log('      https://vercel.com/seu-projeto/logs');
console.log('');
console.log('4. Teste enviando mensagem para o WhatsApp conectado');
console.log('   e verifique se o webhook é chamado\n');
