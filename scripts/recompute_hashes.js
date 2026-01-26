const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const manifestPath = path.resolve(__dirname, 'hashes_applied.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
let updated = false;

function sha256File(p) {
  const data = fs.readFileSync(p);
  return crypto.createHash('sha256').update(data).digest('hex');
}

for (const entry of manifest) {
  const filePath = path.resolve(__dirname, '..', entry.file.replace(/\\/g, path.sep));
  if (!fs.existsSync(filePath)) continue;
  const computed = sha256File(filePath);
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
