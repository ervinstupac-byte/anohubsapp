const fs = require('fs');
const path = require('path');

const manifest = require('./hashes_applied.json');

function normalizeManifestPath(raw) {
  const forward = raw.replace(/\\+/g, '/');
  const withoutPublic = forward.replace(/^public\//i, '');
  return withoutPublic.replace(/^archive\//i, '');
}

function extractSection(html, labels) {
  for (const label of labels) {
    const re = new RegExp(`<h[1-6][^>]*>\\s*${label}\\s*</h[1-6][^>]*>([\\s\\S]*?)(?:<h[1-6]|$)`, 'i');
    const m = html.match(re);
    if (m && m[1]) {
      return m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
  }
  return null;
}

const criticalKeywords = ['critical', 'seizure', 'shutdown', 'fail', 'failure', 'urgent', 'immediate', 'replace', 'catastrophic', 'risk of', 'risk:'];
const warningKeywords = ['warning', 'monitor', 'recommend', 'inspect', 'check', 'review', 'observe', 'elevated', 'anomaly'];

function scoreText(s) {
  if (!s) return 0;
  s = s.toLowerCase();
  let score = 0;
  for (const k of criticalKeywords) if (s.includes(k)) score += 3;
  for (const k of warningKeywords) if (s.includes(k)) score += 1.5;
  // numeric severity heuristics: find numbers like 0.06 (vibration) or percentages
  const nums = s.match(/\b\d+(?:\.\d+)?\b/g) || [];
  for (const n of nums) {
    const v = parseFloat(n);
    if (!isNaN(v)) {
      if (v > 100) score += 0.5; // large values
      if (v > 10 && v <= 100) score += 1;
      if (v > 1 && v <= 10) score += 0.5;
    }
  }
  return score;
}

function inferTopic(rel) {
  const l = rel.toLowerCase();
  if (l.includes('penstock')) return 'Penstock';
  if (l.includes('runner') || l.includes('hydraulic')) return 'Runner';
  if (l.includes('stator') || l.includes('generator') || l.includes('electrical')) return 'Stator/Generator';
  if (l.includes('bearing')) return 'Bearings';
  if (l.includes('shaft') || l.includes('coupling')) return 'Shaft/Coupling';
  return 'Other';
}

function parseDueDays(text) {
  if (!text) return null;
  text = text.toLowerCase();
  const mDays = text.match(/(within|in)\s*(\d+)\s*days?/i);
  if (mDays) return parseInt(mDays[2], 10);
  const mHours = text.match(/(within|in)\s*(\d+)\s*hours?/i);
  if (mHours) return Math.ceil(parseInt(mHours[2], 10) / 24);
  const m48 = text.match(/(within|in)\s*(48)\s*hours?/i);
  if (m48) return 2;
  return null;
}

const results = [];

for (const entry of manifest) {
  const rel = normalizeManifestPath(entry.file);
  const filePath = path.join(__dirname, '..', 'public', 'archive', rel);
  let html = null;
  try {
    html = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    // missing file -> skip
    continue;
  }

  const currentAnalysis = extractSection(html, ['Current Analysis', 'Analysis']);
  const operationalRecommendation = extractSection(html, ['Operational Recommendation', 'Recommendation', 'Operational Recommendations']);

  const score = scoreText((currentAnalysis || '') + ' ' + (operationalRecommendation || ''));
  const due = parseDueDays((currentAnalysis || '') + ' ' + (operationalRecommendation || ''));
  const topic = inferTopic(rel);

  results.push({
    path: `/archive/${rel.replace(/^\/+/, '')}`,
    rel,
    title: rel.split('/').pop() || rel,
    hash: entry.hash,
    topic,
    currentAnalysis,
    operationalRecommendation,
    score,
    maintenanceDueDays: due
  });
}

// Compute baseline and classifications
const scores = results.map(r => r.score);
const baseline = scores.length ? (scores.reduce((a,b)=>a+b,0)/scores.length) : 0;

for (const r of results) {
  if (baseline <= 0) r.classification = 'NOMINAL';
  else if (r.score > baseline * 2.5) r.classification = 'CRITICAL';
  else if (r.score > baseline * 1.5) r.classification = 'WARNING';
  else r.classification = 'NOMINAL';
}

// Global Health Index H_g: 100 - normalized average risk
const avgScore = baseline;
// normalization: assume reasonable upper avg score of ~10; clamp
const normalized = Math.min(1, avgScore / 10);
const H_g = Math.round(Math.max(0, 100 - normalized * 100));

// Priority list: sort by maintenanceDueDays (non-null) asc then by score desc
const alerts = results
  .filter(r => r.classification !== 'NOMINAL' || (r.maintenanceDueDays !== null && r.maintenanceDueDays <= 2))
  .sort((a,b) => {
    const aDue = a.maintenanceDueDays === null ? 9999 : a.maintenanceDueDays;
    const bDue = b.maintenanceDueDays === null ? 9999 : b.maintenanceDueDays;
    if (aDue !== bDue) return aDue - bDue;
    return b.score - a.score;
  })
  .slice(0,5);

// Group alerts by topic
const grouped = {};
for (const r of results.filter(x => x.classification !== 'NOMINAL')) {
  (grouped[r.topic] = grouped[r.topic] || []).push(r);
}

const report = {
  generatedAt: new Date().toISOString(),
  totalFiles: results.length,
  baselineAverageScore: baseline,
  globalHealthIndex: H_g,
  alerts,
  grouped,
  all: results
};

const outDir = path.join(__dirname, 'reports');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'nc102_intelligence.json'), JSON.stringify(report, null, 2), 'utf8');

console.log('NC-10.2 Intelligence report generated:', path.join(outDir, 'nc102_intelligence.json'));
