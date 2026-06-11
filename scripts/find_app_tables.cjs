#!/usr/bin/env node
/**
 * find_app_tables.cjs
 * Scans the src/ directory for all Supabase table references:
 *   .from('table_name')  or  .from("table_name")
 * Outputs a sorted unique list.
 */

const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '../src');
const EXTS      = new Set(['.ts', '.tsx', '.js', '.jsx']);
const TABLE_RE  = /\.from\(\s*['"`]([a-z_][a-z0-9_]*)['"`]\s*\)/g;

const tables = new Set();

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (EXTS.has(path.extname(entry.name))) {
      const src = fs.readFileSync(full, 'utf8');
      for (const m of src.matchAll(TABLE_RE)) {
        tables.add(m[1]);
      }
    }
  }
}

walk(ROOT);

const sorted = [...tables].sort();
console.log(JSON.stringify(sorted, null, 2));
