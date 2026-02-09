import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const exts = new Set(['.tsx', '.jsx']);
const IGNORE_DIRS = new Set(['node_modules', 'dist']);

const REPLACERS = [
  [/\bstroke-width=/g, 'strokeWidth='],
  [/\bfont-size=/g, 'fontSize='],
  [/\bfont-weight=/g, 'fontWeight='],
  [/\bstroke-dasharray=/g, 'strokeDasharray='],
  [/\bstroke-linecap=/g, 'strokeLinecap='],
  [/\bstroke-linejoin=/g, 'strokeLinejoin='],
  [/\btext-anchor=/g, 'textAnchor='],
  [/\bdominant-baseline=/g, 'dominantBaseline=']
];

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      out.push(...(await walk(path.join(dir, e.name))));
    } else {
      const ext = path.extname(e.name);
      if (exts.has(ext)) out.push(path.join(dir, e.name));
    }
  }
  return out;
}

async function main() {
  const files = await walk(SRC);
  let touched = 0;
  let totalRepls = 0;

  for (const abs of files) {
    const before = await fs.readFile(abs, 'utf8');
    let after = before;
    let repls = 0;

    for (const [re, rep] of REPLACERS) {
      const m = after.match(re);
      if (m) repls += m.length;
      after = after.replace(re, rep);
    }

    if (after !== before) {
      await fs.writeFile(abs, after, 'utf8');
      touched++;
      totalRepls += repls;
    }
  }

  console.log(`fixed react svg props: files_touched=${touched}, replacements=${totalRepls}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
