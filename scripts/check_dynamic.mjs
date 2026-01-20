#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const ASSET_ID = process.argv[2] || '1';
const HOURS = Number(process.argv[3] || 6);

if (!SUPABASE_URL || !SUPABASE_KEY) { console.error('Please set SUPABASE_URL and SUPABASE_KEY'); process.exit(1); }
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const since = new Date(Date.now() - HOURS * 3600 * 1000).toISOString();
  const { data, error, count } = await supabase.from('dynamic_sensor_data').select('id, asset_id, timestamp', { count: 'exact', head: false }).eq('asset_id', String(ASSET_ID)).gte('timestamp', since).order('timestamp', { ascending: true });
  if (error) { console.error('Query failed:', error); process.exit(2); }
  console.log(`dynamic_sensor_data rows for asset ${ASSET_ID} in last ${HOURS} hours: ${data.length}`);
  (data || []).slice(-10).forEach(d => console.log(d));
}

main();
