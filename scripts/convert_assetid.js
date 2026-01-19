const fs = require('fs');
const path = require('path');

function walk(dir){
  const files = [];
  for(const f of fs.readdirSync(dir)){
    const full = path.join(dir,f);
    const stat = fs.statSync(full);
    if(stat.isDirectory()) files.push(...walk(full));
    else if(/\.tsx?$|\.ts$/.test(f)) files.push(full);
  }
  return files;
}

const root = path.join(__dirname,'..','src');
const files = walk(root);
let changed = 0;
for(const file of files){
  let s = fs.readFileSync(file,'utf8');
  const orig = s;
  // Replace common patterns
  s = s.replace(/assetId:\s*string\b/g, 'assetId: number');
  s = s.replace(/assetId:\s*string\s*\|\s*null\b/g, 'assetId: number | null');
  s = s.replace(/assetId\?\:\s*string\b/g, 'assetId?: number');
  s = s.replace(/asset_id:\s*string\b/g, 'asset_id: number');
  s = s.replace(/asset_id\?\:\s*string\b/g, 'asset_id?: number');
  s = s.replace(/assetId:\s*Array<string>/g, 'assetId: number[]');
  s = s.replace(/\[assetId:\s*string\]/g, '[assetId: number]');
  // function params (assetId: string,)
  s = s.replace(/\(assetId:\s*string(\s*[,)])/g, '(assetId: number$1');
  s = s.replace(/assetId:\s*string;/g, 'assetId: number;');

  if(s !== orig){
    fs.writeFileSync(file,s,'utf8');
    changed++;
    console.log('Patched', path.relative(process.cwd(), file));
  }
}
console.log('Done. Files changed:', changed);
