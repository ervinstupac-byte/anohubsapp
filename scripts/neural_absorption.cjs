
const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../src');

// Helper to recursively find files
function getAllFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        if (file === 'node_modules' || file.startsWith('.')) return;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, fileList);
        } else {
            fileList.push(fullPath);
        }
    });
    return fileList;
}

const allFiles = getAllFiles(srcDir);
const tsFiles = allFiles.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
const assetFiles = allFiles.filter(f => f.endsWith('.json') || f.endsWith('.svg'));

// 1. Identify Future Assets (Unused Complex Logic)
const futureAssets = [];

tsFiles.forEach(file => {
    const basename = path.basename(file, path.extname(file));
    if (basename === 'index') return;

    let isReferenced = false;
    for (const otherFile of tsFiles) {
        if (otherFile === file) continue;
        const content = fs.readFileSync(otherFile, 'utf-8');
        if (content.includes(`/${basename}'`) || content.includes(`/${basename}"`) || content.includes(`"${basename}"`) || content.includes(`'${basename}'`)) {
            isReferenced = true;
            break;
        }
    }

    if (!isReferenced) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n').length;
        if (lines > 20) {
            // Heuristic for functionality and inputs
            const firstBlockComment = content.match(/\/\*\*([\s\S]*?)\*\//);
            const description = firstBlockComment ? firstBlockComment[1].replace(/\*/g, '').trim().split('\n')[0] : 'No description';
            
            // Look for telemetry-like inputs
            const potentialInputs = [];
            if (content.includes('temperature')) potentialInputs.push('Temperature');
            if (content.includes('pressure')) potentialInputs.push('Pressure');
            if (content.includes('vibration')) potentialInputs.push('Vibration');
            if (content.includes('flow')) potentialInputs.push('Flow');
            if (content.includes('rpm') || content.includes('speed')) potentialInputs.push('RPM');
            if (content.includes('voltage') || content.includes('current')) potentialInputs.push('Electrical');
            if (content.includes('viscosity')) potentialInputs.push('Viscosity');
            
            futureAssets.push({
                file: path.relative(srcDir, file),
                lines: lines,
                description: description.substring(0, 50) + (description.length > 50 ? '...' : ''),
                inputs: [...new Set(potentialInputs)].join(', ') || 'Logic/State'
            });
        }
    }
});

futureAssets.sort((a, b) => b.lines - a.lines);

// 2. Identify Unreferenced Large Assets
const largeUnusedAssets = [];
assetFiles.forEach(file => {
    const stat = fs.statSync(file);
    if (stat.size > 5000) { // > 5KB
        const basename = path.basename(file);
        let isReferenced = false;
        for (const otherFile of tsFiles) {
            const content = fs.readFileSync(otherFile, 'utf-8');
            if (content.includes(basename)) {
                isReferenced = true;
                break;
            }
        }
        
        if (!isReferenced) {
            largeUnusedAssets.push({
                file: path.relative(srcDir, file),
                size: stat.size,
                type: path.extname(file)
            });
        }
    }
});

// Output
console.log('--- NEURAL ABSORPTION REPORT ---');
console.log(JSON.stringify({
    topFutureAssets: futureAssets.slice(0, 15),
    diagnosticReadyAssets: largeUnusedAssets
}, null, 2));
