const fs = require('fs');
const path = require('path');

function parseSVG(svgContent) {
  const paths = [];
  const regex = /<path[^>]*d="([^"]*)"/g;
  let match;
  while ((match = regex.exec(svgContent)) !== null) {
    paths.push(match[1]);
  }
  return paths;
}

function comparePaths(oldPaths, newPaths) {
  const oldSet = new Set(oldPaths);
  const newSet = new Set(newPaths);
  const missing = oldPaths.filter(p => !newSet.has(p));
  const extra = newPaths.filter(p => !oldSet.has(p));
  return { missing, extra, identical: missing.length === 0 && extra.length === 0 };
}

const oldSVG = fs.readFileSync('old-main-hall.svg', 'utf8');
const newSVG = fs.readFileSync('public/assets/schematics/francis-h5/main-hall.svg', 'utf8');

console.log(`Old SVG length: ${oldSVG.length}`);
console.log(`New SVG length: ${newSVG.length}`);

const pathCountOld = (oldSVG.match(/<path/g) || []).length;
const pathCountNew = (newSVG.match(/<path/g) || []).length;

console.log(`Old <path> count: ${pathCountOld}`);
console.log(`New <path> count: ${pathCountNew}`);
console.log(`Old paths count: ${oldPaths.length}`);
console.log(`New paths count: ${newPaths.length}`);
console.log(`Identical: ${oldPaths.length === newPaths.length && oldPaths.every((p, i) => p === newPaths[i])}`);