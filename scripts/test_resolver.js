const resolver = require('../src/lib/canonicalResolver');

function runTest() {
  const idx = resolver.buildIndex();
  console.log(`Manifest count read: ${idx.count}`);

  const samples = resolver.getSamplePaths(5);
  console.log('Sample paths:');
  samples.forEach((s, i) => console.log(`${i + 1}. ${s}`));

  console.log('\nResolving samples:');
  samples.forEach(s => {
    const r = resolver.resolvePath(s);
    console.log(s, '->', r ? JSON.stringify({ path: r.webPath, hash: r.hash }) : 'NOT FOUND');
  });

  // Test alias resolution (strip index.html if present)
  if (samples.length > 0) {
    const alt = samples[0].replace(/index\.html$/i, '');
    console.log('\nAlias test input:', alt);
    console.log('Alias resolve ->', resolver.resolvePath(alt));
  }
}

runTest();
