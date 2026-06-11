#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'supabase', 'migrations');

async function loadEnvFile(filePath = '.env.local') {
  const out = {};
  try {
    const txt = await fs.readFile(path.resolve(process.cwd(), filePath), 'utf8');
    for (const ln of txt.split(/\r?\n/)) {
      const m = ln.match(/^\s*([A-Za-z_0-9]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let val = m[2] || '';
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      // expand simple ${VAR} references from already-read file or process.env
      val = val.replace(/\$\{([^}]+)\}/g, (_, k) => out[k] || process.env[k] || '');
      out[m[1]] = val;
    }
  } catch (e) {
    // ignore missing file
  }
  return out;
}

async function main() {
  const fileEnv = await loadEnvFile('.env.local');
  const env = { ...process.env, ...fileEnv };

  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_KEY || env.SUPABASE_SERVICE_ROLE || env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_ROLE || env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('SUPABASE_URL or SUPABASE_KEY (service role) not provided. Aborting.');
    process.exit(2);
  }

  const client = createClient(url, key, {
    auth: { persistSession: false }
  });

  // Check postgres query support
  const canQuery = !!(client && (client.postgres && typeof client.postgres.query === 'function'));
  if (!canQuery) {
    console.error('Supabase client does not support postgres.query in this runtime. Ensure @supabase/supabase-js v2+ is installed.');
    process.exit(3);
  }

  try {
    const files = await fs.readdir(MIGRATIONS_DIR);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

    console.log(`Found ${sqlFiles.length} migration(s) in ${MIGRATIONS_DIR}`);

    for (const file of sqlFiles) {
      const full = path.join(MIGRATIONS_DIR, file);
      console.log(`Applying: ${file}`);
      const sql = await fs.readFile(full, 'utf8');

      if (!sql.trim()) {
        console.log(`  Skipping empty file ${file}`);
        continue;
      }

      try {
        const res = await client.postgres.query({ sql });
        console.log(`  OK: ${file} — rows: ${res?.rows?.length ?? 'n/a'}`);
      } catch (e) {
        console.error(`  ERROR applying ${file}:`, (e && e.message) || e);
        // Halt on error to avoid partial migrations
        process.exitCode = 1;
        throw e;
      }
    }

    console.log('All migrations applied.');
  } catch (err) {
    console.error('Migration runner failed:', err);
    process.exit(1);
  }
}

// Allow top-level await style
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
