import { randomBytes, createHash } from 'crypto';
import fs from 'fs';

const env = fs.readFileSync('./.env.local', 'utf8');
const map = Object.fromEntries(env.split(/\r?\n/).filter(Boolean).map(l => { const i = l.indexOf('='); return [l.slice(0,i), l.slice(i+1)]; }));
const base = (map['VITE_SUPABASE_URL'] || map['SUPABASE_URL'] || '').replace(/\/+$/, '');
const client_id = process.argv[2] || process.env.CLIENT_ID || '';
if (!client_id) {
  console.error('Usage: node open_authorize_pkce.mjs <client_id>');
  process.exit(1);
}
const redirect = encodeURIComponent('https://anohubsapp-anohubs-projects.vercel.app/oauth/callback');

function base64url(buffer) {
  return buffer.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const verifier = base64url(randomBytes(32));
const digest = createHash('sha256').update(verifier).digest();
const challenge = base64url(digest);
// Save verifier so user can exchange code later if needed
fs.writeFileSync('./.tmp_pkce_verifier', verifier);

const url = `${base}/auth/v1/oauth/authorize?client_id=${client_id}&response_type=code&scope=openid%20email%20profile&redirect_uri=${redirect}&code_challenge=${challenge}&code_challenge_method=S256&state=pkce_test`;
console.log(url);
