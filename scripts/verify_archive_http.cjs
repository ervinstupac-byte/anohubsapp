const fs = require('fs');
const path = require('path');
const fetch = global.fetch || require('node-fetch');

// Allow passing a base URL as first arg, default to production app.anohubs.com
const argBase = process.argv[2];
const BASE = (argBase && argBase.length > 0)
  ? (argBase.endsWith('/') ? argBase : argBase + '/').replace(/\/+$|([^:])\/$/, '$1/')
  : 'https://app.anohubs.com/archive/';
const libPath = path.join(__dirname, '..', 'src', 'data', 'knowledge', 'DossierLibrary.ts');
const content = fs.readFileSync(libPath, 'utf8');
const re = /\{\s*path:\s*'([^']+)'/g;
const paths = [];
let m;
while ((m = re.exec(content)) !== null) paths.push(m[1]);

console.log('Found', paths.length, 'entries — checking HTTP status...');

(async () => {
  let ok = 0;
  let fail = 0;
  for (const p of paths) {
    // normalize path when checking to avoid case-sensitivity mismatches
    const rel = String(p).toLowerCase();
    const url = BASE + encodeURI(rel);
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok) {
        ok++;
      } else {
        fail++;
        console.error('FAIL', res.status, url);
      }
    } catch (e) {
      fail++;
      console.error('ERROR', e.message, url);
    }
  }

  console.log(`Summary: OK=${ok} FAIL=${fail} TOTAL=${paths.length}`);
  if (ok === paths.length) {
    console.log('VERIFIED: All files reachable (200 OK)');
    process.exit(0);
  }
  process.exit(2);
})();
