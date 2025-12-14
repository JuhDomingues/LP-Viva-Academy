#!/usr/bin/env tsx
import 'dotenv/config';
import axios from 'axios';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME;

// Get webhook URL from command line or use default
const WEBHOOK_URL = process.argv[2] || 'https://www.vivaacademy.app/api/webhook';

async function setupWebhook() {
  console.log('🔧 Configurando webhook na Evolution API...\n');

  // Validate environment variables
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE_NAME) {
    console.error('❌ Erro: Variáveis de ambiente não configuradas!');
    console.error('\nConfigure as seguintes variáveis no arquivo .env:');
    console.error('- EVOLUTION_API_URL');
    console.error('- EVOLUTION_API_KEY');
    console.error('- EVOLUTION_INSTANCE_NAME\n');
    process.exit(1);
  }

  console.log('📋 Configurações:');
  console.log(`   Evolution API: ${EVOLUTION_API_URL}`);
  console.log(`   Instância: ${EVOLUTION_INSTANCE_NAME}`);
  console.log(`   Webhook URL: ${WEBHOOK_URL}\n`);

  try {
    // Check instance connection status
    console.log('1️⃣ Verificando status da instância...');
    const statusResponse = await axios.get(
      `${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE_NAME}`,
      {
        headers: {
          'apikey': EVOLUTION_API_KEY,
        },
      }
    );

    const connectionState = statusResponse.data.state;
    console.log(`   Status: ${connectionState}`);

    if (connectionState !== 'open') {
      console.warn('\n⚠️  Aviso: A instância não está conectada (QR Code pode não ter sido escaneado)');
      console.warn('   Continue com a configuração do webhook, mas a instância precisa ser conectada para funcionar.\n');
    } else {
      console.log('   ✅ Instância conectada!\n');
    }

    // Configure webhook
    console.log('2️⃣ Configurando webhook...');
    const webhookResponse = await axios.post(
      `${EVOLUTION_API_URL}/webhook/set/${EVOLUTION_INSTANCE_NAME}`,
      {
        webhook: {
          enabled: true,
          url: WEBHOOK_URL,
          webhookByEvents: true,
          events: [
            'MESSAGES_UPSERT',
            'MESSAGES_UPDATE',
            'CONNECTION_UPDATE',
          ],
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY,
        },
      }
    );

    console.log('   ✅ Webhook configurado com sucesso!\n');
    console.log('📊 Detalhes da configuração:');
    console.log(JSON.stringify(webhookResponse.data, null, 2));

    console.log('\n✅ Configuração concluída!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Certifique-se de que o webhook URL está acessível publicamente');
    console.log('   2. Se a instância não estiver conectada, escaneie o QR Code');
    console.log('   3. Envie uma mensagem de teste no WhatsApp');
    console.log('   4. Verifique os logs no Vercel Dashboard\n');

  } catch (error: any) {
    console.error('\n❌ Erro ao configurar webhook:');

    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Mensagem: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      console.error('   Nenhuma resposta recebida da Evolution API');
      console.error('   Verifique se a URL da API está correta:', EVOLUTION_API_URL);
    } else {
      console.error(`   ${error.message}`);
    }

    console.error('\n💡 Dicas de troubleshooting:');
    console.error('   - Verifique se a Evolution API Key está correta');
    console.error('   - Confirme se o nome da instância está correto');
    console.error('   - Teste se a Evolution API está acessível');
    console.error('   - Revise o arquivo WEBHOOK.md para mais detalhes\n');

    process.exit(1);
  }
}

// Run
setupWebhook();
