import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run(date) {
  const { data, error } = await supabase
    .from('eta_aggregates')
    .select('*')
    .eq('period_start', date);
  if (error) { console.error('Query error:', error); process.exit(2); }
  console.log('Rows for', date, JSON.stringify(data, null, 2));
}

(async () => {
  await run('2025-12-25');
})();
