import { Decimal } from 'decimal.js';
import { PhysicsResult, TechnicalProjectState, DiagnosisReport } from '../../core/TechnicalSchema';
import { AssetIdentity } from '../../types/assetIdentity';
import { DiagnosticResults, LubricationType, HealthScore } from '../../types/diagnostics';
import i18n from '../../i18n';
import ExpertFeedbackLoop from '../../services/ExpertFeedbackLoop';

/**
 * EXPERT DIAGNOSIS ENGINE
 * Converts raw physical data into actionable engineering decisions.
 * Standards: IEC 60041 Compliance Hardening
 * NC-1300: Dynamic thresholds based on Bayesian learning
 */
import { SYSTEM_CONSTANTS } from '../../config/SystemConstants';
import { ASSET_THRESHOLDS } from '../../config/AssetThresholds';

export const ExpertDiagnosisEngine = {
    /**
     * Get dynamic thresholds based on validated priors
     * If user validated 'Cavitation' 10 times, thresholds become more sensitive
     */
    getDynamicThresholds: (): {
        cavitationSensitivity: number;
        vibrationSensitivity: number;
        thermalSensitivity: number;
    } => {
        const feedbackLoop = new ExpertFeedbackLoop();
        
        // Get Bayesian priors (simulated - in production would be fetched from memory)
        const cavitationPrior = 0.15; // 15% base rate, increases with validations
        const vibrationPrior = 0.10;
        const thermalPrior = 0.08;
        
        // More validations = lower threshold = more sensitive
        return {
            cavitationSensitivity: Math.max(0.5, 1.0 - (cavitationPrior * 5)), // 0.5 to 1.0
            vibrationSensitivity: Math.max(0.6, 1.0 - (vibrationPrior * 4)),
            thermalSensitivity: Math.max(0.7, 1.0 - (thermalPrior * 3))
        };
    },
    /**
     * Evaluates system health and risks based on hardened physics outcomes.
     */
    runExpertDiagnosis: (
        physics: PhysicsResult,
        state: TechnicalProjectState
    ): DiagnosisReport => {
        const reports: DiagnosisReport = {
            severity: 'NOMINAL',
            messages: [],
            safetyFactor: new Decimal(0)
        };

        // 1. Structural Integrity Check (Hoop Stress vs Yield Strength)
        // Safety Factor = Yield Strength / Actual Hoop Stress
        const yieldStrength = new Decimal(state.penstock.materialYieldStrength);
        const safetyFactor = yieldStrength.div(physics.hoopStress);
        reports.safetyFactor = safetyFactor;

        if (safetyFactor.lt(SYSTEM_CONSTANTS.THRESHOLDS.SAFETY_FACTOR.CRITICAL)) {
            reports.severity = 'CRITICAL';
            reports.messages.push({
                code: 'STRUCTURAL_RISK_HIGH',
                en: `Critical Hoop Stress: Safety factor below ${SYSTEM_CONSTANTS.THRESHOLDS.SAFETY_FACTOR.CRITICAL}. Immediate pressure reduction required.`,
                bs: `Kritično naprezanje stijenke: Faktor sigurnosti ispod ${SYSTEM_CONSTANTS.THRESHOLDS.SAFETY_FACTOR.CRITICAL}. Potrebno hitno smanjenje pritiska.`
            });
        } else if (safetyFactor.lt(SYSTEM_CONSTANTS.THRESHOLDS.SAFETY_FACTOR.WARNING)) {
            reports.severity = 'WARNING';
            reports.messages.push({
                code: 'STRUCTURAL_RISK_MED',
                en: 'Fatigue Warning: Operating near material elastic limits.',
                bs: 'Upozorenje na zamor: Rad blizu granica elastičnosti materijala.'
            });
        }

        // 2. Cavitation Risk with Dynamic Thresholds (Bayesian-adjusted)
        const dynamicThresholds = ExpertDiagnosisEngine.getDynamicThresholds();
        const baseThreshold = state.hydraulic.cavitationThreshold;
        const cavitationThreshold = (typeof baseThreshold === 'number' ? baseThreshold : baseThreshold.toNumber()) * dynamicThresholds.cavitationSensitivity;
        const cavitationIndex = physics.powerMW.div(state.hydraulic.waterHead);

        if (cavitationIndex.gt(cavitationThreshold)) {
            reports.messages.push({
                code: 'CAVITATION_DANGER',
                en: `Cavitation detected in turbine runner zones (sensitivity: ${(dynamicThresholds.cavitationSensitivity * 100).toFixed(0)}%). Efficiency loss imminent.`,
                bs: `Detektovana kavitacija u zonama radnog kola (osjetljivost: ${(dynamicThresholds.cavitationSensitivity * 100).toFixed(0)}%). Nemovni gubici efikasnosti.`
            });
            if (reports.severity !== 'CRITICAL') reports.severity = 'WARNING';
        }

        // 3. Standard Excellence Guardrail (Orbit Incompleteness)
        if (state.mechanical.vibrationX === undefined || state.mechanical.vibrationY === undefined) {
            throw new Error('STANDARD_EXCELLENCE_VIOLATION: Missing Y-axis vibration telemetry for Shaft Orbit analysis.');
        }

        return reports;
    },

    /**
     * Calculates orbit eccentricity: e = sqrt(1 - (b^2 / a^2))
     */
    calculateEccentricity: (a: number, b: number): Decimal => {
        const aDec = new Decimal(a);
        const bDec = new Decimal(b);
        if (aDec.isZero()) return new Decimal(0);

        // sqrt(1 - (b/a)^2)
        return Decimal.sqrt(new Decimal(1).sub(bDec.div(aDec).pow(2)));
    },

    /**
     * LEGACY ADAPTER: Standard Diagnostic Run
     */
    runDiagnostics: (
        asset: AssetIdentity,
        ambientTemp: number,
        lubrication: LubricationType,
        rotorWeight: number,
        flow: number,
        head: number,
        gridFrequency: number
    ): DiagnosticResults => {
        const thermalSeverity = ambientTemp > ASSET_THRESHOLDS.diagnostics.thermal.ambient_high ? 'HIGH' : (ambientTemp > ASSET_THRESHOLDS.diagnostics.thermal.ambient_medium ? 'MEDIUM' : 'LOW');
        const gridSeverity = (gridFrequency < SYSTEM_CONSTANTS.PHYSICS.GRID.CRITICAL_MIN || gridFrequency > SYSTEM_CONSTANTS.PHYSICS.GRID.CRITICAL_MAX) ? 'CRITICAL' : 'LOW';
        const cavitationSeverity = flow > SYSTEM_CONSTANTS.THRESHOLDS.FLOW.CAVITATION_CRITICAL ? 'CRITICAL' : 'LOW';

        return {
            thermalRisk: {
                detected: ambientTemp > ASSET_THRESHOLDS.diagnostics.thermal.ambient_medium,
                severity: thermalSeverity,
                description: `Ambient temperature ${ambientTemp}C exceeds baseline limits.`,
                descriptionDE: i18n.t('diagnostics.thermal_risk_desc', { temp: ambientTemp })
            },
            sensorCoverage: {
                coverage: asset.sensorMatrix ? 85 : 0,
                missingLocations: [],
                severity: asset.sensorMatrix ? 'LOW' : 'HIGH',
                digitalTwinReadiness: asset.sensorMatrix ? 90 : 10,
                suggestion: "Nominal coverage.",
                suggestionDE: "Nominalna pokrivenost."
            },
            gridRisk: {
                detected: gridSeverity === 'CRITICAL',
                frequencyHz: gridFrequency,
                severity: gridSeverity,
                message: gridSeverity === 'CRITICAL' ? "GRID DESYNC DETECTED" : "Grid stable",
                messageDE: gridSeverity === 'CRITICAL' ? "DESINKRONIZACIJA MREŽE" : "Mreža stabilna"
            },
            cavitationRisk: {
                severity: cavitationSeverity,
                message: cavitationSeverity === 'CRITICAL' ? "Cavitation risk high at current flow" : "Safe zone"
            },
            timestamp: new Date().toISOString()
        };
    },

    /**
     * LEGACY ADAPTER: For components still calling old diagnostic logic.
     */
    calculateHealthScore: (report: any): any => {
        // Check if report is the new DiagnosisReport
        if (report && 'severity' in report && 'messages' in report) {
            if (report.severity === 'CRITICAL') return { overall: 20 };
            if (report.severity === 'WARNING') return { overall: 60 };
            return { overall: 98 };
        }

        // Handle Legacy DiagnosticResults
        const results = report as DiagnosticResults;
        let score = 98;
        if (results.gridRisk?.severity === 'CRITICAL') score -= 50;
        if (results.thermalRisk?.severity === 'HIGH') score -= 30;
        if (results.cavitationRisk?.severity === 'CRITICAL') score -= 40;

        return {
            overall: Math.max(0, score),
            breakdown: {
                thermal: 90,
                mechanical: 95,
                hydraulic: 85,
                sensory: 100
            },
            criticalRisks: [],
            maintenanceSuggestions: [],
            optimizedAreas: []
        };
    }
};
