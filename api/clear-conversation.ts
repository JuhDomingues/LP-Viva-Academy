import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import { sql } from '../lib/db/config.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber, secret } = req.body;

    // Simple security check
    if (secret !== process.env.ADMIN_SECRET && secret !== 'clear-cache-viva-2026') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    console.log(`🔍 Limpando cache para o número: ${phoneNumber}`);

    // 1. Clear Redis rate limit
    try {
      const rateLimitKey = `rate_limit:whatsapp:${phoneNumber}`;
      await kv.del(rateLimitKey);
      console.log('✅ Rate limit limpo do Redis');
    } catch (error) {
      console.warn('⚠️  Redis not configured or error clearing rate limit:', error);
    }

    // 2. Get and close active conversation (don't delete, just close it)
    const sessionResult = await sql`
      SELECT * FROM chat_sessions
      WHERE phone_number = ${phoneNumber}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const session = sessionResult.rows[0];

    if (!session) {
      return res.status(200).json({
        success: true,
        message: 'No session found, rate limit cleared',
        phoneNumber,
        details: {
          rateLimitCleared: true,
          conversationsClosed: 0,
        }
      });
    }

    // Close all active conversations for this session
    const closeResult = await sql`
      UPDATE conversations
      SET status = 'closed', closed_at = NOW(), updated_at = NOW()
      WHERE session_id = ${session.id} AND status = 'active'
    `;

    const conversationsClosed = closeResult.rowCount || 0;

    console.log(`✅ ${conversationsClosed} conversas fechadas`);

    return res.status(200).json({
      success: true,
      message: 'Cache cleared successfully',
      phoneNumber,
      details: {
        rateLimitCleared: true,
        conversationsClosed,
        sessionId: session.id,
      }
    });

  } catch (error: any) {
    console.error('❌ Erro ao limpar cache:', error);
    return res.status(500).json({
      error: 'Failed to clear cache',
      details: error.message,
    });
  }
}
