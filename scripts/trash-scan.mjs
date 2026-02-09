import fs from 'node:fs/promises';

function isTrash(firstLines, size) {
  if (size >= 300) return false;
  const s = (firstLines || '').trim();
  if (!s) return true;
  const onlyComments = s.split(/\r?\n/).every((l) => l.trim() === '' || l.trim().startsWith('//') || l.trim().startsWith('/*') || l.trim().startsWith('*'));
  if (onlyComments) return true;
  if (/\bTODO\b/i.test(s)) return true;
  if (/export\s+default\s+function\s+\w*\s*\(\)\s*\{\s*return\s*<div\s*\/?>\s*<\/div>\s*;?\s*\}/s.test(s)) return true;
  if (/return\s*\(\s*<div\s*\/?>\s*<\/div>\s*\)/s.test(s)) return true;
  return false;
}

function escCell(s) {
  return String(s).replaceAll('|', '\\|').replaceAll('\n', '<br/>');
}

async function main() {
  const raw = await fs.readFile('orphan-report.route-aware.json', 'utf8');
  const report = JSON.parse(raw);
  const trash = report.orphans
    .filter((o) => isTrash(o.firstLines, o.size))
    .sort((a, b) => a.file.localeCompare(b.file));

  const header = ['Filename', 'Size', 'First 10 lines'];
  const lines = [];
  lines.push(`Found ${trash.length} TRASH candidates (<300 bytes, TODO/empty stubs).`);
  lines.push('');
  lines.push(`| ${header.join(' | ')} |`);
  lines.push(`| ${header.map(() => '---').join(' | ')} |`);
  for (const t of trash) {
    lines.push(`| ${escCell(t.file)} | ${t.size} | ${escCell(t.firstLines)} |`);
  }

  await fs.writeFile('trash-candidates.md', lines.join('\n'), 'utf8');
  process.stdout.write(`wrote trash-candidates.md (${trash.length} rows)\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
