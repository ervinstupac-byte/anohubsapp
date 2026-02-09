import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const TARGET_DIR = path.join(ROOT, 'src', 'components');
const exts = new Set(['.ts', '.tsx']);
const IGNORE_DIRS = new Set(['__tests__', 'node_modules', 'dist']);

function normalize(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isDashboardOrGauge(rel) {
  const p = rel.toLowerCase();
  return p.includes('/dashboard/') || p.includes('gauge');
}

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      out.push(...(await walk(path.join(dir, e.name))));
    } else {
      const ext = path.extname(e.name);
      if (exts.has(ext)) out.push(path.join(dir, e.name));
    }
  }
  return out;
}

async function main() {
  const files = (await walk(TARGET_DIR)).map((abs) => ({
    abs,
    rel: path.relative(ROOT, abs).replaceAll('\\', '/')
  }));

  const buckets = new Map();

  for (const f of files) {
    if (!isDashboardOrGauge(f.rel)) continue;
    const raw = await fs.readFile(f.abs, 'utf8');
    const norm = normalize(raw);
    // ignore tiny
    if (norm.length < 500) continue;
    const hash = crypto.createHash('sha1').update(norm).digest('hex');
    const arr = buckets.get(hash) ?? [];
    arr.push({ rel: f.rel, bytes: raw.length });
    buckets.set(hash, arr);
  }

  const clusters = [...buckets.values()].filter((c) => c.length >= 2);
  clusters.sort((a, b) => b.length - a.length);

  const out = {
    scope: 'src/components (dashboard + gauge)',
    method: 'normalized-text sha1 (comment/whitespace stripped)',
    clusters
  };

  const outPath = path.join(ROOT, 'strict-duplicate-report.json');
  await fs.writeFile(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log(`wrote ${path.relative(ROOT, outPath)} (clusters=${clusters.length})`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
