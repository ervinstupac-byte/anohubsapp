import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const projectRoot = process.cwd();
const SRC_DIR = path.join(projectRoot, 'src');

function isUnder(dir, file) {
  const rel = path.relative(dir, file);
  return rel && !rel.startsWith('..') && !path.isAbsolute(rel);
}

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === 'dist' || e.name === '.git') continue;
      out.push(...(await walk(abs)));
    } else {
      out.push(abs);
    }
  }
  return out;
}

function loadTsConfig(tsconfigPath) {
  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (configFile.error) {
    const msg = ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n');
    throw new Error(`Failed to read tsconfig: ${msg}`);
  }

  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(tsconfigPath),
    undefined,
    tsconfigPath
  );

  return {
    fileNames: parsed.fileNames,
    options: parsed.options,
  };
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function getImportSpecifiers(sourceText) {
  const info = ts.preProcessFile(sourceText, true, true);
  const specs = [];
  for (const imp of info.importedFiles) specs.push(imp.fileName);
  for (const imp of info.referencedFiles) specs.push(imp.fileName);
  for (const imp of info.libReferenceDirectives) specs.push(imp.fileName);
  // Also handle export ... from
  for (const imp of info.typeReferenceDirectives) specs.push(imp.fileName);

  // Route-aware: capture dynamic imports (import('...')) and React.lazy(() => import('...'))
  // NOTE: this only handles literal specifiers.
  const dynRe = /\bimport\(\s*['"]([^'"\n]+)['"]\s*\)/g;
  for (const m of sourceText.matchAll(dynRe)) {
    if (m[1]) specs.push(m[1]);
  }

  // Route-aware: capture import.meta.glob('...') patterns (literal only)
  const globRe = /import\.meta\.glob\(\s*['"]([^'"\n]+)['"]\s*\)/g;
  for (const m of sourceText.matchAll(globRe)) {
    if (m[1]) specs.push(`__GLOB__${m[1]}`);
  }

  return specs;
}

function globToMatcher(pattern) {
  // very small glob subset: **, *, and simple suffix/prefix matching
  // we only need enough to prevent common lazy-route pages from being classified as orphans.
  const esc = (s) => s.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const re = '^' + pattern
    .split('**').map((chunk) => chunk.split('*').map(esc).join('[^/]*')).join('.*') + '$';
  return new RegExp(re);
}

function createModuleResolver(tsOptions) {
  const host = ts.sys;
  return (specifier, containingFile) => {
    const resolved = ts.resolveModuleName(specifier, containingFile, tsOptions, host);
    if (resolved?.resolvedModule?.resolvedFileName) {
      return path.normalize(resolved.resolvedModule.resolvedFileName);
    }
    return null;
  };
}

async function computeReachableFiles({ entrypointsAbs, allSrcFilesSet, tsOptions }) {
  const resolveModule = createModuleResolver(tsOptions);
  const reachable = new Set();
  const queue = [...entrypointsAbs.map((p) => path.normalize(p))];

  while (queue.length) {
    const file = queue.pop();
    if (!file) continue;
    if (reachable.has(file)) continue;
    if (!allSrcFilesSet.has(file)) continue;
    reachable.add(file);

    let text = '';
    try {
      text = await fs.readFile(file, 'utf8');
    } catch {
      continue;
    }

    const specs = getImportSpecifiers(text);
    for (const spec of specs) {
      // skip non-module refs
      if (!spec || spec.startsWith('http')) continue;

      // Handle simple import.meta.glob expansions
      if (spec.startsWith('__GLOB__')) {
        const pat = spec.slice('__GLOB__'.length);
        const matcher = globToMatcher(pat.replace(/^\.\//, ''));
        for (const f of allSrcFilesSet) {
          const rel = path.relative(SRC_DIR, f).replace(/\\/g, '/');
          if (matcher.test(rel)) queue.push(f);
        }
        continue;
      }

      const resolved = resolveModule(spec, file);
      if (!resolved) continue;
      // ignore libs and node_modules
      if (resolved.includes('node_modules')) continue;
      if (!isUnder(SRC_DIR, resolved)) continue;
      queue.push(resolved);
    }
  }

  return reachable;
}

function summarizeSnippet(snippet) {
  const s = snippet.trim();
  if (!s) return 'EMPTY';
  const lines = s.split(/\r?\n/).map((l) => l.trim());

  const hasTodo = lines.some((l) => l.includes('TODO'));
  const hasReact = lines.some((l) => l.includes('react') || l.includes('jsx'));
  const exportsOnly = lines.filter(Boolean).every((l) => l.startsWith('export ') || l.startsWith('import ') || l.startsWith('type ') || l.startsWith('interface '));

  const hasMath = /\b(fft|fourier|kalman|eigen|matrix|integral|derivative|turbine|penstock|cavitation|efficien|governor|surge|water hammer|eccentricity|hoop stress)\b/i.test(s);
  const hasUI = /\b(div|className|tailwind|<svg|framer-motion|lucide-react)\b/i.test(s);

  if (s.length < 40) return 'VERY_SMALL';
  if (hasTodo && s.length < 400) return 'BOILERPLATE_TODO';
  if (exportsOnly && s.length < 600) return 'TYPES_ONLY_OR_THIN_WRAPPER';
  if (hasMath && !hasUI) return 'ENGINEERING_LOGIC';
  if (hasUI && !hasMath) return 'UI_COMPONENT';
  if (hasUI && hasMath) return 'UI_PLUS_ENGINEERING';
  if (hasReact) return 'REACT_MISC';
  return 'MISC';
}

async function readFirstLines(filePath, maxLines = 40) {
  const txt = await fs.readFile(filePath, 'utf8');
  const lines = txt.split(/\r?\n/).slice(0, maxLines);
  return lines.join('\n');
}

async function main() {
  const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
  const { options: tsOptions } = loadTsConfig(tsconfigPath);

  const all = (await walk(SRC_DIR))
    .filter((f) => /\.(ts|tsx)$/.test(f))
    .filter((f) => !/\.d\.ts$/.test(f))
    .map((f) => path.normalize(f));

  const allSet = new Set(all);

  const candidateEntrypoints = [
    path.join(SRC_DIR, 'main.tsx'),
    path.join(SRC_DIR, 'main.ts'),
    path.join(SRC_DIR, 'index.tsx'),
    path.join(SRC_DIR, 'index.ts'),
  ];
  const entrypointsAbs = [];
  for (const ep of candidateEntrypoints) {
    if (await fileExists(ep)) entrypointsAbs.push(ep);
  }
  if (entrypointsAbs.length === 0) {
    throw new Error('No entrypoints found (expected src/main.tsx or similar).');
  }

  const reachable = await computeReachableFiles({ entrypointsAbs, allSrcFilesSet: allSet, tsOptions });

  const orphans = [];

  for (const f of all) {
    if (reachable.has(f)) continue;
    const st = await fs.stat(f);
    const snippet = await readFirstLines(f, 40).catch(() => '');
    orphans.push({
      file: path.relative(projectRoot, f).replace(/\\/g, '/'),
      size: st.size,
      mtimeMs: st.mtimeMs,
      mtimeIso: new Date(st.mtimeMs).toISOString(),
      summaryTag: summarizeSnippet(snippet),
      firstLines: snippet.split(/\r?\n/).slice(0, 10).join('\n'),
    });
  }

  orphans.sort((a, b) => b.size - a.size);

  const report = {
    generatedAt: new Date().toISOString(),
    srcDir: 'src',
    totalTsTsxOnDisk: all.length,
    entrypoints: entrypointsAbs.map((p) => path.relative(projectRoot, p).replace(/\\/g, '/')),
    totalReachableFromEntrypoints: reachable.size,
    orphanCount: orphans.length,
    orphans,
  };

  const outPath = path.join(projectRoot, 'orphan-report.route-aware.json');
  await fs.writeFile(outPath, JSON.stringify(report, null, 2), 'utf8');
  process.stdout.write(JSON.stringify({ orphanCount: report.orphanCount, outPath: 'orphan-report.route-aware.json' }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
