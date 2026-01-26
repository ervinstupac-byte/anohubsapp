#!/usr/bin/env node
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const targets = [
    path.join(projectRoot, 'public', 'assets', 'schematics', 'francis-h5', 'main-hall.svg'),
    path.join(projectRoot, 'public', 'assets', 'schematics', 'francis-h5', 'geno_fr_h_manje_od_5.svg'),
];

const heavyDir = path.join(projectRoot, 'public', 'assets', 'heavy');
if (!fs.existsSync(heavyDir)) fs.mkdirSync(heavyDir, { recursive: true });

targets.forEach((filePath) => {
    if (!fs.existsSync(filePath)) {
        console.log('SVG not found, skipping:', filePath);
        return;
    }

    const baseName = path.basename(filePath);
    console.log('Optimizing', baseName);

    // run svgo via npx
    const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const res = spawnSync(cmd, ['svgo', filePath, '-o', filePath, '--multipass'], { stdio: 'inherit' });
    if (res.status !== 0) {
        console.warn('svgo failed for', baseName);
    }

    const stats = fs.statSync(filePath);
    const sizeKb = stats.size / 1024;
    console.log(baseName, 'size after svgo:', sizeKb.toFixed(2), 'KB');

    if (stats.size > 200 * 1024) {
        const dest = path.join(heavyDir, baseName);
        console.log('File still large — moving to public/assets/heavy:', baseName);
        fs.copyFileSync(filePath, dest);
        // leave original in place for compatibility but the app will be updated to use heavy path
    }
});

console.log('SVG optimization complete. If files were moved to public/assets/heavy, update references to /assets/heavy/<file>.svg for lazy loading.');
