const fs = require('fs');
const path = require('path');

const manifest = require('./hashes_applied.json');

function normalizeManifestPath(raw) {
  const forward = raw.replace(/\\+/g, '/');
  const withoutPublic = forward.replace(/^public\//i, '');
  // normalize to lowercase to match public/archive folder layout on disk
  return withoutPublic.replace(/^archive\//i, '').toLowerCase();
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
  const nums = s.match(/\b\d+(?:\.\d+)?\b/g) || [];
  for (const n of nums) {
    const v = parseFloat(n);
    if (!isNaN(v)) {
      if (v > 100) score += 0.5;
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
const errors = [];

for (const entry of manifest) {
  const rel = normalizeManifestPath(entry.file);
  const filePath = path.join(__dirname, '..', 'public', 'archive', rel);
  let html = null;
  try {
    html = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    // Log and continue with a placeholder entry so every manifest row is represented
    errors.push({ file: entry.file, reason: String(e) });
    const title = path.basename(rel) || entry.file;
    const stat = (() => { try { return fs.statSync(filePath); } catch (e2) { return null; } })();
    const date = stat ? stat.mtime.toISOString() : new Date().toISOString();
    results.push({
      path: `/archive/${rel.replace(/^\/+/, '')}`,
      rel,
      title,
      date,
      hash: entry.hash,
      topic: inferTopic(rel),
      currentAnalysis: null,
      operationalRecommendation: '[MISSING: FILE_READ_ERROR]',
      score: 0,
      maintenanceDueDays: null,
      classification: 'NOMINAL'
    });
    continue;
  }

  const currentAnalysis = extractSection(html, ['Current Analysis', 'Analysis']);
  let operationalRecommendation = extractSection(html, ['Operational Recommendation', 'Recommendation', 'Operational Recommendations']);

  // Ensure every entry has a title and a date. Try <title> or <time>, fallback to fs.mtime
  let title = null;
  const mtitle = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (mtitle && mtitle[1]) title = mtitle[1].trim();
  if (!title) title = path.basename(rel) || rel;

  let date = null;
  const mtimeTag = html.match(/<time[^>]*>([^<]+)<\/time>/i) || html.match(/<meta[^>]*name=["']?date["']?[^>]*content=["']([^"']+)["'][^>]*>/i);
  if (mtimeTag && mtimeTag[1]) date = new Date(mtimeTag[1]).toISOString();
  if (!date) {
    try { date = fs.statSync(filePath).mtime.toISOString(); } catch (e) { date = new Date().toISOString(); }
  }

  if (!operationalRecommendation) {
    // Log missing recommendation but continue; provide placeholder
    errors.push({ file: rel, reason: 'Missing operational recommendation' });
    operationalRecommendation = '[MISSING: OPERATIONAL_RECOMMENDATION]';
  }

  const score = scoreText((currentAnalysis || '') + ' ' + (operationalRecommendation || ''));
  const due = parseDueDays((currentAnalysis || '') + ' ' + (operationalRecommendation || ''));
  const topic = inferTopic(rel);

  results.push({
    path: `/archive/${rel.replace(/^\/+/, '')}`,
    rel,
    title,
    date,
    hash: entry.hash,
    topic,
    currentAnalysis,
    operationalRecommendation,
    score,
    maintenanceDueDays: due
  });
}

const scores = results.map(r => r.score);
const baseline = scores.length ? (scores.reduce((a,b)=>a+b,0)/scores.length) : 0;

for (const r of results) {
  if (baseline <= 0) r.classification = 'NOMINAL';
  else if (r.score > baseline * 2.5) r.classification = 'CRITICAL';
  else if (r.score > baseline * 1.5) r.classification = 'WARNING';
  else r.classification = 'NOMINAL';
}

const avgScore = baseline;
const normalized = Math.min(1, avgScore / 10);
const H_g = Math.round(Math.max(0, 100 - normalized * 100));

const alerts = results
  .filter(r => r.classification !== 'NOMINAL' || (r.maintenanceDueDays !== null && r.maintenanceDueDays <= 2))
  .sort((a,b) => {
    const aDue = a.maintenanceDueDays === null ? 9999 : a.maintenanceDueDays;
    const bDue = b.maintenanceDueDays === null ? 9999 : b.maintenanceDueDays;
    if (aDue !== bDue) return aDue - bDue;
    return b.score - a.score;
  })
  .slice(0,5);

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
if (errors.length) {
  fs.writeFileSync(path.join(outDir, 'nc102_intelligence_errors.json'), JSON.stringify({ generatedAt: new Date().toISOString(), errors }, null, 2), 'utf8');
  console.warn('NC-10.2 Intelligence generator logged', errors.length, 'issues ->', path.join(outDir, 'nc102_intelligence_errors.json'));
}

console.log('NC-10.2 Intelligence report generated:', path.join(outDir, 'nc102_intelligence.json'));
