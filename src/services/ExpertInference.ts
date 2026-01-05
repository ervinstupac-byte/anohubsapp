import { TechnicalProjectState } from '../models/TechnicalSchema';
import masterKnowledge from '../knowledge/MasterKnowledgeMap.json';
import maintenanceSop from '../knowledge/MaintenanceSOP.json';
import { StructuralIntegrityService } from './StructuralIntegrityService';
import { SentinelKernel } from './SentinelKernel';
import { LifeExtensionEngine } from './LifeExtensionEngine';
import { RecoveryPath } from '../models/RepairContext';

// Define the shape of MasterKnowledge based on usage
interface MasterKnowledgeMap {
    standardThresholds: {
        goldenStandards: {
            insulation: { min: number };
            axialPlay: { max: number };
            alignment: { ideal: number; failure: number };
        };
        vibration: {
            satisfactory: number;
            unsatisfactory: number;
            standard: string
        };
        bearingTemperature: { critical: number };
        oilChemistry: {
            waterContent: { warning: number };
            tan: { warning: number }
        };
    };
    failureModes: Record<string, {
        symptom: string;
        probableCauses: string[];
        kbRef: string
    }>;
}

const KNOWLEDGE = masterKnowledge as unknown as MasterKnowledgeMap;

export interface InferenceResult {
    conclusions: {
        id: string;
        symptom: string;
        probableCauses: string[];
        remedies: string[];
        reasoning: string;
        kbReference: string;
        recommendedAction?: string; // Actionable Intelligence
        sopCode?: string;
    }[];
    alerts: {
        standard: string;
        parameter: string;
        severity: 'NORMAL' | 'WARNING' | 'CRITICAL';
        reasoning: string;
        recommendedAction?: string; // Actionable Intelligence
        sopCode?: string;
    }[];
    metrics: {
        structuralSafetyMargin: number; // Barlow's Margin (%)
        extendedLifeYears?: number;
        fatigueRiskFactor: number;     // Dynamic Risk Profile (0-100)
        investmentDecayRate: number;   // Calculated capital erosion (%)
        longevityLeakPenalty?: number; // Acceleration factor (e.g. 1.25)
    };
    recoveryPaths: RecoveryPath[]; // NEW: NC-4.2
    chiefEngineerVerdict: string;  // One-sentence executive summary
}

export const ExpertInference = {
    /**
     * Cross-references the TechnicalState with the Master Knowledge Map.
     */
    analyze: (state: TechnicalProjectState): InferenceResult => {
        const result: InferenceResult = {
            conclusions: [],
            alerts: [],
            metrics: {
                structuralSafetyMargin: 0,
                fatigueRiskFactor: 0,
                investmentDecayRate: 0
            },
            recoveryPaths: [],
            chiefEngineerVerdict: ''
        };

        // 1. Live Structural Integrity Check (Barlow's Link)
        const structuralAudit = StructuralIntegrityService.audit(state);
        result.metrics.structuralSafetyMargin = structuralAudit.margin;

        if (structuralAudit.status !== 'NORMAL') {
            result.alerts.push({
                standard: 'NC-4.2 Structural',
                parameter: 'Spiral Casing Stress',
                severity: structuralAudit.status,
                reasoning: `STRUCTURAL RISK: Safety margin is ${structuralAudit.margin.toFixed(1)}%. Hoop stress (${structuralAudit.currentPressure.toFixed(1)} Bar) vs Limit (${structuralAudit.mawp.toFixed(1)} Bar).`,
                recommendedAction: (maintenanceSop.sops as any).STRUCTURAL_RISK.action,
                sopCode: 'STRUCTURAL_RISK'
            });
        }

        // 2. Standards Evaluation (ISO, Megger, Barlow)
        const standards = KNOWLEDGE.standardThresholds;

        // Vibration (ISO 10816-3)
        const vib = state.mechanical.vibration;
        if (vib > standards.vibration.unsatisfactory) {
            result.alerts.push({
                standard: standards.vibration.standard,
                parameter: 'Vibration',
                severity: 'CRITICAL',
                reasoning: `Measured vibration of ${vib} mm/s exceeds the ${standards.vibration.standard} critical limit of ${standards.vibration.unsatisfactory} mm/s for large machines.`,
                recommendedAction: (maintenanceSop.sops as any).VIBRATION_CRITICAL.action,
                sopCode: 'VIBRATION_CRITICAL'
            });
        }

        // Bearing Temperature & Relative Overheating
        const bTemp = state.mechanical.bearingTemp;
        const ambient = state.identity.environmentalBaseline?.ambientTemperature || 25;
        const relativeRise = bTemp - ambient;

        if (bTemp > standards.bearingTemperature.critical) {
            result.alerts.push({
                standard: 'Industrial Standard',
                parameter: 'Bearing Temp',
                severity: 'CRITICAL',
                reasoning: `Bearing temperature reached ${bTemp}°C, exceeding the safe critical shutdown threshold of ${standards.bearingTemperature.critical}°C. Relative rise above ambient is ${relativeRise.toFixed(1)}°C.`,
                recommendedAction: (maintenanceSop.sops as any).BEARING_TEMP_CRITICAL.action,
                sopCode: 'BEARING_TEMP_CRITICAL'
            });
        } else if (relativeRise > 40) {
            result.alerts.push({
                standard: 'Relative Delta Standard',
                parameter: 'Bearing Rise',
                severity: 'WARNING',
                reasoning: `Abnormal thermal rise detected. Bearing is ${relativeRise.toFixed(1)}°C above ambient (${ambient}°C). Even if below absolute limits, this indicates a lubrication or friction issue.`
            });
        }

        // Roots of Engineering: Strict Golden Standards (NC-4.2)
        const golden = standards.goldenStandards;
        const axial = state.mechanical.axialPlay || 0;
        const alignment = state.mechanical.alignment || 0;

        // Alignment Precision Analysis
        if (alignment > golden.alignment.ideal) {
            const severity = alignment > golden.alignment.failure ? 'CRITICAL' : 'WARNING';
            result.alerts.push({
                standard: 'ROOTS GOLDEN (NC-4.2)',
                parameter: 'Alignment',
                severity,
                reasoning: `PRECISION BREACH: Measured ${alignment} mm/m exceeds strict ${golden.alignment.ideal} mm/m Golden Standard. Based on the cubic relationship of bearing wear, this misalignment accelerates capital erosion by ${(Math.pow(alignment / golden.alignment.ideal, 3) * 10).toFixed(1)}%.`,
                recommendedAction: 'Execute Precision Laser Re-alignment to 0.05 mm/m.',
                sopCode: 'ALIGNMENT'
            });
            result.metrics.investmentDecayRate += severity === 'CRITICAL' ? 12.0 : 5.0;
        }

        // Axial Play Precision Analysis
        if (axial > golden.axialPlay.max) {
            result.alerts.push({
                standard: 'ROOTS GOLDEN (NC-4.2)',
                parameter: 'Axial Play',
                severity: 'CRITICAL',
                reasoning: `AXIAL PLAY BREACH: Measured ${axial} mm exceeds max limit of ${golden.axialPlay.max} mm. Driving high dynamic thrust loads on pads, risking catastrophic fatigue breakthrough.`,
                recommendedAction: 'Precision shimming and thrust bridge calibration.',
                sopCode: 'THRUST_BALANCE'
            });
            result.metrics.investmentDecayRate += 15.5;
        }

        // Insulation Precision Analysis (100 MOhm baseline)
        const megger = state.mechanical.insulationResistance || 0;
        if (megger < golden.insulation.min) {
            result.alerts.push({
                standard: 'ROOTS GOLDEN (NC-4.2)',
                parameter: 'Insulation (Healthy Baseline)',
                severity: 'CRITICAL',
                reasoning: `INSULATION RISK: Stator resistance of ${megger} MOhm is below the strict Healthy Baseline of ${golden.insulation.min} MOhm. High probability of winding partial discharge.`,
                recommendedAction: 'Stator dry-out and cryogenic cleaning sequence.',
                sopCode: 'ELECTRICAL_HEALTH'
            });
        }

        // --- HERITAGE TRIBOLOGY MODULE (NC-4.2) ---
        const fluid = state.identity?.fluidIntelligence?.oilSystem;
        const waterContent = fluid?.waterContentPPM || 0;
        const tanValue = fluid?.tan || 0;
        const oilThresholds = standards.oilChemistry;

        if (waterContent > oilThresholds.waterContent.warning || tanValue > oilThresholds.tan.warning) {
            result.alerts.push({
                standard: 'HERITAGE TRIBOLOGY',
                parameter: 'Oil Chemistry',
                severity: 'CRITICAL',
                reasoning: `ACIDIC/HYDRATED OIL: ${waterContent > 500 ? `Water (${waterContent} ppm) > 500 ppm` : `TAN (${tanValue}) > 0.5`}. Accelerated chemical erosion of Babbitt (white metal) bearings detected.`,
                recommendedAction: 'Execute SOP-TRIB-001: Scraping & Blueing and Oil Purification.',
                sopCode: 'BEARING_RECLAMATION'
            });
            result.metrics.longevityLeakPenalty = 1.25; // 25% increase in leak
            result.metrics.investmentDecayRate += 10.0;
        }

        // --- SENTINEL KERNEL: INFRASTRUCTURE CORE (NC-4.7) ---

        // 1. Grease Blowout Risk (Standby Watcher)
        const isStandby = state.demoMode?.active ? true : false; // Simplified for demo
        const grease = SentinelKernel.checkGreaseRisk(isStandby ? 'STBY' : 'RUNNING', state.identity.startStopCount % 30); // Use modulo as proxy
        if (grease.risk) {
            result.alerts.push({
                standard: 'NC-4.7 Infrastructure',
                parameter: 'Grease Management',
                severity: (grease.risk === 'HIGH' ? 'WARNING' : 'CRITICAL') as 'WARNING' | 'CRITICAL',
                reasoning: grease.message || 'Excessive lubrication during standby.',
                recommendedAction: 'Purge grease lines and inspect seal integrity.',
                sopCode: 'BEARING_RECLAMATION',
            });
            (result.alerts[result.alerts.length - 1] as any).slogan = 'PREVENTATIVE OVERFILLING';
            (result.alerts[result.alerts.length - 1] as any).vectors = ['Standby Ops', 'Grease History'];
        }

        // 2. Thermal Inertia (Rate of Rise)
        // Simulate a history if we are in a heat-related scenario
        const isBearingFailure = state.demoMode.scenario === 'BEARING_FAILURE';
        const mockTemps = isBearingFailure ? [55, 62, 71] : [55, 56];
        const mockTimes = [Date.now() - 120000, Date.now() - 60000, Date.now()];
        const thermal = SentinelKernel.checkThermalInertia(mockTemps, mockTimes);
        if (thermal.risk) {
            result.alerts.push({
                standard: 'NC-4.7 Infrastructure',
                parameter: 'Thermal Stability',
                severity: thermal.risk === 'EMERGENCY' ? 'CRITICAL' : 'WARNING',
                reasoning: thermal.message || 'Abnormal bearing heat rise.',
                recommendedAction: 'Verify cooling water flow and jacking oil pressure.'
            });
            (result.alerts[result.alerts.length - 1] as any).slogan = 'COMPOUNDING FRICTION';
            (result.alerts[result.alerts.length - 1] as any).vectors = ['Temp Rate', 'Post-Shutdown'];
        }

        // 3. Magnetic Unbalance (Stator Variance)
        const statorTemps = [55, 56, isBearingFailure ? 85 : 55, 55, 55];
        const magnetic = SentinelKernel.checkMagneticUnbalance(statorTemps, 450);
        if (magnetic.risk) {
            result.conclusions.push({
                id: 'MAG-UNB-001',
                symptom: 'Localized Stator Heating',
                probableCauses: ['Rotor Eccentricity', 'Shorted Laminations', 'Uneven Air Gap'],
                remedies: ['Check air gap alignment', 'Inspect rotor windings'],
                reasoning: magnetic.message || 'High stator temperature variance.',
                kbReference: 'KB-INFRA-03',
                recommendedAction: 'Execute magnetic center audit and stator scanning.'
            });
            (result.conclusions[result.conclusions.length - 1] as any).slogan = 'MAGNETIC SIDE PULL';
            (result.conclusions[result.conclusions.length - 1] as any).vectors = ['Stator Delta', 'Excitation High'];
        }

        // 4. Failure Mode Detection (Cavitation, Aeration, PID)
        const failureModes = KNOWLEDGE.failureModes;

        // Cavitation Check
        const designPower = state.site.designPerformanceMW || 5.0;
        const designFlow = state.site.designFlow || 3.0;
        const designSWC = (designFlow * 3600) / (designPower * 1000);
        const actualSWC = state.physics.specificWaterConsumption || 0;

        if (actualSWC > designSWC * 1.1) {
            result.conclusions.push({
                id: 'CAV-001',
                symptom: failureModes.CAVITATION?.symptom || 'Cavitation',
                probableCauses: failureModes.CAVITATION?.probableCauses || ["Runner wear", "Low head"],
                remedies: ["Adjust setpoint", "Check draft tube"],
                reasoning: `DIAGNOSIS: Potential Cavitation. REASONING: Specific Water Consumption (${actualSWC.toFixed(2)}) is > 10% above design baseline.`,
                kbReference: failureModes.CAVITATION?.kbRef || 'KB-CAV',
                recommendedAction: (maintenanceSop.sops as any).CAVITATION_INFERRED.action,
                sopCode: 'CAVITATION_INFERRED'
            });
        }

        // 4. Recovery Architect (NC-4.2)
        const activeSops = [...result.alerts, ...result.conclusions]
            .map(item => item.sopCode)
            .filter(Boolean) as string[];

        result.recoveryPaths = activeSops.map(sopCode =>
            LifeExtensionEngine.getRecoveryPath(sopCode, state)
        ).filter(path => path.actions.length > 0);

        // 5. Dynamic Risk Forensic (The 48% Rule)
        // Link vibrations and pressure surges directly to Fatigue Accumulation
        // Fatigue ~ (Dynamic Intensity)^3
        const vibeIntensity = state.mechanical.vibration / standards.vibration.satisfactory;
        const surgeIntensity = state.physics.waterHammerPressureBar / 15.0; // Baseline surge
        const dynamicIntensity = Math.max(vibeIntensity, surgeIntensity);

        // The 48% Rule: Structural degradation accelerates exponentially when dynamic loads exceed 48% of design baseline
        // We use a normalized intensity where 1.0 is the ISO/OEM limit
        const fatigueRisk = Math.pow(dynamicIntensity / 0.48, 2.5) * 48;
        result.metrics.fatigueRiskFactor = Math.min(100, Math.round(fatigueRisk));

        if (result.metrics.fatigueRiskFactor > 48) {
            result.alerts.push({
                standard: 'NC-4.2 Forensic',
                parameter: 'Dynamic Risk Profile',
                severity: 'CRITICAL',
                reasoning: `INVESTMENT DECAY ALERT: Dynamic fatigue risk is ${result.metrics.fatigueRiskFactor}%. Failure to correct alignment/vibration will result in accelerated capital erosion.`,
                recommendedAction: 'Engage Revitalization Roadmap immediately.'
            });
        }

        // 6. Total Extended Life (NC-4.2 Persistent)
        const totalExtendedLife = LifeExtensionEngine.calculateTotalExtendedLife(state);
        result.metrics.extendedLifeYears = totalExtendedLife;

        // 7. CHIEF ENGINEER'S VERDICT (NC-4.2 Production Sentinel)
        result.chiefEngineerVerdict = generateChiefEngineerVerdict(state, result);

        return result;
    },

    /**
     * Get only the Chief Engineer's Verdict without full analysis
     */
    getQuickVerdict: (state: TechnicalProjectState): string => {
        const result = ExpertInference.analyze(state);
        return result.chiefEngineerVerdict;
    }
};

/**
 * CHIEF ENGINEER'S VERDICT GENERATOR (NC-4.2 PRODUCTION)
 * 
 * Generates a one-sentence executive summary based on aggregate data.
 * This is the "human" voice of the AI - authoritative and actionable.
 */
function generateChiefEngineerVerdict(state: TechnicalProjectState, result: InferenceResult): string {
    const alignment = state.mechanical?.alignment || 0;
    const vibration = state.mechanical?.vibration || 0;
    const bearingTemp = state.mechanical?.bearingTemp || 0;
    const insulation = state.mechanical?.insulationResistance || 500;

    // Count issues by category
    const criticalAlerts = result.alerts.filter(a => a.severity === 'CRITICAL').length;
    const warningAlerts = result.alerts.filter(a => a.severity === 'WARNING').length;

    // Determine primary concern categories
    const hasMechanicalIssue = alignment > 0.05 || vibration > 2.8;
    const hasTribologyIssue = state.physics?.leakageStatus === 'CRITICAL' || state.physics?.leakageStatus === 'DEGRADING';
    const hasElectricalIssue = insulation < 100;
    const hasThermalIssue = bearingTemp > 70;
    const hasStructuralIssue = result.metrics.structuralSafetyMargin < 30;

    // Build verdict based on priority
    if (criticalAlerts >= 3) {
        return `CRITICAL: Asset requires immediate intervention across ${criticalAlerts} failure domains; prioritize shutdown and comprehensive audit before further operation.`;
    }

    if (hasStructuralIssue && hasMechanicalIssue) {
        return `Asset shows compounded structural and mechanical degradation; immediate engineering review required to prevent cascading failure.`;
    }

    if (hasMechanicalIssue && hasTribologyIssue) {
        return `Asset is structurally sound but tribologically compromised; prioritize oil filtration and precision realignment to arrest longevity leak.`;
    }

    if (hasThermalIssue && hasMechanicalIssue) {
        return `Thermal stress detected with alignment deviation; bearing wear accelerating—recommend laser realignment and thermography baseline.`;
    }

    if (hasMechanicalIssue && !hasTribologyIssue && !hasElectricalIssue) {
        return `Alignment precision below Golden Standard (0.05 mm/m); execute laser realignment protocol to restore full longevity potential.`;
    }

    if (hasElectricalIssue && !hasMechanicalIssue) {
        return `Electrical insulation degradation detected; schedule stator dry-out and partial discharge testing within 30 days.`;
    }

    if (hasTribologyIssue) {
        return `Oil analysis indicates contamination; implement enhanced filtration and consider oil change to prevent accelerated bearing wear.`;
    }

    if (warningAlerts > 0 && criticalAlerts === 0) {
        return `Asset operating within acceptable limits with ${warningAlerts} monitoring flag(s); maintain current inspection cadence.`;
    }

    // All clear
    if (alignment <= 0.05 && vibration <= 1.1 && bearingTemp <= 65) {
        return `Asset meets NC-4.2 Heritage Standards; projected 50-year longevity pathway confirmed—continue predictive monitoring.`;
    }

    return `Asset health nominal with no immediate action required; next scheduled audit recommended in 6 months.`;
}
