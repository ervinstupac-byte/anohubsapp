#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_KEY must be set (service role)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Global flag: whether there is any dynamic_sensor_data in the requested window.
let GLOBAL_HAS_DYNAMIC = null;

async function ensureTable() {
  // Create telemetry_history_cache if not exists
  const createSQL = `
    CREATE TABLE IF NOT EXISTS public.telemetry_history_cache (
      asset_id TEXT PRIMARY KEY,
      history JSONB,
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `;
  try {
    // Use Postgres query endpoint when available
    if (supabase.postgres && typeof supabase.postgres.query === 'function') {
      await supabase.postgres.query({ sql: createSQL });
      console.log('[backfill] Ensured telemetry_history_cache table exists');
    } else {
      console.warn('[backfill] supabase.postgres.query not available in this runtime; ensure table exists manually');
    }
  } catch (e) {
    console.error('[backfill] failed to ensure table:', e.message || e);
  }
}

// New behaviour: prefer high-resolution hourly `dynamic_sensor_data` (efficiency, timestamp),
// then fall back to `eta_aggregates`, then `telemetry_logs`.
async function fetchAssetsWithTelemetry(days = 45) {
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();

  // 1) Try dynamic_sensor_data for recent hourly telemetry
  try {
    const { data: dynSample, error: dynErr } = await supabase
      .from('dynamic_sensor_data')
      .select('asset_id')
      .gte('timestamp', since)
      .limit(2000);
    if (!dynErr && dynSample && dynSample.length) {
      const ids = Array.from(new Set(dynSample.map(d => d.asset_id).filter(Boolean)));
      console.log(`[backfill] dynamic_sensor_data has ${dynSample.length} rows; assets: ${ids.slice(0,10).join(',')}`);
      return ids;
    }
  } catch (e) {
    // ignore and fallthrough
  }

  // 2) Try eta_aggregates (daily aggregates)
  let timestampField = 'timestamp';
  try {
    const sample = await supabase.from('eta_aggregates').select('*').limit(1).maybeSingle();
    const keys = sample?.data ? Object.keys(sample.data) : [];
    if (keys.includes('period_end')) timestampField = 'period_end';
    else if (keys.includes('period_start')) timestampField = 'period_start';
    else if (keys.includes('created_at')) timestampField = 'created_at';
  } catch (e) {
    // ignore
  }

  try {
    const { data, error } = await supabase
      .from('eta_aggregates')
      .select('asset_id')
      .gte(timestampField, since)
      .limit(2000);
    if (!error && data && data.length) {
      return Array.from(new Set(data.map(d => d.asset_id).filter(Boolean)));
    }
  } catch (e) {
    // ignore
  }

  // 3) Fallback to telemetry_logs
  const res = await supabase
    .from('telemetry_logs')
    .select('asset_id')
    .gte('created_at', since)
    .limit(2000);
  if (res.error) throw res.error;
  return Array.from(new Set((res.data || []).map(d => d.asset_id).filter(Boolean)));
}

async function fetchTelemetryForAsset(assetId, days = 45) {
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();

  console.log(`[backfill] fetchTelemetryForAsset assetId=${assetId} (type=${typeof assetId})`);
  try {
    const { data: headData, error: headErr, count } = await supabase
      .from('dynamic_sensor_data')
      .select('*', { count: 'exact', head: true })
      .eq('asset_id', assetId)
      .gte('timestamp', since);
    console.log(`[backfill] dynamic_sensor_data count for asset ${assetId} in window: ${count}`);
  } catch (e) {
    // ignore
  }

  // Prefer dynamic_sensor_data hourly points (efficiency,timestamp)
  try {
    const { data: dyn, error: dynErr } = await supabase
      .from('dynamic_sensor_data')
      .select('*')
      .eq('asset_id', assetId)
      .gte('timestamp', since)
      .order('timestamp', { ascending: true })
      .limit(5000);

    if (!dynErr && dyn && dyn.length) {
      console.log(`[backfill] dyn fetched rows for asset ${assetId}: sample keys: ${Object.keys(dyn[0]||{}).join(',')}`);
      console.log(dyn[0]);
      const points = dyn.map(r => {
        // Compute efficiency (eta) when not stored directly.
        let eta = null;
        if (typeof r.efficiency === 'number') eta = r.efficiency;
        else if (typeof r.eff === 'number') eta = r.eff;
        else if (r.output_power != null && r.francis_data && r.francis_data.flow != null && r.francis_data.head != null) {
          // output_power is stored as kW in this dataset; convert to Watts.
          const P_w = Number(r.output_power) * 1000;
          const Q = Number(r.francis_data.flow);
          const H = Number(r.francis_data.head);
          const rho = 1000; // kg/m^3
          const g = 9.80665; // m/s^2
          const theoretical = rho * g * Q * H;
          if (theoretical > 0) eta = P_w / theoretical;
        }
        const y = (typeof eta === 'number' && isFinite(eta)) ? eta : (typeof eta === 'string' ? Number(eta) : null);
        const ts = r.timestamp ?? r.created_at ?? null;
        const t = ts ? new Date(ts).getTime() : null;
        return y !== null && t ? { t, y } : null;
      }).filter(Boolean);
      if (points.length) {
        console.log(`[backfill] dynamic points for asset ${assetId}: ${points.length}`);
        return points;
      } else {
        console.log(`[backfill] dynamic points for asset ${assetId}: 0`);
      }
    }
  } catch (e) {
    // ignore and fallthrough
  }

  // If global dynamic data exists, do NOT fallback to daily aggregates for this asset.
  // This ensures we only use hourly data when any hourly telemetry is available.
  if (GLOBAL_HAS_DYNAMIC === true) {
    // No dynamic points found for this asset but hourly telemetry exists globally: skip fallback.
    return [];
  }

  // Fallback to eta_aggregates (daily)
  let timestampField = 'timestamp';
  try {
    const sample = await supabase.from('eta_aggregates').select('*').limit(1).maybeSingle();
    const keys = sample?.data ? Object.keys(sample.data) : [];
    if (keys.includes('period_end')) timestampField = 'period_end';
    else if (keys.includes('period_start')) timestampField = 'period_start';
    else if (keys.includes('created_at')) timestampField = 'created_at';
  } catch (e) {
    // ignore
  }

  try {
    const { data, error } = await supabase
      .from('eta_aggregates')
      .select(`avg_eta, ${timestampField}`)
      .eq('asset_id', assetId)
      .gte(timestampField, since)
      .order(timestampField, { ascending: true });

    if (!error && data && data.length) {
      const points = (data || []).map(r => {
        const eff = r.avg_eta ?? r.avg_eta === 0 ? r.avg_eta : null;
        const y = typeof eff === 'number' ? eff : (typeof eff === 'string' ? Number(eff) : null);
        const ts = r[timestampField] ?? r.timestamp ?? r.created_at ?? null;
        const t = ts ? new Date(ts).getTime() : null;
        return y !== null && t ? { t, y } : null;
      }).filter(Boolean);
      if (points.length) return points;
    }
  } catch (e) {
    // ignore
  }

  // Final fallback: legacy telemetry_logs
  const res = await supabase
    .from('telemetry_logs')
    .select('details, created_at')
    .eq('asset_id', assetId)
    .gte('created_at', since)
    .order('created_at', { ascending: true })
    .limit(5000);
  if (res.error) throw res.error;
  const data = (res.data || []).map(r => ({ avg_eta: (r.details && (r.details.efficiency ?? r.details.eta)) || null, timestamp: r.created_at }));
  const points = (data || []).map(r => {
    const eff = r.avg_eta ?? r.avg_eta === 0 ? r.avg_eta : null;
    const y = typeof eff === 'number' ? eff : (typeof eff === 'string' ? Number(eff) : null);
    const ts = r.timestamp ?? r.created_at ?? null;
    const t = ts ? new Date(ts).getTime() : null;
    return y !== null && t ? { t, y } : null;
  }).filter(Boolean);
  return points;
}

async function upsertCache(assetId, points) {
  const payload = { asset_id: String(assetId), history: points };
  const { error } = await supabase.from('telemetry_history_cache').upsert(payload, { onConflict: 'asset_id' });
  if (error) throw error;
  console.log(`[backfill] Upserted cache for asset ${assetId} (${points.length} points)`);
}

async function main() {
  try {
    await ensureTable();
    const DAYS = Number(process.env.BACKFILL_DAYS || 45);
    // Determine whether any dynamic hourly data exists in the window; if so we will
    // enforce hourly-only extraction and avoid falling back to daily aggregates.
    try {
      const since = new Date(Date.now() - DAYS * 24 * 3600 * 1000).toISOString();
      const { data: dynCheck, error: dynErr } = await supabase
        .from('dynamic_sensor_data')
        .select('asset_id')
        .gte('timestamp', since)
        .limit(1);
      GLOBAL_HAS_DYNAMIC = (!dynErr && dynCheck && dynCheck.length > 0);
    } catch (e) {
      GLOBAL_HAS_DYNAMIC = false;
    }

    console.log(`[backfill] GLOBAL_HAS_DYNAMIC=${GLOBAL_HAS_DYNAMIC}`);

    const ids = await fetchAssetsWithTelemetry(DAYS);
    console.log(`[backfill] Found ${ids.length} assets with telemetry in last ${DAYS} days`);
    for (const id of ids) {
      try {
        const points = await fetchTelemetryForAsset(id, DAYS);
        if (points.length === 0) continue;
        await upsertCache(id, points);
      } catch (e) {
        console.error(`[backfill] Failed asset ${id}:`, e.message || e);
      }
    }
    console.log('[backfill] Completed.');
  } catch (e) {
    console.error('[backfill] Fatal:', e.message || e);
    process.exit(2);
  }
}

main();
