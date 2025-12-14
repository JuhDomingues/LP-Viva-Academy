#!/usr/bin/env tsx
import 'dotenv/config';
import axios from 'axios';

const MAUTIC_URL = 'https://mkt.vivaacademy.co';
const FORM_ID = '3';
const FORM_NAME = 'formagenteia';

async function testMauticSubmission() {
  console.log('🧪 Testando envio ao Mautic...\n');

  const testData = {
    nome: 'Teste Claude',
    email: 'teste@claude.ai',
    telefone: '11999999999',
  };

  console.log('📋 Dados de teste:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('');

  try {
    // Test 1: URL-encoded (like HTML form)
    console.log('1️⃣ Testando com application/x-www-form-urlencoded...');
    const formData = new URLSearchParams();
    formData.append('mauticform[nome]', testData.nome);
    formData.append('mauticform[email]', testData.email);
    formData.append('mauticform[telefone]', testData.telefone);
    formData.append('mauticform[formId]', FORM_ID);
    formData.append('mauticform[formName]', FORM_NAME);
    formData.append('mauticform[submit]', '1');
    formData.append('mauticform[return]', '');

    console.log('📤 URL:', `${MAUTIC_URL}/form/submit?formId=${FORM_ID}`);
    console.log('📦 Payload:', formData.toString());
    console.log('');

    const response1 = await axios.post(
      `${MAUTIC_URL}/form/submit?formId=${FORM_ID}`,
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (compatible; Viva-Academy-Test/1.0)',
        },
        maxRedirects: 5,
        validateStatus: () => true, // Accept any status
      }
    );

    console.log('✅ Resposta recebida:');
    console.log('   Status:', response1.status);
    console.log('   Headers:', JSON.stringify(response1.headers, null, 2));
    console.log('   Body (primeiros 500 chars):', response1.data?.toString().substring(0, 500));
    console.log('');

    // Check for success indicators
    if (response1.status === 200 || response1.status === 302) {
      console.log('✅ Envio bem-sucedido!');
    } else {
      console.log('⚠️  Status inesperado:', response1.status);
    }

  } catch (error: any) {
    console.error('❌ Erro ao enviar para Mautic:');
    console.error('   Mensagem:', error.message);

    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Headers:', error.response.headers);
      console.error('   Data:', error.response.data?.toString().substring(0, 500));
    }
  }

  console.log('\n' + '='.repeat(60));

  try {
    // Test 2: Multipart form data
    console.log('\n2️⃣ Testando com multipart/form-data...');

    const FormData = (await import('form-data')).default;
    const form = new FormData();
    form.append('mauticform[nome]', testData.nome);
    form.append('mauticform[email]', testData.email);
    form.append('mauticform[telefone]', testData.telefone);
    form.append('mauticform[formId]', FORM_ID);
    form.append('mauticform[formName]', FORM_NAME);
    form.append('mauticform[submit]', '1');

    const response2 = await axios.post(
      `${MAUTIC_URL}/form/submit?formId=${FORM_ID}`,
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
        maxRedirects: 5,
        validateStatus: () => true,
      }
    );

    console.log('✅ Resposta recebida:');
    console.log('   Status:', response2.status);
    console.log('   Body (primeiros 500 chars):', response2.data?.toString().substring(0, 500));
    console.log('');

  } catch (error: any) {
    console.error('❌ Erro no teste 2:', error.message);
  }

  console.log('\n💡 Próximos passos:');
  console.log('   1. Verifique no painel do Mautic se o lead foi criado');
  console.log('   2. URL do Mautic: https://mkt.vivaacademy.co');
  console.log('   3. Procure por email: teste@claude.ai');
  console.log('');
}

testMauticSubmission();
