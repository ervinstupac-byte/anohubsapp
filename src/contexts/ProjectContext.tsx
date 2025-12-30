
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { TechnicalProjectState, ProjectAction, ComponentHealthData } from '../models/TechnicalSchema';
import { PhysicsEngine } from '../services/PhysicsEngine';
import { ExpertDiagnosisEngine } from '../services/ExpertDiagnosisEngine';
import { DrTurbineAI } from '../services/DrTurbineAI';

const ProjectContext = createContext<{
    state: TechnicalProjectState;
    dispatch: React.Dispatch<ProjectAction>;
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
        case 'UPDATE_FRANCIS_MODULE': {
            const { moduleId, status } = action.payload;
            const currentFrancis = state.francis || {
                modules: {},
                healthScore: 100,
                activeRisks: []
            };

            const updatedModules = {
                ...currentFrancis.modules,
                [moduleId]: status
            };

            // Recalculate Logic (Ideally this logic should live in FrancisModel, but for state sync we do it here or via effect)
            // For now, we update the state, and let the Component consuming it trigger the model recalculation
            // OR we can invoke the FrancisModel logic here if we want pure business logic separation.
            // Let's adhere to the pattern: Reducer updates state, Engine logic recalculates derived data.
            // Since the Health Score in FrancisHub is driven by the model inside the component, we just update the module state here.
            // However, to make it "Core", we should ideally run the calculation here.

            return {
                ...state,
                francis: {
                    ...currentFrancis,
                    modules: updatedModules
                }
            };
        }
        case 'RESET_TO_DEMO':
            return PhysicsEngine.recalculateProjectPhysics(state); // Re-validate
        default:
            return state;
    }
};

export const ProjectProvider = ({ children, initialState }: { children: ReactNode, initialState: TechnicalProjectState }) => {
    const [state, dispatch] = useReducer(cerebroReducer, initialState);

    return (
        <ProjectContext.Provider value={{ state, dispatch }}>
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
export const useProjectEngine = () => {
    const { state, dispatch } = useCerebro();

    // Helper to bridge Simple Identity -> Complex AssetIdentity
    const createComplexIdentity = () => {
        if (!state.identity) return null;
        // Construct a FULL AssetIdentity from the simple definition + state context
        return {
            assetId: state.identity.id,
            assetName: state.identity.name,
            turbineType: state.identity.type.toUpperCase() as any, // 'PELTON' | 'KAPLAN' ...
            manufacturer: 'AnoHUB Legacy',
            commissioningYear: 2020,
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
                penstockType: state.penstock?.material as any || 'STEEL',
                penstockDiameterMM: (state.penstock?.diameter || 1) * 1000,
                penstockLengthM: state.penstock?.length || 100,
                penstockThicknessMM: (state.penstock?.wallThickness || 0.01) * 1000,
                sludgeRemoval: { hasSludgeCleaner: false, erosionRiskScore: 0 },
                waterQuality: { sedimentContentMGL: 0, abrasivityIndex: 'LOW', phLevel: 7 }
            },
            operationalMapping: {
                operatingPoints: [], currentPoint: null,
                hillChart: { dataPoints: 0, coveragePercent: 0, lastUpdated: '' },
                bestEfficiencyPoint: null
            },
            francisAdvanced: { // Mock for Francis calculations
                frontRunnerClearanceMM: 0.4,
                backRunnerClearanceMM: 0.4,
                spiralClearanceMM: 0.5,
                labyrinthGaps: { upperLabyrinthMM: 0.5, lowerLabyrinthMM: 0.5, sealType: 'METALLIC' },
                draftTubePressure: { nominalBar: 1, minBar: 0, maxBar: 2, sensorInstalled: false },
                backRunnerPressure: { nominalBar: 1, minBar: 0, maxBar: 2, sensorInstalled: false },
                axialThrustBalanced: true,
                pressureDifferenceBar: 0
            }
        } as any; // Cast as any because AssetIdentity is very complex
    };

    const connectSCADAToExpertEngine = (flow: number, head: number, frequency: number) => {
        const complexIdentity = createComplexIdentity();
        if (!complexIdentity) return null;

        // 1. Run Diagnostics
        const diagnostics = ExpertDiagnosisEngine.runDiagnostics(
            complexIdentity,
            state.site?.temperature || 20,
            'OIL',
            50, // Default rotor weight tons
            flow,
            head,
            frequency
        );

        // 2. Calculate Health
        const health = ExpertDiagnosisEngine.calculateHealthScore(diagnostics);

        // 3. Aggregate Critical Alarms
        const criticalAlarms: { message: string }[] = [];
        if (diagnostics.gridRisk?.severity === 'CRITICAL') criticalAlarms.push({ message: diagnostics.gridRisk.message });
        if (diagnostics.cavitationRisk?.severity === 'CRITICAL') criticalAlarms.push({ message: diagnostics.cavitationRisk.message });
        if (diagnostics.thermalRisk.severity === 'CRITICAL') criticalAlarms.push({ message: diagnostics.thermalRisk.description });
        if (diagnostics.jackingRisk?.severity === 'CRITICAL') criticalAlarms.push({ message: diagnostics.jackingRisk.alarm });

        return {
            healthScore: health.overall,
            criticalAlarms,
            diagnostics
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
        connectSCADAToExpertEngine,
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
