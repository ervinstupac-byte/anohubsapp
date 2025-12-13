#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const lcovPath = path.resolve(process.cwd(), 'coverage', 'lcov.info');
const baselinePathDefault = path.resolve(process.cwd(), 'coverage', 'coverage-baseline.json');

if (!fs.existsSync(lcovPath)) {
  console.error('coverage/lcov.info not found. Run tests with coverage first.');
  process.exit(1);
}

function parseLcov(content) {
  const lines = content.split('\n');
  let totals = { LF: 0, LH: 0, BRF: 0, BRH: 0, FNF: 0, FNH: 0 };

  for (const line of lines) {
    if (line.startsWith('LF:')) totals.LF += parseInt(line.slice(3), 10) || 0;
    if (line.startsWith('LH:')) totals.LH += parseInt(line.slice(3), 10) || 0;
    if (line.startsWith('BRF:')) totals.BRF += parseInt(line.slice(4), 10) || 0;
    if (line.startsWith('BRH:')) totals.BRH += parseInt(line.slice(4), 10) || 0;
    if (line.startsWith('FNF:')) totals.FNF += parseInt(line.slice(4), 10) || 0;
    if (line.startsWith('FNH:')) totals.FNH += parseInt(line.slice(4), 10) || 0;
  }
  return totals;
}

function percentages(totals) {
  const pct = (num, den) => (den === 0 ? 100 : (num / den) * 100);
  return {
    statements: pct(totals.LH, totals.LF),
    branches: pct(totals.BRH, totals.BRF),
    functions: pct(totals.FNH, totals.FNF),
    lines: pct(totals.LH, totals.LF),
  };
}

const lcov = fs.readFileSync(lcovPath, 'utf8');
const totals = parseLcov(lcov);
const current = percentages(totals);

const updateBaseline = process.argv.includes('--update-baseline');
let baselineJsonArgIndex = process.argv.indexOf('--baseline-json');
let baselineJsonPath = baselineJsonArgIndex === -1 ? null : process.argv[baselineJsonArgIndex + 1];
baselineJsonPath = baselineJsonPath ? path.resolve(process.cwd(), baselineJsonPath) : null;
const baselinePath = baselineJsonPath || baselinePathDefault;

if (!fs.existsSync(baselinePath)) {
  if (updateBaseline) {
    fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
    fs.writeFileSync(baselinePath, JSON.stringify(current, null, 2));
    console.log('Baseline created at coverage/coverage-baseline.json');
    process.exit(0);
  }
  console.error('Baseline file not found. Run with --update-baseline to create baseline from current coverage.');
  process.exit(1);
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));

const metrics = ['statements', 'branches', 'functions', 'lines'];
const failures = [];
for (const m of metrics) {
  const cur = Math.floor(current[m]);
  const base = Math.floor(baseline[m] || 0);
  if (cur < base) {
    failures.push({ metric: m, current: cur, baseline: base });
  }
}

if (failures.length > 0) {
  console.error('Coverage check failed. The following metrics decreased:');
  for (const f of failures) {
    console.error(` - ${f.metric}: current=${f.current} < baseline=${f.baseline}`);
  }
  process.exit(2);
}

console.log('Coverage check passed.');
console.log('Current coverage summary:', {
  statements: Math.floor(current.statements),
  branches: Math.floor(current.branches),
  functions: Math.floor(current.functions),
  lines: Math.floor(current.lines),
});
process.exit(0);
