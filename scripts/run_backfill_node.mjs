import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL_PUBLIC;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run(startDate, endDate) {
  console.log(`Triggering backfill RPC from ${startDate} to ${endDate}`);
  const { data, error } = await supabase.rpc('backfill_eta_aggregates', { start_date: startDate, end_date: endDate });
  if (error) {
    console.error('RPC backfill error:', error);
    process.exit(2);
  }

  const rows = Array.isArray(data) ? data : [];
  console.log(`RPC returned ${rows.length} rows (pre-filter).`);

  const sensorIds = Array.from(new Set(rows.map(r => r.sensor_id).filter(Boolean)));
  if (sensorIds.length === 0) {
    console.log('No sensor ids present in RPC output; returning RPC rows.');
    return rows;
  }

  const { data: sensors, error: sErr } = await supabase.from('sensor_registry').select('sensor_id, asset_id, calibrated').in('sensor_id', sensorIds);
  if (sErr) { console.warn('Failed to fetch sensors:', sErr); return rows; }
  const calibrated = new Set((sensors || []).filter(s => s.calibrated).map(s => s.sensor_id));

  const filtered = rows.filter(r => {
    if (!r.sensor_id) return true; // keep if unknown
    return calibrated.has(r.sensor_id);
  });

  console.log(`Filtered down to ${filtered.length} calibrated rows.`);

  // Ensure asset_id are numbers
  filtered.forEach(r => { if (r.asset_id) r.asset_id = Number(r.asset_id); });

  // Show first 5 eta_aggregates-like rows
  console.log('\nFirst 5 eta rows (sample):');
  filtered.slice(0,5).forEach((r,i) => console.log(i+1, r));

  // Query eta_aggregates table for the same period and include computed_loss_cost
  const { data: aggRows, error: aggErr } = await supabase
    .from('eta_aggregates')
    .select('id, asset_id, period_start, period_end, avg_eta, computed_loss_cost')
    .gte('period_start', startDate)
    .lte('period_end', endDate)
    .order('period_start', { ascending: false });

  if (aggErr) console.warn('Failed to query eta_aggregates:', aggErr);
  else {
    console.log('\nSample rows from `eta_aggregates` (with computed_loss_cost):');
    (aggRows || []).slice(0,5).forEach((r,i) => console.log(i+1, r));

    // Persist artifact JSON for downstream PDF generation
    try {
      const artifactsDir = path.resolve(process.cwd(), 'artifacts');
      if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });
      const fileName = `eta_aggregates_${startDate}_to_${endDate}.json`;
      const outPath = path.join(artifactsDir, fileName);
      fs.writeFileSync(outPath, JSON.stringify(aggRows, null, 2), 'utf8');
      console.log('Wrote artifact:', outPath);
    } catch (wErr) {
      console.warn('Failed to write artifact JSON:', wErr);
    }
  }

  // Query financial_ledger / asset_financials_with_eta
  const { data: finRows, error: finErr } = await supabase.from('asset_financials_with_eta').select('*').order('period_start', { ascending: false }).limit(5);
  if (finErr) console.warn('Failed to query asset_financials_with_eta:', finErr);
  else {
    console.log('\nSample rows from `asset_financials_with_eta`:');
    (finRows || []).forEach((r,i) => console.log(i+1, r));
  }

  return filtered;
}

(async () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  const startStr = start.toISOString().slice(0,10);
  const endStr = end.toISOString().slice(0,10);

  try {
    await run(startStr, endStr);
    process.exit(0);
  } catch (e) {
    console.error('Backfill runner failed:', e);
    process.exit(3);
  }
})();
