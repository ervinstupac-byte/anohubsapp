const fs = require('fs');
const path = require('path');
const child = require('child_process');

const root = path.join(__dirname, '..');
const archiveDir = path.join(root, 'public', 'archive', 'case-studies');
const manifestPath = path.join(__dirname, 'hashes_applied.json');

function walk(dir) {
  const entries = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.lstatSync(full);
    if (st.isDirectory()) {
      entries.push(...walk(full));
      entries.push({ path: full, isDir: true });
    } else if (st.isFile()) {
      entries.push({ path: full, isDir: false });
    }
  }
  return entries;
}

function safeGitMv(src, dst) {
  // Git on Windows ignores case-only renames; do tmp rename then final rename
  const tmp = src + '.tmp_casefix_' + Date.now();
  console.log('git mv', src, '->', tmp);
  child.execSync(`git mv "${src}" "${tmp}"`);
  console.log('git mv', tmp, '->', dst);
  child.execSync(`git mv "${tmp}" "${dst}"`);
}

function normalize() {
  if (!fs.existsSync(archiveDir)) {
    console.error('Archive case-studies directory not found:', archiveDir);
    process.exit(1);
  }

  const items = walk(archiveDir);
  // Sort so that files are renamed before their parent directories
  items.sort((a, b) => (a.path.length === b.path.length ? 0 : b.path.length - a.path.length));

  const renames = [];
  for (const it of items) {
    const rel = path.relative(path.join(root, 'public', 'archive'), it.path);
    const lowerRel = rel.split(path.sep).map(p => p.toLowerCase()).join('/');
    const desired = path.join(root, 'public', 'archive', lowerRel);
    const src = it.path;
    const dst = desired;
    if (src !== dst) {
      if (fs.existsSync(dst)) {
        console.warn('Destination already exists, skipping:', dst);
        continue;
      }
      renames.push({ src, dst, isDir: it.isDir });
    }
  }

  if (renames.length === 0) {
    console.log('No case-only renames required under case-studies');
    return;
  }

  for (const r of renames) {
    // ensure parent dir exists for dst
    const parent = path.dirname(r.dst);
    if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
    try {
      safeGitMv(r.src, r.dst);
      console.log('Renamed', r.src, '->', r.dst);
    } catch (err) {
      console.error('Failed to git mv', r.src, '->', r.dst, String(err).slice(0,200));
    }
  }

  // Update manifest entries to lowercase for case-studies prefixes
  const raw = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(raw);
  let updated = 0;
  for (const e of manifest) {
    const p = String(e.file).replace(/\\+/g, '/');
    if (p.toLowerCase().includes('case-studies/')) {
      const newp = p.split('/').map((seg, idx) => {
        // keep 'public' as is but lowercase subsequent segments under archive
        if (idx >= 1) return seg.toLowerCase();
        return seg;
      }).join('/');
      if (newp !== p) {
        e.file = newp;
        updated++;
      }
    }
  }
  if (updated > 0) {
    const backup = manifestPath + '.casefix.bak';
    fs.copyFileSync(manifestPath, backup);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`Updated ${updated} manifest entries and wrote backup to ${backup}`);
  } else {
    console.log('No manifest updates required for case-studies');
  }
}

try {
  normalize();
} catch (err) {
  console.error('Normalization failed:', err);
  process.exit(1);
}
