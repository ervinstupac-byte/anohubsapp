import fs from 'node:fs/promises';

const PLACEHOLDER_RE = /(coming soon|work in progress|\bwip\b|under construction|\btodo\b|\btbd\b|lorem ipsum)/i;

function hasFunctionalSignals(text) {
  // If these appear, it is very likely not "trash" (even if unreachable today)
  return /\b(useState|useEffect|useMemo|useCallback|useReducer|useRef|createContext|useContext|zustand|calculate|analyz|diagnos|optimizer|engine|physics)\b/i.test(text);
}

function isStubSignature(text) {
  const s = text.trim();
  if (!s) return true;

  const nonEmptyLines = s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const onlyComments = nonEmptyLines.length > 0 && nonEmptyLines.every((l) => l.startsWith('//') || l.startsWith('/*') || l.startsWith('*'));
  if (onlyComments) return true;

  // If it contains clear placeholder language, it's trash regardless of size.
  if (PLACEHOLDER_RE.test(s)) return true;

  // empty component bodies / empty div returns
  if (/return\s*\(\s*<div\b[^>]*>\s*<\/div>\s*\)\s*;?/s.test(s)) return true;
  if (/return\s*<div\b[^>]*\/>\s*;?/s.test(s)) return true;

  // Otherwise, do NOT classify as trash.
  return false;
}

function escCell(s) {
  return String(s ?? '').replaceAll('|', '\\|').replaceAll('\n', '<br/>');
}

async function main() {
  const raw = await fs.readFile('orphan-report.route-aware.json', 'utf8');
  const report = JSON.parse(raw);

  const rows = [];

  for (const o of report.orphans) {
    const abs = o.file.replace(/^src\//, 'src/');
    let text = '';
    try {
      text = await fs.readFile(abs, 'utf8');
    } catch {
      continue;
    }

    if (!isStubSignature(text)) continue;

    const first10 = text.split(/\r?\n/).slice(0, 10).join('\n');
    rows.push({ file: o.file, size: o.size, first10 });
  }

  rows.sort((a, b) => a.file.localeCompare(b.file));

  const header = ['Filename', 'Size', 'First 10 lines'];
  const out = [];
  out.push(`Found ${rows.length} Option-B TRASH candidates (stub/placeholder signature among route-aware orphans).`);
  out.push('');
  out.push(`| ${header.join(' | ')} |`);
  out.push(`| ${header.map(() => '---').join(' | ')} |`);
  for (const r of rows) {
    out.push(`| ${escCell(r.file)} | ${r.size} | ${escCell(r.first10)} |`);
  }

  await fs.writeFile('trash-candidates-b.md', out.join('\n'), 'utf8');
  process.stdout.write(`wrote trash-candidates-b.md (${rows.length} rows)\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
