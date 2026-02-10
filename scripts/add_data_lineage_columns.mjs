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
-- NC-11600: Data Lineage Integration
-- Add tracking columns to dynamic_sensor_data
ALTER TABLE IF EXISTS public.dynamic_sensor_data
ADD COLUMN IF NOT EXISTS source_script text,
ADD COLUMN IF NOT EXISTS ingest_timestamp timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS workflow_run_id text;

-- Index for lineage tracing
CREATE INDEX IF NOT EXISTS dynamic_sensor_data_workflow_idx ON public.dynamic_sensor_data (workflow_run_id);
`;

async function run() {
  try {
    if (supabase.postgres && typeof supabase.postgres.query === 'function') {
      console.log('[data_lineage_migration] Running SQL via supabase.postgres.query');
      const res = await supabase.postgres.query({ sql: fullSQL });
      console.log('[data_lineage_migration] SQL executed', res?.error ? res.error : 'OK');
    } else {
      console.warn('[data_lineage_migration] supabase.postgres.query not available in this runtime.');
      console.warn('[data_lineage_migration] Please run the following SQL in the Supabase SQL editor:');
      console.log(fullSQL);
      process.exit(0);
    }
  } catch (err) {
    console.error('[data_lineage_migration] Failed:', err.message || err);
    process.exit(2);
  }
}

run();
