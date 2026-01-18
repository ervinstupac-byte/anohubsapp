const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function walk(dir, base = ''){
  const out = [];
  for (const name of fs.readdirSync(dir)){
    const full = path.join(dir, name);
    const rel = path.join(base, name).replace(/\\/g,'/');
    const st = fs.statSync(full);
    if (st.isDirectory()) out.push(...walk(full, rel));
    else out.push({ full, rel, size: st.size, mtime: st.mtimeMs });
  }
  return out;
}

function sha256(buf){ return crypto.createHash('sha256').update(buf).digest('hex'); }

const localBase = 'public/archive';
if (!fs.existsSync(localBase)) { console.error('Local archive missing:', localBase); process.exit(2); }

const publicEntries = fs.readdirSync('public');
const bakName = publicEntries.find(n => n.toLowerCase().startsWith('archive.__bak__'));
if (!bakName) { console.error('No backup archive directory found under public (archive.__bak__*)'); process.exit(2); }
const bakBase = path.join('public', bakName);
if (!fs.existsSync(bakBase)) { console.error('Backup path not found:', bakBase); process.exit(2); }

console.log('Comparing', localBase, '<->', bakBase);

const locals = walk(localBase).map(f=>({...f, key: f.rel.toLowerCase()}));
const baks = walk(bakBase).map(f=>({...f, key: f.rel.toLowerCase()}));

const localMap = new Map(locals.map(f => [f.key, f]));
const bakMap = new Map(baks.map(f => [f.key, f]));

const onlyInLocal = [];
const onlyInBak = [];
const mismatches = [];

for (const [key, lf] of localMap.entries()){
  const bf = bakMap.get(key);
  if (!bf) { onlyInLocal.push(lf.rel); continue; }
  const a = fs.readFileSync(lf.full);
  const b = fs.readFileSync(bf.full);
  if (a.length !== b.length){ mismatches.push({ rel: lf.rel, kind: 'size', localSize: a.length, bakSize: b.length }); continue; }
  const ha = sha256(a);
  const hb = sha256(b);
  if (ha !== hb) mismatches.push({ rel: lf.rel, kind: 'content', localSha: ha, bakSha: hb });
}

for (const [key, bf] of bakMap.entries()){
  if (!localMap.has(key)) onlyInBak.push(bf.rel);
}

// Origin analysis for specific file
const targetRel = 'protocol/to_learn_archive/protocols_v0/anohub_alignment_v2/index.html';
let origin = { existsInLocal: false, existsInBak: false, localMtime: null, bakMtime: null, bakTimestampFromName: null, inferred: null };
origin.existsInLocal = localMap.has(targetRel.toLowerCase());
origin.existsInBak = bakMap.has(targetRel.toLowerCase());
if (origin.existsInLocal) origin.localMtime = localMap.get(targetRel.toLowerCase()).mtime;
if (origin.existsInBak) origin.bakMtime = bakMap.get(targetRel.toLowerCase()).mtime;
const m = bakName.match(/archive\.__bak__(\d{10,})/i);
if (m) origin.bakTimestampFromName = parseInt(m[1],10);
if (origin.existsInLocal && !origin.existsInBak){
  if (origin.bakTimestampFromName && origin.localMtime && origin.localMtime > origin.bakTimestampFromName) origin.inferred = 'created-after-backup';
  else origin.inferred = 'present-in-local-not-in-backup';
}

const report = {
  localBase, bakBase, totalLocal: locals.length, totalBak: baks.length,
  onlyInLocal, onlyInBak, mismatches, originAnalysis: origin
};

const outPath = path.join('scripts','reports');
if (!fs.existsSync(outPath)) fs.mkdirSync(outPath, { recursive: true });
fs.writeFileSync(path.join(outPath,'compare_backups_full.json'), JSON.stringify(report, null, 2));

console.log('Report written to', path.join(outPath,'compare_backups_full.json'));
console.log('Summary: totalLocal=', locals.length, ' totalBak=', baks.length, ' onlyInLocal=', onlyInLocal.length, ' onlyInBak=', onlyInBak.length, ' mismatches=', mismatches.length);
process.exit(0);
