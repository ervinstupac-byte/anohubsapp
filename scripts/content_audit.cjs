const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function usage() {
  console.error('Usage: node scripts/content_audit.cjs <baseUrl> [--sample N] [--concurrency M]');
  process.exit(2);
}

const base = process.argv[2];
if (!base) usage();
const sampleArgIndex = process.argv.indexOf('--sample');
const sampleCount = sampleArgIndex >= 0 ? parseInt(process.argv[sampleArgIndex + 1], 10) : 5;
const concurrencyArgIndex = process.argv.indexOf('--concurrency');
const concurrency = concurrencyArgIndex >= 0 ? parseInt(process.argv[concurrencyArgIndex + 1], 10) : 12;

const root = 'public/archive';
if (!fs.existsSync(root)) { console.error('Local archive not found at', root); process.exit(1); }

function walk(dir, baseRel = ''){
  const results = [];
  for (const name of fs.readdirSync(dir)){
    const full = path.join(dir, name);
    const rel = path.join(baseRel, name).replace(/\\/g,'/');
    const st = fs.statSync(full);
    if (st.isDirectory()) results.push(...walk(full, rel));
    else results.push({ full, rel, size: st.size });
  }
  return results;
}

function sha256File(filePath){
  const hash = crypto.createHash('sha256');
  const b = fs.readFileSync(filePath);
  hash.update(b);
  return hash.digest('hex');
}

function pickRandom(arr, n){
  const out = [];
  const copy = arr.slice();
  while(out.length < n && copy.length) out.push(copy.splice(Math.floor(Math.random()*copy.length),1)[0]);
  return out;
}

async function fetchBuffer(url){
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

async function run(){
  const files = walk(root);
  console.log('Found', files.length, 'local files under', root);

  const localMap = new Map();
  for (const f of files){
    const h = sha256File(f.full);
    localMap.set(f.rel.replace(/\\/g,'/'), { path: f.full, size: f.size, sha256: h });
  }

  // Random sample check
  console.log('\n=== Random sample check ('+sampleCount+') ===');
  const sample = pickRandom(Array.from(localMap.keys()), sampleCount);
  for (const rel of sample){
    const url = new URL(rel, base).toString().replace(/\\\\/g,'/');
    try{
      const buf = await fetchBuffer(url);
      const sha = crypto.createHash('sha256').update(buf).digest('hex');
      const local = localMap.get(rel);
      console.log(rel, ' localSize=', local.size, ' liveSize=', buf.length, local.sha256 === sha ? 'OK' : 'MISMATCH');
      if (local.sha256 !== sha) console.log('  localHash=', local.sha256,' liveHash=',sha);
    }catch(e){
      console.error(rel, 'ERROR fetching', e.message);
    }
  }

  // Full SHA-256 validation
  console.log('\n=== Full SHA-256 validation ===');
  const keys = Array.from(localMap.keys());
  let mismatches = 0;
  let failures = 0;
  let processed = 0;

  const q = [];
  for (const key of keys){
    q.push(async ()=>{
      const url = new URL(key, base).toString();
      try{
        const buf = await fetchBuffer(url);
        const sha = crypto.createHash('sha256').update(buf).digest('hex');
        const local = localMap.get(key);
        if (local.sha256 !== sha) mismatches++;
      }catch(e){ failures++; }
      processed++;
      if (processed % 100 === 0) process.stdout.write(`.${processed}`);
    });
  }

  // run with concurrency
  const runners = new Array(concurrency).fill(null).map(async ()=>{
    while(q.length){ const fn = q.shift(); if(!fn) break; await fn(); }
  });
  await Promise.all(runners);
  console.log('\nFull check complete. mismatches=',mismatches,' failures=',failures,' processed=',processed);

  // Asset links check for index.html files
  console.log('\n=== Asset link verification for index.html files ===');
  const indexFiles = keys.filter(k => k.endsWith('/index.html') || k === 'index.html');
  console.log('Index files found:', indexFiles.length);
  const badAssets = [];

  for (const rel of indexFiles){
    const local = fs.readFileSync(path.join(root, rel), 'utf8');
    const assets = [];
    const linkRe = /<link[^>]+href=["']([^"']+)["']/gi;
    const scriptRe = /<script[^>]+src=["']([^"']+)["']/gi;
    let m;
    while((m=linkRe.exec(local))){ assets.push(m[1]); }
    while((m=scriptRe.exec(local))){ assets.push(m[1]); }
    for (const a of assets){
      // resolve to absolute URL on production
      let resolved;
      if (a.startsWith('http://') || a.startsWith('https://')) resolved = a;
      else if (a.startsWith('/')) resolved = new URL(a, base).toString();
      else resolved = new URL(path.posix.join(path.posix.dirname('/'+rel), a), base).toString();
      try{
        const res = await fetch(resolved, { method: 'HEAD' });
        if (!res.ok) badAssets.push({ index: rel, asset: a, status: res.status, url: resolved });
      }catch(e){ badAssets.push({ index: rel, asset: a, error: e.message, url: resolved }); }
    }
  }

  console.log('Asset link verification complete. bad assets:', badAssets.length);
  if (badAssets.length) console.table(badAssets.slice(0,50));

  console.log('\nAudit summary:');
  console.log('- local files:', files.length);
  console.log('- random sample checked:', sample.length);
  console.log('- full mismatches:', mismatches);
  console.log('- full failures (fetch errors):', failures);
  console.log('- bad asset links in index.html:', badAssets.length);
}

run().catch(err=>{ console.error('Audit failed:', err); process.exit(1); });
