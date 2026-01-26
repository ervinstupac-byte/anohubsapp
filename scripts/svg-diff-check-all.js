import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const candidates = [
  path.join(__dirname, '..', 'public', 'assets', 'schematics', 'francis-h5', 'main-hall.svg'),
  path.join(__dirname, '..', 'public', 'assets', 'main-hall.svg'),
];

for (const file of candidates) {
  if (!fs.existsSync(file)) {
    console.log('File not found:', file);
    continue;
  }
  const src = fs.readFileSync(file, 'utf8');
  const totalPaths = (src.match(/<path\b/gi) || []).length;
  const bgOpen = src.indexOf('<g id="background-drawing"');
  const bgClose = bgOpen !== -1 ? src.indexOf('</g>', bgOpen) : -1;
  let bgPaths = 0;
  let bgDCount = 0;
  let emptyD = 0;
  let pathsOutside = 0;
  if (bgOpen !== -1 && bgClose !== -1) {
    const bgContent = src.slice(bgOpen, bgClose);
    bgPaths = (bgContent.match(/<path\b/gi) || []).length;
    bgDCount = (bgContent.match(/d=\"[^\"]+\"/gi) || []).length;
    emptyD = (bgContent.match(/d=\"\s*\"/gi) || []).length;
    const beforeBg = src.slice(0, bgOpen);
    const afterBg = src.slice(bgClose);
    pathsOutside = (beforeBg.match(/<path\b/gi) || []).length + (afterBg.match(/<path\b/gi) || []).length;
  }

  console.log('\nFile:', file);
  console.log('  Total <path> elements:', totalPaths);
  if (bgOpen === -1) console.log('  background-drawing group: NOT FOUND');
  else {
    console.log('  <path> in background-drawing:', bgPaths);
    console.log('  d="..." count inside background:', bgDCount);
    console.log('  empty d inside background:', emptyD);
    console.log('  <path> elements outside group:', pathsOutside);
  }
}
