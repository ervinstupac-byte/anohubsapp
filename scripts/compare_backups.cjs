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
    else out.push({ full, rel, size: st.size });
  }
  return out;
}

function sha256(buf){
  return crypto.createHash('sha256').update(buf).digest('hex');
}

const localBase = 'public/archive';
if (!fs.existsSync(localBase)) { console.error('Local archive missing:', localBase); process.exit(2); }

// find backup dir under public starting with archive.__bak__
const publicEntries = fs.readdirSync('public');
const bakName = publicEntries.find(n => n.toLowerCase().startsWith('archive.__bak__'));
if (!bakName) { console.error('No backup archive directory found under public (archive.__bak__*)'); process.exit(2); }
const bakBase = path.join('public', bakName);
if (!fs.existsSync(bakBase)) { console.error('Backup path not found:', bakBase); process.exit(2); }

console.log('Comparing local:', localBase, 'against backup:', bakBase);

const localFiles = walk(localBase).map(f => ({...f, key: f.rel.toLowerCase()}));
const bakFiles = walk(bakBase).map(f => ({...f, key: f.rel.toLowerCase()}));

const bakMap = new Map(bakFiles.map(f => [f.key, f]));

if (localFiles.length !== bakFiles.length) {
  console.error('File count differs: local=', localFiles.length, 'backup=', bakFiles.length);
}

let checked = 0;
for (const lf of localFiles){
  const key = lf.key;
  const bf = bakMap.get(key);
  if (!bf){
    console.error('MISSING IN BACKUP:', lf.rel);
    process.exit(3);
  }
  const a = fs.readFileSync(lf.full);
  const b = fs.readFileSync(bf.full);
  if (a.length !== b.length){
    console.error('SIZE MISMATCH for', lf.rel, 'local=', a.length, 'backup=', b.length);
    process.exit(4);
  }
  const ha = sha256(a);
  const hb = sha256(b);
  if (ha !== hb){
    console.error('CONTENT MISMATCH for', lf.rel);
    console.error(' local sha256=', ha);
    console.error(' backup sha256=', hb);
    // show small diff snippet for quick triage
    for (let i=0;i<Math.min(a.length, b.length, 2000); i++){
      if (a[i] !== b[i]){ console.error(' First differing byte at offset', i); break; }
    }
    process.exit(5);
  }
  checked++;
  if (checked % 100 === 0) process.stdout.write('.');
}

console.log('\nComparison complete. checked=', checked, 'all files match (byte-for-byte).');
process.exit(0);
