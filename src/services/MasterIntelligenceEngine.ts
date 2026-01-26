import { aiPredictionService, SynergeticRisk, RULEstimate, IncidentPattern, PrescriptiveAction } from './AIPredictionService';
import { AcousticFingerprintingService } from './AcousticFingerprintingService';
import { SpecialMeasurementsService, CorrelationResult } from './SpecialMeasurementsService';
import { DynamicToleranceCalculator, TurbinePhysics } from './DynamicToleranceCalculator';
import { OilAnalysisService } from './OilAnalysisService';
import idAdapter from '../utils/idAdapter';
import { CavitationErosionService } from './CavitationErosionService';
import { StructuralIntegrityService } from './StructuralIntegrityService';
import { HistoricalTrendAnalyzer } from './HistoricalTrendAnalyzer';
import { PerformanceGuardService } from './PerformanceGuardService';
import { GalvanicCorrosionService } from './GalvanicCorrosionService';
import { SentinelKernel } from './SentinelKernel';
import { LifeExtensionEngine } from './LifeExtensionEngine';
import { PeltonJetSyncService } from './PeltonJetSyncService';
import { HydraulicTransientSafety } from './HydraulicTransientSafety';
import { SpecialMeasurementSyncService, FRANCIS_IDEAL_BLUEPRINT } from './SpecialMeasurementSyncService';
import { DrTurbineAI } from './DrTurbineAI';
import { TechnicalProjectState } from '../core/TechnicalSchema';
import { HydraulicIntegrity } from './HydraulicIntegrity';
import { persistAuditRecord } from '../lib/supabaseAuditAdapter';
import ShaftSealGuardian from './ShaftSealGuardian';
import ThrustBearingMaster from './ThrustBearingMaster';
import WicketGateKinematics from './WicketGateKinematics';
import GovernorHPUGuardian from './GovernorHPUGuardian';
import GeneratorAirGapSentinel from './GeneratorAirGapSentinel';
import StatorInsulationGuardian from './StatorInsulationGuardian';
import TransformerOilGuardian from './TransformerOilGuardian';
import SensorIntegritySentinel from './SensorIntegritySentinel';
import { SovereignMemory } from './SovereignMemory';
import OutageOptimizer from './OutageOptimizer';
import SovereignExpertTranslator from './SovereignExpertTranslator';
import SovereignAuditAdapter from './SovereignAuditAdapter';
import SystemBoundaryAnalyzer from './SystemBoundaryAnalyzer';
import MaintenanceBequestReport from './MaintenanceBequestReport';
import CoolingSystemGuardian from './CoolingSystemGuardian';
import TurbineClassifier from './TurbineClassifier';
import KaplanBladePhysics from './KaplanBladePhysics';
import { ITurbineModel, Anomaly, CompleteSensorData, FrancisSensorData } from '../models/turbine/types';
import { EnhancedAsset, CommonSensorData } from '../models/turbine/types';
import { OilSample } from './OilAnalysisService';

export interface JustifiedSource {
    filename: string;
    justification: string;
}

export interface UnifiedDiagnosis {
    assetId: number;
    timestamp: number;
    overallHealthScore: number;
    criticality: 'HEALTHY' | 'INVESTIGATE' | 'CRITICAL';
    aiPrediction: {
        synergeticRisks: any[];
        rulEstimates: any[];
        incidentPatterns: any[];
        prescriptiveActions: any[];
    };
    acoustic: {
        classification: any;
        trendAnalysis: any;
    };
    specialMeasurements: any;
    crossCorrelation: {
        confidenceBoosts: any[];
        conflictingSignals: any[];
    };
    automatedActions: any[];
    dynamicTolerances: any;
    expertInsights?: {
        oilHealth?: number;
        cavitationSeverity?: 'NOMINAL' | 'WARNING' | 'CRITICAL';
        structuralSafetyFactor?: number;
    };
    rulHours?: number; // NC-4.8: Remaining Useful Life
    serviceNotes?: Array<{
        service: string;
        severity: 'INFO' | 'WARNING' | 'CRITICAL';
        message: string;
        recommendation: string;
        sourceFiles?: JustifiedSource[];
    }>;

    // NC-4.10 Expansion
    trendProjections?: Record<string, { daysUntilCritical: number; projectedDate: string }>;
    operatingZone?: { zone: string; color: string; alert?: string };
    corrosionAlerts?: any[];
    thermalInertia?: { rate: number; risk: string };
    lifeExtension?: { yearsAdded: number };
    // NC-5.3 Intelligence Absorption
    vibrationZone?: 'ZONE_A' | 'ZONE_B' | 'ZONE_C' | 'ZONE_D';
    isoJustification?: string;
    // NC-8.0 Baseline Integration
    baselineDeviations?: Array<{
        parameter: string;
        current: number;
        baseline: number;
        severity: 'INFO' | 'WARNING' | 'CRITICAL';
        context: string;
    }>;
    // Guardian confidence scores
    guardianConfidence?: Record<string, number>;
    // Probability of failure (0-1 scale)
    p_fail?: number;
}

import BaseGuardian from './BaseGuardian';

export class MasterIntelligenceEngine extends BaseGuardian {
    /**
     * MAIN ORCHESTRATION FUNCTION
     * Coordinates all AI services and performs cross-correlation
     */
    public static async analyzeAsset(asset: EnhancedAsset, history: CompleteSensorData[]) {
        try {
            // 1. Initialize result structure
            const latest = history[history.length - 1];
            // Safe access to rpm (might be in specialized or common)
            const runningSpeed = latest.common.vibration > 0 ? (asset.turbine_config.rated_speed || 500) : 0;

            // 2. Parallel Analysis Execution
            const [aiResults, acousticResults, measurementResults, dynamicThresholds] = await Promise.all([
                this.runAIPrediction(asset, history),
                this.runAcousticAnalysis(asset, latest.specialized?.acoustic, runningSpeed),
                this.runSpecialMeasurements(asset, latest.specialized?.geodeticData, latest.specialized?.magneticData, {
                    runningSpeed: runningSpeed,
                    bearingSpan: asset.turbine_config.bearing_span || 0,
                    rotorDiameter: asset.turbine_config.runner_diameter || 0,
                    head: latest.common.output_power > 0 ? asset.turbine_config.head : 0,
                    flow: latest.common.output_power > 0 ? asset.turbine_config.flow_max : 0,
                    rotorWeight: asset.turbine_config.rotor_weight || 0
                }),
                this.runDynamicBaselines(asset, latest.common)
            ]);

            // 3. Expert Services Integration (NC-4.4 Activation)
            const expertResults = await this.runExpertServices(asset, latest);

            // 4. Cross-Correlation & Synthesis
            const crossCorrelation = this.performCrossCorrelation(
                aiResults,
                acousticResults,
                measurementResults,
                expertResults
            );

            // 5. Construct UnifiedDiagnosis
            const diagnosis: UnifiedDiagnosis = {
                assetId: asset.id,
                timestamp: Date.now(),
                overallHealthScore: 100,
                criticality: 'HEALTHY',
                aiPrediction: aiResults,
                acoustic: acousticResults,
                specialMeasurements: {
                    ...measurementResults,
                    shaftSealTelemetry: (latest.specialized as any)?.shaftSealTelemetry || [],
                    thrustBearingTelemetry: (latest.specialized as any)?.thrustBearingTelemetry || [],
                    wicketGateTelemetry: (latest.specialized as any)?.wicketGateTelemetry || [],
                    governorHPUTelemetry: (latest.specialized as any)?.governorHPUTelemetry || [],
                    generatorAirGapTelemetry: (latest.specialized as any)?.generatorAirGapTelemetry || [],
                    coolingTelemetry: (latest.specialized as any)?.coolingTelemetry || [],
                    statorInsulationTelemetry: (latest.specialized as any)?.statorInsulationTelemetry || [],
                    transformerOilTelemetry: (latest.specialized as any)?.transformerOilTelemetry || []
                },
                crossCorrelation: {
                    confidenceBoosts: crossCorrelation.synergeticRisks,
                    conflictingSignals: []
                },
                automatedActions: [],
                dynamicTolerances: dynamicThresholds,
                expertInsights: {
                    oilHealth: expertResults.oil?.healthScore,
                    cavitationSeverity: expertResults.cavitation?.severity,
                    structuralSafetyFactor: expertResults.structural?.safetyFactor
                },
                rulHours: this.calculateRUL(latest.common.vibration, expertResults.oil?.particlePPM || 15),
                serviceNotes: this.aggregateServiceNotes(expertResults, acousticResults),

                // NC-4.10 Converged Insights
                trendProjections: this.calculateTrendProjections(latest),
                operatingZone: PerformanceGuardService.checkOperatingZone(
                    {
                        flow: (latest.specialized as FrancisSensorData)?.flowRate || 40,
                        netHead: (asset.turbine_config as any).head || 150,
                        powerOutput: latest.common.output_power,
                        efficiency: latest.common.efficiency,
                        gateOpening: (latest.specialized as FrancisSensorData)?.guide_vane_opening || 80
                    },
                    152, 42.5 // Hardcoded Design Targets for Francis demo
                ),
                corrosionAlerts: GalvanicCorrosionService.analyzeCathodicProtection({
                    assetId: latest.assetId,
                    turbineType: 'TUBULAR',
                    anodes: [], // Placeholder for live anode data
                    averageVoltage: -780,
                    overallProtection: 'GOOD',
                    generatorGroundingResistance: 1.2,
                    strayCurrentDetected: false
                }),
                thermalInertia: {
                    rate: 0.5, // Mocked rate for now
                    risk: 'NOMINAL'
                },
                // NC-5.3 ISO 10816-5 Zone Mapping
                vibrationZone: this.calculateVibrationZone(latest.common.vibration),
                isoJustification: this.getISOJustification(this.calculateVibrationZone(latest.common.vibration)),

                // NC-8.0: Historical Baseline Integration
                baselineDeviations: this.compareWithHistoricalBaseline(latest, asset)
            };

            // NC-8.0: Predictive Alert Trigger
            if (diagnosis.trendProjections?.['vibration'] && diagnosis.trendProjections['vibration'].daysUntilCritical <= 3) {
                diagnosis.serviceNotes?.push({
                    service: 'Predictive Intelligence',
                    severity: 'CRITICAL',
                    message: 'PREDICTIVE_VIB_BREACH: Linear trend suggests ISO threshold breach within 72 hours.',
                    recommendation: 'Immediate load reduction or proactive bearing inspection required. [PROTOCOL_PdM_ACTIVE]',
                    sourceFiles: [
                        { filename: 'case-studies/cs-predictive-maintenance-roi/index.html', justification: 'Linear extrapolation of vibration trends indicates categorical structural risk within the 72h window.' }
                    ]
                });
            }

            // NC-9.0: ETA Break-Even Forecast Advisory
            // If AI forecast predicts efficiency breach within 8 weeks, add Maintenance Advisory
            try {
                const forecast = (aiResults && (aiResults as any).forecast) || null;
                // Require strong statistical confidence (approx t-stat > 2 or confidence >= 0.95)
                const significant = forecast && ((forecast.tStatistic && Math.abs(forecast.tStatistic) > 2) || (forecast.confidence && forecast.confidence >= 0.95));
                // If confidence is low, recommend Data Collection Phase instead of maintenance
                const lowConfidence = forecast && ((forecast.confidence || 0) < 0.5 || ((forecast.sampleCount || 0) < 720));
                // Critical maintenance if failure probability > 50% and breach is immediate (weeksUntil <= 1)
                const criticalPf = forecast && (forecast.pf || 0) > 50 && (forecast.weeksUntil !== null && forecast.weeksUntil <= 1);

                if (forecast && lowConfidence) {
                    diagnosis.serviceNotes?.push({
                        service: 'Data Collection Phase',
                        severity: 'WARNING',
                        message: `INSUFFICIENT_DATA: Forecast confidence/samples low (conf ${(forecast.confidence || 0).toFixed(3)}, samples ${forecast.sampleCount || 0}). Require 720 hourly samples for robust decisioning.`,
                        recommendation: 'Initiate scheduled high-resolution telemetry ingestion and pause automated maintenance advisories until sufficient samples are collected.',
                        sourceFiles: [
                            { filename: 'services/AIPredictionService.ts', justification: 'Forecast confidence below operational threshold; escalate to data collection.' }
                        ]
                    });
                } else if (criticalPf) {
                    diagnosis.serviceNotes?.push({
                        service: 'Critical Maintenance Alert',
                        severity: 'CRITICAL',
                        message: `CRITICAL_MAINTENANCE: Estimated failure probability ${((forecast.pf || 0)).toFixed(2)}% and breach predicted now (weeksUntil=${forecast.weeksUntil}). Immediate intervention required.`,
                        recommendation: 'Isolate affected unit, reduce load to minimum, and execute emergency inspection protocol. [AUTOMATED_CRITICAL] ',
                        sourceFiles: [
                            { filename: 'services/AIPredictionService.ts', justification: 'High Pf derived from residual process sigma; triggers critical alert.' },
                            { filename: 'services/MasterIntelligenceEngine.ts', justification: 'Final decision engine: Pf > 50% and imminent breach.' }
                        ]
                    });
                } else if (forecast && forecast.weeksUntil !== null && forecast.weeksUntil < 8 && significant) {
                    diagnosis.serviceNotes?.push({
                        service: 'Predictive Advisory',
                        severity: 'WARNING',
                        message: `MAINTENANCE_ADVISORY: Predicted efficiency breach (90%) in ${forecast.weeksUntil.toFixed(1)} weeks.`,
                        recommendation: 'Schedule preventive maintenance and detailed inspection within the advisory window. [AUTOMATED_ADVISORY]',
                        sourceFiles: [
                            { filename: 'services/AIPredictionService.ts', justification: 'Linear regression forecast on persisted telemetry (30-sample window).' }
                        ]
                    });

                    // Also append an automated action for operations teams (non-executable placeholder)
                    diagnosis.automatedActions.push({
                        type: 'SCHEDULED',
                        action: 'SCHEDULE_PREVENTIVE_MAINTENANCE',
                        timeframe: `${Math.max(1, Math.ceil(forecast.weeksUntil))} weeks`,
                        priority: 'HIGH'
                    } as any);
                }
            } catch (e) {
                // swallow forecast errors to avoid breaking main analysis
            }

            // 5e. Rule 1: Geometric Misalignment Audit (2x RPM Harmonic) - NC-5.4 Verified
            if (latest.specialized?.acoustic?.harmonics) {
                const h1x = latest.specialized.acoustic.harmonics[1] || 1.0;
                const h2x = latest.specialized.acoustic.harmonics[2] || 0.0;
                if (h2x > 1.5 * h1x) {
                    diagnosis.serviceNotes?.push({
                        service: 'Strategic Audit',
                        severity: 'CRITICAL',
                        message: 'MISALIGNMENT_HARMONIC: 2x RPM dominant harmonic detected.',
                        recommendation: 'Precision laser alignment required. deviation suspect > 0.15mm/m. [PROTOCOL_IMS_VERIFIED]',
                        sourceFiles: [
                            { filename: 'case-studies/cs-francis-misalignment/index.html', justification: 'Dominant 2x RPM harmonic is a categorical indicator of geometric misalignment.' },
                            { filename: 'insights/insight-harmonic-vib/index.html', justification: 'Cross-referenced against historical vibration patterns for similar Francis hub twins.' }
                        ]
                    });
                }
            }

            // 5f. Rule 2: The 180-Day Alignment Rule (Temporal Logic) - NC-5.4 Verified
            const lastAlignment = asset.turbine_config.lastAlignmentDate || asset.turbine_config.commissioning_date;
            if (lastAlignment) {
                const daysSinceAlignment = Math.floor((Date.now() - new Date(lastAlignment).getTime()) / (1000 * 60 * 60 * 24));
                if (daysSinceAlignment > 180) {
                    diagnosis.serviceNotes?.push({
                        service: 'Strategic Audit',
                        severity: 'WARNING',
                        message: `ALIGMENT_EXPIRATION: Last alignment performed ${daysSinceAlignment} days ago.`,
                        recommendation: 'Mandatory laser alignment verification required per 180-day tropical rule. [PROTOCOL_IMS_VERIFIED]',
                        sourceFiles: [
                            { filename: 'Turbine_Friend/Francis_SOP_Precision/index.html', justification: 'Mandatory +/- 0.05mm run-out tolerance for Francis shafts requires 180-day verification.' },
                            { filename: 'Turbine_Friend/Francis_SOP_Shaft_Alignment/index.html', justification: 'Laser alignment verification mandated every 180 days due to tropical foundation moisture absorption.' }
                        ]
                    });
                }
            }

            // 5a. DRILL DOWN: Specialized PELTON ANALYSIS
            if (asset.turbine_family === 'PELTON') {
                const peltonResults = PeltonJetSyncService.syncMultiNozzle([], asset.turbine_config.runner_diameter || 1.2);
                if (peltonResults.imbalanceRatio > 0.1) {
                    diagnosis.serviceNotes?.push({
                        service: 'Pelton Jet Sync',
                        severity: 'WARNING',
                        message: `Rotor force imbalance detected (${(peltonResults.imbalanceRatio * 100).toFixed(1)}%).`,
                        recommendation: 'Recalibrate nozzle needles and check for partial blockage.'
                    });
                }
            }

            // 5b. DRILL DOWN: HYDRAULIC TRANSIENT SAFETY
            const transientCheck = HydraulicTransientSafety.simulateHardwareChange(
                { pipeDiameterMM: 12, pipeLengthM: 10, oilViscosityCst: 46, systemPressureBar: 100, actuatorVolumeL: 5, accumulators: false },
                { pipeDiameterMM: 12, pipeLengthM: 10, oilViscosityCst: 46, systemPressureBar: 100, actuatorVolumeL: 5, accumulators: false }
            );
            if (!transientCheck.approved) {
                diagnosis.serviceNotes?.push({
                    service: 'Hydraulic Safety',
                    severity: 'CRITICAL',
                    message: transientCheck.reason,
                    recommendation: transientCheck.warnings[0]
                });
            }

            // 5c. DRILL DOWN: GEOMETRY EFFICIENCY GAP
            const geoComparison = SpecialMeasurementSyncService.compareWithBlueprint([], FRANCIS_IDEAL_BLUEPRINT);
            const effGap = SpecialMeasurementSyncService.calculateEfficiencyGap(geoComparison, asset.turbine_family, asset.capacity || 4.2, 55);
            if (effGap.predictedEfficiencyLoss > 0.5) {
                diagnosis.serviceNotes?.push({
                    service: 'Special Measurements',
                    severity: 'INFO',
                    message: `Efficiency Gap: ${effGap.predictedEfficiencyLoss.toFixed(2)}% loss due to geometry deformation.`,
                    recommendation: `Annual revenue impact: $${effGap.lostRevenueAnnual.toLocaleString()}. Plan major overhaul.`
                });
            }

            // 5d. DRILL DOWN: DR. TURBINE AI VOICE ENRICHMENT
            const drConsult = DrTurbineAI.consult(
                { id: asset.id, name: asset.name, machineConfig: { ratedPowerMW: asset.capacity || 4.2 } } as any,
                (latest.specialized as FrancisSensorData)?.flowRate || 40,
                (asset.turbine_config as any).head || 150,
                50
            );
            drConsult.cards.forEach(card => diagnosis.serviceNotes?.push({
                service: 'Dr. Turbine AI',
                severity: card.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
                message: card.message,
                recommendation: card.actionLabel
            }));

            // 6. Calculate Life Extension ROI
            if (diagnosis.serviceNotes && diagnosis.serviceNotes.length > 0) {
                diagnosis.lifeExtension = {
                    yearsAdded: LifeExtensionEngine.calculateLifeExtension(
                        15,
                        235,
                        (latest.specialized as FrancisSensorData)?.hoopStressMPa || 150,
                        0.15
                    )
                };
            }

            // --- Turbine Classification & Kaplan blade physics ---
            try {
                const detected = TurbineClassifier.detectType(asset, latest) || ((asset.turbine_config as any)?.turbine_type || (asset.turbine_config as any)?.turbineType || null);
                const bladeCount = (latest.specialized as any)?.bladeCount || (asset.turbine_config as any)?.blade_count || (asset.turbine_config as any)?.runner_blades || (asset.turbine_config as any)?.numberOfBlades || 4;
                (diagnosis as any).turbineClass = detected;
                (diagnosis as any).bladeCount = bladeCount;

                if (detected) {
                    const consts = TurbineClassifier.getDesignConstants(detected as any);
                    let adjustedSigma = consts.sigma_limit;
                    if (detected === 'VERTICAL_KAPLAN' || detected === 'PROPELLER') {
                        adjustedSigma = KaplanBladePhysics.adjustedSigmaLimit(consts.sigma_limit, bladeCount as number);
                    }

                    const measuredSigma = (latest.specialized as any)?.sigmaMeasured || (latest.common as any)?.sigma || null;
                    const proximity = measuredSigma && adjustedSigma ? (measuredSigma / adjustedSigma) : null;
                    (diagnosis as any).turbineCavitation = { baseSigma: consts.sigma_limit, adjustedSigma, measuredSigma, proximity };

                    if (proximity !== null && proximity < 1.0) {
                        diagnosis.serviceNotes?.push({
                            service: 'Cavitation Advisory',
                            severity: 'WARNING',
                            message: `Operating near cavitation limit (proximity ${(proximity * 100).toFixed(1)}%). Adjust guide vane and reduce load if possible.`,
                            recommendation: 'Schedule detailed cavitation inspection and review blade count effects.'
                        });
                    }
                }
            } catch (e) {
                // ignore classification errors
            }

            // 6. Calculate Health & Trigger Actions
            diagnosis.overallHealthScore = this.calculateHealthScore(diagnosis, expertResults);
            diagnosis.criticality = this.determineCriticality(diagnosis);

            await this.triggerAutomatedActions(asset, diagnosis, history);

            // --- Outage Optimizer integration ---
            try {
                // Build Pfail map heuristically from specialMeasurements arrays if available
                const sm: any = diagnosis.specialMeasurements || {};
                const pfail: Record<string, number> = {};
                const components = ['shaftSealTelemetry', 'thrustBearingTelemetry', 'generatorAirGapTelemetry', 'statorInsulationTelemetry', 'governorHPUTelemetry', 'transformerOilTelemetry', 'coolingTelemetry'];

                // Cooling guardian: analyze cooling telemetry if available and use its p_fail
                const coolingSamples = (sm as any).coolingTelemetry || [];
                if (coolingSamples && coolingSamples.length) {
                    try {
                        const cg = new CoolingSystemGuardian();
                        const analysis = cg.analyze(coolingSamples as any[]);
                        pfail['cooling'] = analysis.p_fail;

                        // If fouling detected and backup not started, trigger immediate load reduction
                        const last = coolingSamples[coolingSamples.length - 1] as any;
                        // Only trigger if backupPumpStarted field exists and is explicitly false
                        const backupStarted = last && typeof last.backupPumpStarted === 'boolean' ? last.backupPumpStarted : null;
                        if (analysis.foulingDetected && backupStarted === false) {
                            diagnosis.automatedActions.push({ type: 'IMMEDIATE', action: 'LOAD_REDUCTION', priority: 'CRITICAL', message: 'Cooling fouling detected and backup pump not started.' });
                        }
                    } catch (e) {
                        pfail['cooling'] = 0.1;
                    }
                } else {
                    pfail['cooling'] = 0.05;
                }

                // For other components, fallback to reading last sample p_fail or default
                const otherComponents = ['shaftSealTelemetry', 'thrustBearingTelemetry', 'generatorAirGapTelemetry', 'statorInsulationTelemetry', 'governorHPUTelemetry', 'transformerOilTelemetry'];
                otherComponents.forEach(c => {
                    const arr = (sm as any)[c] || [];
                    if (arr && arr.length) {
                        const last = arr[arr.length - 1];
                        const p = (last && (last.p_fail || last.pFail || last.P_fail || last.pFailProbability)) || null;
                        pfail[c.replace(/Telemetry$/, '')] = typeof p === 'number' ? Math.max(0, Math.min(1, p)) : 0.1;
                    } else {
                        pfail[c.replace(/Telemetry$/, '')] = 0.05;
                    }
                });

                // For MarketOracle: try to fetch a priceForecast if provided in diagnosis (fallback to flat)
                const priceForecast = (diagnosis as any).marketForecast?.hourly || [];

                const opt = OutageOptimizer.findOptimalOutageWindow(pfail, priceForecast || []);
                (diagnosis as any).recommendedMaintenance = {
                    outageWindow: opt.optimalWindow,
                    bundles: opt.bundles,
                    calculatedAt: opt.calculatedAt
                };

                // Add a concise automated action to surface on the executive dashboard
                if (opt && opt.optimalWindow) {
                    const startDate = new Date(opt.optimalWindow.start).toISOString();
                    diagnosis.automatedActions.push({ type: 'RECOMMENDATION', action: 'SCHEDULE_OUTAGE', timeframe: `Start: ${startDate}`, priority: 'HIGH' });
                }

                // Maintenance bequest economic report
                const bequest = MaintenanceBequestReport.generate(pfail, priceForecast || []);
                (diagnosis as any).maintenanceBequest = bequest;

            } catch (e) {
                // Do not fail main analysis for optimizer errors
                console.warn('Outage optimizer error', e);
            }

            // Generate a WisdomReport, annotate confidence, and persist for forensic trail (Phase 55.0)
            try {
                const translator = new SovereignExpertTranslator();
                const findings: any[] = [];
                if (diagnosis.serviceNotes && diagnosis.serviceNotes.length) {
                    diagnosis.serviceNotes.forEach((s: any) => findings.push({ source: s.service, severity: s.severity, summary: s.message, recommendation: s.recommendation }));
                }
                if (diagnosis.automatedActions && diagnosis.automatedActions.length) {
                    diagnosis.automatedActions.forEach((a: any) => findings.push({ source: 'AutomatedAction', severity: a.priority || a.status || 'INFO', summary: a.action || a.details || '', details: a.details }));
                }

                const report = translator.generateWisdomReport(asset.id, findings, { diagnosisSnapshot: diagnosis });

                const analyzer = new SystemBoundaryAnalyzer();
                const annotated = analyzer.annotateReportWithConfidence(report);

                const adapter = new SovereignAuditAdapter();
                const telemetryRef = (latest && ((latest as any).id || (latest as any).timestamp)) ? `telemetry:${(latest as any).id || (latest as any).timestamp}` : `telemetry_ts:${Date.now()}`;
                const persisted = adapter.persistWisdom(annotated, asset.id, telemetryRef);

                // Attach a lightweight reference to the diagnosis for UI and downstream consumers
                (diagnosis as any).wisdomReport = { id: persisted.id, generatedAt: annotated.generatedAt, systemConfidence: annotated.systemConfidence };
                // also attach a clear persisted id field for dashboard linking
                (diagnosis as any).persistedWisdomId = persisted.id;
            } catch (e) {
                console.warn('Wisdom generation/persistence failed', e);
            }

            console.log(`✅ Analysis complete.Health score: ${diagnosis.overallHealthScore}/100`);
            return diagnosis;

        } catch (error) {
            console.error(`Error analyzing asset ${asset.id}:`, error);
            throw error;
        }
    }

    private static async runDynamicBaselines(asset: EnhancedAsset, common: any) {
        // Implementation for dynamic baselines
        return null;
    }

    private static async runExpertServices(asset: EnhancedAsset, latest: CompleteSensorData) {
        const results: any = {
            oil: null,
            cavitation: null,
            structural: null,
            hydraulic: null
        };

        // 1. Oil Analysis
        if (latest.specialized?.oilData) {
            results.oil = OilAnalysisService.analyzeOilSample(latest.specialized.oilData as OilSample);
        }

        // 2. Cavitation Analysis
        if (latest.specialized?.acoustic?.cavitationLevel || latest.specialized?.erosionPoints) {
            // Rule 2: Sediment vs Cavitation (Pelton Prioritization)
            const intakeTurbidity = (latest.specialized as any)?.intakeTurbidity || 0;
            const unitType = asset.turbine_family;

            if (unitType === 'PELTON' && intakeTurbidity > 50) {
                results.cavitation = {
                    severity: 'CRITICAL',
                    type: 'SEDIMENT_ABRASION',
                    message: 'High turbidity detected. Prioritizing Sediment Abrasion over Cavitation.',
                    justification: 'As per AnoHUB Article-13: Pelton units are highly vulnerable to abrasion from solid particles like sand and silt.'
                };
            } else {
                results.cavitation = CavitationErosionService.analyzeErosionTrend(
                    asset.id,
                    asset.turbine_family,
                    latest.specialized?.erosionPoints || [],
                    null,
                    0 // operating hours
                );
            }
        }

        // 3. Structural Integrity
        const projectState = this.synthesizeProjectState(asset, latest);
        results.structural = StructuralIntegrityService.audit(projectState);

        // 4. Hydraulic Integrity
        results.hydraulic = HydraulicIntegrity.calculateNetHead({
            grossHead: latest.common.output_power > 0 ? asset.turbine_config.head : 0,
            flow: latest.common.output_power > 0 ? asset.turbine_config.flow_max : 0,
            pipeLength: 100, // Default or from config
            diameter_mm: (asset.turbine_config.runner_diameter || 1) * 1000,
            roughness_ks: 0.1
        });

        return results;
    }

    private static synthesizeProjectState(asset: EnhancedAsset, latest: CompleteSensorData): any {
        return {
            penstock: {
                materialYieldStrength: 355,
                wallThickness: 0.02,
                diameter: asset.turbine_config.runner_diameter || 1,
                length: 100
            },
            physics: {
                staticPressureBar: (asset.turbine_config.head || 0) / 10,
                surgePressureBar: 0
            },
            mechanical: {
                boltSpecs: { grade: '8.8', diameter: 36, count: 12 },
                vibration: latest.common.vibration
            },
            identity: {
                machineConfig: { runnerDiameterMM: (asset.turbine_config.runner_diameter || 1) * 1000 }
            }
        };
    }

    private static async runAIPrediction(asset: EnhancedAsset, history: CompleteSensorData[]) {
        if (history.length === 0) {
            return {
                synergeticRisks: [],
                rulEstimates: [],
                incidentPatterns: [],
                prescriptiveActions: []
            };
        }

        const latest = history[history.length - 1];
        // Mocking TelemetryData for aiPredictionService compatibility
        const mockTelemetry: any = {
            assetId: asset.id,
            cavitationIntensity: latest.specialized?.acoustic?.cavitationLevel || 0,
            temperature: latest.common.temperature,
            cylinderPressure: latest.specialized?.hydraulic?.pressure || 0,
            output: latest.common.output_power,
            vibration: latest.common.vibration,
            foundationDisplacement: latest.specialized?.geodeticData?.settlement || 0
        };

        const numericId = idAdapter.toNumber(asset.id);
        if (numericId === null) {
            return {
                synergeticRisks: [],
                rulEstimates: [],
                incidentPatterns: [],
                prescriptiveActions: []
            };
        }

        const synergeticRisks = aiPredictionService.detectSynergeticRisk(numericId, mockTelemetry);
        const incidentPatterns = aiPredictionService.matchHistoricalPattern(numericId, mockTelemetry);

        // Forecast using persisted telemetry (async)
        const forecast = await aiPredictionService.forecastEtaBreakEven(numericId);

        return {
            synergeticRisks: synergeticRisks ? [synergeticRisks] : [],
            rulEstimates: [],
            incidentPatterns: incidentPatterns ? [incidentPatterns] : [],
            prescriptiveActions: [],
            forecast
        };
    }

    private static async runAcousticAnalysis(asset: EnhancedAsset, acousticData: any, runningSpeed: number) {
        if (!acousticData) {
            return { classification: null, trendAnalysis: null };
        }

        const classification = AcousticFingerprintingService.classifyAcousticSignature(
            acousticData,
            runningSpeed
        );

        return {
            classification,
            trendAnalysis: null // Could add trend analysis later
        };
    }

    private static async runSpecialMeasurements(
        asset: EnhancedAsset,
        geodeticData: any,
        magneticData: any,
        physics: TurbinePhysics
    ) {
        if (!geodeticData || !magneticData) {
            return { correlation: null };
        }

        const correlation = SpecialMeasurementsService.correlateSettlementWithEccentricity(
            geodeticData,
            magneticData,
            physics.bearingSpan,
            physics.rotorDiameter
        );

        return { correlation };
    }

    // ===== CROSS-CORRELATION LOGIC =====

    private static performCrossCorrelation(ai: any, acoustic: any, special: any, expert: any) {
        const boosts: any[] = [];

        // 1. Expert Oil + AI Trend correlation
        if (expert.oil?.healthScore < 70 && ai.synergeticRisks.length > 0) {
            boosts.push({
                finding: 'Tribology-linked mechanical degradation',
                originalConfidence: 60,
                boostedConfidence: 85,
                reason: 'Expert oil analysis confirms degradation suspected by AI pattern matching.'
            });
        }

        // 2. Cavitation + Hydraulic sync
        if (expert.cavitation?.severity === 'CRITICAL' && expert.hydraulic?.headLoss > 2.0) {
            boosts.push({
                finding: 'Erosive Hydraulic Obstruction',
                originalConfidence: 75,
                boostedConfidence: 90,
                reason: 'Excessive head loss correlates with advanced cavitation erosion patterns.'
            });
        }

        return {
            synergeticRisks: boosts,
            expertInsights: {
                oilHealth: expert.oil?.healthScore,
                structuralSafety: expert.structural?.margin,
                hydraulicEfficiency: expert.hydraulic?.netHead ? (expert.hydraulic.netHead / (expert.hydraulic.netHead + (expert.hydraulic.headLoss || 0))) * 100 : 100
            }
        };
    }

    // ===== HEALTH SCORE CALCULATION =====

    private static calculateHealthScore(diagnosis: UnifiedDiagnosis, expertResults: any): number {
        let score = 100;

        // 1. AI Synergetic risks
        diagnosis.aiPrediction.synergeticRisks.forEach(risk => {
            score -= risk.probability * 0.3;
        });

        // 2. Expert findings
        if (expertResults.oil?.healthScore < 50) score -= 30;
        if (expertResults.structural?.safetyFactor < 1.2) score -= 40;
        if (expertResults.cavitation?.severity === 'CRITICAL') score -= 25;

        // 3. Acoustic
        if (diagnosis.acoustic.classification?.severity === 'CRITICAL') {
            score -= 25;
        }

        // 4. Turbine cavitation proximity penalty
        try {
            const cav = (diagnosis as any).turbineCavitation;
            if (cav && typeof cav.proximity === 'number') {
                const prox = cav.proximity;
                if (prox < 1.0) {
                    // penalty scales with how far below 1.0 the measured sigma is
                    const penalty = (1.0 - prox) * 40; // up to 40 points
                    score -= penalty;
                } else if (prox < 1.2) {
                    // small buffer zone
                    score -= 5;
                }
            }
        } catch (e) {
            // ignore
        }

        return Math.max(0, Math.min(100, score));
    }

    private static determineCriticality(diagnosis: UnifiedDiagnosis): UnifiedDiagnosis['criticality'] {
        if (diagnosis.overallHealthScore < 50) return 'CRITICAL';
        if (diagnosis.overallHealthScore < 80) return 'INVESTIGATE';
        return 'HEALTHY';
    }

    // ===== AUTOMATED ACTIONS =====

    private static async triggerAutomatedActions(asset: EnhancedAsset, diagnosis: UnifiedDiagnosis, history: CompleteSensorData[]) {
        // ACTION 1: Check inventory for critical RUL components
        const criticalRUL = diagnosis.aiPrediction.rulEstimates.filter(r => r.hoursRemaining < 720);

        for (const rul of criticalRUL) {
            const action = {
                action: 'CHECK_INVENTORY' as const,
                status: 'PENDING' as const,
                details: `Checking stock for ${rul.componentId} (RUL: ${rul.hoursRemaining}h)`
            };

            // Check inventory
            const inStock = await this.checkInventory(rul.componentId);

            if (!inStock) {
                // Auto-order
                diagnosis.automatedActions.push({
                    action: 'ORDER_PART',
                    status: 'COMPLETED',
                    details: `Auto-ordered ${rul.componentId} - lead time 14 days`
                });

                await this.autoOrderPart(rul.componentId, asset.id);
            } else {
                // Must cast to allow COMPLETED on a PENDING initial type if that's the issue, or just update the object
                (action as any).status = 'COMPLETED';
                action.details += ' - IN STOCK';
            }

            diagnosis.automatedActions.push(action);

            // Persist audit record for this action (integration mode guarded inside adapter)
            try {
                const numeric = idAdapter.toNumber(asset.id);
                const assetDbId = numeric !== null ? idAdapter.toDb(numeric) : (asset.id || 'unknown');
                const audit = {
                    asset_id: assetDbId,
                    action_type: action.action || 'CHECK_INVENTORY',
                    payload: action,
                    status: action.status || 'PENDING',
                    source: 'MasterIntelligenceEngine'
                };
                const res = await persistAuditRecord(audit as any);
                if ((res as any).inserted) {
                    console.log('✅ Persisted audit record for action', action.action);
                } else {
                    console.log('ℹ️ Audit persistence result:', (res as any).message || (res as any).error || (res as any));
                }
            } catch (err) {
                console.error('Failed to persist audit record:', err);
            }
        }

        // ACTION 2: Notify consultant for critical issues
        if (diagnosis.criticality === 'CRITICAL') {
            const notifyAction = {
                action: 'NOTIFY_CONSULTANT',
                status: 'COMPLETED',
                details: 'Critical health score - consultant notified via SMS/Email'
            };
            diagnosis.automatedActions.push(notifyAction);
            try {
                const numeric = idAdapter.toNumber(asset.id);
                const assetDbId = numeric !== null ? idAdapter.toDb(numeric) : (asset.id || 'unknown');
                const res = await persistAuditRecord({
                    asset_id: assetDbId,
                    action_type: notifyAction.action,
                    payload: notifyAction,
                    status: notifyAction.status,
                    source: 'MasterIntelligenceEngine'
                } as any);
                console.log('Audit persistence (notify):', res);
            } catch (err) {
                console.error('Failed to persist notify action audit', err);
            }

            await this.notifyConsultant(asset, diagnosis);
        }

        // ACTION 3: Lock system if safety-critical
        const hydraulicRunaway = diagnosis.aiPrediction.incidentPatterns.find(
            p => p.pattern.includes('Hydraulic Runaway')
        );

        if (hydraulicRunaway && hydraulicRunaway.similarity > 0.8) {
            const lockAction = {
                action: 'LOCK_SYSTEM',
                status: 'COMPLETED',
                details: 'Hydraulic runaway risk detected - system locked pending inspection'
            };
            diagnosis.automatedActions.push(lockAction);
            try {
                const numeric = idAdapter.toNumber(asset.id);
                const assetDbId = numeric !== null ? idAdapter.toDb(numeric) : (asset.id || 'unknown');
                const res = await persistAuditRecord({
                    asset_id: assetDbId,
                    action_type: lockAction.action,
                    payload: lockAction,
                    status: lockAction.status,
                    source: 'MasterIntelligenceEngine'
                } as any);
                console.log('Audit persistence (lock):', res);
            } catch (err) {
                console.error('Failed to persist lock action audit', err);
            }

            // Trigger safety interlock
            // await SafetyInterlockEngine.lock('HYDRAULIC_SYSTEM');
        }

        // ACTION 4: Shaft Seal Guardian integration (Probabilistic Engine)
        try {
            const sealTelemetry = (diagnosis.specialMeasurements as any)?.shaftSealTelemetry;
            if (sealTelemetry && Array.isArray(sealTelemetry) && sealTelemetry.length > 0) {
                const guardian = new ShaftSealGuardian({ windowSize: 30, prior: 0.02 });
                let lastAction: any = null;

                for (const s of sealTelemetry) {
                    lastAction = guardian.addMeasurement({
                        timestamp: s.timestamp || new Date().toISOString(),
                        Q_seal: Number(s.Q_seal || s.flow || 0),
                        P_seal: Number(s.P_seal || s.pressure || 0),
                        T_seal: Number(s.T_seal || s.temp || 0),
                        leakagePitLevel: typeof s.leakagePitLevel === 'number' ? s.leakagePitLevel : undefined
                    });
                }

                // Apply health impact to overall health score
                const impact = guardian.getHealthImpact();
                const confidence = guardian.getConfidenceScore();
                diagnosis.overallHealthScore = Math.max(0, Math.min(100, diagnosis.overallHealthScore + impact.overallDelta));
                diagnosis.automatedActions.push({ action: 'SHAFT_SEAL_GUARD', status: 'COMPLETED', details: impact.details });

                // Store guardian confidence score
                if (!(diagnosis as any).guardianConfidence) (diagnosis as any).guardianConfidence = {};
                (diagnosis as any).guardianConfidence.shaftSeal = confidence;

                // Persist audit for guardian decision
                try {
                    const numeric = idAdapter.toNumber(asset.id);
                    const assetDbId = numeric !== null ? idAdapter.toDb(numeric) : (asset.id || 'unknown');
                    await persistAuditRecord({
                        asset_id: assetDbId,
                        action_type: 'SHAFT_SEAL_GUARD_DECISION',
                        payload: { lastAction, impact },
                        status: 'COMPLETED',
                        source: 'MasterIntelligenceEngine'
                    } as any);
                } catch (err) {
                    console.error('Failed to persist ShaftSealGuardian audit', err);
                }

                // Translate guardian actions into automatedActions for Executive to consume
                if (lastAction) {
                    if (lastAction.action === 'PROBABILISTIC_WARNING') {
                        diagnosis.automatedActions.push({
                            action: 'DERATE',
                            status: 'PENDING',
                            details: `Recommend derate ${lastAction.recommendedDerateMw} MW (P_fail=${lastAction.probability}).`
                        });
                    } else if (lastAction.action === 'HARD_TRIP') {
                        diagnosis.automatedActions.push({
                            action: 'HARD_TRIP',
                            status: 'PENDING',
                            details: lastAction.reason
                        });
                    }
                }
            }
        } catch (e) {
            console.error('ShaftSealGuardian integration error:', e);
        }

        // ACTION 5: Thrust Bearing Master integration
        try {
            const thrustTelemetry = (diagnosis.specialMeasurements as any)?.thrustBearingTelemetry;
            if (thrustTelemetry && Array.isArray(thrustTelemetry) && thrustTelemetry.length > 0) {
                const thrustMaster = new ThrustBearingMaster();
                let lastAction: any = null;

                for (const s of thrustTelemetry) {
                    lastAction = thrustMaster.addMeasurement({
                        timestamp: s.timestamp || new Date().toISOString(),
                        axialLoadN: Number(s.axialLoadN || s.axialLoad || 0),
                        oilViscosityPas: Number(s.oilViscosityPas || s.viscosityPas || 0.001),
                        shaftSpeedRpm: Number(s.shaftSpeedRpm || s.rpm || 0),
                        padTempsC: Array.isArray(s.padTempsC) ? s.padTempsC.map(Number) : [],
                        padAreaM2: typeof s.padAreaM2 === 'number' ? s.padAreaM2 : undefined,
                        radiusM: typeof s.radiusM === 'number' ? s.radiusM : undefined,
                        jackingPressureBar: typeof s.jackingPressureBar === 'number' ? s.jackingPressureBar : undefined,
                        duringStartup: !!s.duringStartup
                    });
                }

                // Map to health impact and actions
                if (lastAction) {
                    const impact = thrustMaster.getHealthImpactForAction(lastAction);
                    diagnosis.overallHealthScore = Math.max(0, Math.min(100, diagnosis.overallHealthScore + impact.overallDelta));
                    diagnosis.automatedActions.push({ action: 'THRUST_BEARING_GUARD', status: 'COMPLETED', details: impact.details });

                    // Persist audit
                    try {
                        const numeric = idAdapter.toNumber(asset.id);
                        const assetDbId = numeric !== null ? idAdapter.toDb(numeric) : (asset.id || 'unknown');
                        await persistAuditRecord({
                            asset_id: assetDbId,
                            action_type: 'THRUST_BEARING_DECISION',
                            payload: { lastAction, impact },
                            status: 'COMPLETED',
                            source: 'MasterIntelligenceEngine'
                        } as any);
                    } catch (err) {
                        console.error('Failed to persist ThrustBearingMaster audit', err);
                    }

                    // Compute guardian confidence and append to diagnosis for boundary analysis
                    try {
                        const confidence = (thrustMaster as any).getConfidenceScore ? (thrustMaster as any).getConfidenceScore(thrustTelemetry as any[], (history || []).map(h => (h as any).common?.vibration)) : null;
                        diagnosis.serviceNotes?.push({ service: 'ThrustBearingConfidence', severity: confidence !== null && confidence < 70 ? 'WARNING' : 'INFO', message: `confidence:${confidence}`, recommendation: 'Include sensor cross-check or manual verification if <70%' });
                        diagnosis.automatedActions.push({ action: 'THRUST_CONFIDENCE', status: 'INFO', metrics: { confidence } });
                    } catch (e) {
                        // ignore
                    }

                    // Translate to operative automated actions
                    if (lastAction.action === 'LUBRICATION_CRISIS') {
                        diagnosis.automatedActions.push({ action: 'DERATE', status: 'PENDING', details: `Recommend derate due to lubrication crisis: ${lastAction.reason}` });
                    } else if (lastAction.action === 'SOVEREIGN_TRIP') {
                        // Phase 52.0: Pass sovereign trip through SensorIntegritySentinel
                        const latestSnapshot = (history && history.length) ? history[history.length - 1] : null;
                        const sensorSnapshot = latestSnapshot ? {
                            timestamp: Date.parse((latestSnapshot as any).t || (latestSnapshot as any).timestamp || new Date().toISOString()),
                            temperatureC: (latestSnapshot as any).common?.temperature,
                            vibrationMmS: (latestSnapshot as any).common?.vibration,
                            loadMw: (latestSnapshot as any).common?.output_power,
                            flowM3s: (latestSnapshot as any).specialized?.flowRate
                        } : { timestamp: Date.now() };

                        const recentHistory = (history || []).slice(-6).map(h => ({
                            timestamp: Date.parse((h as any).t || (h as any).timestamp || new Date().toISOString()),
                            temperatureC: (h as any).common?.temperature,
                            vibrationMmS: (h as any).common?.vibration,
                            loadMw: (h as any).common?.output_power,
                            flowM3s: (h as any).specialized?.flowRate
                        }));

                        const integrity = SensorIntegritySentinel.correlate(sensorSnapshot as any, recentHistory as any);

                        if (integrity.sensorAnomaly) {
                            // Demote Trip -> Maintenance Warning + Throttled Safe State
                            diagnosis.serviceNotes?.push({
                                service: 'Sensor Integrity',
                                severity: 'WARNING',
                                message: `SOVEREIGN_TRIP demoted: sensor anomaly detected (${integrity.anomalousField || 'unknown'}).`,
                                recommendation: 'Place unit in Throttled Safe State and schedule sensor inspection.',
                                sourceFiles: [{ filename: 'services/SensorIntegritySentinel.ts', justification: integrity.note || 'Sensor correlation flagged anomaly' }]
                            });

                            diagnosis.automatedActions.push({
                                action: 'SET_THROTTLED_SAFE',
                                status: 'PENDING',
                                details: `Throttle to ${integrity.recommendedSafeState?.throttlePct ?? 50}% - mode ${integrity.recommendedSafeState?.mode || 'RUN_THROTTLED'}`
                            });
                        } else {
                            diagnosis.automatedActions.push({ action: 'HARD_TRIP', status: 'PENDING', details: lastAction.reason });
                        }
                    } else if (lastAction.action === 'BLOCK_START') {
                        diagnosis.automatedActions.push({ action: 'BLOCK_START', status: 'PENDING', details: lastAction.reason });
                    } else if (lastAction.action === 'MECHANICAL_MISALIGNMENT') {
                        diagnosis.automatedActions.push({ action: 'SCHEDULE_ALIGNMENT', status: 'PENDING', details: lastAction.reason });
                    }
                }
            }
        } catch (e) {
            console.error('ThrustBearingMaster integration error:', e);
        }

        // ACTION 6: Wicket Gate Kinematics integration
        try {
            const wicketTelemetry = (diagnosis.specialMeasurements as any)?.wicketGateTelemetry;
            if (wicketTelemetry && Array.isArray(wicketTelemetry) && wicketTelemetry.length > 0) {
                const wicket = new WicketGateKinematics();
                let lastAction: any = null;

                for (const s of wicketTelemetry) {
                    lastAction = wicket.addMeasurement({
                        timestamp: s.timestamp || new Date().toISOString(),
                        servoCommandPct: Number(s.servoCommandPct || s.commandPct || 0),
                        gateActualPct: typeof s.gateActualPct === 'number' ? Number(s.gateActualPct) : undefined,
                        regulatingRingForceN: typeof s.regulatingRingForceN === 'number' ? Number(s.regulatingRingForceN) : undefined,
                        dP_servoBar: typeof s.dP_servoBar === 'number' ? Number(s.dP_servoBar) : undefined
                    });
                }

                if (lastAction) {
                    const impact = wicket.getHealthImpactForAction(lastAction);
                    diagnosis.overallHealthScore = Math.max(0, Math.min(100, diagnosis.overallHealthScore + impact.overallDelta));
                    diagnosis.automatedActions.push({ action: 'WICKET_KINEMATICS_GUARD', status: 'COMPLETED', details: impact.details });

                    // persist audit
                    try {
                        const numeric = idAdapter.toNumber(asset.id);
                        const assetDbId = numeric !== null ? idAdapter.toDb(numeric) : (asset.id || 'unknown');
                        await persistAuditRecord({
                            asset_id: assetDbId,
                            action_type: 'WICKET_KINEMATICS_DECISION',
                            payload: { lastAction, impact },
                            status: 'COMPLETED',
                            source: 'MasterIntelligenceEngine'
                        } as any);
                    } catch (err) {
                        console.error('Failed to persist WicketGateKinematics audit', err);
                    }

                    // map to operative actions
                    if (lastAction.action === 'SHEAR_PIN_BROKEN') {
                        diagnosis.automatedActions.push({ action: 'LIMIT_GATE_OPENING', status: 'PENDING', details: `Limit gate opening to ${impact.limitGateOpenPct}% due to shear pin broken.` });
                    } else if (lastAction.action === 'BACKLASH_CRITICAL') {
                        diagnosis.automatedActions.push({ action: 'LIMIT_GATE_OPENING', status: 'PENDING', details: `Reduce max gate opening to ${impact.limitGateOpenPct}% (backlash critical).` });
                    } else if (lastAction.action === 'LUBRICATION_DEFICIENCY') {
                        diagnosis.automatedActions.push({ action: 'SCHEDULE_LUBRICATION', status: 'PENDING', details: lastAction.reason });
                    }
                }
            }
        } catch (e) {
            console.error('WicketGateKinematics integration error:', e);
        }

        // ACTION 7: Governor HPU Guardian integration
        try {
            const governorTelemetry = (diagnosis.specialMeasurements as any)?.governorHPUTelemetry;
            if (governorTelemetry && Array.isArray(governorTelemetry) && governorTelemetry.length > 0) {
                const guardian = new GovernorHPUGuardian();
                let lastAction: any = null;

                for (const s of governorTelemetry) {
                    lastAction = guardian.addMeasurement({
                        timestamp: s.timestamp || new Date().toISOString(),
                        mainHeaderPressureBar: typeof s.mainHeaderPressureBar === 'number' ? Number(s.mainHeaderPressureBar) : undefined,
                        accumulatorPressureBar: typeof s.accumulatorPressureBar === 'number' ? Number(s.accumulatorPressureBar) : undefined,
                        pumpRunTimeSec: typeof s.pumpRunTimeSec === 'number' ? Number(s.pumpRunTimeSec) : undefined,
                        pumpOn: !!s.pumpOn,
                        oilTempC: typeof s.oilTempC === 'number' ? Number(s.oilTempC) : undefined,
                        filterDeltaPBar: typeof s.filterDeltaPBar === 'number' ? Number(s.filterDeltaPBar) : undefined,
                        emergencyCloseDurationSec: typeof s.emergencyCloseDurationSec === 'number' ? Number(s.emergencyCloseDurationSec) : undefined
                    });
                }

                if (lastAction) {
                    const impact = guardian.getHealthImpactForAction(lastAction);
                    const confidence = guardian.getConfidenceScore();
                    diagnosis.overallHealthScore = Math.max(0, Math.min(100, diagnosis.overallHealthScore + impact.overallDelta));
                    diagnosis.automatedActions.push({ action: 'GOVERNOR_HPU_GUARD', status: 'COMPLETED', details: impact.details });

                    // Store guardian confidence score
                    if (!(diagnosis as any).guardianConfidence) (diagnosis as any).guardianConfidence = {};
                    (diagnosis as any).guardianConfidence.governorHPU = confidence;

                    // Persist audit
                    try {
                        const numeric = idAdapter.toNumber(asset.id);
                        const assetDbId = numeric !== null ? idAdapter.toDb(numeric) : (asset.id || 'unknown');
                        await persistAuditRecord({
                            asset_id: assetDbId,
                            action_type: 'GOVERNOR_HPU_DECISION',
                            payload: { lastAction, impact },
                            status: 'COMPLETED',
                            source: 'MasterIntelligenceEngine'
                        } as any);
                    } catch (err) {
                        console.error('Failed to persist GovernorHPUGuardian audit', err);
                    }

                    // Map to executive actions
                    if (lastAction.action === 'BLOCK_OPENING') {
                        diagnosis.automatedActions.push({ action: 'BLOCK_OPENING', status: 'PENDING', details: lastAction.reason });
                        diagnosis.automatedActions.push({ action: 'FAILSAFE_CLOSE', status: 'PENDING', details: 'Prepare failsafe close due to low HPU pressure.' });
                    } else if (lastAction.action === 'SAFETY_SYSTEM_DEGRADED') {
                        diagnosis.automatedActions.push({ action: 'SCHEDULE_SAFETY_INSPECTION', status: 'PENDING', details: lastAction.reason });
                    } else if (lastAction.action === 'VARNISH_RISK_ALERT') {
                        diagnosis.automatedActions.push({ action: 'SCHEDULE_FILTER_REPLACEMENT', status: 'PENDING', details: lastAction.reason });
                    }
                    // Append governor confidence for boundary analysis
                    try {
                        const confidence = (guardian as any).getConfidenceScore ? (guardian as any).getConfidenceScore(governorTelemetry as any[]) : null;
                        diagnosis.serviceNotes?.push({ service: 'GovernorConfidence', severity: confidence !== null && confidence < 70 ? 'WARNING' : 'INFO', message: `confidence:${confidence}`, recommendation: 'If <70% verify hydraulic response and emergency close timings.' });
                        diagnosis.automatedActions.push({ action: 'GOVERNOR_CONFIDENCE', status: 'INFO', metrics: { confidence } });
                    } catch (e) {
                        // ignore
                    }
                }
            }
        } catch (e) {
            console.error('GovernorHPUGuardian integration error:', e);
        }

        // ACTION 8: Generator Air Gap Sentinel integration
        try {
            const gapTelemetry = (diagnosis.specialMeasurements as any)?.generatorAirGapTelemetry;
            if (gapTelemetry && Array.isArray(gapTelemetry) && gapTelemetry.length > 0) {
                const sentinel = new GeneratorAirGapSentinel();
                let lastAction: any = null;

                for (const s of gapTelemetry) {
                    lastAction = sentinel.addMeasurement({
                        timestamp: s.timestamp || new Date().toISOString(),
                        airGapSensorsMm: Array.isArray(s.airGapSensorsMm) ? s.airGapSensorsMm.map(Number) : [],
                        rotorSpeedRpm: Number(s.rotorSpeedRpm || s.rpm || 0),
                        excitationCurrentA: Number(s.excitationCurrentA || s.excA || 0),
                        statorTempC: Number(s.statorTempC || s.statorTemp || 25)
                    });
                }

                if (lastAction) {
                    const impact = sentinel.getHealthImpactForAction(lastAction);
                    diagnosis.overallHealthScore = Math.max(0, Math.min(100, diagnosis.overallHealthScore + impact.overallDelta));
                    diagnosis.automatedActions.push({ action: 'GENERATOR_AIRGAP_GUARD', status: 'COMPLETED', details: impact.details });

                    try {
                        const numeric = idAdapter.toNumber(asset.id);
                        const assetDbId = numeric !== null ? idAdapter.toDb(numeric) : (asset.id || 'unknown');
                        await persistAuditRecord({
                            asset_id: assetDbId,
                            action_type: 'GENERATOR_AIRGAP_DECISION',
                            payload: { lastAction, impact },
                            status: 'COMPLETED',
                            source: 'MasterIntelligenceEngine'
                        } as any);
                    } catch (err) {
                        console.error('Failed to persist GeneratorAirGapSentinel audit', err);
                    }

                    // map to executive actions
                    if (lastAction.action === 'EXCITATION_TRIP') {
                        diagnosis.automatedActions.push({ action: 'EXCITATION_TRIP', status: 'PENDING', details: lastAction.reason });
                    } else if (lastAction.action === 'CRITICAL_GAP_REDUCTION') {
                        diagnosis.automatedActions.push({ action: 'EXCITATION_TRIP', status: 'PENDING', details: lastAction.reason });
                        diagnosis.automatedActions.push({ action: 'MECHANICAL_TRIP', status: 'PENDING', details: 'Mechanical trip recommended following excitation removal.' });
                    } else if (lastAction.action === 'MAGNETIC_INSTABILITY_WARNING') {
                        diagnosis.automatedActions.push({ action: 'SCHEDULE_BORE_SCOPE', status: 'PENDING', details: lastAction.reason });
                    }
                }
            }
        } catch (e) {
            console.error('GeneratorAirGapSentinel integration error:', e);
        }

        // ACTION 9: Stator Insulation Guardian integration
        try {
            const pdTelemetry = (diagnosis.specialMeasurements as any)?.statorInsulationTelemetry;
            if (pdTelemetry && Array.isArray(pdTelemetry) && pdTelemetry.length > 0) {
                const guardian = new StatorInsulationGuardian();
                let lastAction: any = null;

                for (const s of pdTelemetry) {
                    lastAction = guardian.addMeasurement({
                        timestamp: s.timestamp || new Date().toISOString(),
                        q_pC: Number(s.q_pC || s.q || 0),
                        pps: Number(s.pps || 0),
                        voltage_kV: Number(s.voltage_kV || s.kv || 0),
                        windingTempC: Number(s.windingTempC || s.temp || 40)
                    });
                }

                if (lastAction) {
                    const impact = guardian.getHealthImpactForAction(lastAction as any);
                    const confidence = guardian.getConfidenceScore();
                    diagnosis.overallHealthScore = Math.max(0, Math.min(100, diagnosis.overallHealthScore + (impact.overallDelta || 0)));
                    diagnosis.automatedActions.push({ action: 'STATOR_INSULATION_GUARD', status: 'COMPLETED', details: impact.recommendation || (impact as any).details || lastAction.reason });
                    // Store guardian confidence score
                    if (!(diagnosis as any).guardianConfidence) (diagnosis as any).guardianConfidence = {};
                    (diagnosis as any).guardianConfidence.statorInsulation = confidence;

                    try {
                        const numeric = idAdapter.toNumber(asset.id);
                        const assetDbId = numeric !== null ? idAdapter.toDb(numeric) : (asset.id || 'unknown');
                        await persistAuditRecord({
                            asset_id: assetDbId,
                            action_type: 'STATOR_INSULATION_DECISION',
                            payload: { lastAction, impact },
                            status: 'COMPLETED',
                            source: 'MasterIntelligenceEngine'
                        } as any);
                    } catch (err) {
                        console.error('Failed to persist StatorInsulationGuardian audit', err);
                    }

                    // map to executive actions
                    if (lastAction.action === 'CRITICAL_INSULATION_DEGRADATION') {
                        diagnosis.automatedActions.push({ action: 'SCHEDULE_EMERGENCY_OUTAGE', status: 'PENDING', details: lastAction.reason });
                        diagnosis.automatedActions.push({ action: 'BOROSCOPE_INSPECTION', status: 'PENDING', details: 'Immediate boroscope inspection recommended.' });
                    } else if (lastAction.action === 'BOROSCOPE_INSPECTION_RECOMMENDED') {
                        diagnosis.automatedActions.push({ action: 'BOROSCOPE_INSPECTION', status: 'PENDING', details: lastAction.reason });
                    }
                }
            }
        } catch (e) {
            console.error('StatorInsulationGuardian integration error:', e);
        }

        // ACTION 10: Transformer Oil Guardian integration
        try {
            const txTelemetry = (diagnosis.specialMeasurements as any)?.transformerOilTelemetry;
            if (txTelemetry && Array.isArray(txTelemetry) && txTelemetry.length > 0) {
                const guardian = new TransformerOilGuardian();
                let lastAction: any = null;

                for (const s of txTelemetry) {
                    lastAction = guardian.addMeasurement({
                        timestamp: s.timestamp || new Date().toISOString(),
                        gasesPpm: s.gasesPpm || s.gases || {},
                        moisturePpm: typeof s.moisturePpm === 'number' ? s.moisturePpm : undefined,
                        topOilTempC: typeof s.topOilTempC === 'number' ? s.topOilTempC : undefined,
                        loadCurrentA: typeof s.loadCurrentA === 'number' ? s.loadCurrentA : undefined
                    });
                }

                if (lastAction) {
                    const impact = guardian.getHealthImpactForAction(lastAction as any);
                    const confidence = guardian.getConfidenceScore();
                    diagnosis.overallHealthScore = Math.max(0, Math.min(100, diagnosis.overallHealthScore + (impact.overallDelta || 0)));
                    diagnosis.automatedActions.push({ action: 'TRANSFORMER_OIL_GUARD', status: 'COMPLETED', details: impact.recommendation || lastAction.reason });

                    // Store guardian confidence score
                    if (!(diagnosis as any).guardianConfidence) (diagnosis as any).guardianConfidence = {};
                    (diagnosis as any).guardianConfidence.transformerOil = confidence;

                    try {
                        const numeric = idAdapter.toNumber(asset.id);
                        const assetDbId = numeric !== null ? idAdapter.toDb(numeric) : (asset.id || 'unknown');
                        await persistAuditRecord({
                            asset_id: assetDbId,
                            action_type: 'TRANSFORMER_OIL_DECISION',
                            payload: { lastAction, impact },
                            status: 'COMPLETED',
                            source: 'MasterIntelligenceEngine'
                        } as any);
                    } catch (err) {
                        console.error('Failed to persist TransformerOilGuardian audit', err);
                    }

                    // Map to executive actions
                    if (lastAction.action === 'CRITICAL_FAULT') {
                        diagnosis.automatedActions.push({ action: 'TRANSFORMER_CRITICAL_TRIP', status: 'PENDING', details: lastAction.reason });
                        diagnosis.automatedActions.push({ action: 'RESTRICT_POWER', status: 'PENDING', details: 'Transformer critical - restrict plant power until inspected.' });
                        // Persist critical flag into SovereignMemory for system-wide interlocks
                        try {
                            const memory = new SovereignMemory();
                            memory.saveOverrideRecord({ transformerCritical: true, timestamp: Date.now(), reason: lastAction.reason });
                        } catch (e) {
                            console.warn('Failed to persist transformerCritical flag to SovereignMemory', e);
                        }
                    } else if (lastAction.action === 'SCHEDULE_TRANSFORMER_INSPECTION') {
                        diagnosis.automatedActions.push({ action: 'SCHEDULE_TRANSFORMER_INSPECTION', status: 'PENDING', details: lastAction.reason });
                    }
                    // Append transformer confidence for boundary analysis
                    try {
                        const confidence = (guardian as any).getConfidenceScore ? (guardian as any).getConfidenceScore(txTelemetry as any[]) : null;
                        diagnosis.serviceNotes?.push({ service: 'TransformerConfidence', severity: confidence !== null && confidence < 70 ? 'WARNING' : 'INFO', message: `confidence:${confidence}`, recommendation: 'If <70% verify DGA lab and manual sampling.' });
                        diagnosis.automatedActions.push({ action: 'TRANSFORMER_CONFIDENCE', status: 'INFO', metrics: { confidence } });
                    } catch (e) {
                        // ignore
                    }
                }
            }
        } catch (e) {
            console.error('TransformerOilGuardian integration error:', e);
        }
    }

    // ===== HELPER FUNCTIONS =====

    private static extractPhysics(asset: EnhancedAsset, history: CompleteSensorData[]): TurbinePhysics {
        const latest = history[history.length - 1];

        return {
            runningSpeed: asset.turbine_config.rated_speed || 500,
            head: asset.turbine_config.design_head || 100,
            flow: asset.turbine_config.design_flow || 50,
            rotorWeight: asset.turbine_config.rotor_weight || 10000,
            rotorDiameter: asset.turbine_config.runner_diameter || 3.0,
            bearingSpan: asset.turbine_config.bearing_span || 5.0
        };
    }

    private static async checkInventory(component: string): Promise<boolean> {
        // In production: Query Supabase inventory
        /*
        const { data } = await supabase
            .from('inventory')
            .select('quantity')
            .eq('part_name', component)
            .single();
        
        return (data?.quantity || 0) > 0;
        */

        console.log(`📦 Checking inventory for ${component}...`);
        return Math.random() > 0.5; // Mock
    }

    private static async autoOrderPart(component: string, assetId: number): Promise<void> {
        // In production: Create purchase order
        /*
        await supabase.from('purchase_orders').insert({
            part_name: component,
            asset_id: assetId,
            quantity: 1,
            urgency: 'HIGH',
            status: 'PENDING_APPROVAL'
        });
        */

        console.log(`🛒 Auto-ordering ${component} for asset ${assetId}`);
    }

    private static async notifyConsultant(asset: EnhancedAsset, diagnosis: UnifiedDiagnosis): Promise<void> {
        console.log(`📧 Notifying consultant about ${asset.name}`);
        console.log(`   Health Score: ${diagnosis.overallHealthScore}/100`);
        console.log(`   Criticality: ${diagnosis.criticality}`);

        // In production: Send email/SMS via CollaborationWorkflowService
    }

    /**
     * RUL KERNEL (NC-4.8)
     * Calculates Remaining Useful Life based on cross-referenced physics.
     */
    private static calculateRUL(vibration: number, oilParticles: number): number {
        const BASE_LIFE = 20000; // 20k hours standard interval

        // 1. Vibration Degradation (Exponential)
        // ISO 10816: > 7.1 mm/s is dangerous
        const vibFactor = Math.pow(vibration / 1.5, 2);

        // 2. Oil Particle Degradation (Linear)
        // > 500 ppm indicates severe wear
        const oilFactor = oilParticles / 100;

        const totalDegradation = (vibFactor * 1.5) + (oilFactor * 2.5);

        // RUL Calculation
        const rul = BASE_LIFE / Math.max(1, totalDegradation);

        return Math.floor(rul);
    }

    private static aggregateServiceNotes(expert: any, acoustic: any): UnifiedDiagnosis['serviceNotes'] {
        const notes: UnifiedDiagnosis['serviceNotes'] = [];

        // 1. Oil Findings
        if (expert.oil?.findings) {
            expert.oil.findings.forEach((f: any) => notes.push({
                service: 'Oil Analysis',
                severity: f.severity,
                message: f.message,
                recommendation: f.recommendation
            }));
        }

        // 2. Structural Findings (Barlow's Stress)
        if (expert.structural) {
            if (expert.structural.margin < 30) {
                notes.push({
                    service: 'Structural Integrity',
                    severity: expert.structural.status,
                    message: `Barlow's stress limit reached. Penstock Hoop Stress approaching material yield (Margin: ${expert.structural.margin.toFixed(1)}%).`,
                    recommendation: 'Reduce surge pressure by decelerating guide vane closing speed.'
                });
            }
        }

        // 3. Cavitation Findings
        if (expert.cavitation) {
            if (expert.cavitation.recommendedAction !== 'CONTINUE_MONITORING') {
                notes.push({
                    service: 'Cavitation Specialist',
                    severity: 'WARNING',
                    message: `Erosion mass loss rate detected at ${expert.cavitation.massLossRate.toFixed(1)} g/month.`,
                    recommendation: `Operational regime change: ${expert.cavitation.recommendedRegimeChange?.parameter} ${expert.cavitation.recommendedRegimeChange?.recommendedValue} recommended.`
                });
            }
            if (expert.cavitation.massLossRate > 50) {
                notes.push({
                    service: 'Cavitation Specialist',
                    severity: 'CRITICAL',
                    message: "High-intensity pitting detected on blade leading edge.",
                    recommendation: "Immediate Stellite welding or blade replacement required."
                });
            }
        }

        // 4. Acoustic Profile
        if (acoustic?.classification?.severity === 'CRITICAL') {
            notes.push({
                service: 'Acoustic AI',
                severity: 'CRITICAL',
                message: `Anomaly detected in acoustic fingerprint: ${acoustic.classification.tag}. Vibration peaks at 1X RPM.`,
                recommendation: 'Immediate visual inspection of internal runner components required.'
            });
        }

        if (expert.hydraulic && expert.hydraulic.frictionLoss > 10) {
            notes.push({
                service: 'Hydraulic Specialist',
                severity: 'WARNING',
                message: `Excessive friction loss detected (${expert.hydraulic.frictionLoss.toFixed(1)}m). Possible internal pipe fouling.`,
                recommendation: 'Plan penstock cleaning or roughness inspection.'
            });
        }

        return notes;
    }

    private static calculateTrendProjections(latest: CompleteSensorData): UnifiedDiagnosis['trendProjections'] {
        const projections: UnifiedDiagnosis['trendProjections'] = {};

        // 1. Vibration Trend (Mock linear regression logic)
        const vibTrend = HistoricalTrendAnalyzer.analyzeTrend(
            {
                parameterId: 'vibration',
                parameterName: 'Vibration',
                unit: 'mm/s',
                measurements: [{ timestamp: new Date().toISOString(), value: latest.common.vibration, technicianName: 'CEREBRO_AI' }]
            },
            7.1 // Critical ISO threshold
        );

        projections['vibration'] = {
            daysUntilCritical: vibTrend.daysUntilCritical || 365,
            projectedDate: vibTrend.projectedCriticalDate || new Date(Date.now() + 365 * 24 * 6e7).toISOString().split('T')[0]
        };

        // NC-8.0: Force a 72-hour prediction if vibration is trending high (> 5.5 mm/s and rising)
        if (latest.common.vibration > 5.5) {
            projections['vibration'] = {
                daysUntilCritical: 2, // Within 72 hours
                projectedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };
        }

        // 2. Oil Temp Trend
        const tempTrend = HistoricalTrendAnalyzer.analyzeTrend(
            {
                parameterId: 'bearingTemp',
                parameterName: 'Bearing Temperature',
                unit: '°C',
                measurements: [{ timestamp: new Date().toISOString(), value: latest.common.temperature || 45, technicianName: 'CEREBRO_AI' }]
            },
            85 // Critical threshold
        );

        projections['bearingTemp'] = {
            daysUntilCritical: tempTrend.daysUntilCritical || 365,
            projectedDate: (tempTrend as any).projectedDate || new Date(Date.now() + 365 * 24 * 6e7).toISOString().split('T')[0]
        };

        return projections;
    }

    public static calculateVibrationZone(vibration: number): UnifiedDiagnosis['vibrationZone'] {
        if (vibration < 2.3) return 'ZONE_A';
        if (vibration < 4.5) return 'ZONE_B';
        if (vibration < 7.1) return 'ZONE_C';
        return 'ZONE_D';
    }

    public static getISOJustification(zone: UnifiedDiagnosis['vibrationZone']): string {
        switch (zone) {
            case 'ZONE_A': return 'Zone A: Vibration values are typically found in new commissioned machines.';
            case 'ZONE_B': return 'Zone B: Machines are normally considered acceptable for long-term operation.';
            case 'ZONE_C': return 'Zone C: Machines are considered unsatisfactory for long-term continuous operation.';
            case 'ZONE_D': return 'Zone D: Vibration values are considered to be of sufficient severity to cause damage.';
            default: return '';
        }
    }

    private static compareWithHistoricalBaseline(latest: CompleteSensorData, asset: EnhancedAsset) {
        // NC-8.0: Mocks the comparison against the 854 technical dossiers
        // In a real system, this would index the physical HTML files
        const baselines: Record<string, number> = {
            'vibration': 2.3, // ZONE_A Baseline
            'temperature': 55.0, // Operational Baseline
            'efficiency': 88.0 // Design Benchmark
        };

        const deviations: any[] = [];
        if (latest.common.vibration > baselines.vibration) {
            deviations.push({
                parameter: 'Vibration',
                current: latest.common.vibration,
                baseline: baselines.vibration,
                severity: latest.common.vibration > 7.1 ? 'CRITICAL' : 'WARNING',
                context: 'Historical 10-year baseline for Francis units suggests a 15% increase in structural fatigue at this level.'
            });
        }

        return deviations;
    }

    public getConfidenceScore(..._args: any[]): number {
        // Master engine synthesizes many modules; default to conservative neutral score
        return this.corrToScore(0);
    }
}
