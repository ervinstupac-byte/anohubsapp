#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const ASSET_ID = process.argv[2] || process.env.ASSET_ID || '1';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('set SUPABASE_URL and SUPABASE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function normalCDF(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  prob = 1 - prob;
  return x < 0 ? 1 - prob : prob;
}

async function main() {
  const { data, error } = await supabase.from('telemetry_history_cache').select('history').eq('asset_id', ASSET_ID).single();
  if (error) { console.error(error); process.exit(2); }
  const pts = (data.history || []).map(p => ({ t: p.t, y: p.y })).filter(Boolean);
  if (!pts.length) { console.log('no points'); return; }
  const n = pts.length;
  const meanT = pts.reduce((s,p)=>s+p.t,0)/n;
  const meanY = pts.reduce((s,p)=>s+p.y,0)/n;
  const Sxx = pts.reduce((s,p)=>s+Math.pow(p.t-meanT,2),0);
  const Sxy = pts.reduce((s,p)=>s+(p.t-meanT)*(p.y-meanY),0);
  const a = Sxy/(Sxx||1);
  const b = meanY - a*meanT;
  const residuals = pts.map(p=>p.y-(a*p.t+b));
  const SSE = residuals.reduce((s,r)=>s+r*r,0);
  const sigma2 = SSE/Math.max(1,(n-2));
  const residualStd = Math.sqrt(sigma2);
  const acceptableSigma = 0.5;
  const z = residualStd/acceptableSigma;
  const pf = Math.min(99.99, Math.max(0.01, normalCDF(z)*100));
  console.log(`asset ${ASSET_ID} points=${n} residualStd=${residualStd.toFixed(4)} Pf=${pf.toFixed(3)}%`);
}

main();
