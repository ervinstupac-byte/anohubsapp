const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const manifestPath = path.join(__dirname, 'hashes_applied.json');
const manifest = require(manifestPath);

function sha256FileNormalized(filePath) {
  const textExts = new Set(['.html', '.htm', '.css', '.js', '.json', '.txt', '.md', '.svg', '.ts', '.tsx', '.cjs', '.mjs']);
  const ext = path.extname(filePath).toLowerCase();
  if (textExts.has(ext)) {
    let txt = fs.readFileSync(filePath, 'utf8');
    txt = txt.replace(/\r\n/g, '\n');
    txt = txt.replace(/\r/g, '\n');
    return crypto.createHash('sha256').update(Buffer.from(txt, 'utf8')).digest('hex');
  }
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

function updateManifest() {
  const backup = manifestPath + '.bak';
  fs.copyFileSync(manifestPath, backup);
  console.log('Backup written to', backup);

  let updated = 0;
  for (const entry of manifest) {
    const raw = entry.file;
    const forward = raw.replace(/\\+/g, '/').replace(/^public\//i, '').replace(/^archive\//i, '');
    const rel = forward.replace(/^\/+/, '');
    const filePath = path.join(__dirname, '..', 'public', 'archive', rel);
    if (fs.existsSync(filePath)) {
      try {
        const ch = sha256FileNormalized(filePath);
        if (ch !== entry.hash) {
          entry.hash = ch;
          updated++;
        }
      } catch (err) {
        console.warn('Failed to hash', filePath, String(err).slice(0,200));
      }
    } else {
      console.warn('Missing file, skipping:', filePath);
    }
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Updated ${updated} manifest entries and wrote ${manifestPath}`);
}

try {
  updateManifest();
} catch (err) {
  console.error('Failed updating manifest:', err);
  process.exit(1);
}
