const fs = require('fs');
const path = require('path');

function validate(filePath) {
  if (!fs.existsSync(filePath)) return { file: filePath, exists: false };
  const raw = fs.readFileSync(filePath, 'utf8');
  const hasId = /<!--\s*NC-10\.0-ID:[0-9a-f]+\s*-->/i.test(raw);
  const hasTable = /<table[^>]+class=["']?nc10-sensor-log["']?[^>]*>[\s\S]*?<tbody>[\s\S]*?<\/tbody>/i.test(raw);
  const tbodyMatch = raw.match(/<table[^>]+class=["']?nc10-sensor-log["']?[^>]*>[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/i);
  const rowCount = tbodyMatch ? (tbodyMatch[1].match(/<tr\b/gi) || []).length : 0;
  const hasMaintenance = /<div[^>]+class=["']?nc10-maintenance["']?[^>]*>[\s\S]*?<p>Technician:/i.test(raw);
  const hasMath = /<div[^>]+class=["']?nc10-math["']?[^>]*>[\s\S]*?(Hydraulic|Electrical) Calculation/i.test(raw);
  return { file: filePath, exists: true, hasId, hasTable, rowCount, hasMaintenance, hasMath };
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/validate_dossier_render.cjs <file1> [file2] ...');
  process.exit(2);
}

const results = args.map(p => validate(path.resolve(p)));
console.log(JSON.stringify({ checked: results.length, results }, null, 2));
// Exit with non-zero if any check fails
const bad = results.some(r => !r.exists || !r.hasId || !r.hasTable || r.rowCount < 5 || !r.hasMaintenance || !r.hasMath);
process.exit(bad ? 1 : 0);
