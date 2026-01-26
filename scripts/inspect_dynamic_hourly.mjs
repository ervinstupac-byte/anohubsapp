#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('set SUPABASE_URL and SUPABASE_KEY');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
(async function(){
  try{
    const since = new Date(Date.now() - (Number(process.env.BACKFILL_DAYS||365) * 24 * 3600 * 1000)).toISOString();
    // Fetch rows (select *) to discover column names
    const { data: rows, error: e2 } = await supabase
      .from('dynamic_sensor_data')
      .select('*')
      .gte('timestamp', since)
      .order('timestamp', { ascending: true })
      .limit(1000);
    if (e2) { console.error('rows error', e2); process.exit(2); }
    const by = {};
    for (const r of rows || []) {
      const id = String(r.asset_id || '');
      by[id] = (by[id]||0)+1;
    }
    console.log('counts by asset:', by);
    if ((rows||[]).length) {
      console.log('first rows sample keys:', Object.keys(rows[0] || {}).slice(0,40));
      console.log('first rows sample:', rows.slice(0,5));
    }
  }catch(err){console.error(err);process.exit(2);} 
})();
