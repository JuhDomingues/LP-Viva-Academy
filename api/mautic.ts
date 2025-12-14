import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const MAUTIC_URL = 'https://mkt.vivaacademy.co';
const FORM_ID = '3';
const FORM_NAME = 'formagenteia';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
  const origin = req.headers.origin || '';

  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nome, email, telefone } = req.body;

    // Validate required fields
    if (!nome || !email || !telefone) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['nome', 'email', 'telefone'],
      });
    }

    // Prepare form data for Mautic
    const formData = new URLSearchParams();
    formData.append('mauticform[nome]', nome);
    formData.append('mauticform[email]', email);
    formData.append('mauticform[telefone]', telefone);
    formData.append('mauticform[formId]', FORM_ID);
    formData.append('mauticform[formName]', FORM_NAME);
    formData.append('mauticform[submit]', '1');
    formData.append('mauticform[return]', '');

    // Submit to Mautic
    const mauticResponse = await axios.post(
      `${MAUTIC_URL}/form/submit?formId=${FORM_ID}`,
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (compatible; Viva-Academy-Bot/1.0)',
        },
        maxRedirects: 5,
        validateStatus: () => true, // Accept any status code
      }
    );

    // Mautic returns HTML, not JSON. Status 200 is success.
    if (mauticResponse.status === 200) {
      console.log('✅ Mautic submission successful:', {
        nome,
        email,
        telefone,
        status: mauticResponse.status,
      });

      return res.status(200).json({
        success: true,
        message: 'Dados enviados com sucesso para o Mautic',
      });
    }

    // If not 200, log the error
    console.error('⚠️  Mautic unexpected status:', {
      status: mauticResponse.status,
      data: mauticResponse.data?.toString().substring(0, 200),
    });

    return res.status(200).json({
      success: true,
      message: 'Dados processados',
      warning: `Status: ${mauticResponse.status}`,
    });

  } catch (error: any) {
    console.error('❌ Mautic submission error:', {
      message: error.message,
      requestBody: req.body,
    });

    return res.status(500).json({
      error: 'Failed to submit to Mautic',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
