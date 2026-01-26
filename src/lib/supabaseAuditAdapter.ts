import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
    // In non-integration mode we avoid Node FS access on the browser.
    if (typeof window === 'undefined') {
      // Server-side fallback: write to artifacts as before
      try {
        // dynamic require to avoid bundler resolving `fs` in browser builds
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const req = (Function('return require'))();
        const fs = req('fs');
        const path = req('path');
        const outDir = path.join(process.cwd(), 'artifacts');
        fs.mkdirSync(outDir, { recursive: true });
        const file = path.join(outDir, `audit_mock_${Date.now()}.json`);
        fs.writeFileSync(file, JSON.stringify(record, null, 2), 'utf8');
        return { inserted: false, path: file, message: 'Integration disabled; wrote mock audit file (server).' };
      } catch (err) {
        return { inserted: false, error: String(err) };
      }
    }

    // Browser fallback: persist to localStorage so the client still records an audit mock
    try {
      const key = 'audit_mock_history_v1';
      const prev = JSON.parse(localStorage.getItem(key) || '[]');
      prev.push({ ts: Date.now(), record });
      localStorage.setItem(key, JSON.stringify(prev));
      return { inserted: false, storage: 'localStorage', message: 'Integration disabled; wrote mock audit record to localStorage.' };
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
