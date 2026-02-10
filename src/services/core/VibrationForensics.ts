// Vibration Forensics Service
// NC-3300: The NoisyRunner Recovery

import { VibrationPattern, VibrationPatternConfig, HistoricalVibrationCases } from '../../knowledge/VibrationPatterns';

export interface VibrationForensicResult {
  timestamp: number;
  rpm: number;
  vibration: number;
  frequency: number;
  pattern: string;
  severity: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  recommendations: string[];
}

type PatternConfig = {
  id: string;
  severity: 'WARNING' | 'CRITICAL';
  recommendations: readonly string[];
  matches: (rpm: number, vibration: number, frequency: number) => boolean;
};

type HistoricalCase = {
  severity: 'WARNING' | 'CRITICAL';
  recommendations: readonly string[];
  matches: (rpm: number, vibration: number, frequency: number) => boolean;
};

export class VibrationForensics {
  private patterns: PatternConfig[] = [];
  private historicalCases: HistoricalCase[] = [];

  constructor() {
    this.patterns = Object.entries(VibrationPatternConfig).map(([id, cfg]) => ({
      id,
      severity: cfg.severity,
      recommendations: cfg.recommendations,
      matches: cfg.matches
    }));

    this.historicalCases = Object.values(HistoricalVibrationCases);
  }

  analyzeVibration(timestamp: number, rpm: number, vibration: number, frequency: number): VibrationForensicResult {
    let matchedPattern = VibrationPattern.UNKNOWN;
    let severity: VibrationForensicResult['severity'] = 'NOMINAL';
    const recommendations: string[] = [];

    const is2014Cavitation = Math.abs(frequency - 120) <= 3 || Math.abs(frequency - 240) <= 3;
    if (is2014Cavitation && vibration >= 5.5) {
      const ancestral = (HistoricalVibrationCases as any).CAVITATION_2014;
      matchedPattern = ancestral?.name ?? '2014 Cavitation';
      severity = 'CRITICAL';
      recommendations.push(...(ancestral?.recommendations ?? [
        'Reduce load and avoid resonance band',
        'Inspect runner blades for pitting/erosion',
        'Review draft tube pressure and NPSH margin',
        'Trend vibration spectrum at 120Hz/240Hz'
      ]));
      return { timestamp, rpm, vibration, frequency, pattern: matchedPattern, severity, recommendations };
    }

    // Check against known patterns
    for (const pattern of this.patterns) {
      if (pattern.matches(rpm, vibration, frequency)) {
        matchedPattern = (VibrationPattern as any)[pattern.id] ?? pattern.id;
        severity = pattern.severity;
        recommendations.push(...pattern.recommendations);
        break;
      }
    }

    // Check against historical cases
    for (const historicalCase of this.historicalCases) {
      if (historicalCase.matches(rpm, vibration, frequency)) {
        matchedPattern = (historicalCase as any).name ?? VibrationPattern.HISTORICAL_FAILURE;
        severity = historicalCase.severity;
        recommendations.push(...historicalCase.recommendations);
        break;
      }
    }

    return {
      timestamp,
      rpm,
      vibration,
      frequency,
      pattern: matchedPattern,
      severity,
      recommendations
    };
  }

  generateReport(results: VibrationForensicResult[]): string {
    let report = '# Vibration Forensics Report\n\n';
    
    for (const result of results) {
      report += `## Case ${result.timestamp}\n`;
      report += `RPM: ${result.rpm}\n`;
      report += `Vibration: ${result.vibration}\n`;
      report += `Frequency: ${result.frequency}\n`;
      report += `Pattern: ${result.pattern}\n`;
      report += `Severity: ${result.severity}\n`;
      report += `Recommendations:\n`;
      
      for (const rec of result.recommendations) {
        report += `- ${rec}\n`;
      }
      report += '\n';
    }
    
    return report;
  }
}
