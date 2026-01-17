const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'public', 'assets', 'schematics', 'francis-h5', 'main-hall.svg');
if (!fs.existsSync(svgPath)) {
  console.error('SVG not found:', svgPath);
  process.exit(2);
}
let src = fs.readFileSync(svgPath, 'utf8');

const bgOpenMatch = src.match(/<g\s+id="background-drawing"[\s\S]*?>/i);
if (!bgOpenMatch) {
  console.error('background-drawing open tag not found');
  process.exit(3);
}
const bgOpenIndex = src.indexOf(bgOpenMatch[0]);
let i = bgOpenIndex + bgOpenMatch[0].length;
let depth = 1;
while (i < src.length && depth > 0) {
  const nextOpen = src.indexOf('<g', i);
  const nextClose = src.indexOf('</g>', i);
  if (nextClose === -1) { console.error('Malformed SVG — missing closing </g>'); process.exit(4); }
  if (nextOpen !== -1 && nextOpen < nextClose) {
    depth++;
    i = nextOpen + 2;
  } else {
    depth--;
    i = nextClose + 4;
  }
}
const bgCloseIndex = i; // position after the matching </g>

const before = src.slice(0, bgOpenIndex);
const bgOpenTag = bgOpenMatch[0];
const bgInner = src.slice(bgOpenIndex + bgOpenTag.length, bgCloseIndex - 4);
const bgCloseTag = '</g>';
const after = src.slice(bgCloseIndex);

// Collect <path .../> or <path ...></path> in the entire file except those already inside bgInner
// We'll extract from the 'after' and 'before' and also any <path> that are outside the background group
const outside = before + after;
const pathRegex = /<path\b[\s\S]*?>/gi; // matches opening path tag (self-closing or not)
let m;
const foundPaths = [];
while ((m = pathRegex.exec(outside)) !== null) {
  foundPaths.push({ idx: m.index, text: m[0] });
}

// Remove group-shaft-seal entirely from the source (any occurrence)
let newSrc = src.replace(/<g\s+[^>]*id=["']group-shaft-seal["'][\s\S]*?<\/g>/gi, '');

// Recompute background region positions after removal

// Now move all path tags from outside into background inner content.
// Build a version that removes those outside paths and inserts them into bgInner end.

// Remove paths from before and after by replacing them with empty string in the full src
// But avoid removing paths that are already inside background group — we only remove in outside
let outsideModified = outside.replace(pathRegex, '');

// Reconstruct the SVG: before part (but with its paths removed) + bgOpenTag + bgInner + insertedPaths + bgCloseTag + after (with its paths removed)

const insertedPathsText = foundPaths.map(p => p.text).join('\n');

// Build new before/after by removing the paths we collected
const beforePart = before.replace(pathRegex, '');
const afterPart = after.replace(pathRegex, '');

const result = beforePart + bgOpenTag + '\n' + bgInner + '\n' + insertedPathsText + '\n' + bgCloseTag + afterPart;

// Ensure pointer-events="none" on the background group open tag
let resultFixed = result.replace(/<g\s+id="background-drawing"([^>]*)>/i, (s, attrs) => {
  if (/pointer-events\s*=/.test(attrs)) return `<g id="background-drawing"${attrs}>`;
  return `<g id="background-drawing"${attrs} pointer-events="none">`;
});

fs.writeFileSync(svgPath, resultFixed, 'utf8');
console.log('SVG transformed.');

// Final counts
const totalPaths = (resultFixed.match(/<path\b/gi) || []).length;
const bgSectionMatch = resultFixed.match(/<g\s+id="background-drawing"[\s\S]*?>[\s\S]*?<\/g>/i);
const bgCount = bgSectionMatch ? (bgSectionMatch[0].match(/<path\b/gi) || []).length : 0;
console.log('Total paths now:', totalPaths, 'Background group paths:', bgCount);
