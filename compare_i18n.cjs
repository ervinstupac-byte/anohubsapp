const fs = require('fs');

const en = JSON.parse(fs.readFileSync('src/i18n/en.json', 'utf8'));
const bs = JSON.parse(fs.readFileSync('src/i18n/bs.json', 'utf8'));

function getValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function getAllKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            keys = keys.concat(getAllKeys(obj[key], `${prefix}${key}.`));
        } else {
            keys.push(`${prefix}${key}`);
        }
    }
    return keys;
}

const enKeys = getAllKeys(en);
const bsKeys = getAllKeys(bs);

const missingInBs = enKeys.filter(k => !bsKeys.includes(k));
const missingInEn = bsKeys.filter(k => !enKeys.includes(k));

console.log('--- Missing in bs.json (Keys from en.json) ---');
missingInBs.forEach(k => console.log(`${k}: ${getValue(en, k)}`));

console.log('\n--- Missing in en.json (Keys from bs.json) ---');
missingInEn.forEach(k => console.log(`${k}: ${getValue(bs, k)}`));
