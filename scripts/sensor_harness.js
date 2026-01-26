const fs = require('fs');

// Re-implement MasterIntelligenceEngine.calculateRUL locally
function calculateRUL(vibration, oilParticles) {
  const BASE_LIFE = 20000; // hours
  const vibFactor = Math.pow(vibration / 1.5, 2);
  const oilFactor = oilParticles / 100;
  const totalDegradation = (vibFactor * 1.5) + (oilFactor * 2.5);
  const rul = BASE_LIFE / Math.max(1, totalDegradation);
  return Math.floor(rul);
}

function classifyCavitation(cavitationLevel) {
  if (cavitationLevel < 3) return 'NOMINAL';
  if (cavitationLevel < 7) return 'WARNING';
  return 'CRITICAL';
}

const scenarios = {
  normal: [
    { ts: 0, cavitationLevel: 1.2, surgePressure: 1.0, vibration: 1.5, oilParticles: 20 },
    { ts: 60, cavitationLevel: 1.3, surgePressure: 1.1, vibration: 1.6, oilParticles: 22 },
    { ts: 120, cavitationLevel: 1.1, surgePressure: 1.0, vibration: 1.4, oilParticles: 21 }
  ],
  critical: [
    { ts: 0, cavitationLevel: 8.2, surgePressure: 25.0, vibration: 8.5, oilParticles: 600 },
    { ts: 30, cavitationLevel: 9.0, surgePressure: 28.0, vibration: 9.1, oilParticles: 650 },
    { ts: 60, cavitationLevel: 9.5, surgePressure: 30.2, vibration: 10.2, oilParticles: 700 }
  ]
};

function runScenario(name, seq) {
  console.log(`\nRunning scenario: ${name.toUpperCase()}`);
  const outputs = [];
  seq.forEach((s, i) => {
    const rul = calculateRUL(s.vibration, s.oilParticles);
    const cavClass = classifyCavitation(s.cavitationLevel);
    const severity = (cavClass === 'CRITICAL' || s.vibration > 7.1 || s.oilParticles > 500) ? 'CRITICAL' : (cavClass === 'WARNING' ? 'WARNING' : 'NORMAL');

    const entry = {
      step: i + 1,
      timestamp_offset_s: s.ts,
      cavitationLevel: s.cavitationLevel,
      surgePressure: s.surgePressure,
      vibration: s.vibration,
      oilParticles: s.oilParticles,
      cavitationClass: cavClass,
      severity,
      rul_hours: rul
    };

    outputs.push(entry);
    console.log(` step ${entry.step}: cav=${entry.cavitationLevel} surge=${entry.surgePressure} vib=${entry.vibration} oilPPM=${entry.oilParticles} => severity=${entry.severity} rul=${entry.rul_hours}h`);
  });

  // Persist scenario result
  const outPath = `./artifacts/harness_${name}.json`;
  try {
    fs.mkdirSync('./artifacts', { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(outputs, null, 2), 'utf8');
    console.log(`Saved results to ${outPath}`);
  } catch (e) {
    console.error('Failed to write artifact', e);
  }

  return outputs;
}

function main() {
  const normal = runScenario('normal', scenarios.normal);
  const critical = runScenario('critical', scenarios.critical);

  // Simple summary
  const summary = {
    normal_last: normal[normal.length - 1],
    critical_last: critical[critical.length - 1]
  };
  fs.writeFileSync('./artifacts/harness_summary.json', JSON.stringify(summary, null, 2));
  console.log('\nSummary written to ./artifacts/harness_summary.json');
}

if (require.main === module) main();
