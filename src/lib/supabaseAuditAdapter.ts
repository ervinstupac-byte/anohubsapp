import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  supabase = createClient(url, key);
  return supabase;
}

export async function persistAuditRecord(record: any) {
  const integration = (process.env.INTEGRATION_MODE || 'false').toLowerCase() === 'true';
  if (!integration) {
    // In non-integration mode we only write a local mock for visibility
    const outDir = path.join(process.cwd(), 'artifacts');
    try {
      fs.mkdirSync(outDir, { recursive: true });
      const file = path.join(outDir, `audit_mock_${Date.now()}.json`);
      fs.writeFileSync(file, JSON.stringify(record, null, 2), 'utf8');
      return { inserted: false, path: file, message: 'Integration disabled; wrote mock audit file.' };
    } catch (err) {
      return { inserted: false, error: String(err) };
    }
  }

  const client = getSupabaseClient();
  if (!client) {
    return { inserted: false, error: 'Supabase credentials not provided in env' };
  }

  try {
    const { data, error } = await client
      .from('automated_actions_audit')
      .insert(record)
      .select();

    if (error) return { inserted: false, error };
    return { inserted: true, data };
  } catch (err) {
    return { inserted: false, error: String(err) };
  }
}
