import fs from 'fs';

const envPath = './.env.local';
if (!fs.existsSync(envPath)) {
  console.error('No .env.local found in workspace root');
  process.exit(1);
}
const env = fs.readFileSync(envPath, 'utf8');
const lines = env.split(/\r?\n/);
const map = {};
for (const l of lines) {
  if (!l || l.trim().startsWith('#') || !l.includes('=')) continue;
  const idx = l.indexOf('=');
  const k = l.slice(0, idx).trim();
  const v = l.slice(idx + 1).trim();
  map[k] = v;
}

const service_key = map['SUPABASE_SERVICE_ROLE_KEY'] || map['SUPABASE_KEY'];
const anon_key = map['VITE_SUPABASE_ANON_KEY'] || map['SUPABASE_ANON_KEY'] || '';
const url = (map['VITE_SUPABASE_URL'] || map['SUPABASE_URL'] || '').replace(/\/+$/, '') + '/auth/v1/admin/oauth/clients';

if (!service_key) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(2);
}
if (!url || url.includes('undefined')) {
  console.error('Supabase URL not found or invalid in .env.local');
  process.exit(3);
}

async function tryFetch(apikey, auth) {
  const headers = {};
  if (apikey) headers['apikey'] = apikey;
  if (auth) headers['Authorization'] = `Bearer ${auth}`;
  console.log('Requesting', url, 'with headers:', Object.keys(headers).join(', '));
  const res = await fetch(url, { method: 'GET', headers });
  const status = res.status;
  let body = '';
  try { body = await res.text(); } catch (e) { body = String(e); }
  console.log('\nHTTP', status);
  console.log(body.slice(0, 4000));
  return { status, body };
}

(async () => {
  try {
    // 1: try both headers set to service role key
    await tryFetch(service_key, service_key);
  } catch (e) {
    console.error('Fetch error:', e);
  }

  try {
    // 2: try apikey = anon, Authorization = service
    await tryFetch(anon_key, service_key);
  } catch (e) {
    // ignore
  }

  try {
    // 3: try only Authorization
    await tryFetch(null, service_key);
  } catch (e) {
    // ignore
  }

})();
