const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dossierFile = path.join(__dirname, '..', 'src', 'data', 'knowledge', 'DossierLibrary.ts');
const baseArchive = path.join(__dirname, '..', 'public', 'archive');

function extractPaths(tsContent) {
  const regex = /path:\s*'([^']+)'/g;
  const paths = [];
  let m;
  while ((m = regex.exec(tsContent)) !== null) {
    paths.push(m[1]);
  }
  return paths;
}

function computeSha256Hex(content) {
  return crypto.createHash('sha256').update(content).digest('hex').toUpperCase();
}

(function main() {
  if (!fs.existsSync(dossierFile)) {
    console.error('DossierLibrary.ts not found at', dossierFile);
    process.exit(2);
  }

  const ts = fs.readFileSync(dossierFile, 'utf8');
  const paths = extractPaths(ts);

  console.log(`Found ${paths.length} dossier entries in DossierLibrary.`);

  let checked = 0;
  let missing = 0;
  let embeddedMissing = 0;
  const mismatches = [];
  const computedHashes = new Set();

  for (const p of paths) {
    const filePath = path.join(baseArchive, p);
    if (!fs.existsSync(filePath)) {
      missing++;
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    // Compute hash in a way that ignores the embedded SHA-256 token so it matches
    // the validation flow used by the LibraryHealthMonitor.
    const contentForHash = content.replace(/SHA-256:\s*[A-Fa-f0-9]{40,64}/g, 'SHA-256: ');
    const computed = computeSha256Hex(contentForHash);
    computedHashes.add(computed);

    // Find embedded hash (accept 40 or 64 hex digits)
    const match = content.match(/SHA-256:\s*([A-Fa-f0-9]{40,64})/);
    if (!match) {
      embeddedMissing++;
    } else {
      const embedded = match[1].toUpperCase();
      if (embedded !== computed) {
        mismatches.push({ path: p, embedded, computed });
      }
    }

    checked++;
  }

  console.log('--- Summary ---');
  console.log('Total dossiers listed:', paths.length);
  console.log('Files checked (present):', checked);
  console.log('Missing files:', missing);
  console.log('Files without embedded hash:', embeddedMissing);
  console.log('Unique computed hashes:', computedHashes.size);
  console.log('Mismatches (embedded != computed):', mismatches.length);

  if (mismatches.length > 0) {
    console.log('\nSample mismatches (up to 10):');
    mismatches.slice(0, 10).forEach(m => console.log(`- ${m.path}\n   embedded: ${m.embedded}\n   computed: ${m.computed}\n`));
  }

  process.exit(0);
})();
