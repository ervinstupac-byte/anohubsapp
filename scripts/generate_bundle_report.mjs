#!/usr/bin/env node
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Checking for existing dist/assets...');
const dist = path.resolve(process.cwd(), 'dist', 'assets');
if (!fs.existsSync(dist)) {
    console.log('dist/assets not present — running production build now...');
    const build = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build', '--silent'], { stdio: 'inherit' });
    if (build.status !== 0) {
        console.error('Build failed, aborting report.');
        process.exit(build.status ?? 1);
    }
} else {
    console.log('dist/assets already exists; skipping rebuild.');
}

// resolve again after potential build
if (!fs.existsSync(dist)) {
    console.error('dist/assets not found — run build first');
    process.exit(1);
}
if (!fs.existsSync(dist)) {
    console.error('dist/assets not found — run build first');
    process.exit(1);
}

const files = fs.readdirSync(dist).map(f => {
    const p = path.join(dist, f);
    const stat = fs.statSync(p);
    return { file: f, size: stat.size };
}).sort((a,b) => b.size - a.size);

const report = { generated_at: new Date().toISOString(), assets: files };
fs.writeFileSync(path.resolve(process.cwd(), 'dist', 'stats.json'), JSON.stringify(report, null, 2));
console.log('Wrote dist/stats.json with', files.length, 'assets.');

const threshold = 50 * 1024; // 50KB
const large = files.filter(f => f.size > threshold).map(f => ({ file: f.file, size_kb: +(f.size/1024).toFixed(2) }));
console.log('Assets larger than 50KB:');
large.slice(0, 200).forEach(l => console.log('-', l.file, `${l.size_kb} KB`));
console.log('Report complete.');
