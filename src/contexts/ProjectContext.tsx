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

// --- FORCE IMPORT OF MODULES ---
import { HistoricalTrendAnalyzer } from '../services/HistoricalTrendAnalyzer';
import { FineEngineeringLogService } from '../services/FineEngineeringLogService';
import { ServiceChecklistEngine } from '../services/ServiceChecklistEngine';
import { ExpertDiagnosisEngine } from '../services/ExpertDiagnosisEngine';

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
        calculateFinancialRisk
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
