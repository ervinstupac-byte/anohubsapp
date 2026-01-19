-- Supabase migration: Create audit table for automated actions
-- Creates a lightweight audit trail used by integration tests
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS automated_actions_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id text NOT NULL,
  action_type text NOT NULL,
  payload jsonb,
  status text,
  source text,
  created_at timestamptz DEFAULT now()
);

-- Index on created_at for query performance
CREATE INDEX IF NOT EXISTS idx_automated_actions_audit_created_at ON automated_actions_audit(created_at DESC);
