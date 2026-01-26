import { SovereignMemory } from './SovereignMemory';

export type BoundaryAssessment = {
  score: number; // 0-100 confidence
  reasons: string[];
  warning?: string;
};

export default class SystemBoundaryAnalyzer {
  private memory: SovereignMemory;

  constructor() {
    this.memory = new SovereignMemory();
  }

  // Assess if a diagnosis is within reliable bounds
  assessConfidence(diagnosis: any): BoundaryAssessment {
    const reasons: string[] = [];
    let score = 100;

    // 1. If diagnosis relies on a single sensor reading, penalize heavily
    const sources = (diagnosis && diagnosis.entries) ? diagnosis.entries.length : (diagnosis && diagnosis.automatedActions ? diagnosis.automatedActions.length : 0);
    if (sources <= 1) {
      reasons.push('Diagnosis based on single source/sensor without cross-correlation');
      score -= 50;
    }

    // 2. If any entry contains 'confidence' fields under 0.5, penalize
    try {
      const lowConfidence = (JSON.stringify(diagnosis).match(/confidence\W*[:=]\W*0\.[0-4]/gi) || []).length;
      if (lowConfidence > 0) {
        reasons.push('Low statistical confidence detected in one or more findings');
        score -= 20 * lowConfidence;
      }
    } catch (e) { /* ignore */ }

    // 3. If sentinel flagged anomalies (sensorAnomaly true) but action is HARD_TRIP, reduce confidence
    if (JSON.stringify(diagnosis).toLowerCase().includes('sensor anomaly')) {
      reasons.push('Sensor integrity warnings present; data may be unreliable');
      score -= 20;
    }

    // 4. Enforce bounds
    score = Math.max(0, Math.min(100, score));

    const warning = score < 40 ? 'I am guessing here. My logic is reaching its boundary due to: ' + reasons.join('; ') + '. Manual inspection is MANDATORY.' : undefined;

    return { score, reasons, warning };
  }

  // Convenience: attach assessment into a wisdom report
  annotateReportWithConfidence(report: any) {
    const assessment = this.assessConfidence(report);
    report.systemConfidence = assessment;
    // persist a note in memory for audit
    this.memory.saveOverrideRecord({ type: 'CONFIDENCE_ASSESSMENT', timestamp: Date.now(), score: assessment.score, reasons: assessment.reasons });
    return report;
  }
}
