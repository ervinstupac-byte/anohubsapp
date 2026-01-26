import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const manifestPath = path.resolve(process.cwd(), 'scripts', 'hashes_applied.json');
const textExts = new Set(['.html', '.htm', '.css', '.js', '.json', '.txt', '.md', '.svg', '.ts', '.tsx', '.cjs', '.mjs']);

function computeHash(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (textExts.has(ext)) {
    let txt = fs.readFileSync(filePath, 'utf8');
    txt = txt.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    return crypto.createHash('sha256').update(Buffer.from(txt, 'utf8')).digest('hex');
  }
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function main() {
  if (!fs.existsSync(manifestPath)) {
    console.error('Manifest not found:', manifestPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(manifestPath, 'utf8');
  let entries: Array<{ file: string; hash: string }> = JSON.parse(raw);
  let updated = 0;

  for (const e of entries) {
    const rel = e.file.replace(/\\/g, '/').replace(/^public\//i, 'public/');
    const p = path.resolve(process.cwd(), rel);
    if (!fs.existsSync(p)) {
      console.warn('Missing file, skipping:', rel);
      continue;
    }
    try {
      const h = computeHash(p);
      if (h !== e.hash) {
        e.hash = h;
        updated++;
      }
    } catch (err) {
      console.warn('Failed to hash', p, err);
    }
  }

  fs.writeFileSync(manifestPath, JSON.stringify(entries, null, 2), 'utf8');
  console.log(`Recomputed hashes for ${entries.length} entries, updated ${updated} entries.`);
}

main();
