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
const WEBHOOK_URL = 'https://www.vivaacademy.app/api/webhook';

console.log('\n🔧 CONFIGURANDO WEBHOOK DA EVOLUTION API\n');
console.log('━'.repeat(50));

const client = axios.create({
  baseURL: EVOLUTION_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'apikey': EVOLUTION_API_KEY || '',
  },
  timeout: 10000,
});

try {
  console.log(`\n📡 Configurando webhook para instância: ${EVOLUTION_INSTANCE_NAME}\n`);

  // Configurar webhook com o evento correto
  const webhookConfig = {
    url: WEBHOOK_URL,
    enabled: true,
    webhookByEvents: true,
    events: [
      'messages.upsert',  // Este é o evento que o código espera
    ],
  };

  console.log('Payload do webhook:');
  console.log(JSON.stringify(webhookConfig, null, 2));
  console.log('');

  const response = await client.post(
    `/webhook/set/${EVOLUTION_INSTANCE_NAME}`,
    webhookConfig
  );

  console.log('✅ Webhook configurado com sucesso!\n');
  console.log('Resposta da API:');
  console.log(JSON.stringify(response.data, null, 2));
  console.log('');

  console.log('━'.repeat(50));
  console.log('\n✅ WEBHOOK CONFIGURADO!\n');
  console.log('📝 Detalhes:');
  console.log(`   URL: ${WEBHOOK_URL}`);
  console.log(`   Evento: messages.upsert`);
  console.log(`   Enabled: true`);
  console.log('');
  console.log('🧪 PRÓXIMO PASSO:');
  console.log('   Envie uma mensagem para o WhatsApp e veja se o agente responde!');
  console.log('');

} catch (error: any) {
  console.log('❌ Erro ao configurar webhook:\n');

  if (error.response) {
    console.log(`Status: ${error.response.status}`);
    console.log(`Mensagem: ${JSON.stringify(error.response.data, null, 2)}`);
  } else {
    console.log(error.message);
  }

  console.log('\n⚠️  Tente configurar manualmente no painel da Evolution API:');
  console.log(`   URL: ${WEBHOOK_URL}`);
  console.log(`   Events: messages.upsert (com ponto e minúsculo)`);

  process.exit(1);
}
