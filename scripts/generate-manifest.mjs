import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SCAN_ROOTS = [
  path.join(ROOT, 'src'),
  path.join(ROOT, 'src', 'features', 'discovery-vault')
];

const IGNORE_DIRS = new Set(['node_modules', 'dist', '.git']);

const TEXT_EXTS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.md', '.css', '.scss', '.svg', '.html'
]);

function rel(p) {
  return path.relative(ROOT, p).replaceAll('\\', '/');
}

function categorize(fileRel) {
  const p = fileRel.toLowerCase();
  if (p.includes('/services/') || p.includes('service') || p.includes('/api/')) return 'Data-Service';
  if (p.includes('/models/') || p.includes('/physics') || p.includes('engine') || p.includes('optimizer') || p.includes('guardian')) return 'Physics-Logic';
  if (p.endsWith('.tsx') || p.endsWith('.jsx')) return 'UI-Component';
  if (p.includes('legacy') || p.includes('deprecated') || p.includes('archive') || p.includes('old')) return 'Legacy-Asset';
  return 'Legacy-Asset';
}

function folderPurpose(folderRel) {
  const p = folderRel.toLowerCase();
  if (p.endsWith('/src')) return 'Application source root: UI, services, models, features, and assets.';
  if (p.includes('features/discovery-vault/vault')) return 'Discovery Vault storage: secured, high-value engineering logic preserved for later integration.';
  if (p.includes('/components')) return 'React UI components and page-level dashboards.';
  if (p.includes('/shared')) return 'Shared cross-feature UI primitives, hooks, and utilities.';
  if (p.includes('/services')) return 'Business/engineering services, report generators, and system engines.';
  if (p.includes('/contexts')) return 'React context providers for global application state and cross-cutting concerns.';
  if (p.includes('/features')) return 'Feature modules: domain-specific UI + logic grouped by product area.';
  if (p.includes('/models')) return 'Domain models, types, and simulation entities.';
  if (p.includes('/assets')) return 'Static assets: SVGs, images, and other build-time resources.';
  return 'Project folder holding related source files.';
}

async function walk(dir) {
  const outFiles = [];
  const outDirs = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      outDirs.push(abs);
      const { files, dirs } = await walk(abs);
      outFiles.push(...files);
      outDirs.push(...dirs);
    } else {
      outFiles.push(abs);
    }
  }
  return { files: outFiles, dirs: outDirs };
}

async function summarizeFile(abs) {
  const fileRel = rel(abs);
  const ext = path.extname(abs);

  if (!TEXT_EXTS.has(ext)) {
    return { fileRel, summary: 'Binary or non-text asset.', category: categorize(fileRel), unknown: true };
  }

  let content = '';
  try {
    content = await fs.readFile(abs, 'utf8');
  } catch {
    return { fileRel, summary: 'Unreadable file.', category: categorize(fileRel), unknown: true };
  }

  const trimmed = content.trim();
  if (!trimmed) {
    return { fileRel, summary: 'Empty file.', category: categorize(fileRel), unknown: true };
  }

  const lines = trimmed.split(/\r?\n/).slice(0, 60);
  const firstMeaningful = lines.find((l) => l.trim() && !l.trim().startsWith('//'))?.trim() ?? lines[0].trim();

  // simple heuristics for a one-liner
  let summary = '';
  if (/export\s+class\s+/m.test(trimmed)) {
    const m = trimmed.match(/export\s+class\s+([A-Za-z0-9_]+)/m);
    summary = m ? `Defines the \`${m[1]}\` class.` : 'Defines an exported class.';
  } else if (/export\s+const\s+/m.test(trimmed) && (ext === '.tsx' || ext === '.jsx')) {
    const m = trimmed.match(/export\s+const\s+([A-Za-z0-9_]+)/m);
    summary = m ? `React component \`${m[1]}\`.` : 'React component module.';
  } else if (/function\s+([A-Za-z0-9_]+)\s*\(/m.test(trimmed)) {
    const m = trimmed.match(/function\s+([A-Za-z0-9_]+)\s*\(/m);
    summary = m ? `Defines function \`${m[1]}\`.` : 'Defines functions.';
  } else if (ext === '.md') {
    summary = 'Markdown documentation.';
  } else if (ext === '.json') {
    summary = 'JSON configuration/data file.';
  } else if (ext === '.svg') {
    summary = 'SVG asset.';
  } else if (ext === '.html') {
    summary = 'HTML content page.';
  } else {
    summary = `Source module starting with: ${firstMeaningful.slice(0, 80)}${firstMeaningful.length > 80 ? '…' : ''}`;
  }

  // unknown if too generic
  const unknown = summary.startsWith('Source module starting with:');

  return { fileRel, summary, category: categorize(fileRel), unknown };
}

function groupByFolder(fileEntries) {
  const map = new Map();
  for (const e of fileEntries) {
    const folder = e.fileRel.split('/').slice(0, -1).join('/') || '.';
    const arr = map.get(folder) ?? [];
    arr.push(e);
    map.set(folder, arr);
  }
  return map;
}

async function writeVaultReadmes() {
  const vaultRoot = path.join(ROOT, 'src', 'features', 'discovery-vault', 'vault');
  let entries;
  try {
    entries = await fs.readdir(vaultRoot, { withFileTypes: true });
  } catch {
    return;
  }

  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const folder = path.join(vaultRoot, e.name);
    const folderRel = rel(folder);
    const { files } = await walk(folder);
    const inv = files
      .filter((f) => !path.basename(f).toLowerCase().endsWith('readme.md'))
      .map((f) => `- ${rel(f)}`)
      .join('\n');

    const readme = `# Discovery Vault: ${e.name}\n\nThis folder preserves secured engineering logic for later integration.\n\n## Contents\n${inv || '- (empty)'}\n`;
    await fs.writeFile(path.join(folder, 'README.md'), readme, 'utf8');
  }
}

async function main() {
  const allFiles = [];
  const allDirs = new Set();

  for (const r of SCAN_ROOTS) {
    const { files, dirs } = await walk(r);
    for (const d of dirs) allDirs.add(rel(d));
    for (const f of files) allFiles.push(f);
  }

  const summaries = [];
  for (const f of allFiles) summaries.push(await summarizeFile(f));
  summaries.sort((a, b) => a.fileRel.localeCompare(b.fileRel));

  const byFolder = groupByFolder(summaries);
  const folderKeys = [...byFolder.keys()].sort();

  const unknowns = summaries.filter((s) => s.unknown).map((s) => s.fileRel);

  // Build manifest markdown
  let md = '# CODEBASE_MANIFEST\n\n';
  md += `Generated: ${new Date().toISOString()}\n\n`;

  for (const folder of folderKeys) {
    md += `## ${folder}\n\n`;
    md += `Folder Purpose: ${folderPurpose(folder)}\n\n`;
    md += 'File Inventory:\n';
    for (const f of byFolder.get(folder)) {
      md += `- **${path.basename(f.fileRel)}** (${f.category}): ${f.summary}\n`;
    }
    md += '\n';
  }

  md += '# Mystery Hunt (Unclear/Generic Summaries)\n\n';
  md += unknowns.length
    ? unknowns.map((u) => `- ${u}`).join('\n') + '\n'
    : '- None\n';

  await fs.writeFile(path.join(ROOT, 'CODEBASE_MANIFEST.md'), md, 'utf8');
  await fs.writeFile(path.join(ROOT, 'MYSTERY_HUNT.json'), JSON.stringify({ unknowns }, null, 2), 'utf8');

  await writeVaultReadmes();

  console.log(`wrote CODEBASE_MANIFEST.md (folders=${folderKeys.length}, files=${summaries.length})`);
  console.log(`wrote MYSTERY_HUNT.json (unknowns=${unknowns.length})`);
  console.log('wrote vault README.md files');
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
