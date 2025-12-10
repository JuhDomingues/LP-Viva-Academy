import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSessionById, getActiveConversation, getConversationMessages } from '../../../lib/db/client';

interface DbMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  message_type: string;
  media_url: string | null;
  tokens_used: number | null;
  created_at: Date;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
  const origin = req.headers.origin || '';

  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId } = req.query;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid sessionId' });
    }

    // Get session from database
    const session = await getSessionById(sessionId);

    if (!session) {
      // If session doesn't exist, return empty history (not an error)
      return res.status(200).json({
        messages: [],
        conversationId: null,
      });
    }

    // Get active conversation for this session
    const conversation = await getActiveConversation(session.id);

    if (!conversation) {
      // No active conversation, return empty history
      return res.status(200).json({
        messages: [],
        conversationId: null,
      });
    }

    // Get messages from the conversation
    const dbMessages = await getConversationMessages(conversation.id, 100);

    // Format messages for frontend (exclude system messages)
    const messages = (dbMessages as DbMessage[])
      .filter((msg) => msg.role !== 'system')
      .map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.created_at,
      }));

    return res.status(200).json({
      messages,
      conversationId: conversation.id,
    });

  } catch (error) {
    console.error('Chat history API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export const config = {
  maxDuration: 10, // History fetching should be fast
};
