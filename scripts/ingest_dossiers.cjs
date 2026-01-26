const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.join(__dirname, '..');
const LIBRARY_FILE = path.join(ROOT_DIR, 'src', 'data', 'knowledge', 'DossierLibrary.ts');
const ARCHIVE_DIR = path.join(ROOT_DIR, 'public', 'archive');
const TEMPLATE_FILE = path.join(__dirname, 'templates', 'dossier-template.html');

// Read existing DossierLibrary.ts
const libraryContent = fs.readFileSync(LIBRARY_FILE, 'utf8');

// Regex to extract DossierFile entries
const entryRegex = /\{\s*path:\s*'(.*?)',\s*justification:\s*'(.*?)',\s*category:\s*'(.*?)'\s*\}/g;

const entries = [];
let match;
while ((match = entryRegex.exec(libraryContent)) !== null) {
    entries.push({
        path: match[1],
        justification: match[2],
        category: match[3]
    });
}

console.log(`Found ${entries.length} entries in DossierLibrary.ts`);

const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');

let createdCount = 0;
let errorCount = 0;

entries.forEach(entry => {
    const fullPath = path.join(ARCHIVE_DIR, entry.path);
    const dir = path.dirname(fullPath);

    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const fileName = path.basename(entry.path, '.html');
        let displayTitle = fileName === 'index'
            ? path.basename(path.dirname(entry.path))
            : fileName;

        displayTitle = displayTitle
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());

        const id = Math.random().toString(36).substring(2, 10).toUpperCase();
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

        // Generate a deterministic hash for the integrity proof
        const hash = crypto.createHash('sha256')
            .update(entry.path + entry.justification)
            .digest('hex')
            .substring(0, 40)
            .toUpperCase();

        const content = template
            .replace(/{{TITLE}}/g, displayTitle)
            .replace(/{{DISPLAY_TITLE}}/g, displayTitle)
            .replace(/{{CATEGORY}}/g, entry.category)
            .replace(/{{JUSTIFICATION}}/g, entry.justification)
            .replace(/{{ID}}/g, id)
            .replace(/{{TIMESTAMP}}/g, timestamp)
            .replace(/{{HASH}}/g, hash);

        fs.writeFileSync(fullPath, content);
        createdCount++;
    } catch (err) {
        console.error(`Error creating ${entry.path}:`, err);
        errorCount++;
    }
});

console.log('--- PROTOCOL NC-7.0 INGESTION COMPLETE ---');
console.log(`Total Files Generated: ${createdCount}`);
console.log(`Errors: ${errorCount}`);
