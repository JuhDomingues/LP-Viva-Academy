import type { VercelRequest, VercelResponse } from '@vercel/node';
import { evolutionClient, type EvolutionWebhookPayload } from '../lib/whatsapp/evolution-client.js';
import { chatService } from '../lib/services/chat-service.js';
import { rateLimitWhatsApp } from '../lib/utils/rate-limiter.js';
import crypto from 'crypto-js';

function validateWebhookSignature(req: VercelRequest): boolean {
  const signature = req.headers['x-webhook-signature'] as string;
  const webhookSecret = process.env.WEBHOOK_SECRET || '';

  if (!signature || !webhookSecret) {
    // If no signature validation is configured, allow (for development)
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    return false;
  }

  const expectedSignature = crypto.HmacSHA256(
    JSON.stringify(req.body),
    webhookSecret
  ).toString();

  return signature === expectedSignature;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate webhook signature (TEMPORARILY DISABLED FOR DEBUG)
  // TODO: Re-enable after confirming webhook works
  // if (!validateWebhookSignature(req)) {
  //   console.error('Invalid webhook signature');
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }

  // Debug logging
  console.log('🔍 Webhook called:', {
    method: req.method,
    headers: req.headers,
    body: JSON.stringify(req.body).substring(0, 200),
  });

  try {
    const payload: EvolutionWebhookPayload = req.body;

    // Only process message events (accept both formats from Evolution API)
    const eventLower = payload.event?.toLowerCase().replace('_', '.');
    if (eventLower !== 'messages.upsert') {
      return res.status(200).json({ status: 'ignored', reason: 'not a message event' });
    }

    // Extract message
    const extracted = evolutionClient.extractMessage(payload);
    if (!extracted) {
      return res.status(200).json({ status: 'ignored', reason: 'no text content or sent by bot' });
    }

    const { text, phoneNumber } = extracted;

    // Rate limiting for WhatsApp
    const rateLimitResult = await rateLimitWhatsApp(phoneNumber);
    if (!rateLimitResult.allowed) {
      await evolutionClient.sendTextMessage({
        phoneNumber,
        message: 'Você atingiu o limite de mensagens. Por favor, aguarde alguns minutos antes de continuar.',
      });
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    // Get or create session
    const session = await chatService.getOrCreateSession(phoneNumber, 'whatsapp');

    // Get or create conversation
    const conversation = await chatService.getOrCreateConversation(session.id);

    // Show typing indicator
    await evolutionClient.setPresence(phoneNumber, 'composing');

    // Process message with AI
    const result = await chatService.processMessage({
      sessionId: session.id,
      conversationId: conversation.id,
      userMessage: text,
      channel: 'whatsapp',
    });

    // Send AI response
    await evolutionClient.sendTextMessage({
      phoneNumber,
      message: result.response,
    });

    // If should transfer to human, log for notification
    if (result.shouldTransferToHuman) {
      console.log('Human handoff requested for:', phoneNumber);
      // TODO: Implement notification to human agent (Slack, email, etc.)
    }

    return res.status(200).json({
      status: 'processed',
      conversationId: result.conversationId,
      leadQualified: result.leadQualified,
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Increase timeout for AI processing (requires Vercel Pro)
export const config = {
  maxDuration: 60,
};
