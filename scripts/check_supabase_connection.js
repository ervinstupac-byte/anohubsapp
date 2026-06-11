#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnvFile(filePath = '.env.local') {
  const out = {};
  try {
    const txt = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf8');
    for (const ln of txt.split(/\r?\n/)) {
      const m = ln.match(/^\s*([A-Za-z_0-9]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let val = m[2] || '';
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      out[m[1]] = val;
    }
  } catch (e) {
    // ignore missing file
  }
  return out;
}

const fileEnv = loadEnvFile('.env.local');
const env = { ...process.env, ...fileEnv };

const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment or .env.local');
  process.exit(2);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

(async () => {
  try {
    console.log('Supabase URL:', SUPABASE_URL);
    console.log('Verifying access to table `forensic_reports` (HEAD, count)');
    const res = await supabase.from('forensic_reports').select('id', { head: true, count: 'exact' });
    if (res.error) {
      console.error('Query error:', res.error.message || res.error);
      process.exit(3);
    }
    console.log('Query OK. Count (may be undefined if head not supported):', res.count);

    try {
      if (supabase.storage && supabase.storage.listBuckets) {
        const list = await supabase.storage.listBuckets();
        console.log('Storage buckets count:', Array.isArray(list.data) ? list.data.length : 'unknown');
      } else {
        console.log('Storage bucket listing not available on this client version.');
      }
    } catch (e) {
      console.warn('Storage listing failed (may be permission-related):', e.message || e);
    }

    console.log('Supabase connection verification completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Connection verification failed:', err);
    process.exit(1);
  }
})();
