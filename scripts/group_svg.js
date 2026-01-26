
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFilename = path.join(__dirname, 'Gemini_Generated_Image_pk5hl3pk5hl3pk5h (1).svg');
const outputPath = path.join(__dirname, 'public', 'Turbine_Grouped.svg');

const groups = {
    'temp-lubrication': { x: [680, 850], y: [220, 320] },
    'temp-generator': { x: [650, 950], y: [50, 250] },
    'temp-spiral-case': { x: [600, 1100], y: [250, 650] },
    'temp-miv': { x: [420, 620], y: [320, 500] },
    'temp-penstock': { x: [100, 420], y: [320, 500] },
    'temp-cabinet': { x: [50, 280], y: [150, 550] },
    'temp-bypass': { x: [900, 1150], y: [300, 500] }
};

function getCentroid(d) {
    const coords = d.match(/-?\d+\.?\d*/g);
    if (!coords || coords.length < 2) return null;

    let sumX = 0, sumY = 0, count = 0;
    const step = Math.max(2, Math.floor(coords.length / 20) * 2);
    for (let i = 0; i < coords.length; i += step) {
        if (coords[i + 1] !== undefined) {
            sumX += parseFloat(coords[i]);
            sumY += parseFloat(coords[i + 1]);
            count++;
        }
    }
    return count > 0 ? { x: sumX / count, y: sumY / count } : null;
}

function processSVG() {
    console.log('Reading input file:', inputFilename);
    if (!fs.existsSync(inputFilename)) {
        console.error(`Error: ${inputFilename} does not exist.`);
        process.exit(1);
    }

    const content = fs.readFileSync(inputFilename, 'utf8');
    console.log(`File read. Length: ${content.length}`);

    const pathRegex = /<path[^>]+d="([^"]+)"[^>]*\/>/g;

    const groupedPaths = {
        'temp-lubrication': [],
        'temp-generator': [],
        'temp-spiral-case': [],
        'temp-miv': [],
        'temp-penstock': [],
        'temp-cabinet': [],
        'temp-bypass': [],
        'temp-detail': []
    };

    let match;
    let totalPaths = 0;

    console.log('Grouping paths...');
    while ((match = pathRegex.exec(content)) !== null) {
        totalPaths++;
        const fullPathTag = match[0];
        const dValue = match[1];

        const centroid = getCentroid(dValue);

        if (!centroid) {
            groupedPaths['temp-detail'].push(fullPathTag);
            continue;
        }

        let assigned = false;
        for (const [id, range] of Object.entries(groups)) {
            if (centroid.x >= range.x[0] && centroid.x <= range.x[1] &&
                centroid.y >= range.y[0] && centroid.y <= range.y[1]) {
                groupedPaths[id].push(fullPathTag);
                assigned = true;
                break;
            }
        }

        if (!assigned) {
            groupedPaths['temp-detail'].push(fullPathTag);
        }
    }

    console.log(`Processed ${totalPaths} paths.`);
    Object.keys(groupedPaths).forEach(id => {
        console.log(`- ${id}: ${groupedPaths[id].length} paths`);
    });

    let newContent = content.replace(/<path[^>]+\/>/g, '');
    newContent = newContent.replace(/\n\s*\n/g, '\n');

    const closingTagIndex = newContent.lastIndexOf('</svg>');
    if (closingTagIndex === -1) {
        console.error('Error: Could not find closing </svg> tag.');
        process.exit(1);
    }

    let groupsXml = '\n';
    for (const [id, paths] of Object.entries(groupedPaths)) {
        groupsXml += `  <g id="${id}" style="pointer-events: all; cursor: pointer;">\n    ${paths.join('\n    ')}\n  </g>\n`;
    }

    const finalContent = newContent.slice(0, closingTagIndex) + groupsXml + newContent.slice(closingTagIndex);

    if (!fs.existsSync(path.dirname(outputPath))) {
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    fs.writeFileSync(outputPath, finalContent);
    console.log(`\nSUCCESS: Grouped SVG saved to ${outputPath}`);
}

try {
    processSVG();
} catch (err) {
    console.error('Runtime Error:', err);
    process.exit(1);
}
