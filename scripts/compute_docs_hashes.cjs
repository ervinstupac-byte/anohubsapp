const fs = require('fs');
const crypto = require('crypto');
const base = 'docs/archive/case_studies/cs-compliance-shield';
const files = ['index.html','index_2.html','index_3.html','index_4.html','index_5.html','index_6.html','index_7.html','index_8.html'];
const out = {};
for (const name of files) {
  const p = `${base}/${name}`;
  try {
    let txt = fs.readFileSync(p, 'utf8');
    txt = txt.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const h = crypto.createHash('sha256').update(Buffer.from(txt, 'utf8')).digest('hex');
    out[name] = h;
  } catch (e) {
    out[name] = null;
  }
}
console.log(JSON.stringify(out, null, 2));
