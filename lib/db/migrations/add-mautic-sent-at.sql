-- Migration: Add mautic_sent_at column to leads table
-- This prevents duplicate submissions to Mautic

-- Add the column if it doesn't exist
ALTER TABLE leads ADD COLUMN IF NOT EXISTS mautic_sent_at TIMESTAMP;

-- Add comment for documentation
COMMENT ON COLUMN leads.mautic_sent_at IS 'Timestamp when lead was sent to Mautic (prevents duplicates)';
