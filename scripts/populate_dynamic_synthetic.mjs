#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const ASSET_ID = String(process.env.ASSET_ID || '1');
const TARGET = Number(process.env.TARGET_SAMPLES || 720);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function countExisting() {
  const { count, error } = await supabase
    .from('dynamic_sensor_data')
    .select('id', { count: 'exact', head: true })
    .eq('asset_id', ASSET_ID);
  if (error) throw error;
  return count || 0;
}

function iso(ts) { return new Date(ts).toISOString(); }

async function insertSynthetic(existing) {
  const need = Math.max(0, TARGET - existing);
  if (need === 0) {
    console.log(`[synthetic] already have ${existing} samples for asset ${ASSET_ID}`);
    return 0;
  }

  // We'll generate hourly samples ending at now, going backwards
  const rows = [];
  const now = Date.now();
  // start from existing count to create a deterministic trend
  for (let i = 0; i < need; i++) {
    const hoursAgo = need - i; // generate older -> newer
    const ts = new Date(now - hoursAgo * 3600 * 1000).toISOString();

    // Linear degradation in output_power to create a trend
    const basePowerKw = 5000; // 5MW nominal
    const trendPerSample = -0.5; // -0.5 kW per hour -> modest degradation
    const output_power = Math.max(1000, basePowerKw + trendPerSample * (existing + i));

    // Choose francis_data such that theoretical power matches nominal roughly
    const flow = 40; // m3/s
    const head = 13; // m

    rows.push({
      asset_id: ASSET_ID,
      timestamp: ts,
      output_power: Math.round(output_power),
      francis_data: { flow, head }
    });
  }

  // Batch insert in chunks
  const chunkSize = 200;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from('dynamic_sensor_data').insert(chunk);
    if (error) throw error;
    console.log(`[synthetic] inserted chunk ${i}-${i+chunk.length}`);
  }

  return rows.length;
}

async function main() {
  try {
    const existing = await countExisting();
    console.log(`[synthetic] existing samples for asset ${ASSET_ID}: ${existing}`);
    const added = await insertSynthetic(existing);
    console.log(`[synthetic] added ${added} samples`);
  } catch (e) {
    console.error('[synthetic] failed:', e.message || e);
    process.exit(2);
  }
}

main();
