#!/usr/bin/env node
import { spawnSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';

const ASSET_ID = process.argv[2] || process.env.ASSET_ID || '1';
const ANCHOR = {
  residualStd: 0.0135,
  pf: 51.077
};
const RESIDUAL_THRESHOLD = 0.0001; // meaningful change threshold

function parseOutput(output) {
  const re = /asset\s+([^\s]+)\s+points=(\d+)\s+residualStd=([0-9.]+)\s+Pf=([0-9.]+)%/i;
  const m = output.match(re);
  if (!m) return null;
  return {
    asset: m[1],
    points: Number(m[2]),
    residualStd: Number(m[3]),
    pf: Number(m[4])
  };
}

function runCompute() {
  const proc = spawnSync('node', ['./scripts/compute_pf_for_asset.mjs', ASSET_ID], { encoding: 'utf8' });
  if (proc.error) throw proc.error;
  if (proc.status !== 0) {
    console.error('compute_pf_for_asset failed:', proc.stderr || proc.stdout);
    process.exit(proc.status || 2);
  }
  return proc.stdout.trim();
}

async function logEventToSupabase(details) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log('No SUPABASE env configured; skipping DB write.');
    console.log('Event:', JSON.stringify(details, null, 2));
    return;
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const row = {
    asset_id: ASSET_ID,
    type: 'Live Operational Event',
    details: details,
    created_at: new Date().toISOString()
  };
  const { data, error } = await supabase.from('telemetry_alerts').insert([row]);
  if (error) {
    console.error('Failed to write event to telemetry_alerts:', error);
  } else {
    console.log('Logged Live Operational Event to telemetry_alerts (id:', (data && data[0] && data[0].id) || 'unknown', ')');
  }
}

async function main() {
  const out = runCompute();
  const parsed = parseOutput(out);
  if (!parsed) {
    console.error('Could not parse compute output:', out);
    process.exit(3);
  }
  console.log('Computed:', parsed);
  const residualShift = Math.abs(parsed.residualStd - ANCHOR.residualStd);
  const pfShift = Math.abs(parsed.pf - ANCHOR.pf);
  const event = {
    anchor: ANCHOR,
    observed: parsed,
    residualShift,
    pfShift,
    threshold: { residualThreshold: RESIDUAL_THRESHOLD }
  };

  if (residualShift > RESIDUAL_THRESHOLD) {
    console.log('ResidualStd shift detected — creating Live Operational Event');
    await logEventToSupabase(event);
  } else {
    console.log('No meaningful residualStd shift detected (shift=', residualShift, ').');
  }
}

main().catch(err => { console.error(err); process.exit(10); });
