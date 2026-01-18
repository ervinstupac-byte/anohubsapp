const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files = files.concat(walk(full));
    else if (/\.html?$/.test(e.name)) files.push(full);
  }
  return files;
}

const base = path.resolve(__dirname, '..', 'public', 'archive');
if (!fs.existsSync(base)) {
  console.error('Archive path not found:', base);
  process.exit(1);
}

const files = walk(base);
console.log('Found', files.length, 'HTML files under public/archive');

let patched = 0;
const report = [];

for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');

  // Sweep replace NC-5.7 -> NC-9.0
  const replacedContent = content.replace(/NC-5\.7/g, 'NC-9.0');

  // Prepare content used for hashing: remove any existing SHA-256 hex token
  const contentForHash = replacedContent.replace(/SHA-256:\s*[A-Fa-f0-9]{40,64}/g, 'SHA-256: ');

  const hash = crypto.createHash('sha256').update(contentForHash, 'utf8').digest('hex').toUpperCase();

  // Replace/insert the SHA-256 token inside the file
  let newContent;
  if (/SHA-256:\s*[A-Fa-f0-9]{40,64}/.test(replacedContent)) {
    newContent = replacedContent.replace(/SHA-256:\s*[A-Fa-f0-9]{40,64}/g, 'SHA-256: ' + hash);
  } else {
    // If no token exists, append a small meta line before </body> if possible
    if (/<\/body>/i.test(replacedContent)) {
      newContent = replacedContent.replace(/<\/body>/i, '<div class="dossier-meta">SHA-256: ' + hash + '</div>\n</body>');
    } else {
      newContent = replacedContent + '\n<!-- SHA-256: ' + hash + ' -->';
    }
  }

  if (newContent !== content) {
    fs.writeFileSync(f, newContent, 'utf8');
    patched++;
  }

  report.push({ file: path.relative(process.cwd(), f), hash });
}

// Write mapping for verification
const out = path.resolve(__dirname, 'hashes_applied.json');
fs.writeFileSync(out, JSON.stringify(report, null, 2));
console.log('Patched', patched, 'files. Mapping written to', out);
process.exit(0);
