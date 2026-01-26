const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const manifestPath = path.resolve(__dirname, 'hashes_applied.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
let updated = false;

const textExts = new Set(['.html', '.htm', '.css', '.js', '.json', '.txt', '.md', '.svg', '.ts', '.tsx', '.cjs', '.mjs']);

function sha256FileNormalized(p) {
  const ext = path.extname(p).toLowerCase();
  if (textExts.has(ext)) {
    let txt = fs.readFileSync(p, 'utf8');
    txt = txt.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    return crypto.createHash('sha256').update(Buffer.from(txt, 'utf8')).digest('hex');
  }
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

for (const entry of manifest) {
  const filePath = path.resolve(__dirname, '..', entry.file.replace(/\\/g, path.sep));
  if (!fs.existsSync(filePath)) continue;
  const computed = sha256FileNormalized(filePath);
  if (computed !== entry.hash) {
    console.log('Updating', entry.file, entry.hash, '->', computed);
    entry.hash = computed;
    updated = true;
  }
}

if (updated) {
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log('Manifest updated.');
} else {
  console.log('No changes.');
}
