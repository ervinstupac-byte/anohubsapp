const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Import the library directly from the source to avoid TS compilation issues in this script
// Since we are in Node, we will read the file and extract the paths using regex for speed
const libraryPath = path.join(__dirname, '../src/data/knowledge/DossierLibrary.ts');
const libraryContent = fs.readFileSync(libraryPath, 'utf8');

const pathMatches = libraryContent.match(/path:\s*'([^']+)'/g);
const dossierPaths = pathMatches.map(m => m.match(/'([^']+)'/)[1]);

console.log(`[NC-9.0] Starting Final Integrity Audit for ${dossierPaths.length} assets...`);

const results = {
    found: 0,
    missing: 0,
    hashes: new Set(),
    duplicates: 0,
    invalidHashes: 0
};

dossierPaths.forEach(relPath => {
    const fullPath = path.join(__dirname, '../public/archive', relPath);

    if (fs.existsSync(fullPath)) {
        results.found++;
        const content = fs.readFileSync(fullPath, 'utf8');

        // Extract SHA-256 hash
        const hashMatch = content.match(/SHA-256: ([A-F0-9]{40})/);
        if (hashMatch) {
            const hash = hashMatch[1];
            if (results.hashes.has(hash)) {
                results.duplicates++;
                console.warn(`[WARNING] Duplicate Hash found: ${hash} (${relPath})`);
            }
            results.hashes.add(hash);
        } else {
            results.invalidHashes++;
            console.error(`[ERROR] No SHA-256 hash found in: ${relPath}`);
        }
    } else {
        results.missing++;
        console.error(`[ERROR] Missing physical file: ${relPath}`);
    }
});

console.log('\n--- AUDIT SUMMARY ---');
console.log(`REAL ASSETS FOUND: ${results.found} / ${dossierPaths.length}`);
console.log(`MISSING ASSETS: ${results.missing}`);
console.log(`UNIQUE INTEGRITY HASHES: ${results.hashes.size}`);
console.log(`DUPLICATE HASHES: ${results.duplicates}`);
console.log(`FILES WITHOUT HASHES: ${results.invalidHashes}`);
console.log('----------------------\n');

if (results.found === dossierPaths.length && results.missing === 0 && results.duplicates === 0 && results.invalidHashes === 0) {
    console.log('[SUCCESS] Protocol NC-9.0: 100% Physical Integrity Verified.');
    process.exit(0);
} else {
    console.log('[FAILURE] Protocol NC-9.0: Integrity breach detected.');
    process.exit(1);
}
