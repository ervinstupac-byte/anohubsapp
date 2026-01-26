const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const LIBRARY_FILE = path.join(ROOT_DIR, 'src', 'data', 'knowledge', 'DossierLibrary.ts');

const libraryContent = fs.readFileSync(LIBRARY_FILE, 'utf8');

// Regex to extract DossierFile entries
const entryRegex = /\{\s*path:\s*'(.*?)',\s*justification:\s*'(.*?)',\s*category:\s*'(.*?)'\s*\}/g;

const paths = {};
const processedEntries = [];
let match;
let count = 0;

while ((match = entryRegex.exec(libraryContent)) !== null) {
    let filePath = match[1];
    let justification = match[2];
    let category = match[3];

    if (paths[filePath]) {
        paths[filePath]++;
        const parts = filePath.split('/');
        const fileName = parts.pop();
        const lastDotIndex = fileName.lastIndexOf('.');
        const name = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
        const ext = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : '';

        // Make it unique by appending the occurrence count before the extension
        filePath = [...parts, `${name}_${paths[filePath]}${ext}`].join('/');
    } else {
        paths[filePath] = 1;
    }

    processedEntries.push(`    { path: '${filePath}', justification: '${justification}', category: '${category}' }`);
    count++;
}

console.log(`Processed ${count} entries. Unique paths: ${Object.keys(paths).length}`);

const newContent = `export interface DossierFile {
    path: string;
    justification: string;
    category: 'Case Studies' | 'Technical Insights' | 'Maintenance Protocols' | 'Turbine Friend Dossiers';
}

export const DOSSIER_LIBRARY: DossierFile[] = [
${processedEntries.join(',\n')}
];
`;

fs.writeFileSync(LIBRARY_FILE, newContent);
console.log('DossierLibrary.ts updated with unique paths.');
