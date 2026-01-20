import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  const startStr = start.toISOString().slice(0,10);
  const endStr = end.toISOString().slice(0,10);
  const filename = `management_summary_30d_${startStr}_to_${endStr}.pdf`;
  const filePath = path.join(process.cwd(), 'artifacts', filename);

  if (!fs.existsSync(filePath)) {
    console.error('PDF not found at', filePath);
    process.exit(2);
  }

  const bucket = 'reports';
  const remotePath = `management/${filename}`;

  // Attempt upload
  const file = fs.readFileSync(filePath);
  const { data, error } = await supabase.storage.from(bucket).upload(remotePath, file, { contentType: 'application/pdf', upsert: true });
  if (error) {
    console.error('Failed to upload to storage bucket', bucket, error);
    console.error('If the bucket does not exist, create it via Supabase UI or CLI: supabase storage create-bucket reports --public');
    process.exit(3);
  }

  // Insert metadata into reports table
  const { data: rData, error: rErr } = await supabase.from('reports').insert([{ file_name: filename, file_path: data.path, size_bytes: file.length }]).select().single();
  if (rErr) {
    console.warn('Failed to insert reports row:', rErr);
  } else {
    console.log('Inserted report row id:', rData.id);
  }

  // Make public URL (constructed fallback)
  let publicURL = undefined;
  try {
    const g = supabase.storage.from(bucket).getPublicUrl(remotePath);
    publicURL = (g && (g.publicURL || g.publicUrl)) || (g && g.data && g.data.publicUrl);
  } catch (e) {
    // ignore
  }
  if (!publicURL) {
    publicURL = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${remotePath}`;
  }
  console.log('Public URL:', publicURL);
}

(async () => {
  try {
    await run();
    process.exit(0);
  } catch (e) {
    console.error('upload script failed:', e);
    process.exit(4);
  }
})();
