const fs = require('fs');

const en = JSON.parse(fs.readFileSync('src/i18n/en.json', 'utf8'));
const bs = JSON.parse(fs.readFileSync('src/i18n/bs.json', 'utf8'));

function setPath(obj, path, value) {
    const parts = path.split('.');
    let curr = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!curr[part]) curr[part] = {};
        curr = curr[part];
    }
    curr[parts[parts.length - 1]] = value;
}

function getAllKeys(obj, prefix = '') {
    let keys = {};
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            Object.assign(keys, getAllKeys(obj[key], `${prefix}${key}.`));
        } else {
            keys[`${prefix}${key}`] = obj[key];
        }
    }
    return keys;
}

const enData = getAllKeys(en);
const bsData = getAllKeys(bs);

const allKeys = new Set([...Object.keys(enData), ...Object.keys(bsData)]);

const newEn = {};
const newBs = {};

allKeys.forEach(key => {
    let enVal = enData[key];
    let bsVal = bsData[key];

    if (enVal === undefined) {
        // Translate from Bosnian to English (Placeholder)
        enVal = `[EN] ${bsVal}`;
    }
    if (bsVal === undefined) {
        // Translate from English to Bosnian (Placeholder)
        bsVal = `[BS] ${enVal}`;
    }

    setPath(newEn, key, enVal);
    setPath(newBs, key, bsVal);
});

fs.writeFileSync('src/i18n/en_new.json', JSON.stringify(newEn, null, 2), 'utf8');
fs.writeFileSync('src/i18n/bs_new.json', JSON.stringify(newBs, null, 2), 'utf8');

console.log('Merged i18n files created.');
console.log('Total unique keys:', allKeys.size);
