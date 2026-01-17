import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = path.join(__dirname, '..', 'public', 'assets', 'schematics', 'francis-h5', 'main-hall.svg');
if (!fs.existsSync(file)) { console.error('SVG not found at', file); process.exit(2); }
const src = fs.readFileSync(file, 'utf8');

const totalPaths = (src.match(/<path\b/gi) || []).length;

// find the background-drawing group
const bgOpen = src.indexOf('<g id="background-drawing"');
if (bgOpen === -1) {
  console.error('No <g id="background-drawing"> found');
  process.exit(3);
}
const bgClose = src.indexOf('</g>', bgOpen);
if (bgClose === -1) {
  console.error('Malformed SVG: background group not closed');
  process.exit(4);
}
const bgContent = src.slice(bgOpen, bgClose);
const bgPaths = (bgContent.match(/<path\b/gi) || []).length;
const bgDCount = (bgContent.match(/d=\"[^\"]+\"/gi) || []).length;

console.log('SVG file:', file);
console.log('Total <path> elements in file:', totalPaths);
console.log('<path> elements inside <g id="background-drawing">:', bgPaths);
console.log('Total "d=\"...\"" attributes inside background group:', bgDCount);

// check for any <path> outside the background group (basic heuristic)
const beforeBg = src.slice(0, bgOpen);
const afterBg = src.slice(bgClose);
const pathsOutside = (beforeBg.match(/<path\b/gi) || []).length + (afterBg.match(/<path\b/gi) || []).length;
console.log('<path> elements outside background group (before+after):', pathsOutside);

// quick sanity: ensure none of the d attributes in background are empty
const emptyD = (bgContent.match(/d=\"\s*\"/gi) || []).length;
console.log('Empty d="" attributes inside background group:', emptyD);

// summary
if (bgPaths > 0 && emptyD === 0) {
  console.log('Background appears to contain path data and is wrapped.');
  process.exit(0);
} else {
  console.error('Background group check failed');
  process.exit(5);
}
