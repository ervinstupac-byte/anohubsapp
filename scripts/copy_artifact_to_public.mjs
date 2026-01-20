import fs from 'fs';
import path from 'path';

const end = new Date();
const start = new Date();
start.setDate(end.getDate() - 30);
const startStr = start.toISOString().slice(0,10);
const endStr = end.toISOString().slice(0,10);
const filename = `management_summary_30d_${startStr}_to_${endStr}.pdf`;
const src = path.join(process.cwd(), 'artifacts', filename);
const destDir = path.join(process.cwd(), 'public', 'artifacts');
const dest = path.join(destDir, filename);

if (!fs.existsSync(src)) {
  console.error('Source PDF not found:', src);
  process.exit(1);
}
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log('Copied PDF to public artifacts:', dest);
