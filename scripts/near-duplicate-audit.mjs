import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const TARGET_DIRS = [
  path.join(ROOT, 'src', 'components'),
  path.join(ROOT, 'src', 'shared')
];

const exts = new Set(['.ts', '.tsx', '.js', '.jsx']);
const IGNORE_DIRS = new Set(['__tests__', 'node_modules', 'dist']);

function normalizeText(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeForSimilarity(src) {
  // Remove string/number noise and collapse identifiers so "same component, different names" still clusters.
  // Keep JSX tags and core TS/JS keywords to avoid over-collapsing.
  const withoutLiterals = src
    .replace(/`[^`]*`/g, '`STR`')
    .replace(/"(?:\\.|[^"\\])*"/g, '"STR"')
    .replace(/'(?:\\.|[^'\\])*'/g, "'STR'")
    .replace(/\b\d+(?:\.\d+)?\b/g, 'NUM');

  // Collapse identifiers, but keep common keywords and JSX-ish tokens.
  const keywords = new Set([
    'import','from','export','default','return','const','let','var','function','class','extends','implements',
    'interface','type','enum','new','if','else','for','while','switch','case','break','continue','try','catch','finally',
    'async','await','throw','true','false','null','undefined','in','of','as','typeof','keyof',
    'React','useState','useEffect','useMemo','useCallback','useRef','useContext','useReducer','memo','lazy','Suspense'
  ]);

  return withoutLiterals.replace(/\b[A-Za-z_][A-Za-z0-9_]*\b/g, (m) => (keywords.has(m) ? m : 'ID'));
}

function tokenize(src) {
  // identifiers and JSX-ish tags
  const m = src.match(/[A-Za-z_][A-Za-z0-9_]*|<\/?[A-Za-z][A-Za-z0-9_-]*/g);
  return m ?? [];
}

function shingles(tokens, k) {
  const s = new Set();
  if (tokens.length < k) return s;
  for (let i = 0; i <= tokens.length - k; i++) {
    s.add(tokens.slice(i, i + k).join(' '));
  }
  return s;
}

function tokenWeights(tokens) {
  const m = new Map();
  for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
}

function hash64(str) {
  const buf = crypto.createHash('sha1').update(str).digest();
  return buf.subarray(0, 8);
}

function simhashFromWeights(weights) {
  const acc = new Int32Array(64);
  for (const [tok, w] of weights.entries()) {
    const h = hash64(tok);
    for (let bit = 0; bit < 64; bit++) {
      const byte = h[Math.floor(bit / 8)];
      const mask = 1 << (bit % 8);
      acc[bit] += (byte & mask) ? w : -w;
    }
  }
  const out = Buffer.alloc(8);
  for (let bit = 0; bit < 64; bit++) {
    if (acc[bit] > 0) out[Math.floor(bit / 8)] |= 1 << (bit % 8);
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

function overlapRatio(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let inter = 0;
  const [small, large] = setA.size < setB.size ? [setA, setB] : [setB, setA];
  for (const x of small) if (large.has(x)) inter++;
  return inter / Math.min(setA.size, setB.size);
}

function isDashboardOrGauge(relPath, normText) {
  const p = relPath.toLowerCase();
  if (p.includes('/dashboard/')) return true;
  if (p.includes('gauge')) return true;
  if (/\bDashboard\b|\bGauge\b/i.test(normText)) return true;
  return false;
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
  const maxHamming = Number(process.env.MAX_HAMMING ?? 2);
  const minOverlap = Number(process.env.MIN_OVERLAP ?? 0.98);
  const shingleK = Math.max(3, Number(process.env.SHINGLE_K ?? 5));
  const minSizeRatio = Number(process.env.MIN_SIZE_RATIO ?? 0.85);

  const filesNested = await Promise.all(TARGET_DIRS.map((d) => walk(d)));
  const files = filesNested.flat();

  const items = [];
  for (const abs of files) {
    const rel = path.relative(ROOT, abs).replaceAll('\\', '/');
    const raw = await fs.readFile(abs, 'utf8');
    const norm = normalizeText(raw);
    if (!isDashboardOrGauge(rel, norm)) continue;
    if (norm.length < 800) continue;

    const simNorm = normalizeForSimilarity(norm);
    const toks = tokenize(simNorm);
    const shSet = shingles(toks, shingleK);
    const weights = tokenWeights(toks);
    const sig = simhashFromWeights(weights);

    items.push({ rel, bytes: raw.length, sig, shSetSize: shSet.size, shSet });
  }

  const pairs = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];

      const sizeRatio = Math.min(a.bytes, b.bytes) / Math.max(a.bytes, b.bytes);
      if (sizeRatio < minSizeRatio) continue;

      const dist = hamming64(a.sig, b.sig);
      if (dist > maxHamming) continue;
      const overlap = overlapRatio(a.shSet, b.shSet);
      if (overlap < minOverlap) continue;
      pairs.push({
        a: a.rel,
        b: b.rel,
        dist,
        overlap,
        sizeRatio,
        simhashSim: 1 - dist / 64
      });
    }
  }

  // union-find clusters
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
    arr.push({ rel: it.rel, bytes: it.bytes, shSetSize: it.shSetSize });
    clusters.set(r, arr);
  }

  const clusterList = [...clusters.values()].filter((c) => c.length >= 2);
  clusterList.sort((a, b) => b.length - a.length);

  pairs.sort((x, y) => (y.overlap - x.overlap) || (x.dist - y.dist));

  const out = {
    scope: ['src/components', 'src/shared'],
    focus: 'dashboards + gauges',
    criteria: { maxHamming, minOverlap, shingleK, minSizeRatio },
    filesConsidered: items.length,
    pairMatches: pairs.length,
    clusters: clusterList,
    topPairs: pairs.slice(0, 50)
  };

  // strip heavy sets
  for (const it of items) delete it.shSet;

  const outPath = path.join(ROOT, 'near-duplicate-report.json');
  await fs.writeFile(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log(`wrote ${path.relative(ROOT, outPath)} (files=${items.length}, pairs=${pairs.length}, clusters=${clusterList.length})`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
