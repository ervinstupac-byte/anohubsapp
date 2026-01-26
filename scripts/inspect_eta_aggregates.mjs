#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  try {
    // Try to sample a few columns but first inspect available columns
    const { data: cols, error: colsErr } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'eta_aggregates');
    if (colsErr) {
      console.warn('Could not fetch information_schema.columns:', colsErr.message || colsErr);
    } else {
      console.log('eta_aggregates columns:', (cols || []).map(c => c.column_name).join(', '));
    }

    // Attempt a small sample without assuming column names
    const { data, error } = await supabase.from('eta_aggregates').select('*').limit(5);
    if (error) {
      console.error('Query error:', error.message || error);
      process.exit(2);
    }
    console.log('Sample rows (up to 5):', data || []);
    // Get approximate total count via head:true
    const { count, error: err2 } = await supabase.from('eta_aggregates').select('*', { count: 'exact', head: true });
    if (err2) console.warn('Count via select failed:', err2.message || err2);
    else console.log('Total rows (exact count header):', count ?? 'unknown');
  } catch (e) {
    console.error('Inspect failed:', e.message || e);
  }
}

main();
