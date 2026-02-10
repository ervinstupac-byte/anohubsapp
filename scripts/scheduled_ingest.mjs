#!/usr/bin/env node
// Scheduled ingestion job: fetch hourly telemetry from PRIMARY_SENSOR_URL and upsert into dynamic_sensor_data
import { createClient } from '@supabase/supabase-js';
// Prefer global fetch (Node 18+). Dynamically import `node-fetch` only if needed.
let _nodeFetch = null;
import { exec } from 'child_process';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const PRIMARY_SENSOR_URL = (process.env.PRIMARY_SENSOR_URL || '').trim(); // e.g. https://sensors.example/api/recent?hours=24
const ASSET_ID = process.env.ASSET_ID || '1';
// NC-11600: Data Lineage Identifiers
const WORKFLOW_RUN_ID = process.env.GITHUB_RUN_ID || `local-${Date.now()}`;
const SOURCE_SCRIPT = 'scheduled_ingest.mjs';

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
  // Support a synthetic mode for local testing where PRIMARY_SENSOR_URL === 'use-synthetic'
  if (PRIMARY_SENSOR_URL === 'use-synthetic') {
    // Query the existing `dynamic_sensor_data` table for the most recent `hours` samples
    const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
    const { data, error } = await supabase
      .from('dynamic_sensor_data')
      .select('*')
      .eq('asset_id', ASSET_ID)
      .gte('timestamp', since)
      .order('timestamp', { ascending: true });
    if (error) throw error;
    return Array.isArray(data) ? data : (data?.data || []);
  }

  let url;
  try {
    url = new URL(PRIMARY_SENSOR_URL);
  } catch (err) {
    throw new Error(`Invalid URL for PRIMARY_SENSOR_URL: ${PRIMARY_SENSOR_URL}`);
  }
  url.searchParams.set('hours', String(hours));
  const fetchImpl = globalThis.fetch || ((...args) => {
    if (!_nodeFetch) _nodeFetch = import('node-fetch');
    return _nodeFetch.then(m => m.default(...args));
  });
  const res = await fetchImpl(url.toString(), { timeout: 30000 });
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
    // NC-11600: Data Lineage Population
    source_script: SOURCE_SCRIPT,
    ingest_timestamp: new Date().toISOString(),
    workflow_run_id: WORKFLOW_RUN_ID
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

    // NC-11500: Ingest Idempotency Guard
    // Check against existing timestamps to prevent duplicates
    if (cleaned.length > 0) {
      const times = cleaned.map(r => new Date(r.timestamp).getTime());
      const minTime = new Date(Math.min(...times)).toISOString();
      const maxTime = new Date(Math.max(...times)).toISOString();

      const { data: existing, error: checkErr } = await supabase
        .from('dynamic_sensor_data')
        .select('timestamp')
        .eq('asset_id', ASSET_ID)
        .gte('timestamp', minTime)
        .lte('timestamp', maxTime);

      if (!checkErr && existing) {
        const existingSet = new Set(existing.map(e => new Date(e.timestamp).toISOString()));
        const unique = cleaned.filter(r => !existingSet.has(r.timestamp));
        
        if (unique.length < cleaned.length) {
          console.log(`[ingest] Idempotency Guard: Filtered ${cleaned.length - unique.length} duplicates.`);
        }

        if (unique.length > 0) {
          await upsertRows(unique);
        } else {
          console.log('[ingest] Idempotency Guard: No new unique rows to insert.');
        }
      } else {
        console.warn('[ingest] Idempotency check failed, attempting raw upsert:', checkErr);
        await upsertRows(cleaned);
      }
    } else {
      await upsertRows(cleaned);
    }

    // After ingest, run a quick calibration check by invoking compute_pf_for_asset.mjs
    try {
      const cp = exec(`node ./scripts/compute_pf_for_asset.mjs ${ASSET_ID}`);
      let out = '';
      cp.stdout.on('data', d => {
        process.stdout.write(d);
        out += String(d);
      });
      cp.stderr.on('data', d => { process.stderr.write(d); });
      cp.on('close', code => {
        try {
          const m = out.match(/residualStd=([0-9.]+)/);
          if (m) {
            const residualStd = parseFloat(m[1]);
            const baseline = 0.0135; // synthetic baseline
            const diff = Math.abs(residualStd - baseline);
            if (diff > 0.005) {
              console.warn('[ingest] Calibration Shift detected: residualStd=', residualStd);
              // Optionally persist alert into a table `telemetry_alerts` if exists
              supabase.from('telemetry_alerts').insert([{ asset_id: ASSET_ID, type: 'calibration_shift', details: { residualStd }, created_at: new Date().toISOString() }]).then(() => {}).catch(() => {});
            } else {
              console.log('[ingest] Calibration within expected bounds (residualStd=', residualStd, ')');
            }
          }
        } catch (e) { console.warn('[ingest] calibration parse failed', e); }
      });
    } catch (e) {
      console.warn('[ingest] calibration check failed:', e.message || e);
    }
  } catch (e) {
    console.error('[ingest] failed:', e.message || e);
    process.exit(2);
  }
}

main();
