import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(new URL(import.meta.url).pathname.replace(/^\//, ''), '..', '..');
// On Windows the above may produce a leading drive slash; normalize by allowing cwd
// Instead, use process.cwd()
const root = process.cwd();

function walk(dir) {
  const acc = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (name === 'node_modules' || name === '.git' || name === 'dist') continue;
      acc.push(...walk(full));
    } else if (/\.(ts|tsx|js|jsx)$/.test(name)) {
      acc.push(full);
    }
  }
  return acc;
}

function extractImports(fileContent) {
  // remove block comments first
  const cleaned = fileContent.replace(/\/\*[\s\S]*?\*\//g, '');
  const lines = cleaned.split(/\r?\n/);
  const imports = [];
  const re = /import\s+[^'\"]+['\"]([^'\\"]+)['\"]/;
  for (const l of lines) {
    const trimmed = l.trim();
    if (trimmed.startsWith('//')) continue;
    // ignore inline commented imports
    const commentIdx = trimmed.indexOf('//');
    const effective = commentIdx >= 0 ? trimmed.slice(0, commentIdx) : trimmed;
    const m = effective.match(re);
    if (m) imports.push(m[1]);
  }
  return imports;
}

function findActualPath(expected) {
  // expected absolute path
  const parts = expected.split(path.sep);
  let cur = parts[0] === '' ? path.sep : parts[0];
  if (!path.isAbsolute(expected)) cur = path.isAbsolute(process.cwd()) ? path.parse(process.cwd()).root : '';
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p === '' || p === '.' || p === path.sep) continue;
    const dir = cur || path.sep;
    const entries = fs.readdirSync(dir);
    const found = entries.find(e => e.toLowerCase() === p.toLowerCase());
    if (!found) return null;
    cur = path.join(dir, found);
  }
  return cur;
}

function checkCaseSensitiveMatch(expectedAbs) {
  // Walk up from root and check each component matches case
  const rel = path.relative(root, expectedAbs);
  const parts = rel.split(path.sep);
  let cur = root;
  for (const part of parts) {
    const entries = fs.readdirSync(cur);
    const found = entries.find(e => e === part);
    if (!found) {
      // exists but casing differs?
      const pli = entries.find(e => e.toLowerCase() === part.toLowerCase());
      if (pli) {
        return { ok: false, actual: path.join(cur, pli) };
      }
      return { ok: false, actual: null };
    }
    cur = path.join(cur, part);
  }
  return { ok: true, actual: cur };
}

(async function main(){
  const files = walk(root);
  const reports = [];
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    const imports = extractImports(content);
    for (const imp of imports) {
      if (!imp.startsWith('.')) continue;
      const base = path.dirname(f);
      const resolved = path.resolve(base, imp);
      const candidates = [resolved, resolved + '.ts', resolved + '.tsx', resolved + '.js', resolved + '.jsx', path.join(resolved, 'index.ts'), path.join(resolved, 'index.tsx'), path.join(resolved, 'index.js'), path.join(resolved, 'index.jsx')];
      let found = null;
      for (const c of candidates) {
        if (fs.existsSync(c)) { found = c; break; }
      }
      if (!found) {
        reports.push({ file: f, import: imp, issue: 'not_found', resolved: resolved });
        continue;
      }
      const check = checkCaseSensitiveMatch(found);
      if (!check.ok) {
        reports.push({ file: f, import: imp, issue: 'case_mismatch', expected: found, actual: check.actual });
      }
    }
  }
  if (reports.length === 0) {
    console.log('No import case issues detected.');
    process.exit(0);
  }
  console.log('Import case issues:');
  for (const r of reports) {
    console.log(JSON.stringify(r));
  }
  process.exit(0);
})();
