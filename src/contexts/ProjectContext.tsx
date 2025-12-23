// Project Context - "CEREBRO" Master State - Final Unified
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PhysicsEngine } from '../services/PhysicsEngine';
import {
    TechnicalProjectState,
    DEFAULT_TECHNICAL_STATE,
    SiteConditions,
    PenstockSpecs,
    MechanicalDetails,
    Tolerances,
    FinancialSettings
} from '../models/TechnicalSchema';
import { InspectionImage, SiteParameters } from '../services/StrategicPlanningService';
import { AssetIdentity } from '../types/assetIdentity';
import { AIFinding } from '../types/aiFinding';
import { MeasurementHistory, HistoricalMeasurement, PrecisionMeasurement } from '../types/trends';

// --- FORCE IMPORT OF ALL ENGINEERING MODULES ---
import { HistoricalTrendAnalyzer } from '../services/HistoricalTrendAnalyzer';
import { FineEngineeringLogService } from '../services/FineEngineeringLogService';
import { ServiceChecklistEngine } from '../services/ServiceChecklistEngine';
import { ExpertDiagnosisEngine } from '../services/ExpertDiagnosisEngine';
import { PerformanceGuardService, OperatingPoint, WaterHammerSafeLimits } from '../services/PerformanceGuardService';
import { SafetyInterlockEngine } from '../services/SafetyInterlockEngine';
import { OilAnalysisService } from '../services/OilAnalysisService';
import { CavitationErosionService } from '../services/CavitationErosionService';
import { GalvanicCorrosionService } from '../services/GalvanicCorrosionService';
import { AcousticFingerprintingService } from '../services/AcousticFingerprintingService';
import { VisionAnalysisService } from '../services/VisionAnalysisService';
import { VisualInspectionService } from '../services/VisualInspectionService';
import { ParticleAnalysisService } from '../services/ParticleAnalysisService';
import { MasterIntelligenceEngine } from '../services/MasterIntelligenceEngine';
import { DecisionEngine } from '../services/DecisionEngine';
import { DrTurbineAI, ActionCard } from '../services/DrTurbineAI';
import { MockSCADAController } from '../services/MockSCADAController';

// MASTER DEMO DATA
const PELTON_DEMO_STATE: TechnicalProjectState = {
    ...DEFAULT_TECHNICAL_STATE,
    site: {
        grossHead: 450,
        designFlow: 2.5,
        waterQuality: 'CLEAN',
        temperature: 15
    },
    penstock: {
        material: 'STEEL',
        length: 2500,
        diameter: 1200,
        wallThickness: 25,
        roughness: 0.045,
        youngsModulus: 210
    }
};

interface ProjectContextType {
    // Core Technical State
    technicalState: TechnicalProjectState;
    siteParams: SiteParameters;
    activeProject: any;
    images: InspectionImage[];

    // Legacy setters (physics-reactive)
    updateSiteConditions: (updates: Partial<SiteConditions>) => void;
    updatePenstockSpecs: (updates: Partial<PenstockSpecs>) => void;
    updateMechanicalDetails: (updates: Partial<MechanicalDetails>) => void;
    updateTolerances: (updates: Partial<Tolerances>) => void;
    addInspectionImage: (img: InspectionImage) => void;
    recalculate: () => void;
    loadDemoData: () => void;

    // Phase 13: Unified State Management
    setAssetIdentity: (identity: AssetIdentity) => void;
    updateAssetIdentity: (updates: Partial<AssetIdentity>) => void;

    addAIFinding: (finding: AIFinding) => void;
    updateAIFinding: (findingId: string, updates: Partial<AIFinding>) => void;

    addMeasurement: (parameterId: string, measurement: HistoricalMeasurement) => void;
    getMeasurementHistory: (parameterId: string) => MeasurementHistory | undefined;
    getTrend: (parameterId: string) => any; // Exposed for Dashboard

    addPrecisionMeasurement: (measurement: PrecisionMeasurement) => void;

    updateFinancialSettings: (settings: Partial<FinancialSettings>) => void;

    // Phase 13: Service Checklist
    getRecommendedChecklist: () => any;

    // Financial Risk Calculator (Integrated)
    calculateFinancialRisk: (healthScore: number, powerMW: number) => any;
    calculateIntegratedFinancialRisk: () => number;

    // INTEGRATED ENGINEERING MODULES
    // Performance Guard
    calculateSafeClosingTime: (length: number, diameterMM: number, thicknessMM: number, material: string) => WaterHammerSafeLimits;
    analyzeLosses: (grossHead: number, netHead: number, flow: number, mechPowerKW: number, elecPowerKW: number) => any;

    // Safety Systems
    checkSafetyInterlocks: () => any;
    engageEmergencyShutdown: () => Promise<boolean>;

    // Oil Analysis
    analyzeOilCondition: (viscosity: number, acidity: number, waterContent: number) => any;

    // Cavitation & Erosion
    assessCavitationRisk: (flow: number, head: number, runnerDiameter: number) => any;

    // Corrosion Monitoring
    assessCorrosionRisk: (material1: string, material2: string, electrolyte: string) => any;

    // Acoustic Analysis
    analyzeAcousticSignature: (frequency: number, amplitude: number) => any;

    // Vision Analysis
    analyzeVisualData: (imageData: any) => any;

    // SCADA Integration
    readSCADAParameter: (address: string) => Promise<number>;
    writeSCADAParameter: (address: string, value: number) => Promise<boolean>;
    connectSCADAToExpertEngine: (flow: number, head: number, frequency: number) => any;

    // Dr. Turbine AI Integration
    getDrTurbineConsultation: (flow: number, head: number, frequency: number) => { cards: ActionCard[], healthScore: number, voiceMessage: string };
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize with physics pre-calculated
    const [technicalState, setTechnicalState] = useState<TechnicalProjectState>(() =>
        PhysicsEngine.recalculateProjectPhysics(PELTON_DEMO_STATE)
    );
    const [images, setImages] = useState<InspectionImage[]>([]);

    const loadDemoData = () => {
        const recalculated = PhysicsEngine.recalculateProjectPhysics(PELTON_DEMO_STATE);
        setTechnicalState(recalculated);
    };

    // Legacy setters (maintain backward compatibility)
    const updateSiteConditions = (updates: Partial<SiteConditions>) => {
        setTechnicalState(prev => {
            const updated = {
                ...prev,
                site: { ...prev.site, ...updates }
            };
            return PhysicsEngine.recalculateProjectPhysics(updated);
        });
    };

    const updatePenstockSpecs = (updates: Partial<PenstockSpecs>) => {
        setTechnicalState(prev => {
            const updated = {
                ...prev,
                penstock: { ...prev.penstock, ...updates }
            };
            return PhysicsEngine.recalculateProjectPhysics(updated);
        });
    };

    const updateMechanicalDetails = (updates: Partial<MechanicalDetails>) => {
        setTechnicalState(prev => ({
            ...prev,
            mechanical: { ...prev.mechanical, ...updates }
        }));
    };

    const updateTolerances = (updates: Partial<Tolerances>) => {
        setTechnicalState(prev => ({
            ...prev,
            tolerances: { ...prev.tolerances, ...updates }
        }));
    };

    const recalculate = () => {
        setTechnicalState(prev => PhysicsEngine.recalculateProjectPhysics(prev));
    };

    const addInspectionImage = (img: InspectionImage) => {
        setImages(prev => [...prev, img]);
    };

    // Phase 13: Asset Identity Management
    const setAssetIdentity = (identity: AssetIdentity) => {
        setTechnicalState(prev => ({
            ...prev,
            assetIdentity: identity
        }));
    };

    const updateAssetIdentity = (updates: Partial<AssetIdentity>) => {
        setTechnicalState(prev => {
            if (!prev.assetIdentity) return prev;
            return {
                ...prev,
                assetIdentity: {
                    ...prev.assetIdentity,
                    ...updates,
                    lastUpdatedAt: new Date().toISOString()
                }
            };
        });
    };

    // Phase 13: AI Findings Management
    const addAIFinding = (finding: AIFinding) => {
        setTechnicalState(prev => ({
            ...prev,
            aiDiagnosis: {
                findings: [...prev.aiDiagnosis.findings, finding],
                unverifiedCount: finding.verifiedByExpert
                    ? prev.aiDiagnosis.unverifiedCount
                    : prev.aiDiagnosis.unverifiedCount + 1,
                lastUpdated: new Date().toISOString()
            }
        }));
    };

    const updateAIFinding = (findingId: string, updates: Partial<AIFinding>) => {
        setTechnicalState(prev => {
            const findings = prev.aiDiagnosis.findings.map(f =>
                f.id === findingId ? { ...f, ...updates } : f
            );

            const unverifiedCount = findings.filter(f => !f.verifiedByExpert).length;

            return {
                ...prev,
                aiDiagnosis: {
                    findings,
                    unverifiedCount,
                    lastUpdated: new Date().toISOString()
                }
            };
        });
    };

    // Phase 13: Measurement History Management
    const addMeasurement = (parameterId: string, measurement: HistoricalMeasurement) => {
        setTechnicalState(prev => {
            const measurements = new Map(prev.maintenanceHistory.measurements);
            const existing = measurements.get(parameterId);

            if (existing) {
                // Add to existing history
                const updated = HistoricalTrendAnalyzer.addMeasurement(
                    existing,
                    measurement,
                    existing.trend?.criticalThreshold || 0.60
                );
                measurements.set(parameterId, updated);
            } else {
                // Create new history
                const newHistory: MeasurementHistory = {
                    parameterId,
                    parameterName: parameterId.replace(/_/g, ' '),
                    unit: 'mm',
                    measurements: [measurement]
                };

                // Calculate initial trend
                const trend = HistoricalTrendAnalyzer.analyzeTrend(newHistory, 0.60);
                newHistory.trend = trend;

                measurements.set(parameterId, newHistory);
            }

            return {
                ...prev,
                maintenanceHistory: {
                    ...prev.maintenanceHistory,
                    measurements,
                    lastUpdated: new Date().toISOString()
                }
            };
        });
    };

    const getMeasurementHistory = (parameterId: string): MeasurementHistory | undefined => {
        return technicalState.maintenanceHistory.measurements.get(parameterId);
    };

    const getTrend = (parameterId: string) => {
        const history = technicalState.maintenanceHistory.measurements.get(parameterId);
        return history?.trend || null;
    };

    // Phase 13: Precision Measurement Management
    const addPrecisionMeasurement = (measurement: PrecisionMeasurement) => {
        setTechnicalState(prev => {
            const engineeringLog = FineEngineeringLogService.addMeasurement(
                prev.maintenanceHistory.engineeringLog,
                measurement
            );

            return {
                ...prev,
                maintenanceHistory: {
                    ...prev.maintenanceHistory,
                    engineeringLog,
                    lastUpdated: new Date().toISOString()
                }
            };
        });
    };

    // Phase 13: Financial Settings Management
    const updateFinancialSettings = (settings: Partial<FinancialSettings>) => {
        setTechnicalState(prev => ({
            ...prev,
            financials: {
                ...prev.financials,
                ...settings
            }
        }));
    };

    // Phase 13: Service Checklist Integration
    const getRecommendedChecklist = () => {
        if (!technicalState.assetIdentity) return null;
        const engineType = technicalState.assetIdentity.turbineType;
        return ServiceChecklistEngine.getTemplateForTurbine(engineType);
    };

    // Phase 13: Financial Risk Calculator Integration
    const calculateFinancialRisk = (healthScore: number, powerMW: number) => {
        // Assume default price if not set
        const price = technicalState.financials.electricityPriceEURperMWh || 80;
        return ExpertDiagnosisEngine.calculateFinancialImpact(healthScore, powerMW, price);
    };

    // INTEGRATED ENGINEERING MODULE IMPLEMENTATIONS - COMPLETE STATE UNIFICATION

    // Performance Guard Methods
    const calculateSafeClosingTime = (length: number, diameterMM: number, thicknessMM: number, material: string) => {
        return PerformanceGuardService.calculateSafeClosingTime(length, diameterMM, thicknessMM, material as any);
    };

    const analyzeLosses = (grossHead: number, netHead: number, flow: number, mechPowerKW: number, elecPowerKW: number) => {
        return PerformanceGuardService.analyzeLosses(grossHead, netHead, flow, mechPowerKW, elecPowerKW);
    };

    // Safety Systems
    const checkSafetyInterlocks = () => {
        return SafetyInterlockEngine.checkAllInterlocks();
    };

    const engageEmergencyShutdown = async () => {
        return await SafetyInterlockEngine.emergencyShutdown();
    };

    // Oil Analysis
    const analyzeOilCondition = (viscosity: number, acidity: number, waterContent: number) => {
        return OilAnalysisService.analyzeCondition(viscosity, acidity, waterContent);
    };

    // Cavitation & Erosion
    const assessCavitationRisk = (flow: number, head: number, runnerDiameter: number) => {
        return CavitationErosionService.assessRisk(flow, head, runnerDiameter);
    };

    // Corrosion Monitoring
    const assessCorrosionRisk = (material1: string, material2: string, electrolyte: string) => {
        return GalvanicCorrosionService.assessRisk(material1, material2, electrolyte);
    };

    // Acoustic Analysis
    const analyzeAcousticSignature = (frequency: number, amplitude: number) => {
        return AcousticFingerprintingService.classifyAcousticSignature([{ frequency, amplitude }]);
    };

    // Vision Analysis
    const analyzeVisualData = (imageData: any) => {
        return VisionAnalysisService.analyzeImage(imageData);
    };

    // SCADA Integration - CONNECTED TO EXPERT DIAGNOSIS ENGINE
    const readSCADAParameter = async (address: string) => {
        return await MockSCADAController.readParameter(address);
    };

    const writeSCADAParameter = async (address: string, value: number) => {
        return await MockSCADAController.writeParameter(address, value);
    };

    const connectSCADAToExpertEngine = (flow: number, head: number, frequency: number) => {
        if (!technicalState.assetIdentity) return null;

        // Run expert diagnostics with SCADA inputs - SINGLE SOURCE OF TRUTH
        const diagnostics = ExpertDiagnosisEngine.runDiagnostics(
            technicalState.assetIdentity,
            technicalState.site.temperature, // From TechnicalSchema
            'OIL', // lubrication
            technicalState.assetIdentity.machineConfig?.ratedPowerMW || undefined, // rotor weight
            flow,
            head,
            frequency,
            technicalState.constants // Pass reactive constants from schema
        );

        // CRITICAL ALARMS - Grid Frequency Check (98.2 Hz triggers CRITICAL)
        const criticalAlarms = [];
        if (diagnostics.gridRisk?.severity === 'CRITICAL') {
            criticalAlarms.push({
                type: 'GRID_FREQUENCY_CRITICAL',
                message: `Grid frequency ${frequency} Hz exceeds safe limits. Risk of mechanical destruction.`,
                action: 'EMERGENCY_SHUTDOWN',
                severity: 'CRITICAL'
            });
        }

        if (diagnostics.cavitationRisk?.severity === 'CRITICAL') {
            criticalAlarms.push({
                type: 'CAVITATION_CRITICAL',
                message: diagnostics.cavitationRisk.message,
                action: 'REDUCE_LOAD',
                severity: 'CRITICAL'
            });
        }

        // Calculate health score using ExpertDiagnosisEngine
        const healthScore = ExpertDiagnosisEngine.calculateHealthScore(diagnostics).overall;

        // Update maintenance history with SCADA data
        if (flow > 0) {
            addMeasurement('SCADA_FLOW', {
                value: flow,
                timestamp: new Date().toISOString(),
                unit: 'm³/s'
            });
        }

        if (head > 0) {
            addMeasurement('SCADA_HEAD', {
                value: head,
                timestamp: new Date().toISOString(),
                unit: 'm'
            });
        }

        if (frequency > 0) {
            addMeasurement('GRID_FREQUENCY', {
                value: frequency,
                timestamp: new Date().toISOString(),
                unit: 'Hz'
            });
        }

        return {
            diagnostics,
            criticalAlarms,
            healthScore,
            timestamp: new Date().toISOString()
        };
    };

    // Dr. Turbine AI Integration - CONNECTED TO ALL MODULES
    const getDrTurbineConsultation = (flow: number, head: number, frequency: number) => {
        if (!technicalState.assetIdentity) {
            return { cards: [], healthScore: 0, voiceMessage: "No asset identity available" };
        }

        // Get comprehensive consultation using all integrated modules
        const consultation = DrTurbineAI.consult(technicalState.assetIdentity, flow, head, frequency);

        // Enhance with historical trend analysis
        const flowTrend = getTrend('SCADA_FLOW');
        const headTrend = getTrend('SCADA_HEAD');
        const freqTrend = getTrend('GRID_FREQUENCY');

        // Add trend-based insights to AI cards
        if (flowTrend?.daysUntilCritical && flowTrend.daysUntilCritical < 30) {
            consultation.cards.unshift({
                id: 'trend-alert-flow',
                title: 'Flow Trend Critical',
                message: `Flow trending towards critical threshold in ${flowTrend.daysUntilCritical} days. Schedule maintenance.`,
                severity: 'HIGH',
                actionLabel: 'View Trend Analysis',
                actionFunction: 'analyze_trend_flow'
            });
        }

        if (freqTrend?.daysUntilCritical && freqTrend.daysUntilCritical < 7) {
            consultation.cards.unshift({
                id: 'trend-alert-frequency',
                title: 'Frequency Stability Critical',
                message: `Grid frequency trending unstable. ${freqTrend.daysUntilCritical} days until critical threshold.`,
                severity: 'CRITICAL',
                actionLabel: 'Emergency Protocol',
                actionFunction: 'emergency_frequency'
            });
        }

        return consultation;
    };

    // FINANCIAL RISK ENGINE INTEGRATION - CONNECTED TO MAINTENANCE LOGBOOK
    const calculateIntegratedFinancialRisk = () => {
        if (!technicalState.assetIdentity) return 0;

        // Get health score from expert diagnosis
        const scadaData = connectSCADAToExpertEngine(
            technicalState.site.designFlow,
            technicalState.site.grossHead,
            50.0 // nominal frequency
        );

        const healthScore = scadaData?.healthScore || 100;

        // Calculate financial impact using ExpertDiagnosisEngine with reactive constants
        const financialImpact = ExpertDiagnosisEngine.calculateFinancialImpact(
            healthScore,
            technicalState.assetIdentity.machineConfig.ratedPowerMW,
            technicalState.financials.electricityPriceEURperMWh,
            technicalState.constants
        );

        // Factor in maintenance history trends
        let maintenanceMultiplier = 1.0;
        const criticalTrends = Array.from(technicalState.maintenanceHistory.measurements.values())
            .filter(h => h.trend?.daysUntilCritical && h.trend.daysUntilCritical < 90)
            .length;

        if (criticalTrends > 0) {
            maintenanceMultiplier = 1 + (criticalTrends * 0.2); // 20% increase per critical trend
        }

        return financialImpact.estimatedLossEUR30Days * maintenanceMultiplier;
    };

    // Legacy compatibility: siteParams computed from technicalState
    const siteParams: SiteParameters = {
        grossHead: technicalState.site.grossHead,
        pipeLength: technicalState.penstock.length,
        pipeDiameter: technicalState.penstock.diameter,
        pipeMaterial: technicalState.penstock.material,
        wallThickness: technicalState.penstock.wallThickness,
        boltClass: technicalState.mechanical.boltSpecs.grade,
        corrosionProtection: 'NONE',
        waterQuality: technicalState.site.waterQuality,
        flowDurationCurve: [],
        ecologicalFlow: 0
    };

    const value: ProjectContextType = {
        technicalState,
        siteParams,
        activeProject: null,
        images,

        // Legacy setters
        updateSiteConditions,
        updatePenstockSpecs,
        updateMechanicalDetails,
        updateTolerances,
        addInspectionImage,
        recalculate,
        loadDemoData,

        // Phase 13: Unified methods
        setAssetIdentity,
        updateAssetIdentity,
        addAIFinding,
        updateAIFinding,
        addMeasurement,
        getMeasurementHistory,
        addPrecisionMeasurement,
        updateFinancialSettings,
        getRecommendedChecklist,
        getTrend,
        calculateFinancialRisk,
        calculateIntegratedFinancialRisk,

        // INTEGRATED ENGINEERING MODULES
        calculateSafeClosingTime,
        analyzeLosses,
        checkSafetyInterlocks,
        engageEmergencyShutdown,
        analyzeOilCondition,
        assessCavitationRisk,
        assessCorrosionRisk,
        analyzeAcousticSignature,
        analyzeVisualData,
        readSCADAParameter,
        writeSCADAParameter,
        connectSCADAToExpertEngine,
        getDrTurbineConsultation
    };

    return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProjectEngine = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProjectEngine must be used within ProjectProvider');
    }
    return context;
};
