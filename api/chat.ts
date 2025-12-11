import type { VercelRequest, VercelResponse } from '@vercel/node';
import { chatService } from '../lib/services/chat-service.js';
import { rateLimitWeb } from '../lib/utils/rate-limiter.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
  const origin = req.headers.origin || '';

  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Missing required fields: sessionId and message' });
    }

    // Rate limiting by IP
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
                     req.socket.remoteAddress ||
                     'unknown';

    const rateLimitResult = await rateLimitWeb(clientIp);

    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: rateLimitResult.retryAfter,
      });
    }

    // Get or create session
    const session = await chatService.getOrCreateSession(sessionId, 'web');

    // Get or create conversation
    const conversation = await chatService.getOrCreateConversation(session.id);

    // Process message
    const result = await chatService.processMessage({
      sessionId: session.id,
      conversationId: conversation.id,
      userMessage: message,
      channel: 'web',
    });

    // Prepare suggestions if lead should be offered subscription
    const suggestions = result.shouldOfferSubscription ? [
      'Quero assinar agora',
      'Falar com consultor',
      'Preciso de mais informações'
    ] : null;

    return res.status(200).json({
      response: result.response,
      conversationId: result.conversationId,
      suggestions,
      leadQualified: result.leadQualified,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export const config = {
  maxDuration: 60,
};
