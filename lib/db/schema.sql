-- Viva Academy AI Agent Database Schema
-- For Vercel Postgres

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Chat Sessions Table
-- Stores user sessions for both WhatsApp and web chat
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('whatsapp', 'web')),
  phone_number VARCHAR(20),  -- For WhatsApp users
  session_id VARCHAR(255),    -- For web chat users
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_activity_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  CONSTRAINT unique_phone_number UNIQUE (phone_number),
  CONSTRAINT unique_session_id UNIQUE (session_id)
);

-- Conversations Table
-- Each session can have multiple conversations over time
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'transferred')),
  lead_stage VARCHAR(50) DEFAULT 'initial' CHECK (lead_stage IN (
    'initial',
    'name_collected',
    'situation_collected',
    'goals_collected',
    'budget_collected',
    'timeline_collected',
    'qualified',
    'disqualified',
    'converted'
  )),
  assigned_to VARCHAR(255),  -- For future human handoff
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP
);

-- Messages Table
-- Stores all messages exchanged in conversations
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN (
    'text', 'image', 'video', 'audio', 'document', 'location'
  )),
  media_url TEXT,
  tokens_used INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Leads Table
-- Qualified leads extracted from conversations
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id),
  conversation_id UUID REFERENCES conversations(id),

  -- Lead Information
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),

  -- Qualification Data
  family_situation TEXT,
  immigration_goals TEXT,
  budget_range VARCHAR(50),
  timeline VARCHAR(50),
  current_visa_status VARCHAR(100),

  -- Lead Scoring (0-100)
  qualification_score INTEGER DEFAULT 0 CHECK (qualification_score >= 0 AND qualification_score <= 100),
  is_qualified BOOLEAN DEFAULT FALSE,
  disqualification_reason TEXT,

  -- Lead Status
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN (
    'new', 'contacted', 'engaged', 'qualified',
    'proposal_sent', 'converted', 'lost'
  )),

  -- Engagement Tracking
  first_contact_at TIMESTAMP,
  last_contact_at TIMESTAMP,
  total_messages INTEGER DEFAULT 0,

  -- Marketing Attribution
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  referrer TEXT,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Chat Events Table
-- Analytics and tracking events
CREATE TABLE IF NOT EXISTS chat_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL,
  session_id UUID REFERENCES chat_sessions(id),
  conversation_id UUID REFERENCES conversations(id),
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_channel ON chat_sessions(channel);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_phone ON chat_sessions(phone_number);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_active ON chat_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_activity ON chat_sessions(last_activity_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_lead_stage ON conversations(lead_stage);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_qualified ON leads(is_qualified);
CREATE INDEX IF NOT EXISTS idx_leads_qualification_score ON leads(qualification_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_session_id ON leads(session_id);

CREATE INDEX IF NOT EXISTS idx_chat_events_type ON chat_events(event_type);
CREATE INDEX IF NOT EXISTS idx_chat_events_session ON chat_events(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_events_created_at ON chat_events(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE chat_sessions IS 'User sessions for both WhatsApp and web chat';
COMMENT ON TABLE conversations IS 'Individual conversations within sessions';
COMMENT ON TABLE messages IS 'All messages exchanged in conversations';
COMMENT ON TABLE leads IS 'Qualified leads extracted from conversations';
COMMENT ON TABLE chat_events IS 'Analytics and tracking events';
