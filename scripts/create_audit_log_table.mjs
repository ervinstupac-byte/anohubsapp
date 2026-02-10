#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_KEY must be set (service role)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const fullSQL = `
-- Create sovereign_audit_log table for Executive Decisions and Protocol 9 triggers
CREATE TABLE IF NOT EXISTS public.sovereign_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- 'EXECUTIVE_DECISION' or 'PROTOCOL_9'
  reason text,
  metric_value text,
  metric_unit text,
  active_protection text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for analysis
CREATE INDEX IF NOT EXISTS sovereign_audit_log_event_type_idx ON public.sovereign_audit_log (event_type);
CREATE INDEX IF NOT EXISTS sovereign_audit_log_created_at_idx ON public.sovereign_audit_log (created_at DESC);
`;

async function run() {
  try {
    if (supabase.postgres && typeof supabase.postgres.query === 'function') {
      console.log('[create_audit_log] Running SQL via supabase.postgres.query');
      const res = await supabase.postgres.query({ sql: fullSQL });
      console.log('[create_audit_log] SQL executed', res?.error ? res.error : 'OK');
    } else {
      console.warn('[create_audit_log] supabase.postgres.query not available in this runtime.');
      console.warn('[create_audit_log] Please run the following SQL in the Supabase SQL editor:');
      console.log(fullSQL);
      process.exit(0);
    }
  } catch (err) {
    console.error('[create_audit_log] Failed:', err.message || err);
    process.exit(2);
  }
}

run();
