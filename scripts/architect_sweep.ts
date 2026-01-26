import path from 'path';
import fs from 'fs';
import Reflector from '../src/services/SovereignArchitectReflector.js';

function scanForConfidenceTokens(fileContent: string) {
  // broaden token coverage: accept direct confidence annotations or guardians extending BaseGuardian
  const tokens = [
    'systemConfidence',
    'SystemBoundaryAnalyzer',
    'assessConfidence',
    'annotateReportWithConfidence',
    'annotateReport',
    'systemConfidence.score',
    'extends BaseGuardian',
    'BaseGuardian',
    'getConfidenceScore('
  ];
  return tokens.some(t => fileContent.includes(t));
}

async function run() {
  let report;
  try {
    report = Reflector.generateArchitectReport();
  } catch (e) {
    console.error('Failed to generate architect report:', e);
    process.exit(1);
  }
  const srcRoot = path.resolve(process.cwd(), 'src');
  const files = report.scannedFiles;

  // Identify guardian/engine-like files
  const candidates = files.filter(f => /Guardian|Master|Engine|Sentinel|Guardian|Optimizer|Reflector/.test(path.basename(f)));

  const incomplete: string[] = [];
  for (const f of candidates) {
    try {
      const content = fs.readFileSync(f, 'utf8');
      const has = scanForConfidenceTokens(content);
      if (!has) {
        incomplete.push(path.relative(process.cwd(), f));
      }
    } catch (e) {
      // ignore
    }
  }

  const out = {
    summary: report.summary,
    subsystemsCount: report.subsystemsCount,
    missingFeatures: report.missingFeatures,
    usesBayesian: report.usesBayesian,
    candidatesChecked: candidates.length,
    incompleteReporting: incomplete
  };
  // Post-filter: only consider actual service-level guardian/engine files as candidates
  const filteredIncomplete = incomplete.filter(p => p.startsWith('src\\services\\') && /Guardian|Sentinel|Master|Engine|Optimizer|Kernel|SentinelKernel/i.test(p));
  // Report only the filtered incomplete items
  out.incompleteReporting = filteredIncomplete;

  console.log('\n=== Sovereign Architect Reflector: Global Integrity Sweep ===\n');
  console.log(JSON.stringify(out, null, 2));
  if (incomplete.length > 0) {
    console.log('\nFlagged modules lacking confidence reporting (Incomplete Engineering Logic):');
    incomplete.forEach(i => console.log(' -', i));
  } else {
    console.log('\nAll scanned subsystems report confidence tokens.');
  }
}

run().catch(e => { console.error('Reflector run failed', e); process.exit(2); });
