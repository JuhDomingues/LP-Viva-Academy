import axios from 'axios';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME;

console.log('\n🔍 TESTE DE CONEXÃO DETALHADO\n');
console.log('URL:', EVOLUTION_API_URL);
console.log('Instance:', EVOLUTION_INSTANCE_NAME);
console.log('API Key:', EVOLUTION_API_KEY ? `***${EVOLUTION_API_KEY.slice(-8)}` : 'NOT SET');

const client = axios.create({
  baseURL: EVOLUTION_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'apikey': EVOLUTION_API_KEY || '',
  },
  timeout: 10000,
});

try {
  console.log('\n📡 Fazendo requisição...');
  const response = await client.get(`/instance/connectionState/${EVOLUTION_INSTANCE_NAME}`);

  console.log('\n✅ Resposta recebida:');
  console.log('Status Code:', response.status);
  console.log('Response Data:', JSON.stringify(response.data, null, 2));

  if (response.data.instance?.state) {
    console.log('\n📱 Estado da Conexão:', response.data.instance.state);
  } else {
    console.log('\n⚠️  Campo "state" não encontrado na resposta');
  }
} catch (error: any) {
  console.error('\n❌ ERRO:');
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', JSON.stringify(error.response.data, null, 2));
  } else {
    console.error(error.message);
  }
}
