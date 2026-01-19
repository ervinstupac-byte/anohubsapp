const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', '..', 'scripts', 'hashes_applied.json');

function normalizeRawFile(raw) {
  if (!raw) return null;
  let p = raw.replace(/\\\\/g, '/').replace(/\\/g, '/');
  // Remove leading public/ or ./public/
  p = p.replace(/^\.\/public\//i, '').replace(/^public\//i, '').replace(/^\.\//, '');
  // Ensure archive segment
  const idx = p.indexOf('archive/');
  if (idx >= 0) p = p.slice(idx);
  // Ensure leading slash
  if (!p.startsWith('/')) p = '/' + p;
  return p;
}

function buildIndex() {
  const raw = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(raw);

  const entries = manifest.map(item => {
    const rawFile = item.file || item.filename || item.path || '';
    const webPath = normalizeRawFile(rawFile);
    return {
      webPath,
      raw: rawFile,
      hash: item.hash || item.sha256 || item.sha || item.digest || null
    };
  }).filter(e => e.webPath);

  const PATH_INDEX = Object.create(null);
  const PATH_ALIAS = Object.create(null);

  entries.forEach(e => {
    PATH_INDEX[e.webPath] = e;

    // alias: strip /index.html
    const alias1 = e.webPath.replace(/index\.html$/i, '');
    PATH_ALIAS[alias1.toLowerCase()] = e;

    // alias: strip .html
    const alias2 = e.webPath.replace(/\.html$/i, '');
    PATH_ALIAS[alias2.toLowerCase()] = e;
  });

  return { count: entries.length, entries, PATH_INDEX, PATH_ALIAS };
}

function resolvePath(pathOrAlias) {
  if (!pathOrAlias) return null;
  const { PATH_INDEX, PATH_ALIAS } = buildIndex();
  // Normalize input
  let p = pathOrAlias.replace(/\\\\/g, '/').replace(/\\/g, '/');
  p = p.replace(/^https?:\/\/[\w\.-]+\//i, ''); // strip host if passed
  p = p.replace(/^public\//i, '').replace(/^\.\//, '');
  if (!p.startsWith('/')) p = '/' + p;

  if (PATH_INDEX[p]) return PATH_INDEX[p];

  const lower = p.toLowerCase();
  if (PATH_ALIAS[lower]) return PATH_ALIAS[lower];

  // try adding/removing index.html
  if (p.endsWith('/')) {
    const withIndex = p + 'index.html';
    if (PATH_INDEX[withIndex]) return PATH_INDEX[withIndex];
  } else {
    const withoutIndex = p.replace(/index\.html$/i, '');
    if (PATH_ALIAS[withoutIndex.toLowerCase()]) return PATH_ALIAS[withoutIndex.toLowerCase()];
  }

  return null;
}

function getSamplePaths(n = 10) {
  const idx = buildIndex();
  return idx.entries.slice(0, n).map(e => e.webPath);
}

module.exports = {
  buildIndex,
  resolvePath,
  getSamplePaths
};
