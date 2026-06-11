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
const base = (map['VITE_SUPABASE_URL'] || map['SUPABASE_URL'] || '').replace(/\/+$/, '');
const url = base + '/auth/v1/admin/oauth/clients';

if (!service_key) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(2);
}
if (!base || base.includes('undefined')) {
  console.error('Supabase URL not found or invalid in .env.local');
  process.exit(3);
}

function redact(obj) {
  if (obj == null) return obj;
  const copy = Array.isArray(obj) ? obj.map(redact) : { ...obj };
  if (typeof copy === 'object') {
    for (const k of Object.keys(copy)) {
      if (/secret|client_secret|secret_key|secretKey|password/i.test(k)) {
        copy[k] = '<redacted>'; 
      } else if (typeof copy[k] === 'object') {
        copy[k] = redact(copy[k]);
      }
    }
  }
  return copy;
}

(async () => {
  try {
    const headers = { apikey: service_key, Authorization: `Bearer ${service_key}` };
    console.log('Requesting', url, 'with headers: apikey + Authorization');
    const res = await fetch(url, { method: 'GET', headers });
    const status = res.status;
    const text = await res.text();
    console.log('\nHTTP', status);
    if (!text) {
      console.log('(empty response)');
      process.exit(0);
    }
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.log('Non-JSON response:\n', text.slice(0, 4000));
      process.exit(0);
    }

    // Normalize: some endpoints return an array, others return {clients: [...]} or {}.
    let clients = [];
    if (Array.isArray(json)) clients = json;
    else if (json && Array.isArray(json.clients)) clients = json.clients;
    else if (Object.keys(json).length === 0) clients = [];
    else if (Array.isArray(json.data)) clients = json.data; // fallback
    else {
      // If it's an object with keys that look like clients, try to treat as single client
      clients = [json];
    }

    if (!clients || clients.length === 0) {
      console.log('No OAuth clients found (empty list).');
      process.exit(0);
    }

    console.log('\nFound', clients.length, 'OAuth client(s):');
    for (const c of clients) {
      const safe = redact(c);
      // Print concise info only
      const name = safe.name || safe.client_name || safe.metadata?.name || '<unnamed>';
      const client_id = safe.client_id || safe.clientId || '<no-id>';
      const redirect = safe.redirect_uris || safe.redirect_uri || safe.redirectUris || safe.redirect || safe.redirectUri || safe.metadata?.redirect_uris || '[]';
      console.log('\n- name:', name);
      console.log('  client_id:', client_id);
      console.log('  redirect_uris:', Array.isArray(redirect) ? redirect.join(', ') : redirect);
      // If there are other non-sensitive metadata fields, print them
      const extra = { description: safe.description || safe.metadata?.description };
      console.log('  description:', extra.description || '');
    }

  } catch (err) {
    console.error('Fetch error:', err);
    process.exit(10);
  }
})();
