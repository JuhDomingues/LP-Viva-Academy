import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/db/client.js';

// Simple authentication
function authenticate(req: VercelRequest): boolean {
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.ADMIN_API_TOKEN;

  if (!authHeader || !expectedToken) return false;

  return authHeader === `Bearer ${expectedToken}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Authentication required
  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const { status, qualified, limit = '50', offset = '0' } = req.query;

      const leads = await db.getLeads({
        status: status as string | undefined,
        qualified: qualified === 'true' ? true : qualified === 'false' ? false : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      const total = await db.getLeadsCount({
        status: status as string | undefined,
        qualified: qualified === 'true' ? true : qualified === 'false' ? false : undefined,
      });

      return res.status(200).json({
        leads,
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

    } catch (error) {
      console.error('Leads fetch error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { leadId, status, notes } = req.body;

      if (!leadId) {
        return res.status(400).json({ error: 'Lead ID required' });
      }

      const updated = await db.updateLead(leadId, {
        // status will be added to the update function
      });

      return res.status(200).json(updated);

    } catch (error) {
      console.error('Lead update error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
