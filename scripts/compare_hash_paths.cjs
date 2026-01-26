const fs = require('fs');
const path = require('path');

const hashesPath = path.join(__dirname, 'hashes_applied.json');
const ghFilesPath = path.join(process.cwd(), 'gh_pages_files.txt');
const ghArchivePath = path.join(process.cwd(), 'gh_pages_archive_files.txt');
const ghSpecialPath = path.join(process.cwd(), 'gh_pages_special.txt');

if (!fs.existsSync(hashesPath)) {
  console.error('Missing', hashesPath);
  process.exit(2);
}
if (!fs.existsSync(ghFilesPath)) {
  console.error('Missing', ghFilesPath);
  process.exit(2);
}

const hashesRaw = fs.readFileSync(hashesPath,'utf8');
let mapping;
try{ mapping = JSON.parse(hashesRaw); }catch(e){ console.error('Invalid JSON', e); process.exit(2); }
const ghFiles = fs.readFileSync(ghFilesPath,'utf8').split(/\r?\n/).filter(Boolean);
const ghArchive = fs.existsSync(ghArchivePath) ? fs.readFileSync(ghArchivePath,'utf8').split(/\r?\n/).filter(Boolean) : [];

// mapping is an array of {file,hash} entries. Normalize to repo-style paths (archive/...)
function normalizeKey(k){
  let s = k.replace(/\\/g,'/');
  s = s.replace(/^public\//,'');
  s = s.replace(/^\.\//,'');
  return s;
}

const normToOrig = {};
const normKeys = mapping.map(entry => {
  const n = normalizeKey(entry.file);
  normToOrig[n] = entry.file;
  return n;
});

const ghSet = new Set(ghFiles);

let missing = [];
let foundAsIndex = [];
let foundAsHtml = [];

for(const nk of normKeys){
  if(ghSet.has(nk)){
    foundAsHtml.push(nk);
    continue;
  }
  // check for directory/index.html form
  const idx = nk.replace(/archive\/(.*)\.html$/,'archive/$1/index.html');
  if(ghSet.has(idx)){
    foundAsIndex.push({expected:nk,found:idx});
    continue;
  }
  // also check for paths ending with /index.html mapping
  const alt = nk.replace(/\.html$/,'/index.html');
  if(ghSet.has(alt)){
    foundAsIndex.push({expected:nk,found:alt});
    continue;
  }
  // check if the name exists as folder (e.g., archive/85/) by searching archive list
  const base = nk.replace(/^archive\//,'');
  const folderMatch = ghArchive.find(p => p.startsWith('archive/' + base.replace(/\.html$/,'') + '/'));
  if(folderMatch){
    foundAsIndex.push({expected:nk,found:folderMatch});
    continue;
  }

  missing.push(nk);
}

console.log('mappingCount:', normKeys.length);
console.log('found exact count:', foundAsHtml.length);
console.log('found as index count:', foundAsIndex.length);
console.log('missing count:', missing.length);

if(foundAsIndex.length>0){
  console.log('\nSample found-as-index (expected -> actual):');
  console.log(foundAsIndex.slice(0,10).map(x=> `${x.expected} -> ${x.found}`).join('\n'));
}
if(missing.length>0){
  console.log('\nSample missing:');
  console.log(missing.slice(0,20).join('\n'));
}

// print presence of .nojekyll and 404.html
const special = fs.existsSync(ghSpecialPath) ? fs.readFileSync(ghSpecialPath,'utf8').split(/\r?\n/).filter(Boolean) : [];
console.log('\nspecial files found:', special.join(', ') || '(none)');

// Determine dossier naming style heuristics
// Count how many ghArchive entries end with '/index.html' vs '*.html'
const indexCount = ghArchive.filter(p=>p.endsWith('/index.html')).length;
const flatHtmlCount = ghArchive.filter(p=>/\/\d+\.html$/.test(p)).length;
console.log('\narchive index files:', indexCount, 'flat numeric html files:', flatHtmlCount);

process.exit(0);
