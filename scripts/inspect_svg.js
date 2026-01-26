
const fs = require('fs');
const path = require('path');

const svgPath = 'c:\\Users\\Home\\OneDrive\\getting started\\Documents\\GitHub\\anohubsapp\\public\\Turbine_Grouped.svg';

if (!fs.existsSync(svgPath)) {
    console.error("SVG file not found at " + svgPath);
    process.exit(1);
}

const svgContent = fs.readFileSync(svgPath, 'utf8');

const idRegex = /id=["']([^"']+)["']/g;
const viewBoxRegex = /viewBox=["']([^"']+)["']/;
const dimensionsRegex = /(?:width|height)=["']([^"']+)["']/;

let match;
console.log("SVG Analysis:");
const vbMatch = viewBoxRegex.exec(svgContent);
if (vbMatch) console.log("ViewBox: " + vbMatch[1]);

const ids = [];
while ((match = idRegex.exec(svgContent)) !== null) {
    ids.push(match[1]);
}

console.log("IDs found: " + ids.length);
ids.forEach(id => {
    if (id.includes('temp') || id.includes('spiral') || id.includes('runner') || id.includes('shaft') || id.includes('floor')) {
        console.log("  " + id);
    }
});
