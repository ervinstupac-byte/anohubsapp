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
      val = val.replace(/\$\{([^}]+)\}/g, (_, k) => out[k] || process.env[k] || '');
      out[m[1]] = val;
    }
  } catch (e) {
    // ignore
  }
  return out;
}

const fileEnv = loadEnvFile('.env.local');
const env = { ...process.env, ...fileEnv };

const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_KEY || env.SUPABASE_SERVICE_ROLE;
const ANON_KEY = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_KEY || !ANON_KEY) {
  console.error('Missing SUPABASE_URL, SERVICE_KEY or ANON_KEY in environment or .env.local');
  process.exit(2);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const anon = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

(async () => {
  console.log('Testing anon client access to `forensic_reports`...');
  try {
    const a = await anon.from('forensic_reports').select('id').limit(1);
    console.log('  anon select -> error:', a.error ? a.error.message || a.error : null, 'rows:', Array.isArray(a.data) ? a.data.length : null);
  } catch (e) {
    console.error('  anon select threw:', String(e));
  }

  console.log('Testing service-role (admin) client access to `forensic_reports`...');
  try {
    const s = await admin.from('forensic_reports').select('id').limit(1);
    console.log('  admin select -> error:', s.error ? s.error.message || s.error : null, 'rows:', Array.isArray(s.data) ? s.data.length : null);
  } catch (e) {
    console.error('  admin select threw:', String(e));
  }

  // Try creating a temporary test user and signing in (to simulate authenticated client)
  const testEmail = `rls-test+${Date.now()}@example.com`;
  const testPassword = 'Test1234!';
  console.log('Creating temporary test user via admin API:', testEmail);
  try {
    const { data: createdUser, error: createErr } = await admin.auth.admin.createUser({ email: testEmail, password: testPassword });
    if (createErr) {
      console.error('  createUser error:', createErr.message || createErr);
    } else {
      console.log('  created user id:', createdUser?.id);

      console.log('Signing in as test user (anon client)...');
      const signRes = await anon.auth.signInWithPassword({ email: testEmail, password: testPassword });
      if (signRes.error) {
        console.error('  signIn error:', signRes.error.message || signRes.error);
      } else {
        const session = signRes.data?.session;
        console.log('  signed in, session present:', !!session);
        if (session) {
          // set session on anon client (so subsequent requests use auth header)
          await anon.auth.setSession({ access_token: session.access_token, refresh_token: session.refresh_token });
          const authSelect = await anon.from('forensic_reports').select('id').limit(1);
          console.log('  authenticated select -> error:', authSelect.error ? authSelect.error.message || authSelect.error : null, 'rows:', Array.isArray(authSelect.data) ? authSelect.data.length : null);
        }
      }
    }
  } catch (e) {
    console.error('  test user flow error:', String(e));
  }

  console.log('RLS validation script completed.');
  process.exit(0);
})();
