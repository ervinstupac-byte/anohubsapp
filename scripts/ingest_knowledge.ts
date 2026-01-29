#!/usr/bin/env tsx
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const argv = process.argv.slice(2);
  const fileArgIndex = argv.findIndex(a => a === '--file');
  const dryRun = argv.includes('--dry-run') || argv.includes('--dryrun');
  const filePath = fileArgIndex >= 0 && argv[fileArgIndex + 1] ? argv[fileArgIndex + 1] : 'scripts/extracted_expert_knowledge.json';

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

  const content = await fs.readFile(path.resolve(process.cwd(), filePath), 'utf-8');
  const entries = JSON.parse(content || '[]');
  if (!Array.isArray(entries) || entries.length === 0) {
    console.log('No entries to ingest');
    return;
  }

  const normalized = entries.map((e: any) => ({
    symptom_key: String(e.symptom_key || '').slice(0, 120),
    diagnosis: (e.diagnosis || '').replace(/\r\n|\r/g, '\n').trim(),
    recommended_action: (e.recommended_action || '').replace(/\r\n|\r/g, '\n').trim(),
    severity: (['LOW','MEDIUM','HIGH','CRITICAL'].includes((e.severity||'').toUpperCase()) ? (e.severity||'MEDIUM').toUpperCase() : 'MEDIUM')
  }));

  if (dryRun) {
    console.log('DRY RUN: normalized payload (first 50 entries shown)');
    console.log(JSON.stringify(normalized.slice(0, 50), null, 2));

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.log(`Would upsert ${normalized.length} entries (no DB connection available to determine INSERT vs UPDATE counts).`);
      return;
    }

    // If env provided, compute exact INSERT vs UPDATE by checking existing keys
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const keys = normalized.map((n: any) => n.symptom_key);
    try {
      const { data: existing } = await supabase.from('expert_knowledge_base').select('symptom_key').in('symptom_key', keys);
      const existSet = new Set((existing || []).map((r: any) => r.symptom_key));
      let inserts = 0, updates = 0;
      for (const k of keys) {
        if (existSet.has(k)) updates++; else inserts++;
      }
      console.log(`Dry-run DB check: ${inserts} INSERT(s) and ${updates} UPDATE(s) would be performed.`);
    } catch (err) {
      console.error('Dry-run DB lookup failed', err);
    }

    return;
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY / SUPABASE_SERVICE_ROLE_KEY in environment. Aborting.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log(`Upserting ${normalized.length} entries into expert_knowledge_base (onConflict symptom_key)`);
  const { data, error } = await supabase
    .from('expert_knowledge_base')
    .upsert(normalized, { onConflict: 'symptom_key' })
    .select();

  if (error) {
    console.error('Upsert failed', error);
    process.exit(2);
  }

  console.log('Upsert succeeded. Rows returned:', (data || []).length);
}

main().catch(err => { console.error(err); process.exit(1); });
