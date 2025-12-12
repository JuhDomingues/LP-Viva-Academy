// Import config first to set correct POSTGRES_URL
import './config.js';
import { sql } from '@vercel/postgres';

// Session operations
export interface CreateSessionParams {
  channel: 'whatsapp' | 'web';
  phoneNumber?: string | null;
  sessionId?: string | null;
  userName?: string;
  userEmail?: string;
}

export async function createSession(params: CreateSessionParams) {
  const { channel, phoneNumber, sessionId, userName, userEmail } = params;

  const result = await sql`
    INSERT INTO chat_sessions (channel, phone_number, session_id, user_name, user_email)
    VALUES (${channel}, ${phoneNumber}, ${sessionId}, ${userName}, ${userEmail})
    RETURNING *
  `;

  return result.rows[0];
}

export async function getSessionByPhone(phoneNumber: string) {
  const result = await sql`
    SELECT * FROM chat_sessions
    WHERE phone_number = ${phoneNumber}
    ORDER BY created_at DESC
    LIMIT 1
  `;

  return result.rows[0] || null;
}

export async function getSessionById(sessionId: string) {
  const result = await sql`
    SELECT * FROM chat_sessions
    WHERE session_id = ${sessionId}
    ORDER BY created_at DESC
    LIMIT 1
  `;

  return result.rows[0] || null;
}

export async function updateSessionActivity(sessionId: string) {
  await sql`
    UPDATE chat_sessions
    SET last_activity_at = NOW()
    WHERE id = ${sessionId}
  `;
}

// Conversation operations
export interface CreateConversationParams {
  sessionId: string;
}

export async function createConversation(params: CreateConversationParams) {
  const { sessionId } = params;

  const result = await sql`
    INSERT INTO conversations (session_id, status, lead_stage)
    VALUES (${sessionId}, 'active', 'initial')
    RETURNING *
  `;

  return result.rows[0];
}

export async function getActiveConversation(sessionId: string) {
  const result = await sql`
    SELECT * FROM conversations
    WHERE session_id = ${sessionId} AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1
  `;

  return result.rows[0] || null;
}

export async function updateConversationActivity(conversationId: string) {
  await sql`
    UPDATE conversations
    SET updated_at = NOW()
    WHERE id = ${conversationId}
  `;
}

export async function updateConversationStage(conversationId: string, stage: string) {
  await sql`
    UPDATE conversations
    SET lead_stage = ${stage}, updated_at = NOW()
    WHERE id = ${conversationId}
  `;
}

export async function closeConversation(conversationId: string) {
  await sql`
    UPDATE conversations
    SET status = 'closed', closed_at = NOW(), updated_at = NOW()
    WHERE id = ${conversationId}
  `;
}

// Message operations
export interface SaveMessageParams {
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  messageType?: string;
  mediaUrl?: string;
  tokensUsed?: number;
}

export async function saveMessage(params: SaveMessageParams) {
  const {
    conversationId,
    role,
    content,
    messageType = 'text',
    mediaUrl = null,
    tokensUsed = null
  } = params;

  const result = await sql`
    INSERT INTO messages (conversation_id, role, content, message_type, media_url, tokens_used)
    VALUES (${conversationId}, ${role}, ${content}, ${messageType}, ${mediaUrl}, ${tokensUsed})
    RETURNING *
  `;

  return result.rows[0];
}

export async function getConversationMessages(conversationId: string, limit: number = 50) {
  const result = await sql`
    SELECT * FROM messages
    WHERE conversation_id = ${conversationId}
    ORDER BY created_at ASC
    LIMIT ${limit}
  `;

  return result.rows;
}

export async function getMessageCount(conversationId: string): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count FROM messages
    WHERE conversation_id = ${conversationId} AND role = 'user'
  `;

  return parseInt(result.rows[0]?.count || '0');
}

// Lead operations
export interface CreateLeadParams {
  sessionId: string;
  conversationId: string;
  name?: string;
  email?: string;
  phone?: string;
  familySituation?: string;
  immigrationGoals?: string;
  budgetRange?: string;
  timeline?: string;
  qualificationScore?: number;
  isQualified?: boolean;
}

export async function createLead(params: CreateLeadParams) {
  const {
    sessionId,
    conversationId,
    name,
    email,
    phone,
    familySituation,
    immigrationGoals,
    budgetRange,
    timeline,
    qualificationScore = 0,
    isQualified = false
  } = params;

  const result = await sql`
    INSERT INTO leads (
      session_id,
      conversation_id,
      name,
      email,
      phone,
      family_situation,
      immigration_goals,
      budget_range,
      timeline,
      qualification_score,
      is_qualified,
      status,
      first_contact_at,
      last_contact_at
    )
    VALUES (
      ${sessionId},
      ${conversationId},
      ${name},
      ${email},
      ${phone},
      ${familySituation},
      ${immigrationGoals},
      ${budgetRange},
      ${timeline},
      ${qualificationScore},
      ${isQualified},
      'new',
      NOW(),
      NOW()
    )
    RETURNING *
  `;

  return result.rows[0];
}

export async function updateLead(leadId: string, updates: Partial<CreateLeadParams>) {
  const {
    name,
    email,
    phone,
    familySituation,
    immigrationGoals,
    budgetRange,
    timeline,
    qualificationScore,
    isQualified
  } = updates;

  const result = await sql`
    UPDATE leads
    SET
      name = COALESCE(${name}, name),
      email = COALESCE(${email}, email),
      phone = COALESCE(${phone}, phone),
      family_situation = COALESCE(${familySituation}, family_situation),
      immigration_goals = COALESCE(${immigrationGoals}, immigration_goals),
      budget_range = COALESCE(${budgetRange}, budget_range),
      timeline = COALESCE(${timeline}, timeline),
      qualification_score = COALESCE(${qualificationScore}, qualification_score),
      is_qualified = COALESCE(${isQualified}, is_qualified),
      last_contact_at = NOW(),
      updated_at = NOW()
    WHERE id = ${leadId}
    RETURNING *
  `;

  return result.rows[0];
}

export async function getLeadBySessionId(sessionId: string) {
  const result = await sql`
    SELECT * FROM leads
    WHERE session_id = ${sessionId}
    ORDER BY created_at DESC
    LIMIT 1
  `;

  return result.rows[0] || null;
}

export async function getLeadByConversationId(conversationId: string) {
  const result = await sql`
    SELECT * FROM leads
    WHERE conversation_id = ${conversationId}
    ORDER BY created_at DESC
    LIMIT 1
  `;

  return result.rows[0] || null;
}

export interface GetLeadsParams {
  status?: string;
  qualified?: boolean;
  limit?: number;
  offset?: number;
}

export async function getLeads(params: GetLeadsParams = {}) {
  const { status, qualified, limit = 50, offset = 0 } = params;

  let query = sql`SELECT * FROM leads WHERE 1=1`;

  if (status) {
    query = sql`${query} AND status = ${status}`;
  }

  if (qualified !== undefined) {
    query = sql`${query} AND is_qualified = ${qualified}`;
  }

  query = sql`${query} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

  const result = await query;
  return result.rows;
}

export async function getLeadsCount(params: Omit<GetLeadsParams, 'limit' | 'offset'> = {}): Promise<number> {
  const { status, qualified } = params;

  let query = sql`SELECT COUNT(*) as count FROM leads WHERE 1=1`;

  if (status) {
    query = sql`${query} AND status = ${status}`;
  }

  if (qualified !== undefined) {
    query = sql`${query} AND is_qualified = ${qualified}`;
  }

  const result = await query;
  return parseInt(result.rows[0]?.count || '0');
}

// Analytics operations
export interface TrackEventParams {
  eventType: string;
  sessionId?: string;
  conversationId?: string;
  properties?: Record<string, unknown>;
}

export async function trackChatEvent(params: TrackEventParams) {
  const { eventType, sessionId, conversationId, properties = {} } = params;

  await sql`
    INSERT INTO chat_events (event_type, session_id, conversation_id, properties)
    VALUES (${eventType}, ${sessionId}, ${conversationId}, ${JSON.stringify(properties)})
  `;
}

// Health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Export all functions as db object
export const db = {
  // Sessions
  createSession,
  getSessionByPhone,
  getSessionById,
  updateSessionActivity,

  // Conversations
  createConversation,
  getActiveConversation,
  updateConversationActivity,
  updateConversationStage,
  closeConversation,

  // Messages
  saveMessage,
  getConversationMessages,
  getMessageCount,

  // Leads
  createLead,
  updateLead,
  getLeadBySessionId,
  getLeadByConversationId,
  getLeads,
  getLeadsCount,

  // Analytics
  trackChatEvent,

  // Health
  checkDatabaseHealth,
};
