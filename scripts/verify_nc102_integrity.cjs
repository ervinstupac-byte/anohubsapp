const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const manifest = require('./hashes_applied.json');
const EXPECTED_COUNT = 854;

function sha256File(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

const report = {
  generatedAt: new Date().toISOString(),
  expectedCount: EXPECTED_COUNT,
  manifestCount: manifest.length,
  files: [],
  visuals: [],
  verdict: 'UNKNOWN'
};

let critical = false;

function safeRead(fp) {
  try { return fs.readFileSync(fp, 'utf8'); } catch (e) { return null; }
}

for (const entry of manifest) {
  const raw = entry.file;
  const forward = raw.replace(/\\+/g, '/').replace(/^public\//i, '').replace(/^archive\//i, '');
  const rel = forward.replace(/^\/+/, '');
  const filePath = path.join(__dirname, '..', 'public', 'archive', rel);
  const item = { file: rel, expectedHash: entry.hash, exists: false, computedHash: null, status: 'MISSING' };
  try {
    if (fs.existsSync(filePath)) {
      item.exists = true;
      item.computedHash = sha256File(filePath);
      if (item.computedHash === entry.hash) {
        item.status = 'OK';
      } else {
        item.status = 'HASH_MISMATCH';
        critical = true;
      }
    } else {
      item.status = 'MISSING';
      critical = true;
    }
  } catch (e) {
    item.status = 'ERROR';
    item.error = String(e);
    critical = true;
  }
  report.files.push(item);
}

// Verify manifest count
if (manifest.length !== EXPECTED_COUNT) {
  report.countMismatch = true;
  critical = true;
} else {
  report.countMismatch = false;
}

// Visual verification: tailwind config and technical whitepaper must reference #00ff7f
const tailwindPath = path.join(__dirname, '..', 'tailwind.config.js');
const whitepaperPath = path.join(__dirname, '..', 'public', 'technical_whitepaper.html');
const tailwindText = safeRead(tailwindPath) || '';
const whitepaperText = safeRead(whitepaperPath) || '';
const neon = '#00ff7f';
const tailwindHas = tailwindText.includes(neon);
const whitepaperHas = whitepaperText.includes(neon);
report.visuals.push({ file: 'tailwind.config.js', containsNeon: tailwindHas });
report.visuals.push({ file: 'public/technical_whitepaper.html', containsNeon: whitepaperHas });
if (!tailwindHas || !whitepaperHas) {
  critical = true;
}

report.verdict = critical ? 'CRITICAL' : 'NOMINAL';

const outDir = path.join(__dirname, 'reports');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'nc102_integrity_report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log('Integrity report written:', path.join(outDir, 'nc102_integrity_report.json'));
if (critical) {
  console.error('Integrity verifier detected critical issues — exiting with code 2');
  process.exit(2);
} else {
  console.log('All integrity checks nominal');
  process.exit(0);
}
