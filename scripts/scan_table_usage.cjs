#!/usr/bin/env node
/**
 * scan_table_usage.cjs
 * For each missing table, finds all .from('table') usages and extracts surrounding context
 * (select fields, insert objects, filter keys) to infer schema.
 */

const fs   = require('fs');
const path = require('path');

const MISSING_TABLES = [
  'asset_financials_with_eta',
  'avatars',
  'century_plans',
  'component_encyclopedia',
  'dynamic_sensor_data',
  'experience_ledger',
  'expert_efficiency_curves',
  'expert_knowledge_base',
  'hydrology_context',
  'logbook_entries',
  'operator_feedback',
  'plants',
  'reports',
  'telemetry_logs',
  'telemetry_samples',
  'turbine_bids',
  'turbine_designs',
];

const ROOT = path.resolve(__dirname, '../src');
const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx']);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (EXTS.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

const allFiles = walk(ROOT);
const results = {};

for (const table of MISSING_TABLES) {
  results[table] = [];
  const re = new RegExp(`\\.from\\(['"\`]${table}['"\`]\\)`, 'g');
  for (const file of allFiles) {
    const src = fs.readFileSync(file, 'utf8');
    const lines = src.split('\n');
    lines.forEach((line, i) => {
      if (re.test(line)) {
        // grab 8 lines of context around the hit
        const start = Math.max(0, i - 2);
        const end   = Math.min(lines.length - 1, i + 8);
        results[table].push({
          file: path.relative(ROOT, file),
          line: i + 1,
          context: lines.slice(start, end + 1).join('\n'),
        });
      }
      re.lastIndex = 0;
    });
  }
}

for (const [table, hits] of Object.entries(results)) {
  if (hits.length === 0) {
    console.log(`\n### ${table} — NO HITS FOUND ###`);
    continue;
  }
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TABLE: ${table}  (${hits.length} usage(s))`);
  console.log('='.repeat(60));
  for (const h of hits) {
    console.log(`\nFile: ${h.file}  Line ${h.line}`);
    console.log('---');
    console.log(h.context);
  }
}
