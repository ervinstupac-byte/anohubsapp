#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'src', 'i18n', 'en.json');
if (!fs.existsSync(file)) {
  console.error('Translation file not found:', file);
  process.exit(2);
}

const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const flatten = (obj, prefix = '') => Object.entries(obj).reduce((acc, [k, v]) => {
  const key = prefix ? `${prefix}.${k}` : k;
  if (typeof v === 'string') acc[key] = v;
  else Object.assign(acc, flatten(v, key));
  return acc;
}, {});

const flat = flatten(data);
const empty = Object.entries(flat).filter(([, v]) => !v || v.trim() === '');
if (empty.length) {
  console.error('Empty translation values found:');
  empty.forEach(([k]) => console.error(' -', k));
  process.exit(3);
}

console.log('i18n check passed. Keys:', Object.keys(flat).length);
process.exit(0);
