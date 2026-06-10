const { execSync } = require('child_process');
const fs = require('fs');

let out = '';
try {
    out = execSync('npx knip --reporter json', { encoding: 'utf-8' });
} catch (e) {
    out = e.stdout.toString();
}

try {
    const data = JSON.parse(out);
    let files = [];
    if (data.files && Array.isArray(data.files)) {
        files = data.files; // Array of strings?
        if (files.length > 0 && typeof files[0] === 'object') {
            files = files.map(f => f.file);
        }
    } else if (Array.isArray(data)) {
        files = data.map(f => f.file || f);
    }
    
    // Some versions of knip report files under 'files', others under 'unlisted', or just as an array.
    // Knip actually reports issues.
    if (data.issues && Array.isArray(data.issues)) {
       files = data.issues.filter(i => i.type === 'files').map(i => i.file);
    }
    
    const actualFiles = files.filter(f => typeof f === 'string' && fs.existsSync(f));
    const sizes = actualFiles.map(f => ({ file: f, size: fs.statSync(f).size }));
    sizes.sort((a,b) => b.size - a.size);
    
    console.log(JSON.stringify(sizes.slice(0, 50), null, 2));
} catch (e) {
    console.error('Failed to parse:', e);
}
