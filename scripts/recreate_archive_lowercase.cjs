#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

async function walkFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...await walkFiles(full));
    } else if (e.isFile()) {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  const argv = process.argv.slice(2);
  const src = path.resolve(process.cwd(), argv[0] || 'public/archive');
  const dest = path.resolve(process.cwd(), argv[1] || 'public/archive_lowercase_tmp');

  try { await fs.access(src); } catch (e) { console.error('Source not found:', src); process.exit(2);} 
  // remove dest if exists
  try { await fs.rm(dest, { recursive: true, force: true }); } catch(e) {}
  await fs.mkdir(dest, { recursive: true });

  const files = await walkFiles(src);
  console.log('Copying', files.length, 'files to', dest);
  for (const f of files) {
    const rel = path.relative(src, f);
    const parts = rel.split(path.sep).map(s => s.toLowerCase());
    const destPath = path.join(dest, ...parts);
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.copyFile(f, destPath);
  }

  console.log('Copy complete. Swapping directories...');
  const backup = src + '_backup_' + Date.now();
  try {
    await fs.rename(src, backup);
    await fs.rename(dest, src);
    // remove backup
    await fs.rm(backup, { recursive: true, force: true });
    console.log('Swap complete: original replaced with lowercased tree.');
  } catch (e) {
    console.error('Swap failed:', e.message);
    console.log('Attempting cleanup: restoring original state if possible.');
    try { await fs.rm(dest, { recursive: true, force: true }); } catch(e) {}
    // try to restore
    try { await fs.rename(backup, src); } catch(e) {}
    process.exit(1);
  }

  // update DossierLibrary.ts
  const dossierPath = path.join(process.cwd(), 'src', 'data', 'knowledge', 'DossierLibrary.ts');
  try {
    let txt = await fs.readFile(dossierPath, 'utf8');
    let count = 0;
    txt = txt.replace(/(path:\s*')([^']+)(')/g, (m, p1, p2, p3) => {
      const lowered = p2.toLowerCase();
      if (p2 !== lowered) count++;
      return p1 + lowered + p3;
    });
    if (count > 0) {
      await fs.copyFile(dossierPath, dossierPath + '.bak2');
      await fs.writeFile(dossierPath, txt, 'utf8');
      console.log('Updated', dossierPath, 'lowercased', count, 'path entries (backup created).');
    } else {
      console.log('No path entries to lowercase in DossierLibrary.ts');
    }
  } catch (e) {
    console.error('Failed to update DossierLibrary.ts', e.message);
  }

  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
