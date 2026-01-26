const fs = require('fs');
const path = require('path');
const cwd = process.cwd();
const start = path.join(cwd, 'dist', 'archive');
function walk(d) {
  let out = [];
  if (!fs.existsSync(d)) return out;
  (function r(dir) {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) r(p);
      else out.push(path.relative(cwd, p).replace(/\\\\/g, '/'));
    }
  })(d);
  return out;
}
const files = walk(start);
const filesLower = files.map(x => x.toLowerCase());
const htmlFiles = filesLower.filter(f => f.endsWith('.html'));
const otherFiles = filesLower.filter(f => !f.endsWith('.html'));
console.log('DIST_ARCHIVE_TOTAL_FILES', files.length);
console.log('DIST_ARCHIVE_HTML_FILES', htmlFiles.length);
console.log('DIST_ARCHIVE_OTHER_FILES', otherFiles.length);
if (otherFiles.length > 0) console.log('SAMPLE_OTHERS', otherFiles.slice(0, 20));
