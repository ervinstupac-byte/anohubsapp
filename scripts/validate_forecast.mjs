#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_KEY (service role) in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function computeForecast(points, threshold = 90) {
  const n = points.length;
  const meanT = points.reduce((s, p) => s + p.t, 0) / n;
  const meanY = points.reduce((s, p) => s + p.y, 0) / n;
  const Sxx = points.reduce((s, p) => s + Math.pow(p.t - meanT, 2), 0);
  const Sxy = points.reduce((s, p) => s + (p.t - meanT) * (p.y - meanY), 0);
  const a = Sxy / (Sxx || 1);
  const b = meanY - a * meanT;
  const residuals = points.map(p => p.y - (a * p.t + b));
  const SSE = residuals.reduce((s, r) => s + r * r, 0);
  const sigma2 = SSE / Math.max(1, (n - 2));
  const SEa = Math.sqrt(sigma2 / (Sxx || 1));
  const tStat = SEa > 0 ? a / SEa : 0;
  const tAbs = Math.abs(tStat);
  const confidence = Math.min(1, tAbs / 3);
  if (!isFinite(a) || Math.abs(a) < 1e-16) return { weeksUntil: null, predictedTimestamp: null, confidence, slope: a, intercept: b, tStatistic: tStat };
  const tCross = (threshold - b) / a;
  const now = Date.now();
  if (!isFinite(tCross)) return { weeksUntil: null, predictedTimestamp: null, confidence, slope: a, intercept: b, tStatistic: tStat };
  if (tCross <= now) return { weeksUntil: 0, predictedTimestamp: Math.floor(tCross), confidence, slope: a, intercept: b, tStatistic: tStat };
  const weeks = (tCross - now) / (7 * 24 * 3600 * 1000);
  return { weeksUntil: Math.max(0, weeks), predictedTimestamp: Math.floor(tCross), confidence, slope: a, intercept: b, tStatistic: tStat };
}

async function main() {
  const assetArg = process.argv[2];
  try {
    let query = supabase.from('telemetry_history_cache').select('asset_id, history');
    if (assetArg) query = query.eq('asset_id', assetArg);
    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) {
      console.log('No cache rows found. Run backfill first.');
      return;
    }
    for (const row of data) {
      const pts = (row.history || []).map(p => ({ t: p.t, y: p.y })).filter(Boolean);
      const fc = computeForecast(pts);
      console.log(`Asset ${row.asset_id}: points=${pts.length} tStat=${fc.tStatistic?.toFixed(3)||0} conf=${(fc.confidence||0).toFixed(3)} weeksUntil=${fc.weeksUntil}`);
    }
  } catch (e) {
    console.error('Validation failed:', e.message || e);
  }
}

main();
