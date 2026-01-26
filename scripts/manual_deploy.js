const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Manual deploy script: initialize a temporary git repo in dist and push to gh-pages
// Usage: node scripts/manual_deploy.js

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

if (!fs.existsSync(dist)) {
  console.error('dist directory not found. Run npm run build first.');
  process.exit(1);
}

// Detect origin remote from parent repo
let originUrl = null;
try {
  originUrl = execSync('git config --get remote.origin.url', { cwd: root }).toString().trim();
} catch (e) {
  console.error('Could not read origin remote URL from parent repo');
  process.exit(2);
}

console.log('Using origin remote:', originUrl);

try {
  // Ensure clean temporary repo
  // Remove any existing .git in dist
  const gitDir = path.join(dist, '.git');
  if (fs.existsSync(gitDir)) {
    run(`rm -rf "${gitDir}"`);
  }

  // Init repo and push
  run('git init', { cwd: dist });
  run('git checkout -b gh-pages', { cwd: dist });
  run(`git remote add origin "${originUrl}"`, { cwd: dist });
  run('git add -A', { cwd: dist });
  run('git commit -m "chore(deploy): manual gh-pages deploy" || true', { cwd: dist });
  // Force push to gh-pages
  run('git push -f origin gh-pages', { cwd: dist });

  console.log('Manual deploy completed: pushed dist/ to origin gh-pages');
} catch (err) {
  console.error('Manual deploy failed:', err.message || err);
  process.exit(3);
}
