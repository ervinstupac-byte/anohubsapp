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
-- Create telemetry_logs table optimized for time-series queries
CREATE TABLE IF NOT EXISTS public.telemetry_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id text NOT NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for fast time-range + asset queries
CREATE INDEX IF NOT EXISTS telemetry_logs_asset_time_idx ON public.telemetry_logs (asset_id, created_at DESC);
CREATE INDEX IF NOT EXISTS telemetry_logs_created_at_idx ON public.telemetry_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS telemetry_logs_details_gin ON public.telemetry_logs USING GIN (details);

-- Create telemetry_history_cache for fast historical lookup
CREATE TABLE IF NOT EXISTS public.telemetry_history_cache (
  asset_id text PRIMARY KEY,
  history jsonb,
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS telemetry_history_cache_updated_at_idx ON public.telemetry_history_cache (updated_at DESC);
`;

async function run() {
  try {
    if (supabase.postgres && typeof supabase.postgres.query === 'function') {
      console.log('[create_tables] Running SQL via supabase.postgres.query');
      const res = await supabase.postgres.query({ sql: fullSQL });
      console.log('[create_tables] SQL executed', res?.error ? res.error : 'OK');
    } else {
      console.warn('[create_tables] supabase.postgres.query not available in this runtime.');
      console.warn('[create_tables] Please run the following SQL in the Supabase SQL editor:');
      console.log(fullSQL);
      process.exit(0);
    }
  } catch (err) {
    console.error('[create_tables] Failed:', err.message || err);
    process.exit(2);
  }
}

run();
