import SensorIntegritySentinel, { IntegrityResult } from './SensorIntegritySentinel';
import GridStabilityGuardian, { InertiaAction, VCurveOutput } from './GridStabilityGuardian';
import ExpertFeedbackLoop from './ExpertFeedbackLoop';
import { SovereignMemory } from './SovereignMemory';
import Architect from './SovereignArchitectReflector';

export type GuardianFinding = {
  source: string; // e.g., 'ThrustBearingMaster', 'ShaftSealGuardian', 'GeneratorAirGapSentinel', 'TransformerOilGuardian', 'GridStabilityGuardian'
  action: string; // e.g., 'SOVEREIGN_TRIP', 'CRITICAL_FAULT', 'VARNISH_RISK_ALERT', 'KineticKick'
  details?: string;
  metrics?: Record<string, any>;
};

export type WisdomEntry = {
  title: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  mechanicalExplanation: string; // short reason in engineering terms
  legacyTip: string; // actionable principle derived from hydro practice
  recommendedAction?: string; // concise next-step for operator
  contextualNote?: string; // references to overrides or memories
};

export type WisdomReport = {
  generatedAt: string;
  assetId?: number | string;
  entries: WisdomEntry[];
  executiveSummary: string; // short paragraph for the King
  architectSummary?: string; // from SovereignArchitectReflector
};

export default class SovereignExpertTranslator {
  private feedback: ExpertFeedbackLoop;
  private memory: SovereignMemory;

  constructor() {
    this.feedback = new ExpertFeedbackLoop();
    this.memory = new SovereignMemory();
  }

  private severityFromAction(action: string): WisdomEntry['severity'] {
    if (/CRIT|HARD_TRIP|CRITICAL|FAILSAFE|SOVEREIGN_TRIP/i.test(action)) return 'CRITICAL';
    if (/WARN|DEGRADE|DEGRADED|WARNING|RISK|ANOMALY|SET_THROTTLED_SAFE/i.test(action)) return 'WARNING';
    return 'INFO';
  }

  private explainSensorIntegrity(find: GuardianFinding, integrity: IntegrityResult): WisdomEntry {
    const sev = this.severityFromAction(find.action);
    const mech = integrity.note || 'Sensor readings inconsistent with correlated channels.';
    const legacy = `Sensor physics check: abrupt ${integrity.anomalousField || 'parameter'} change violates expected system inertia (thermal/structural). Verify sensor wiring, junction box temperature drift, and transducer calibration before mechanical intervention.`;
    const rec = integrity.recommendedSafeState ? `Recommend ${integrity.recommendedSafeState.mode} at ${integrity.recommendedSafeState.throttlePct ?? 50}% and schedule sensor inspection.` : 'Recommend immediate sensor validation.';
    return {
      title: `${find.source}: Sensor Integrity Override`,
      severity: sev,
      mechanicalExplanation: `Sensor Integrity Sentinel: ${mech}`,
      legacyTip: legacy,
      recommendedAction: rec,
      contextualNote: `Sentinel confidence ${(integrity.confidence || 0) * 100}%`,
    };
  }

  private explainKineticKick(find: GuardianFinding, inertia: InertiaAction | null, vcurve: VCurveOutput | null): WisdomEntry {
    const sev = this.severityFromAction(find.action) || 'WARNING';
    const mech = inertia && inertia.triggered
      ? `Rapid frequency decay (${(inertia.dfdt||0).toFixed(3)} Hz/s) detected. Engaging rotor kinetic contribution: we temporarily convert stored rotational kinetic energy into electrical power to arrest grid frequency fall.`
      : `Reactive support requested by grid: ${vcurve?.reactiveSupportMVar ?? 0} MVar.`;

    const legacy = inertia && inertia.triggered
      ? 'Energy exchange principle: rotor kinetic energy ΔE ≈ ½·J·(ω1²−ω2²). Use short-duration over-excitation and controlled torque application; avoid prolonged over-generation to protect bearings.'
      : 'Reactive power principle: adjust excitation per V-curve to stabilize voltage; follow excitation ramping guides to avoid step-change transients.';

    const rec = inertia && inertia.triggered
      ? 'Short-duration inertia support only. Notify grid operator and monitor rotor speed/shaft stress.'
      : 'Apply excitation schedule from generator manual; prioritize grid voltage stability.';

    return {
      title: `${find.source}: Grid Stability Action`,
      severity: sev,
      mechanicalExplanation: mech,
      legacyTip: legacy,
      recommendedAction: rec,
      contextualNote: `V-curve note: ${vcurve?.note || 'N/A'}`
    };
  }

  private noteOverridesForSource(source: string): string | undefined {
    const history = this.memory.getOverrideHistory() || [];
    const relevant = history.filter(h => (h.action || '').toString().toLowerCase().includes(source.toLowerCase()));
    if (!relevant || relevant.length === 0) return undefined;
    const last = relevant[relevant.length - 1];
    const d = new Date(last.timestamp || Date.now()).toLocaleDateString();
    return `Based on your previous decision on ${d}, I have adjusted my severity assessment; continue to monitor ${source}.`;
  }

  public generateWisdomReport(assetId: number | string | undefined, guardianFindings: GuardianFinding[], architectContext?: any): WisdomReport {
    const entries: WisdomEntry[] = [];

    // Ingest architect summary if available
    let architectSummary: string | undefined = undefined;
    try {
      if (architectContext) architectSummary = (architectContext.summary || JSON.stringify(architectContext)).toString();
      else {
        const a = Architect.generateArchitectReport();
        architectSummary = a.summary;
      }
    } catch (e) {
      architectSummary = 'Architect report unavailable.';
    }

    // Process each guardian finding into WisdomEntry using reasoning rules
    for (const f of guardianFindings) {
      // Sensor integrity path
      if (/SOVEREIGN_TRIP|HARD_TRIP/i.test(f.action) && f.metrics && f.metrics.sensorSnapshot) {
        const integrity = SensorIntegritySentinel.correlate(f.metrics.sensorSnapshot, f.metrics.recentHistory || []);
        if (integrity.sensorAnomaly) {
          const e = this.explainSensorIntegrity(f, integrity);
          const overrideNote = this.noteOverridesForSource(f.source);
          if (overrideNote) e.contextualNote = `${e.contextualNote || ''} ${overrideNote}`.trim();
          entries.push(e);
          continue;
        }
      }

      // Grid stability path
      if (/GRID|KineticKick|KINETIC/i.test(f.source) || /KINETIC/i.test(f.action)) {
        const g = new GridStabilityGuardian();
        const inertia = (f.metrics && f.metrics.inertia) ? f.metrics.inertia as InertiaAction : null;
        const vcurve = (f.metrics && f.metrics.vcurve) ? f.metrics.vcurve as VCurveOutput : null;
        entries.push(this.explainKineticKick(f, inertia, vcurve));
        continue;
      }

      // Generic translator for bearing/cooling etc.
      if (/THRUST|BEARING|COOLING|OIL|VARNISH|SEAL|SHAFT/i.test(f.source) || /BEARING|COOLING|OIL|SEAL/i.test(f.action)) {
        const sev = this.severityFromAction(f.action);
        const mech = f.details || 'Automated guardian reported an anomaly.';
        const legacy = (() => {
          if (/bearing/i.test(f.source) || /THRUST/i.test(f.source)) return 'Legacy Tip: Bearings prefer slow, controlled deceleration and stable lubrication film. If temperature rises, check oil contamination and bearing clearances first.';
          if (/cooling|oil/i.test(f.source)) return 'Legacy Tip: Cooling issues typically originate from fouling or blocked heat exchange. Verify cooling pump operation, filter ΔP, and heat-exchanger cleanliness.';
          return 'Legacy Tip: Follow the plant SOP for inspection and measurement verification before mechanical intervention.';
        })();

        const overrideNote = this.noteOverridesForSource(f.source);
        entries.push({
          title: `${f.source}: ${f.action}`,
          severity: sev,
          mechanicalExplanation: mech,
          legacyTip: legacy,
          recommendedAction: f.details || 'Perform further inspection and validate sensors',
          contextualNote: overrideNote
        });
        continue;
      }

      // Fallback entry
      entries.push({
        title: `${f.source}: ${f.action}`,
        severity: this.severityFromAction(f.action),
        mechanicalExplanation: f.details || 'No detailed explanation available.',
        legacyTip: 'When in doubt, slow down and validate instrumentation.',
      });
    }

    // Executive summary construction
    const criticalCount = entries.filter(e => e.severity === 'CRITICAL').length;
    const warningCount = entries.filter(e => e.severity === 'WARNING').length;
    const executiveSummary = `Sovereign Diagnosis: ${criticalCount} critical, ${warningCount} warnings. High-level guidance: prioritize life-safety and grid stability; prefer throttled safe states where sensors are uncertain.`;

    return {
      generatedAt: new Date().toISOString(),
      assetId,
      entries,
      executiveSummary,
      architectSummary
    };
  }

  // Simulation helper: produce a sample WisdomReport for a Bearing/Cooling crisis
  public sampleBearingCoolingReport(): WisdomReport {
    const assetId = 'TURBINE-001';
    const thrustFinding: GuardianFinding = {
      source: 'ThrustBearingMaster',
      action: 'SOVEREIGN_TRIP',
      details: 'h_min below threshold; high pad temperatures observed',
      metrics: {
        sensorSnapshot: { timestamp: Date.now(), temperatureC: 120, vibrationMmS: 18, loadMw: 2.1, flowM3s: 0.5 },
        recentHistory: [
          { timestamp: Date.now() - 60000, temperatureC: 90, vibrationMmS: 17, loadMw: 2.1, flowM3s: 0.5 },
        ]
      }
    };

    const coolingFinding: GuardianFinding = {
      source: 'CoolingSystemGuardian',
      action: 'FAN_FAILURE_WARNING',
      details: 'Cooling ΔT rising, fouling suspected',
      metrics: { avgDeltaP: 0.45, foulingDetected: true }
    };

    const gridFinding: GuardianFinding = {
      source: 'GridStabilityGuardian',
      action: 'KINETIC_KICK',
      details: 'Rapid frequency drop detected by SCADA',
      metrics: { inertia: { triggered: true, dfdt: -0.35, durationSec: 6 }, vcurve: { excitationPct: 60, reactiveSupportMVar: 5, note: 'V low' } }
    };

    const report = this.generateWisdomReport(assetId, [thrustFinding, coolingFinding, gridFinding]);

    // Enhance report with an expert mentor opening paragraph
    report.executiveSummary = `Wise Counsel: ${report.executiveSummary} Detailed entries follow with mechanical explanations and legacy tips for operators.`;

    return report;
  }
}
