#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

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

function hasUppercase(s) {
  return /[A-Z]/.test(path.basename(s));
}

function toLowerSegments(p, baseDir) {
  const rel = path.relative(baseDir, p);
  const parts = rel.split(path.sep).map(s => s.toLowerCase());
  return path.join(baseDir, ...parts);
}

async function main() {
  const argv = process.argv.slice(2);
  const targetDir = argv[0] || 'public/archive';
  const repoRoot = path.resolve(__dirname, '..');
  const fullDir = path.resolve(repoRoot, targetDir);
  try {
    await fs.access(fullDir);
  } catch (e) {
    console.error('Directory not found:', fullDir);
    process.exit(2);
  }

  console.log('Scanning', fullDir);
  const all = await walk(fullDir);
  const withUpper = all.filter(hasUppercase);
  if (withUpper.length === 0) {
    console.log('No uppercase names found under', targetDir);
  } else {
    console.log('Found', withUpper.length, 'entries with uppercase letters. Sample:');
    console.log(withUpper.slice(0,10).map(p => path.relative(repoRoot, p)).join('\n'));
  }

  const plan = all
    .map(p => ({ orig: p, depth: p.split(path.sep).length }))
    .sort((a,b) => b.depth - a.depth)
    .map(x => x.orig);

  const tmpMap = [];
  for (const orig of plan) {
    const final = toLowerSegments(orig, fullDir);
    if (orig === final) continue;
    try {
      const origStat = await fs.lstat(orig);
      const tmpName = orig + '__tmp__' + crypto.randomBytes(4).toString('hex');
      await fs.rename(orig, tmpName);
      tmpMap.push({ tmp: tmpName, final });
      console.log('Renamed to tmp:', path.relative(repoRoot, orig), '->', path.relative(repoRoot, tmpName));
    } catch (e) {
      console.warn('Skip rename failed for', orig, e.code || e.message);
    }
  }

  for (const { tmp, final } of tmpMap) {
    try {
      await fs.mkdir(path.dirname(final), { recursive: true });
      await fs.rename(tmp, final);
      console.log('Finalized:', path.relative(repoRoot, tmp), '->', path.relative(repoRoot, final));
    } catch (e) {
      console.error('Failed to finalize', tmp, '->', final, e.message);
    }
  }

  const dossierPath = path.join(repoRoot, 'src', 'data', 'knowledge', 'DossierLibrary.ts');
  try {
    let txt = await fs.readFile(dossierPath, 'utf8');
    let count = 0;
    txt = txt.replace(/(path:\s*')([^']+)(')/g, (m, p1, p2, p3) => {
      const lowered = p2.toLowerCase();
      if (p2 !== lowered) count++;
      return p1 + lowered + p3;
    });
    if (count > 0) {
      await fs.copyFile(dossierPath, dossierPath + '.bak');
      await fs.writeFile(dossierPath, txt, 'utf8');
      console.log('Updated', dossierPath, 'lowercased', count, 'path entries (backup created).');
    } else {
      console.log('No path entries to lowercase in DossierLibrary.ts');
    }
  } catch (e) {
    console.error('Failed to update DossierLibrary.ts', e.message);
  }

  console.log('Normalization complete. Run a clean build next.');
}

main().catch(e => { console.error(e); process.exit(1); });
