const fs = require('fs');
const path = require('path');

function usage() {
  console.error('Usage: node scripts/strip_tmp_suffixes.cjs <targetDir>');
  process.exit(2);
}

const target = process.argv[2] || 'public/archive';
if (!fs.existsSync(target)) {
  console.error('Target not found:', target);
  usage();
}

const tmpName = `${target}.__stripped__${Date.now()}`;

function walk(src, cb) {
  for (const name of fs.readdirSync(src)) {
    const full = path.join(src, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      cb(full, true);
      walk(full, cb);
    } else if (st.isFile()) {
      cb(full, false);
    }
  }
}

function normalizeRel(rel) {
  // remove any __tmp__<hex> sequences and lowercase the path
  return rel.replace(/__tmp__[0-9a-fA-F]+/g, '').replace(/\\/g, '/').toLowerCase();
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

console.log('Creating temp tree at', tmpName);
ensureDir(tmpName);

const seen = new Set();
let copied = 0;
let collisions = 0;

walk(target, (full, isDir) => {
  const rel = path.relative(target, full);
  const norm = normalizeRel(rel);
  const dest = path.join(tmpName, norm);
  if (isDir) {
    ensureDir(dest);
    return;
  }

  let finalDest = dest;
  let i = 1;
  while (seen.has(finalDest)) {
    const parsed = path.parse(dest);
    finalDest = path.join(parsed.dir, parsed.name + `__dup${i}` + parsed.ext);
    i++;
    collisions++;
  }
  seen.add(finalDest);
  ensureDir(path.dirname(finalDest));
  fs.copyFileSync(full, finalDest);
  copied++;
});

console.log(`Copy complete. Files copied: ${copied}. Collisions: ${collisions}`);

const backup = `${target}.__bak__${Date.now()}`;
try {
  console.log('Swapping directories:');
  fs.renameSync(target, backup);
  fs.renameSync(tmpName, target);
  console.log('Swap complete. Backup at', backup);
} catch (err) {
  console.error('Swap failed, attempting rollback:', err && err.message);
  if (fs.existsSync(backup) && !fs.existsSync(target)) {
    try { fs.renameSync(backup, target); console.log('Rollback complete'); } catch (e) { console.error('Rollback failed:', e.message); }
  }
  process.exit(1);
}

console.log('Done.');
