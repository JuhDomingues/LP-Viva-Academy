import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/db/client';
import { evolutionClient } from '../lib/whatsapp/evolution-client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      evolutionAPI: 'unknown',
      openai: 'configured',
    },
  };

  // Check database
  try {
    const dbHealthy = await db.checkDatabaseHealth();
    health.services.database = dbHealthy ? 'healthy' : 'unhealthy';
  } catch (error) {
    health.services.database = 'error';
    health.status = 'degraded';
  }

  // Check EvolutionAPI
  try {
    const evolutionHealthy = await evolutionClient.checkHealth();
    health.services.evolutionAPI = evolutionHealthy ? 'healthy' : 'unhealthy';
  } catch (error) {
    health.services.evolutionAPI = 'error';
    health.status = 'degraded';
  }

  // Check OpenAI configuration
  if (!process.env.OPENAI_API_KEY) {
    health.services.openai = 'not configured';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;

  return res.status(statusCode).json(health);
}
