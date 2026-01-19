import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run(startDate, endDate, pricePerKwh = 0.08) {
  console.log(`Recalculating computed_loss_cost for ${startDate} -> ${endDate} (price ${pricePerKwh} EUR/kWh)`);

  const { data: rows, error } = await supabase
    .from('eta_aggregates')
    .select('id, asset_id, period_start, period_end, avg_eta')
    .gte('period_start', startDate)
    .lte('period_end', endDate);

  if (error) {
    console.error('Failed to fetch eta_aggregates rows:', error);
    process.exit(2);
  }

  const list = Array.isArray(rows) ? rows : [];
  console.log('Rows to update:', list.length);

  const etaRef = 92.0; // percent
  const ratedPowerKw = 4500.0;
  const hoursPerDay = 24.0;

  for (const r of list) {
    const avgEta = Number(r.avg_eta);
    if (isNaN(avgEta)) continue;

    // Determine representation: fractional (0.9) or percent (90)
    let loss = 0;
    if (avgEta <= 1.5) {
      // fractional
      loss = (etaRef / 100.0 - avgEta) * ratedPowerKw * hoursPerDay * Number(pricePerKwh);
    } else {
      // percent value
      loss = (etaRef - avgEta) / 100.0 * ratedPowerKw * hoursPerDay * Number(pricePerKwh);
    }

    // clamp to zero minimum
    if (loss < 0) loss = 0;

    const { error: upErr } = await supabase
      .from('eta_aggregates')
      .update({ computed_loss_cost: loss })
      .eq('id', r.id);

    if (upErr) console.warn('Failed to update id', r.id, upErr);
  }

  console.log('Recalculation complete.');
}

(async () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  const startStr = start.toISOString().slice(0,10);
  const endStr = end.toISOString().slice(0,10);
  try {
    await run(startStr, endStr, 0.08);
    process.exit(0);
  } catch (e) {
    console.error('Script failed:', e);
    process.exit(3);
  }
})();
