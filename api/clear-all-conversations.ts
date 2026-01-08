import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import { sql } from '../lib/db/config.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { secret } = req.body;

    // Simple security check
    if (secret !== process.env.ADMIN_SECRET && secret !== 'clear-cache-viva-2026') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    console.log('🔍 Limpando TODAS as conversas e cache...');

    // 1. Clear ALL Redis keys (rate limits)
    let redisKeysCleared = 0;
    try {
      // Get all rate limit keys
      const keys = await kv.keys('rate_limit:*');
      if (keys && keys.length > 0) {
        await Promise.all(keys.map(key => kv.del(key)));
        redisKeysCleared = keys.length;
      }
      console.log(`✅ ${redisKeysCleared} chaves de rate limit limpas do Redis`);
    } catch (error) {
      console.warn('⚠️  Redis error:', error);
    }

    // 2. Delete all messages
    const messagesResult = await sql`DELETE FROM messages`;
    const messagesDeleted = messagesResult.rowCount || 0;
    console.log(`✅ ${messagesDeleted} mensagens deletadas`);

    // 3. Delete all leads
    const leadsResult = await sql`DELETE FROM leads`;
    const leadsDeleted = leadsResult.rowCount || 0;
    console.log(`✅ ${leadsDeleted} leads deletados`);

    // 4. Delete all conversations
    const conversationsResult = await sql`DELETE FROM conversations`;
    const conversationsDeleted = conversationsResult.rowCount || 0;
    console.log(`✅ ${conversationsDeleted} conversas deletadas`);

    // 5. Delete all chat events
    const eventsResult = await sql`DELETE FROM chat_events`;
    const eventsDeleted = eventsResult.rowCount || 0;
    console.log(`✅ ${eventsDeleted} eventos deletados`);

    // 6. Delete all sessions
    const sessionsResult = await sql`DELETE FROM chat_sessions`;
    const sessionsDeleted = sessionsResult.rowCount || 0;
    console.log(`✅ ${sessionsDeleted} sessões deletadas`);

    console.log('✅ Todas as conversas e cache foram limpos!');

    return res.status(200).json({
      success: true,
      message: 'All conversations and cache cleared successfully',
      details: {
        redisKeysCleared,
        messagesDeleted,
        leadsDeleted,
        conversationsDeleted,
        eventsDeleted,
        sessionsDeleted,
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
