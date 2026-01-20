#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('set SUPABASE_URL and SUPABASE_KEY');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function computeForecast(points, threshold = 90) {
  const n = points.length;
  if (n < 2) return null;
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
  const assetArg = process.argv[2] || '1';
  try {
    const { data, error } = await supabase.from('telemetry_history_cache').select('asset_id, history').eq('asset_id', assetArg);
    if (error) throw error;
    if (!data || data.length === 0) {
      console.log('No cache rows found for', assetArg);
      return;
    }
    const row = data[0];
    const pts = (row.history || []).map(p => ({ t: p.t, y: p.y })).filter(Boolean).sort((a,b)=>a.t-b.t);
    const fullFc = computeForecast(pts);
    // find Dec 25 points (year 2025)
    const dec25 = pts.filter(p => {
      const d = new Date(p.t);
      return d.getUTCFullYear() === 2025 && d.getUTCMonth() === 11 && d.getUTCDate() === 25;
    });
    console.log(`Asset ${assetArg}: points=${pts.length} dec25_points=${dec25.length}`);
    console.log('Full forecast:', fullFc);
    if (dec25.length === 0) {
      console.log('No Dec 25 points present to test sensitivity.');
      return;
    }
    const withoutDec25 = pts.filter(p => !dec25.includes(p));
    const fcNo = computeForecast(withoutDec25);
    console.log('Without Dec25 forecast:', fcNo);
    const deltaWeeks = (fullFc.weeksUntil || 0) - (fcNo.weeksUntil || 0);
    console.log('Delta weeksUntil due to Dec25 points:', deltaWeeks);
  } catch (e) {
    console.error('Dec25 sensitivity failed:', e.message || e);
  }
}

main();
