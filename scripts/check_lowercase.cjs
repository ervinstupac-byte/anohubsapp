#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      results.push(full);
      results.push(...await walk(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

(async () => {
  const argv = process.argv.slice(2);
  const target = argv[0] || 'dist/archive';
  try {
    await fs.access(target);
  } catch (e) {
    console.error('Directory not found:', target);
    process.exit(2);
  }
  const all = await walk(target);
  const bad = all.filter(p => /[A-Z]/.test(path.basename(p)));
  if (bad.length === 0) {
    console.log('OK: No uppercase names found under', target);
    process.exit(0);
  }
  console.log('Found', bad.length, 'entries with uppercase letters under', target);
  console.log(bad.slice(0,50).map(p => path.relative(process.cwd(), p)).join('\n'));
  process.exit(1);
})();
