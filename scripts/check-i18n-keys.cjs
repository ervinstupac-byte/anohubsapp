#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const enFile = path.join(srcDir, 'i18n', 'en.json');
if (!fs.existsSync(enFile)) {
  console.error('en.json not found');
  process.exit(2);
}
const en = JSON.parse(fs.readFileSync(enFile, 'utf8'));

function flatten(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') acc[key] = v;
    else Object.assign(acc, flatten(v, key));
    return acc;
  }, {});
}

const keys = new Set(Object.keys(flatten(en)));

function findFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let results = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) results = results.concat(findFiles(full));
    else if (/\.tsx?$/.test(e.name)) results.push(full);
  }
  return results;
}

const files = findFiles(srcDir);
const used = new Set();
const missing = new Set();

// Match only standalone `t('key')` calls (avoid matching `.split('.')` etc.)
// Require the key to start with a letter to avoid numeric/test literals like '12.34'
const regex = /(?<![A-Za-z0-9_.$])t\(['"`]([a-zA-Z][a-zA-Z0-9_.-]*)['"`]\)/g;
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = regex.exec(content)) !== null) {
    const key = m[1];
    used.add(key);
    if (!keys.has(key)) {
      missing.add(key);
      console.error(`Missing key "${key}" referenced in file: ${f}`);
    }
  }
}

if (missing.size > 0) {
  console.error('Missing translation keys detected:');
  for (const k of missing) console.error(' -', k);
  process.exit(3);
}

console.log('All translation keys present. Keys used:', used.size);
process.exit(0);
