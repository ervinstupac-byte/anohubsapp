#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const ASSET_ID = process.argv[2] || '1';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const { data, error } = await supabase.from('telemetry_history_cache').select('asset_id, history, updated_at').eq('asset_id', String(ASSET_ID)).single();
  if (error) { console.error('Query failed:', error); process.exit(2); }
  const history = (data.history || []);
  console.log(`asset=${data.asset_id} points=${history.length} updated_at=${data.updated_at}`);
  if (history.length) {
    const sorted = history.slice().sort((a,b)=>a.t-b.t);
    const first = sorted[0];
    const last = sorted[sorted.length-1];
    console.log('first sample:', first);
    console.log('last sample:', last);
    console.log('last 5 samples:');
    sorted.slice(-5).forEach(s=>console.log(s));
  }
}

main();
