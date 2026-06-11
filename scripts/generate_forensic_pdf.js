#!/usr/bin/env node
/*
  Server-side forensic PDF generator (Node.js + Puppeteer).
  Usage: node scripts/generate_forensic_pdf.js <asset_id>

  Notes:
  - Requires environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
    (or a .env.local file in the repo root with those entries).
  - Uploads PDF to Supabase Storage bucket `forensic-reports` and inserts a row into
    `forensic_reports` table.
*/

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';

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
    // ignore if file not present
  }
  return out;
}

const envFile = loadEnvFile('.env.local');
const env = { ...process.env, ...envFile };

const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment or .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function ensureBucket(bucket) {
  try {
    // try create (will error if exists) — ignore existing errors
    await supabase.storage.createBucket(bucket, { public: false });
  } catch (e) {
    // ignore
  }
}

async function main() {
  const assetId = process.argv[2];
  if (!assetId) {
    console.error('Usage: node scripts/generate_forensic_pdf.js <asset_id>');
    process.exit(1);
  }

  // Fetch some contextual data (best-effort)
  let asset = null;
  try {
    const { data, error } = await supabase.from('plants').select('*').eq('id', assetId).maybeSingle();
    if (!error && data) asset = data;
  } catch (e) { /* ignore */ }

  if (!asset) {
    try {
      const { data } = await supabase.from('assets').select('*').eq('id', assetId).maybeSingle();
      asset = data;
    } catch (e) { /* ignore */ }
  }

  const { data: telemetry } = await supabase.from('telemetry_samples').select('*').eq('asset_id', assetId).order('created_at', { ascending: false }).limit(20);

  // Build simple HTML report (extend as needed)
  const html = `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Forensic Report ${assetId}</title>
    <style>
      body{font-family: Inter, Arial, sans-serif; padding:24px; color:#0f172a}
      h1{color:#0369a1}
      pre{background:#f8fafc;padding:12px;border-radius:6px}
      table{width:100%;border-collapse:collapse;margin-top:12px}
      th,td{padding:6px;border:1px solid #e6e9ef;font-size:12px;text-align:left}
    </style>
  </head>
  <body>
    <h1>Forensic Report — Asset ${assetId}</h1>
    <p>Generated: ${new Date().toISOString()}</p>
    <h2>Asset Metadata</h2>
    <pre>${JSON.stringify(asset || {}, null, 2)}</pre>
    <h2>Recent Telemetry (${(telemetry || []).length})</h2>
    <table>
      <thead><tr><th>time</th><th>sensor</th><th>payload</th></tr></thead>
      <tbody>
        ${(telemetry || []).map(t => `<tr><td>${t.created_at}</td><td>${t.sensor_id||t.key||''}</td><td>${JSON.stringify(t.payload||t.value||t)}</td></tr>`).join('')}
      </tbody>
    </table>
  </body>
  </html>`;

  // Render PDF via Puppeteer
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  // Upload to storage and record DB row
  const bucket = 'forensic-reports';
  await ensureBucket(bucket);
  const fileName = `forensic_${assetId}_${Date.now()}.pdf`;
  const uploadPath = `${assetId}/${fileName}`;

  const { data: uploadData, error: uploadErr } = await supabase.storage.from(bucket).upload(uploadPath, pdfBuffer, { contentType: 'application/pdf' });
  if (uploadErr) {
    console.error('Upload failed:', uploadErr);
    process.exit(1);
  }

  const storagePath = `${bucket}/${uploadPath}`;
  const { error: insertErr } = await supabase.from('forensic_reports').insert([{ asset_id: assetId, created_by: null, report_type: 'FORENSIC_DOSSIER', storage_path: storagePath, status: 'READY', meta: { file: uploadPath, bytes: pdfBuffer.length } }]);
  if (insertErr) console.warn('Failed to insert forensic_reports row:', insertErr);

  // Create signed URL for download (1 hour)
  try {
    const { data: signed, error: signedErr } = await supabase.storage.from(bucket).createSignedUrl(uploadPath, 60 * 60);
    if (signedErr) console.warn('Signed URL error:', signedErr);
    else console.log('Signed URL:', signed.signedUrl || signed.signedURL || signed.signed_url || signed?.signedURL || signed?.signedUrl);
  } catch (e) {
    console.warn('Signed URL generation failed', e);
  }

  console.log('Done. Uploaded to', storagePath);
}

main().catch(err => { console.error(err); process.exit(1); });
