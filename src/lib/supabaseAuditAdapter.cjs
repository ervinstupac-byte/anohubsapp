const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

let supabase = null;

function getSupabaseClient() {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  supabase = createClient(url, key);
  return supabase;
}

async function persistAuditRecord(record) {
  const integration = (process.env.INTEGRATION_MODE || 'false').toLowerCase() === 'true';
  if (!integration) {
    const outDir = path.join(process.cwd(), 'artifacts');
    try {
      fs.mkdirSync(outDir, { recursive: true });
      const file = path.join(outDir, `audit_simulated_${Date.now()}.json`);
      fs.writeFileSync(file, JSON.stringify(record, null, 2), 'utf8');
      return { inserted: false, path: file, message: 'Integration disabled; wrote simulated audit file.' };
    } catch (err) {
      return { inserted: false, error: String(err) };
    }
  }

  const client = getSupabaseClient();
  if (!client) {
    return { inserted: false, error: 'Supabase credentials not provided in env' };
  }

  try {
    const { data, error } = await client.from('automated_actions_audit').insert(record).select();
    if (error) return { inserted: false, error };
    return { inserted: true, data };
  } catch (err) {
    return { inserted: false, error: String(err) };
  }
}

module.exports = { persistAuditRecord };
