const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

if (!fs.existsSync(dist)) {
  console.error('dist directory not found. Run npm run build first.');
  process.exit(1);
}

let originUrl = null;
try {
  originUrl = execSync('git config --get remote.origin.url', { cwd: root }).toString().trim();
} catch (e) {
  console.error('Could not read origin remote URL from parent repo');
  process.exit(2);
}

console.log('Using origin remote:', originUrl);

try {
  const gitDir = path.join(dist, '.git');
  if (fs.existsSync(gitDir)) {
    run(`rmdir /s /q "${gitDir}"`);
  }

  run('git init', { cwd: dist });
  run('git checkout -b gh-pages', { cwd: dist });
  run(`git remote add origin "${originUrl}"`, { cwd: dist });
  run('git add -A', { cwd: dist });
  try { run('git commit -m "chore(deploy): manual gh-pages deploy"', { cwd: dist }); } catch (e) { console.log('No changes to commit or commit failed, continuing'); }
  run('git push -f origin gh-pages', { cwd: dist });

  console.log('Manual deploy completed: pushed dist/ to origin gh-pages');
} catch (err) {
  console.error('Manual deploy failed:', err.message || err);
  process.exit(3);
}
