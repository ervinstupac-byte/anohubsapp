import fs from 'node:fs/promises';

function esc(v) {
  const s = String(v ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replaceAll('"', '""') + '"';
  }
  return s;
}

async function main() {
  const raw = await fs.readFile('orphan-report.json', 'utf8');
  const report = JSON.parse(raw);
  const header = ['Filename', 'Size', 'LastModified', 'SummaryTag'];
  const lines = [header.map(esc).join(',')];

  for (const o of report.orphans) {
    lines.push([o.file, o.size, o.mtimeIso, o.summaryTag].map(esc).join(','));
  }

  await fs.writeFile('orphan-report.csv', lines.join('\n'), 'utf8');
  process.stdout.write(`wrote orphan-report.csv (${report.orphans.length} rows)\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
