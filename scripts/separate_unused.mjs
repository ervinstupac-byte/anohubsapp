import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Read knip results
const rawData = fs.readFileSync(path.join(rootDir, 'knip_results.json'), 'utf8');
const dataStr = rawData.replace(/^\uFEFF/, '');
const data = JSON.parse(dataStr);

// Knip JSON format usually has a `files` array and an `issues` array.
// Wait, looking at knip docs, the JSON output has { files: [...], issues: [...] } 
// Let's print the keys to be sure.
console.log('Knip data keys:', Object.keys(data));

// Filter files
const unusedFiles = data.files || [];

// If 'files' is not an array of strings, but it is in 'issues' with type 'files':
const fileIssues = data.issues ? data.issues.filter(i => i.type === 'files') : [];
if (unusedFiles.length === 0 && fileIssues.length > 0) {
    fileIssues.forEach(i => unusedFiles.push(i.file));
}

// Fallback to unused-files.json if knip output is different
let finalUnusedFiles = [...unusedFiles];
if (finalUnusedFiles.length === 0) {
    try {
        const fallback = JSON.parse(fs.readFileSync(path.join(rootDir, 'unused-files.json'), 'utf8'));
        if (Array.isArray(fallback)) {
            finalUnusedFiles = fallback;
        }
    } catch (e) {
        console.error('No unused files found in either knip_results.json or unused-files.json');
    }
}

console.log(`Found ${finalUnusedFiles.length} unused files.`);

// Categorize them
const incubatorDir = path.join(rootDir, 'src', 'incubator');
const archiveDir = path.join(rootDir, '_SOVEREIGN_ARCHIVE', 'unused');

if (!fs.existsSync(incubatorDir)) fs.mkdirSync(incubatorDir, { recursive: true });
if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });

// Heuristics for "good quality"
const highQualityKeywords = [
    'Engine', 'Service', 'Kernel', 'Dashboard', 'Simulator', 'Optimizer', 
    'Orchestrator', 'Intelligence', 'Protocol', 'Physics', 'Core', 'Master'
];

let incubatorCount = 0;
let archiveCount = 0;

for (const relPath of finalUnusedFiles) {
    const absPath = path.join(rootDir, relPath);
    if (!fs.existsSync(absPath)) {
        console.warn('File not found:', relPath);
        continue;
    }

    const basename = path.basename(relPath, path.extname(relPath));
    const isHighQuality = highQualityKeywords.some(kw => basename.includes(kw));
    
    // Also consider file size: > 100 lines could be considered complex/good quality
    const content = fs.readFileSync(absPath, 'utf8');
    const lines = content.split('\n').length;
    const isComplex = lines > 100;

    let targetDir;
    if (isHighQuality || isComplex) {
        targetDir = incubatorDir;
        incubatorCount++;
    } else {
        targetDir = archiveDir;
        archiveCount++;
    }

    // Preserve structure inside targetDir? No, just flat or slightly nested for simplicity, 
    // actually it's better to preserve directory structure.
    const relativeToSrc = relPath.startsWith('src\\') || relPath.startsWith('src/') 
        ? relPath.substring(4) 
        : relPath;
    
    const targetAbsPath = path.join(targetDir, relativeToSrc);
    const targetAbsDir = path.dirname(targetAbsPath);
    
    if (!fs.existsSync(targetAbsDir)) {
        fs.mkdirSync(targetAbsDir, { recursive: true });
    }
    
    fs.renameSync(absPath, targetAbsPath);
}

console.log(`Moved ${incubatorCount} files to incubator.`);
console.log(`Moved ${archiveCount} files to archive.`);
