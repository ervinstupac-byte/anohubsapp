import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const TARGET_DIRS = [
  path.join(ROOT, 'src', 'components'),
  path.join(ROOT, 'src', 'shared')
];

const exts = new Set(['.ts', '.tsx']);
const IGNORE_DIRS = new Set(['__tests__', 'node_modules', 'dist']);

function normalizeText(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(src) {
  // keep identifiers and JSX-ish tokens
  const m = src.match(/[A-Za-z_][A-Za-z0-9_]*|<\/?[A-Za-z][A-Za-z0-9_-]*/g);
  return m ?? [];
}

function tokenWeights(tokens) {
  const m = new Map();
  for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
}

function hash64(str) {
  const buf = crypto.createHash('sha1').update(str).digest();
  // first 8 bytes
  return buf.subarray(0, 8);
}

function simhashFromWeights(weights) {
  // 64-bit simhash
  const acc = new Int32Array(64);
  for (const [tok, w] of weights.entries()) {
    const h = hash64(tok);
    for (let bit = 0; bit < 64; bit++) {
      const byte = h[Math.floor(bit / 8)];
      const mask = 1 << (bit % 8);
      acc[bit] += (byte & mask) ? w : -w;
    }
  }
  // produce 8-byte buffer
  const out = Buffer.alloc(8);
  for (let bit = 0; bit < 64; bit++) {
    if (acc[bit] > 0) {
      const i = Math.floor(bit / 8);
      out[i] |= 1 << (bit % 8);
    }
  }
  return out;
}

function popcnt8(x) {
  x = x - ((x >> 1) & 0x55);
  x = (x & 0x33) + ((x >> 2) & 0x33);
  return (((x + (x >> 4)) & 0x0f) * 0x01) & 0xff;
}

function hamming64(a, b) {
  let d = 0;
  for (let i = 0; i < 8; i++) d += popcnt8(a[i] ^ b[i]);
  return d;
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
      if (!exts.has(ext)) continue;
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

function isGaugeOrPanel(relPath, text) {
  const p = relPath.toLowerCase();
  if (p.includes('gauge') || p.includes('panel')) return true;
  // heuristics: common gauge/panel naming
  if (/\bGauge\b|\bPanel\b|\bDashboard\b/i.test(text)) return true;
  return false;
}

async function main() {
  const filesNested = await Promise.all(TARGET_DIRS.map((d) => walk(d)));
  const files = filesNested.flat();
  const items = [];

  for (const abs of files) {
    const rel = path.relative(ROOT, abs).replaceAll('\\', '/');
    const raw = await fs.readFile(abs, 'utf8');
    const norm = normalizeText(raw);
    if (!isGaugeOrPanel(rel, norm)) continue;
    const toks = tokenize(norm);
    const weights = tokenWeights(toks);
    const sig = simhashFromWeights(weights);
    items.push({ rel, size: raw.length, sig });
  }

  const maxHamming = Math.max(1, Number(process.env.MAX_HAMMING ?? 12));
  const pairs = [];

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      const dist = hamming64(a.sig, b.sig);
      if (dist <= maxHamming) {
        const sim = 1 - dist / 64;
        pairs.push({ sim, dist, a: a.rel, b: b.rel });
      }
    }
  }

  pairs.sort((x, y) => y.sim - x.sim);

  // cluster via union-find
  const parent = new Map();
  const find = (x) => {
    const p = parent.get(x) ?? x;
    if (p === x) return x;
    const r = find(p);
    parent.set(x, r);
    return r;
  };
  const union = (x, y) => {
    const rx = find(x);
    const ry = find(y);
    if (rx !== ry) parent.set(rx, ry);
  };

  for (const p of pairs) union(p.a, p.b);

  const clusters = new Map();
  for (const it of items) {
    const r = find(it.rel);
    const arr = clusters.get(r) ?? [];
    arr.push(it.rel);
    clusters.set(r, arr);
  }

  const clusterList = [...clusters.values()].filter((c) => c.length >= 2);
  clusterList.sort((a, b) => b.length - a.length);

  const topPairs = pairs.slice(0, 30);
  const report = {
    scannedDir: ['src/components', 'src/shared'],
    focus: 'gauge/panel-like components',
    maxHamming,
    filesConsidered: items.length,
    pairsAboveThreshold: pairs.length,
    topPairs,
    clusters: clusterList.slice(0, 25)
  };

  const outPath = path.join(ROOT, 'component-similarity-report.json');
  await fs.writeFile(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`wrote ${path.relative(ROOT, outPath)} (files=${items.length}, pairs=${pairs.length}, clusters=${clusterList.length})`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
