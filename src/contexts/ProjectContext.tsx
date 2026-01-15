
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { TechnicalProjectState, ProjectAction, ComponentHealthData } from '../models/TechnicalSchema';
import { AssetIdentity } from '../types/assetIdentity';
import { PhysicsEngine } from '../features/physics-core/PhysicsEngine';
import { ExpertDiagnosisEngine } from '../features/physics-core/ExpertDiagnosisEngine';
import { DrTurbineAI } from '../services/DrTurbineAI';
import { FinancialImpactEngine } from '../services/FinancialImpactEngine';
import { ProfileLoader } from '../services/ProfileLoader';
import { HPPSettingsSchema } from '../schemas/engineering';
import i18n from '../i18n';
import Decimal from 'decimal.js';
import { LifeExtensionEngine } from '../services/LifeExtensionEngine';

const PERSISTENCE_KEY = 'ANOHUB_CORE_V4.2';

const ProjectContext = createContext<{
    state: TechnicalProjectState;
    dispatch: React.Dispatch<ProjectAction>;
    handleTelemetryUpdate: (rawPayload: unknown) => Promise<void>;
    clearCoreState: () => void;
} | undefined>(undefined);

const cerebroReducer = (state: TechnicalProjectState, action: ProjectAction): TechnicalProjectState => {
    switch (action.type) {
        case 'UPDATE_HYDRAULIC':
            return PhysicsEngine.recalculateProjectPhysics({
                ...state,
                hydraulic: { ...state.hydraulic, ...action.payload },
            });
        case 'UPDATE_MECHANICAL':
            return PhysicsEngine.recalculateProjectPhysics({
                ...state,
                mechanical: { ...state.mechanical, ...action.payload },
            });
        case 'UPDATE_PENSTOCK':
            return PhysicsEngine.recalculateProjectPhysics({
                ...state,
                penstock: { ...state.penstock, ...action.payload },
            });
        case 'SET_ASSET':
            return { ...state, identity: action.payload };
        case 'UPDATE_COMPONENT_HEALTH': {
            const { assetId, componentId, healthData } = action.payload;
            const currentHealth = state.componentHealth || {};
            const assetHealth = currentHealth[assetId] || {};

            return {
                ...state,
                componentHealth: {
                    ...currentHealth,
                    [assetId]: {
                        ...assetHealth,
                        [componentId]: healthData
                    }
                }
            };
        }
        case 'UPDATE_SPECIALIZED_MODULE': {
            const { moduleId, status } = action.payload;
            const currentSpecialized = state.specializedState || {
                modules: {},
                healthScore: 100,
                activeRisks: []
            };

            const updatedModules = {
                ...currentSpecialized.modules,
                [moduleId]: status
            };

            return {
                ...state,
                specializedState: {
                    ...currentSpecialized,
                    modules: updatedModules
                }
            };
        }
        case 'UPDATE_VIBRATION_HISTORY': {
            const history = state.mechanical.vibrationHistory || [];
            const newHistory = [...history, action.payload].slice(-100);
            return {
                ...state,
                mechanical: {
                    ...state.mechanical,
                    vibrationX: action.payload.x,
                    vibrationY: action.payload.y,
                    vibrationHistory: newHistory
                }
            };
        }
        case 'UPDATE_CENTER_PATH': {
            const currentPath = state.mechanical.centerPath || [];
            const newPath = [...currentPath, action.payload].slice(-10);
            return {
                ...state,
                mechanical: {
                    ...state.mechanical,
                    centerPath: newPath
                }
            };
        }
        case 'UPDATE_ACOUSTIC_DATA': {
            return {
                ...state,
                mechanical: {
                    ...state.mechanical,
                    acousticMetrics: {
                        ...(state.mechanical.acousticMetrics || {
                            cavitationIntensity: 0,
                            ultrasonicLeakIndex: 0,
                            bearingGrindIndex: 0,
                            acousticBaselineMatch: 1.0
                        }),
                        ...action.payload
                    },
                    acousticNoiseFloor: action.payload.cavitationIntensity // Backward compatibility map
                }
            };
        }
        case 'UPDATE_PARTICLE_DATA': {
            return {
                ...state,
                mechanical: {
                    ...state.mechanical,
                    particleAnalysis: action.payload
                }
            };
        }
        case 'UPDATE_GOVERNOR': {
            return {
                ...state,
                governor: {
                    ...state.governor,
                    ...action.payload
                }
            };
        }
        case 'SET_DEMO_MODE':
            return {
                ...state,
                demoMode: action.payload
            };
        case 'START_SCENARIO':
            return {
                ...state,
                demoMode: {
                    active: action.payload !== 'NORMAL',
                    scenario: action.payload
                }
            };
        case 'UPDATE_SIMULATION':
            return {
                ...state,
                ...action.payload,
                // Ensure physics are recalculated on top of manual simulation updates
                ...PhysicsEngine.recalculateProjectPhysics({ ...state, ...action.payload })
            };
        case 'UPDATE_STRUCTURAL':
            return {
                ...state,
                structural: { ...state.structural, ...action.payload }
            };
        case 'UPDATE_HYDROLOGY':
            return {
                ...state,
                hydrology: { ...state.hydrology, ...action.payload }
            };
        case 'UPDATE_MARKET':
            return {
                ...state,
                market: { ...state.market, ...action.payload }
            };
        case 'ADD_MANUAL_RULE':
            return {
                ...state,
                manualRules: [...state.manualRules, action.payload]
            };
        case 'APPLY_MITIGATION':
            const nextApplied = Array.from(new Set([...state.appliedMitigations, action.payload]));
            const nextStateWithMitigation = { ...state, appliedMitigations: nextApplied };
            return {
                ...nextStateWithMitigation,
                structural: {
                    ...state.structural,
                    extendedLifeYears: LifeExtensionEngine.calculateTotalExtendedLife(nextStateWithMitigation)
                }
            };
        case 'UPDATE_TELEMETRY_SUCCESS':
            return action.payload; // payload is the fully recalculated state
        case 'RESET_TO_DEMO':
            return PhysicsEngine.recalculateProjectPhysics(state); // Re-validate
        default:
            return state;
    }
};

export const ProjectProvider = ({ children, initialState }: { children: ReactNode, initialState: TechnicalProjectState }) => {
    // Neural Core Initialization: Load from Persistence Anchor
    const [state, dispatch] = useReducer(cerebroReducer, initialState, (initial) => {
        try {
            const saved = localStorage.getItem(PERSISTENCE_KEY);
            if (saved) {
                console.log(`[CEREBRO] Neural Core waking up from ${PERSISTENCE_KEY}`);
                const parsed = JSON.parse(saved);

                // --- ROBUST DEEP MERGE (NC-4.2 Directive) ---
                // We ensure sub-objects exist even if the saved state is from an older version
                const merged: TechnicalProjectState = {
                    ...initial,
                    ...parsed,
                    identity: { ...initial.identity, ...(parsed.identity || {}) },
                    hydraulic: { ...initial.hydraulic, ...(parsed.hydraulic || {}) },
                    mechanical: { ...initial.mechanical, ...(parsed.mechanical || {}) },
                    site: { ...initial.site, ...(parsed.site || {}) },
                    penstock: { ...initial.penstock, ...(parsed.penstock || {}) },
                    physics: { ...initial.physics, ...(parsed.physics || {}) },
                    governor: { ...initial.governor, ...(parsed.governor || {}) },
                    structural: { ...initial.structural, ...(parsed.structural || {}) },
                    specializedState: { ...initial.specializedState, ...(parsed.specializedState || {}) },
                    demoMode: { ...initial.demoMode, ...(parsed.demoMode || {}) }
                };

                // Re-hydrate Decimal instances safely
                if (merged.hydraulic) {
                    if (merged.hydraulic.waterHead) merged.hydraulic.waterHead = new Decimal(merged.hydraulic.waterHead);
                    else merged.hydraulic.waterHead = initial.hydraulic.waterHead;

                    if (merged.hydraulic.flowRate) merged.hydraulic.flowRate = new Decimal(merged.hydraulic.flowRate);
                    else merged.hydraulic.flowRate = initial.hydraulic.flowRate;

                    if (merged.hydraulic.cavitationThreshold) merged.hydraulic.cavitationThreshold = new Decimal(merged.hydraulic.cavitationThreshold);
                    else merged.hydraulic.cavitationThreshold = initial.hydraulic.cavitationThreshold;

                    if (merged.hydraulic.currentHoopStress) merged.hydraulic.currentHoopStress = new Decimal(merged.hydraulic.currentHoopStress);
                    if (merged.hydraulic.baselineOutputMW) merged.hydraulic.baselineOutputMW = new Decimal(merged.hydraulic.baselineOutputMW);
                }

                if (merged.governor) {
                    if (merged.governor.setpoint) merged.governor.setpoint = new Decimal(merged.governor.setpoint);
                    else merged.governor.setpoint = initial.governor.setpoint;

                    if (merged.governor.actualValue) merged.governor.actualValue = new Decimal(merged.governor.actualValue);
                    else merged.governor.actualValue = initial.governor.actualValue;

                    if (merged.governor.kp) merged.governor.kp = new Decimal(merged.governor.kp);
                    else merged.governor.kp = initial.governor.kp;

                    if (merged.governor.ki) merged.governor.ki = new Decimal(merged.governor.ki);
                    else merged.governor.ki = initial.governor.ki;

                    if (merged.governor.kd) merged.governor.kd = new Decimal(merged.governor.kd);
                    else merged.governor.kd = initial.governor.kd;

                    if (merged.governor.integralError) merged.governor.integralError = new Decimal(merged.governor.integralError);
                    else merged.governor.integralError = initial.governor.integralError;

                    if (merged.governor.previousError) merged.governor.previousError = new Decimal(merged.governor.previousError);
                    else merged.governor.previousError = initial.governor.previousError;

                    if (merged.governor.outputSignal) merged.governor.outputSignal = new Decimal(merged.governor.outputSignal);
                    else merged.governor.outputSignal = initial.governor.outputSignal;
                }

                return merged;
            }
        } catch (e) {
            console.error("[CEREBRO] Critical failure during re-hydration. Reverting to factory defaults.", e);
            localStorage.removeItem(PERSISTENCE_KEY); // Clear bad state
        }
        return initial;
    });

    // Persistence Anchor: Sync with Storage
    React.useEffect(() => {
        localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
    }, [state]);

    const clearCoreState = () => {
        localStorage.removeItem(PERSISTENCE_KEY);
        window.location.reload(); // Hard reset
    };

    /**
     * CORE LOGIC: Centralized Telemetry Ingestion Pipeline
     * Validates sensor data, converts to high-precision decimals, and updates CEREBRO.
     */
    const handleTelemetryUpdate = async (rawPayload: unknown) => {
        try {
            // 1. Zod Validation (Standard Excellence Guardrail)
            const validatedData = HPPSettingsSchema.safeParse(rawPayload);

            if (!validatedData.success) {
                const errorMessage = i18n.t('errors.standard_excellence_violation', {
                    details: JSON.stringify(validatedData.error.format())
                });
                console.error(`🚨 CRITICAL: ${errorMessage}`);
                return; // Block update to preserve
            }

            // 2. High-Precision Preparation
            const updatedHydraulic = {
                ...state.hydraulic,
                head: validatedData.data.head,
                flow: validatedData.data.flow,
                efficiency: validatedData.data.efficiency,
                waterHead: new Decimal(validatedData.data.head),
                flowRate: new Decimal(validatedData.data.flow)
            };

            const intermediateState: TechnicalProjectState = {
                ...state,
                hydraulic: updatedHydraulic
            };

            // 3. Global Recalculation (The Physics Engine Link)
            const physicsResult = PhysicsEngine.recalculatePhysics(intermediateState);
            const diagnosis = ExpertDiagnosisEngine.runExpertDiagnosis(physicsResult, intermediateState);

            // 4. State Assembly
            const nextState: TechnicalProjectState = {
                ...intermediateState,
                hydraulic: {
                    ...updatedHydraulic,
                    currentHoopStress: physicsResult.hoopStress
                },
                physics: {
                    ...state.physics,
                    hoopStressMPa: physicsResult.hoopStress.toNumber(),
                    staticPressureBar: updatedHydraulic.head / 10,
                    surgePressureBar: physicsResult.surgePressure.toNumber(),
                    waterHammerPressureBar: physicsResult.surgePressure.toNumber()
                },
                mechanical: {
                    ...state.mechanical,
                    vibrationX: validatedData.data.vibrationX || 0,
                    vibrationY: validatedData.data.vibrationY || 0,
                    baselineOrbitCenter: state.mechanical.baselineOrbitCenter || { x: 0, y: 0 }
                },
                diagnosis,
                structural: {
                    ...state.structural,
                    extendedLifeYears: diagnosis.metrics?.extendedLifeYears || 0
                },
                riskScore: diagnosis.severity === 'CRITICAL' ? 100 : (diagnosis.severity === 'WARNING' ? 50 : 0),
                lastRecalculation: new Date().toISOString()
            };

            // 5. State Dispatch
            dispatch({
                type: 'UPDATE_TELEMETRY_SUCCESS',
                payload: nextState
            });

            console.log(`[CEREBRO] Ingestion Success: Head=${validatedData.data.head}m, SF=${diagnosis.safetyFactor.toFixed(2)}`);
        } catch (criticalError) {
            console.error('SYSTEM_CRITICAL_FAILURE: PhysicsEngine desync during recalculation.', criticalError);
        }
    };

    return (
        <ProjectContext.Provider value={{ state, dispatch, handleTelemetryUpdate, clearCoreState }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useCerebro = () => {
    const context = useContext(ProjectContext);
    if (!context) throw new Error("useCerebro must be used within a ProjectProvider");
    return context;
};

// COMPATIBILITY HOOK FOR LEGACY COMPONENTS
export const useProjectEngine = (): any => {
    const { state, dispatch } = useCerebro();

    // Helper to bridge Simple Identity -> Complex AssetIdentity
    const createComplexIdentity = (): AssetIdentity | null => {
        if (!state.identity) return null;
        // Construct a FULL AssetIdentity from the simple definition + state context
        return {
            assetId: state.identity.assetId,
            assetName: state.identity.assetName,
            turbineType: state.identity.turbineType, // 'PELTON' | 'KAPLAN' ...
            manufacturer: 'AnoHUB Legacy',
            commissioningYear: 2020,
            totalOperatingHours: 0,
            hoursSinceLastOverhaul: 0,
            startStopCount: 0,
            location: 'Unknown',
            version: '1.0',
            createdAt: new Date().toISOString(),
            createdBy: 'System',
            lastUpdatedAt: new Date().toISOString(),
            machineConfig: {
                orientation: 'VERTICAL', // Assumption
                transmissionType: 'DIRECT',
                ratedPowerMW: 10,
                ratedSpeedRPM: 500,
                ratedHeadM: state.site?.grossHead || 100,
                ratedFlowM3S: state.site?.designFlow || 10,
                runnerDiameterMM: 1500,
                numberOfBlades: 15
            },
            sensorMatrix: {
                vibrationSensors: { generator: [], turbine: [] },
                temperatureSensors: { bearings: [], oilSystem: [], powerhouse: [] },
                pressureSensors: [],
                upgradeRecommendations: []
            },
            fluidIntelligence: {
                oilSystem: { oilType: 'MINERAL_ISO_VG_46', oilCapacityLiters: 1000, currentHours: 0, changeIntervalHours: 20000, lastChangeDate: '', nextChangeDue: '' },
                filterSystem: { filterType: 'Standard', installDate: '', deltaPBar: 0, deltaPAlarmBar: 1, filterClogged: false },
                temperatureCorrelation: { powerhouseAmbientC: state.site?.temperature || 20, bearingTempsC: [], excessiveHeatDetected: false },
                healthScore: 100
            },
            environmentalBaseline: {
                noiseLevel: { operatingDB: 80, locations: { powerhouse: 80, turbinePit: 85, controlRoom: 60 }, regulatoryLimitDB: 85, complianceStatus: 'COMPLIANT' },
                penstockType: (state.penstock?.material as any) || 'STEEL', // Cast needed if string mismatch
                penstockDiameterMM: (state.penstock?.diameter || 1) * 1000,
                penstockLengthM: state.penstock?.length || 100,
                penstockThicknessMM: (state.penstock?.wallThickness || 0.01) * 1000,
                sludgeRemoval: { hasSludgeCleaner: false, erosionRiskScore: 0 },
                waterQuality: { sedimentContentMGL: 0, abrasivityIndex: 'LOW', phLevel: 7 },
                ambientTemperature: 20,
                relativeHumidity: 50
            },
            operationalMapping: {
                operatingPoints: [], currentPoint: null,
                hillChart: { dataPoints: 0, coveragePercent: 0, lastUpdated: '' },
                bestEfficiencyPoint: null
            },
            specializedAdvanced: { // Mock for specialized calculations
                frontRunnerClearanceMM: 0.4,
                backRunnerClearanceMM: 0.4,
                spiralClearanceMM: 0.5,
                labyrinthGaps: { upperLabyrinthMM: 0.5, lowerLabyrinthMM: 0.5, sealType: 'METALLIC' },
                draftTubePressure: { nominalBar: 1, minBar: 0, maxBar: 2, sensorInstalled: false },
                backRunnerPressure: { nominalBar: 1, minBar: 0, maxBar: 2, sensorInstalled: false },
                axialThrustBalanced: true,
                pressureDifferenceBar: 0
            }
        };
    };

    const connectTwinToExpertEngine = (flow: number, head: number, frequency: number) => {
        const complexIdentity = createComplexIdentity();
        if (!complexIdentity) return null;

        // 1. Run Hardened Physics
        const physicsResult = PhysicsEngine.recalculatePhysics(state);

        // 2. Run Diagnostics
        const diagnosis = ExpertDiagnosisEngine.runExpertDiagnosis(physicsResult, state);

        // 3. Aggregate Critical Alarms
        const criticalAlarms: { message: string }[] = [];
        diagnosis.messages.forEach(msg => {
            if (diagnosis.severity === 'CRITICAL') {
                criticalAlarms.push({ message: msg.en });
            }
        });

        return {
            healthScore: ExpertDiagnosisEngine.calculateHealthScore(diagnosis).overall,
            criticalAlarms,
            diagnostics: diagnosis
        };
    };

    const getDrTurbineConsultation = (flow: number, head: number, frequency: number) => {
        const complexIdentity = createComplexIdentity();
        if (!complexIdentity) return { cards: [], healthScore: 0, voiceMessage: "System Offline" };
        return DrTurbineAI.consult(complexIdentity, flow, head, frequency);
    };

    /**
     * Add inspection image to asset documentation
     * Called from ComponentTree and other inspection UIs
     */
    const addInspectionImage = (
        assetId: string,
        component: string,
        imageData: {
            src: string; // base64 or blob URL
            tag: string;
            timestamp: string;
            notes?: string;
        }
    ): { success: boolean; imageId: string } => {
        // Generate unique ID for image
        const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        console.log(`[ProjectContext] Adding inspection image for ${assetId}/${component}:`, {
            imageId,
            tag: imageData.tag,
            timestamp: imageData.timestamp
        });

        // TODO: Dispatch action to store image in technical state
        // dispatch({ type: 'ADD_INSPECTION_IMAGE', payload: { assetId, component, imageData } });

        return {
            success: true,
            imageId
        };
    };

    /**
     * Add measurement using ServiceChecklistEngine
     * Facade that integrates with ServiceChecklistEngine and updates asset health
     */
    const addMeasurement = (
        assetId: string,
        component: string,
        measuredValue: number,
        unit: 'mm' | 'bar' | 'rpm' | 'celsius',
        nominalValue: number,
        tolerance: number
    ): {
        success: boolean;
        validationResult: any;
        healthScore: number;
    } => {
        // Import ServiceChecklistEngine dynamically to avoid circular deps
        const { ServiceChecklistEngine } = require('../services/ServiceChecklistEngine');

        // Calculate min/max as nominal ± 3x tolerance for safe operating range
        const minValue = nominalValue - (tolerance * 3);
        const maxValue = nominalValue + (tolerance * 3);

        const result = ServiceChecklistEngine.addMeasurement(
            assetId,
            component,
            measuredValue,
            unit,
            nominalValue,
            minValue,
            maxValue,
            tolerance
        );

        // Update asset health score in state
        if (result.measurementData) {
            updateAssetHealth(
                assetId,
                component,
                result.measurementData.healthScore
            );
        }

        return {
            success: result.isValid,
            validationResult: result.validationResult,
            healthScore: result.measurementData.healthScore
        };
    };

    /**
     * Update asset component health score
     * Integrates measurement results into CEREBRO state
     */
    const updateAssetHealth = (
        assetId: string,
        component: string,
        healthScore: number
    ): void => {
        let status: 'OPTIMAL' | 'GOOD' | 'WARNING' | 'CRITICAL';

        if (healthScore >= 90) status = 'OPTIMAL';
        else if (healthScore >= 70) status = 'GOOD';
        else if (healthScore >= 40) status = 'WARNING';
        else status = 'CRITICAL';

        const healthData: ComponentHealthData = {
            score: healthScore,
            status,
            lastMeasured: new Date().toISOString(),
            component
        };

        dispatch({
            type: 'UPDATE_COMPONENT_HEALTH',
            payload: { assetId, componentId: component, healthData }
        });

        console.log(`[ProjectContext] Component health dispatched: ${assetId}/${component} = ${healthScore} (${status})`);
    };

    return {
        technicalState: state,
        dispatch,
        connectTwinToExpertEngine,
        getDrTurbineConsultation,
        createComplexIdentity, // Exposed for internal hooks
        // NEW: Measurement and Inspection Integration
        addInspectionImage,
        addMeasurement,
        updateAssetHealth,
        // Legacy Compatibility
        siteParams: state.site,
        updateSiteConditions: (updates: any) => dispatch({ type: 'UPDATE_HYDRAULIC', payload: updates }), // Best effort mapping
        updateMechanicalDetails: (updates: any) => dispatch({ type: 'UPDATE_MECHANICAL', payload: updates }),
        updatePenstockSpecs: (updates: any) => {
            dispatch({ type: 'UPDATE_PENSTOCK', payload: updates });
        },
        calculateIntegratedFinancialRisk: () => 0 // Stub for ExecutiveDashboard
    };
};
