#!/usr/bin/env node
import { spawn } from 'child_process';
console.log('Running stress test via npx tsx (this may install tsx transiently)');
const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const env = Object.assign({}, process.env, { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' });
const child = spawn(cmd + ' tsx scripts/stress_test_integrity.ts', { stdio: 'inherit', shell: true, env });
child.on('exit', (code) => process.exit(code ?? 0));
