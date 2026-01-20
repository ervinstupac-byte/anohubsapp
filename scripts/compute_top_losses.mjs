import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run(startDate, endDate) {
  // Aggregate computed_loss_cost by period_start
  const { data: rows, error: rErr } = await supabase
    .from('eta_aggregates')
    .select('period_start, computed_loss_cost')
    .gte('period_start', startDate)
    .lte('period_end', endDate);

  if (rErr) { console.error('Failed to fetch eta_aggregates:', rErr); process.exit(2); }
  const map = {};
  (rows || []).forEach(r => {
    const d = r.period_start;
    map[d] = (map[d] || 0) + Number(r.computed_loss_cost || 0);
  });
  const items = Object.entries(map).map(([k,v]) => ({ date: k, loss: v })).sort((a,b)=> b.loss - a.loss);
  console.log('Top loss days:');
  console.log(items.slice(0,3));
  return items.slice(0,3);
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
    console.error('Script failed:', e);
    process.exit(3);
  }
})();
