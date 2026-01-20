#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'supabase', 'migrations');

async function main() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_SERVICE_ROLE;

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
