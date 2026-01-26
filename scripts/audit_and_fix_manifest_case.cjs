const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const manifestPath = path.join(__dirname, 'hashes_applied.json');
const reportPath = path.join(__dirname, 'reports', 'case_sensitivity_report.json');

function listDir(dir) {
  try { return fs.readdirSync(dir); } catch (e) { return null; }
}

function findActualPath(targetRel) {
  // targetRel like public/archive/... or archive/...
  const parts = targetRel.replace(/\\+/g, '/').split('/').filter(Boolean);
  let cur = root;
  let actualParts = [];
  for (const part of parts) {
    const entries = listDir(cur);
    if (!entries) return { found: false };
    // try exact match first
    if (entries.includes(part)) {
      actualParts.push(part);
      cur = path.join(cur, part);
      continue;
    }
    // try case-insensitive match
    const lower = part.toLowerCase();
    const found = entries.find(e => e.toLowerCase() === lower);
    if (found) {
      actualParts.push(found);
      cur = path.join(cur, found);
      continue;
    }
    // not found
    return { found: false };
  }
  return { found: true, actual: actualParts.join('/') };
}

function run() {
  const raw = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(raw);
  const report = { generatedAt: new Date().toISOString(), total: manifest.length, missing: [], mismatches: [] };

  for (const e of manifest) {
    const rawFile = String(e.file).replace(/\\+/g, '/');
    // ensure path rooted at repo (allow both public/... and archive/... forms)
    const rel = rawFile.startsWith('public/') ? rawFile : rawFile.replace(/^\/*/, 'public/');
    const res = findActualPath(rel);
    if (!res.found) {
      report.missing.push({ manifest: e.file });
    } else {
      const normalizedManifest = rel.replace(/^public\//, '').toLowerCase();
      const normalizedActual = res.actual.replace(/^public\//, '').toLowerCase();
      if (res.actual !== rel) {
        report.mismatches.push({ manifest: e.file, actual: res.actual });
      }
    }
  }

  if (!fs.existsSync(path.dirname(reportPath))) fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log('Wrote case-sensitivity report to', reportPath);

  // If there are mismatches but no missing files, update manifest to match actual casing
  if (report.missing.length === 0 && report.mismatches.length > 0) {
    console.log('Updating manifest entries to match actual filesystem casing...');
    const backup = manifestPath + '.caseaudit.bak';
    fs.copyFileSync(manifestPath, backup);
    const map = new Map(report.mismatches.map(m => [String(m.manifest).replace(/\\+/g, '/'), String(m.actual).replace(/\\+/g, '/')]))
;
    for (const e of manifest) {
      const k = String(e.file).replace(/\\+/g, '/');
      if (map.has(k)) {
        e.file = map.get(k);
      }
    }
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log('Manifest updated and backup written to', backup);
  }

  process.exit(report.missing.length === 0 ? 0 : 2);
}

try { run(); } catch (err) { console.error(err); process.exit(1); }
