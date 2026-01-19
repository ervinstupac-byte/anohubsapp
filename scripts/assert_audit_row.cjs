const { createClient } = require('@supabase/supabase-js');

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('Supabase credentials not provided in env');
    process.exit(2);
  }

  const supabase = createClient(url, key);

  try {
    const { data, error } = await supabase
      .from('automated_actions_audit')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Supabase query error', error);
      process.exit(3);
    }

    console.log('Latest audit rows:', data ? data.slice(0, 5) : []);

    // Look for test-asset-1 row
    const found = (data || []).find(r => r.asset_id === 'test-asset-1');
    if (!found) {
      console.error('No audit row found for test-asset-1');
      process.exit(4);
    }

    console.log('Audit verification PASSED for test-asset-1:', found.id || found);
    process.exit(0);
  } catch (err) {
    console.error('Assertion error', err);
    process.exit(5);
  }
}

main();
