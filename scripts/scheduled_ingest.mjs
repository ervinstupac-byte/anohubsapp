#!/usr/bin/env node
// Scheduled ingestion job: fetch hourly telemetry from PRIMARY_SENSOR_URL and upsert into dynamic_sensor_data
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const PRIMARY_SENSOR_URL = process.env.PRIMARY_SENSOR_URL; // e.g. https://sensors.example/api/recent?hours=24
const ASSET_ID = process.env.ASSET_ID || '1';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_KEY must be set');
  process.exit(1);
}
if (!PRIMARY_SENSOR_URL) {
  console.error('PRIMARY_SENSOR_URL must be set to fetch telemetry');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fetchSource(hours = 24) {
  const url = new URL(PRIMARY_SENSOR_URL);
  url.searchParams.set('hours', String(hours));
  const res = await fetch(url.toString(), { timeout: 30000 });
  if (!res.ok) throw new Error(`source fetch failed ${res.status}`);
  return res.json();
}

function normalizeRow(r) {
  // Accept various shapes from source; return { asset_id, timestamp, output_power, francis_data }
  return {
    asset_id: r.asset_id ?? ASSET_ID,
    timestamp: r.timestamp ?? r.time ?? r.t,
    output_power: r.output_power ?? r.power_kw ?? r.P_kw ?? null,
    francis_data: r.francis_data ?? r.metrics ?? r.details ?? null,
  };
}

async function upsertRows(rows) {
  if (!rows || rows.length === 0) return;
  const payload = rows.map(r => ({ ...r }));
  const { error } = await supabase.from('dynamic_sensor_data').upsert(payload, { onConflict: ['id'] });
  if (error) throw error;
  console.log(`[ingest] upserted ${rows.length} rows`);
}

async function main() {
  try {
    const hours = Number(process.env.INGEST_HOURS || 24);
    const src = await fetchSource(hours);
    // source should return array of samples
    const samples = Array.isArray(src) ? src : (src.data || []);
    const normalized = samples.map(normalizeRow).map(r => ({ ...r, asset_id: String(r.asset_id) }));
    // ensure timestamps are ISO strings
    const cleaned = normalized.map(r => ({ ...r, timestamp: new Date(r.timestamp).toISOString() }));
    await upsertRows(cleaned);
  } catch (e) {
    console.error('[ingest] failed:', e.message || e);
    process.exit(2);
  }
}

main();
