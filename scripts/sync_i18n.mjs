/**
 * sync_i18n.mjs
 * ESM replacement for the inline `i18n:sync` script in package.json.
 *
 * Copies locale source files from src/i18n/locales/ to their legacy
 * mirror locations in src/i18n/ so both import paths resolve correctly
 * until the import paths are unified in a future cleanup pass.
 *
 * Usage: node scripts/sync_i18n.mjs
 */
import { copyFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

const copies = [
  { src: 'src/i18n/locales/en.json', dest: 'src/i18n/en.json' },
  { src: 'src/i18n/locales/bs.json', dest: 'src/i18n/bs.json' },
];

let ok = true;
for (const { src, dest } of copies) {
  const srcPath = join(root, src);
  const destPath = join(root, dest);
  if (!existsSync(srcPath)) {
    console.error(`[i18n:sync] ERROR — source not found: ${src}`);
    ok = false;
    continue;
  }
  copyFileSync(srcPath, destPath);
  console.log(`[i18n:sync] ✅ ${src} → ${dest}`);
}

if (!ok) process.exit(1);
console.log('[i18n:sync] Done.');
