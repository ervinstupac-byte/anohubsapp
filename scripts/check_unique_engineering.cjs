const fs = require('fs');
const path = require('path');

function walkHtmlFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      results.push(...walkHtmlFiles(full));
    } else if (e.isFile() && full.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const repoRoot = path.join(__dirname, '..');
const archiveRoot = path.join(repoRoot, 'public', 'archive');
const mapFile = path.join(repoRoot, 'scripts', 'reports', 'nc91_mapping_report.json');
const outReport = path.join(repoRoot, 'scripts', 'reports', 'nc91_hydraulic_samples.json');

const files = walkHtmlFiles(archiveRoot);
const seen = new Map();
const duplicates = [];
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const m = content.match(/<div class=\"scix-inject[\s\S]*?<\/div>\s*/);
  const key = m ? m[0].trim() : '__NO_INJECT__';
  if (seen.has(key)) duplicates.push([seen.get(key), f]); else seen.set(key, f);
}

const mapping = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
const hydraulic = mapping.files.Hydraulic || [];
const samples = {};
for (let i = 0; i < Math.min(3, hydraulic.length); i++) {
  const rel = hydraulic[i];
  const full = path.join(archiveRoot, rel);
  const c = fs.readFileSync(full, 'utf8');
  const m = c.match(/<div class=\"scix-inject[\s\S]*?<\/div>\s*/);
  samples[rel] = m ? m[0].trim() : null;
}

const report = {
  totalFiles: files.length,
  uniqueEngineeringSections: seen.size,
  duplicates: duplicates.length,
  samples
};

fs.writeFileSync(outReport, JSON.stringify(report, null, 2), 'utf8');
if (duplicates.length > 0) {
  console.error('Duplicates found:', duplicates.length);
  try { fs.writeFileSync(path.join(path.dirname(outReport),'nc91_duplicates.json'), JSON.stringify(duplicates.slice(0,50), null, 2), 'utf8'); } catch (e) {}
  process.exit(2);
}
console.log('All engineering sections unique:', seen.size, 'unique of', files.length);
