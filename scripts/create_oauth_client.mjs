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

const payload = {
  name: 'AnoHUB OAuth App (auto-created)',
  redirect_uris: [
    'https://anohubsapp-anohubs-projects.vercel.app/oauth/callback',
    'https://anohubsapp-anohubs-projects.vercel.app/oauth/consent',
    'http://localhost:3000/oauth/callback',
    'http://localhost:5173/oauth/callback'
  ],
  grant_types: [ 'authorization_code' ],
  response_types: [ 'code' ],
  token_endpoint_auth_method: 'client_secret_basic'
};

async function main() {
  try {
    console.log('Creating OAuth client at', url);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': service_key,
        'Authorization': `Bearer ${service_key}`
      },
      body: JSON.stringify(payload)
    });
    const bodyText = await res.text();
    let json;
    try { json = JSON.parse(bodyText); } catch (e) { json = { raw: bodyText }; }

    if (!res.ok) {
      console.error('Error creating client. HTTP', res.status);
      console.error(JSON.stringify(json, null, 2));
      process.exit(4);
    }

    // Normalize client info
    const client = Array.isArray(json) ? json[0] : (json?.client || json);
    // Redact secrets
    if (client && typeof client === 'object') {
      const safe = { ...client };
      if (safe.client_secret) safe.client_secret = '<redacted>';
      if (safe.secret) safe.secret = '<redacted>';
      console.log('Created OAuth client:');
      console.log('  name:', safe.name || safe.client_name || '<unnamed>');
      console.log('  client_id:', safe.client_id || safe.clientId || '<no-id>');
      console.log('  redirect_uris:', (safe.redirect_uris || safe.redirectUris || []).join(', '));
      if (safe.client_secret) console.log('  client_secret: <redacted>');
      else console.log('  client_secret: (not returned)');
    } else {
      console.log('Response:', JSON.stringify(json, null, 2));
    }

  } catch (err) {
    console.error('Request failed:', err);
    process.exit(10);
  }
}

main();
