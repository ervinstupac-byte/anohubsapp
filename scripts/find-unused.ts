import path from 'path';
import fs from 'fs';

const srcDir = path.resolve(process.cwd(), 'src');

function getAllTsTsxFiles(dir: string, files: string[] = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name === '__tests__' || item.name === 'node_modules') continue;
      getAllTsTsxFiles(fullPath, files);
    } else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

const allFiles = getAllTsTsxFiles(srcDir);
const filePaths = new Set(allFiles.map(f => f));
const importedFiles = new Set<string>();

function extractImports(content: string, filePath: string) {
  const imports: string[] = [];
  const importRegex = /import\s+(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
  const lazyRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  while ((match = lazyRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

function resolveImportPath(importPath: string, fromFile: string): string | null {
  if (importPath.startsWith('.')) {
    let fullPath = path.resolve(path.dirname(fromFile), importPath);
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    for (const ext of extensions) {
      if (fs.existsSync(fullPath + ext)) {
        return path.resolve(fullPath + ext);
      }
    }
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      for (const ext of extensions) {
        const indexPath = path.join(fullPath, `index${ext}`);
        if (fs.existsSync(indexPath)) {
          return path.resolve(indexPath);
        }
      }
    }
    return fullPath; // Return even if doesn't exist for debugging
  }
  return null;
}

// First, mark entry points (never unused)
const entryPoints = new Set<string>([
  path.resolve(srcDir, 'main.tsx'),
  path.resolve(srcDir, 'App.tsx'),
  path.resolve(srcDir, 'vite-env.d.ts'),
  path.resolve(srcDir, 'setupTests.ts'),
]);

// Add all route files
const routeFiles = [
  path.resolve(srcDir, 'routes/FrancisRouter.tsx'),
  path.resolve(srcDir, 'routes/MaintenanceRouter.tsx'),
];
routeFiles.forEach(f => entryPoints.add(f));

for (const file of allFiles) {
  entryPoints.add(file); // Mark all as entry first, then subtract later
  try {
    const content = fs.readFileSync(file, 'utf8');
    const imports = extractImports(content, file);
    for (const imp of imports) {
      const resolved = resolveImportPath(imp, file);
      if (resolved && fs.existsSync(resolved)) {
        importedFiles.add(resolved);
      }
    }
  } catch (e) {
    console.error(`Error reading file ${file}:`, e);
  }
}

// Now, unused files are files that are not imported and not entry points
const unusedFiles: string[] = [];
for (const file of allFiles) {
  if (!importedFiles.has(file) && !entryPoints.has(file)) {
    // Wait, we need to adjust entry points to actually only include real ones!
    // Let's re-set entry points correctly.
  }
}

// Okay, let's reset and do it properly:
const properEntryPoints = new Set<string>([
    path.resolve(srcDir, 'main.tsx'),
    path.resolve(srcDir, 'App.tsx'),
    path.resolve(srcDir, 'vite-env.d.ts'),
    path.resolve(srcDir, 'setupTests.ts'),
    path.resolve(srcDir, 'routes/FrancisRouter.tsx'),
    path.resolve(srcDir, 'routes/MaintenanceRouter.tsx'),
    path.resolve(srcDir, 'routes/PeltonRouter.tsx'),
]);

// Now, let's collect all files reachable from entry points via imports
const reachableFiles = new Set<string>();
const queue: string[] = Array.from(properEntryPoints).filter(f => fs.existsSync(f));
const visited = new Set<string>();

while (queue.length > 0) {
  const currentFile = queue.shift()!;
  if (visited.has(currentFile)) continue;
  visited.add(currentFile);
  reachableFiles.add(currentFile);
  try {
    const content = fs.readFileSync(currentFile, 'utf8');
    const imports = extractImports(content, currentFile);
    for (const imp of imports) {
      const resolved = resolveImportPath(imp, currentFile);
      if (resolved && fs.existsSync(resolved) && !visited.has(resolved)) {
        queue.push(resolved);
      }
    }
  } catch (e) {
    console.error(`Error processing file ${currentFile}:`, e);
  }
}

const unusedFilesProper = allFiles.filter(f => !reachableFiles.has(f));
const relativeUnused = unusedFilesProper.map(f => path.relative(process.cwd(), f));

const outputPath = path.resolve(process.cwd(), 'unused-files.json');
fs.writeFileSync(outputPath, JSON.stringify(relativeUnused, null, 2));

console.log('Unused files (not reachable from entry points):');
console.log(JSON.stringify(relativeUnused, null, 2));
console.log('\nCount of unused files:', relativeUnused.length);
console.log('\nResults saved to:', outputPath);
