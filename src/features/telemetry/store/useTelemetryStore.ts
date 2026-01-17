import { create } from 'zustand';
import { HydraulicStream, MechanicalStream, DiagnosisReport, PhysicsResult, DEFAULT_TECHNICAL_STATE, TechnicalProjectState } from '../../../models/TechnicalSchema';
import { AssetIdentity } from '../../../types/assetIdentity';
import { PhysicsEngine } from '../../physics-core/PhysicsEngine';
import { ExpertDiagnosisEngine } from '../../physics-core/ExpertDiagnosisEngine';
import { UnifiedDiagnosis, MasterIntelligenceEngine } from '../../../services/MasterIntelligenceEngine';
import { EnhancedAsset } from '../../../models/turbine/types';

// Custom payload to allow partial updates to streams
type TelemetryUpdatePayload = {
    hydraulic?: Partial<HydraulicStream>;
    mechanical?: Partial<MechanicalStream>;
    identity?: AssetIdentity;
    site?: TechnicalProjectState['site'];
    penstock?: TechnicalProjectState['penstock'];
    diagnosis?: DiagnosisReport | null;
    financials?: TechnicalProjectState['financials'];
    structural?: TechnicalProjectState['structural'];
    specializedState?: TechnicalProjectState['specializedState'];
    unifiedDiagnosis?: UnifiedDiagnosis | null;
    investigatedComponents?: string[];
    // NC-4.9 additions
    acousticMatch?: number;
    insulationResistance?: number;
    geodeticData?: { settlement: number; tilt: number };
};

export type DemoScenario = 'NOMINAL' | 'CAVITATION' | 'BEARING_HAZARD' | 'STRUCTURAL_ANOMALY' | 'CHRONIC_MISALIGNMENT';

interface TelemetryState {
    // High-Frequency Data
    hydraulic: HydraulicStream;
    mechanical: MechanicalStream;
    // Derived Calculations
    physics: Partial<PhysicsResult>;
    diagnosis: DiagnosisReport | null;

    // Static / Low-Frequency Config (Required for Physics Math)
    identity: AssetIdentity;
    site: TechnicalProjectState['site'];
    penstock: TechnicalProjectState['penstock'];
    specializedState: TechnicalProjectState['specializedState']; // Derived/Mocked Specialized Data

    // New Batch 6 additions
    financials: TechnicalProjectState['financials'];
    structural: TechnicalProjectState['structural'];
    unifiedDiagnosis: UnifiedDiagnosis | null; // NC-4.4 Unified Brain Output
    investigatedComponents: string[];

    // Hidden Engineering State (Surfaced in NC-4.9)
    geodeticData: {
        settlement: number;
        tilt: number;
    };
    magneticData: {
        eccentricity: number;
        fluxBalance: number;
    };
    acousticMatch: number; // % match to baseline fingerprint
    insulationResistance: number; // MΩ

    lastUpdate: string;

    // Actions
    updateTelemetry: (payload: TelemetryUpdatePayload) => void;
    setHydraulic: (hydraulic: Partial<HydraulicStream>) => void;
    setMechanical: (mechanical: Partial<MechanicalStream>) => void;
    setConfig: (config: Partial<Pick<TechnicalProjectState, 'identity' | 'site' | 'penstock'>>) => void;
    setFinancials: (financials: TechnicalProjectState['financials']) => void;
    runDeepAnalysis: () => Promise<void>;
    toggleInvestigation: (componentId: string) => void;
    loadScenario: (scenario: DemoScenario) => void;
}

export const useTelemetryStore = create<TelemetryState>((set, get) => ({
    hydraulic: DEFAULT_TECHNICAL_STATE.hydraulic,
    mechanical: DEFAULT_TECHNICAL_STATE.mechanical,
    physics: {},
    diagnosis: null,

    identity: DEFAULT_TECHNICAL_STATE.identity,
    site: DEFAULT_TECHNICAL_STATE.site,
    penstock: DEFAULT_TECHNICAL_STATE.penstock,
    specializedState: DEFAULT_TECHNICAL_STATE.specializedState,

    financials: DEFAULT_TECHNICAL_STATE.financials,
    structural: DEFAULT_TECHNICAL_STATE.structural,
    unifiedDiagnosis: null,
    riskScore: 0, // Initialized riskScore
    investigatedComponents: [],

    geodeticData: { settlement: 0.12, tilt: 0.05 },
    magneticData: { eccentricity: 0.25, fluxBalance: 98.5 },
    acousticMatch: 99.2,
    insulationResistance: 1250,

    lastUpdate: new Date().toISOString(),

    updateTelemetry: (payload: TelemetryUpdatePayload) => {
        set((state) => {
            // 1. Merge Raw Telemetry
            const nextHydraulic = payload.hydraulic ? { ...state.hydraulic, ...payload.hydraulic } : state.hydraulic;
            const nextMechanical = payload.mechanical ? { ...state.mechanical, ...payload.mechanical } : state.mechanical;

            // 2. Construct Calculation Context (Virtual State)
            // We use the store's current config + new telemetry
            const calcContext: TechnicalProjectState = {
                ...DEFAULT_TECHNICAL_STATE, // Fallback for missing top-level fields
                ...state, // Spread current store state
                hydraulic: nextHydraulic,
                mechanical: nextMechanical,
                identity: payload.identity || state.identity,
                site: payload.site || state.site,
                penstock: payload.penstock || state.penstock,
                specializedState: payload.specializedState || state.specializedState, // Pass through specialized state
                financials: payload.financials || state.financials,
                structural: payload.structural || state.structural,
                // fix: ensure physics is a full object, merging partials from state with defaults
                physics: { ...DEFAULT_TECHNICAL_STATE.physics, ...(state.physics as any) },
                diagnosis: state.diagnosis || undefined
            };

            // 3. Run Logic Engines
            // We use the Pure Physics Engine to get derived physics metrics
            const physicsResult = PhysicsEngine.recalculatePhysics(calcContext);

            // We run Expert Diagnosis on the result
            const assessment = ExpertDiagnosisEngine.runExpertDiagnosis(physicsResult, calcContext);

            return {
                hydraulic: nextHydraulic,
                mechanical: nextMechanical,
                physics: physicsResult,
                diagnosis: assessment,
                identity: calcContext.identity, // Update if payload had it
                site: calcContext.site,
                penstock: calcContext.penstock,
                specializedState: calcContext.specializedState,
                financials: calcContext.financials,
                structural: calcContext.structural,
                unifiedDiagnosis: payload.unifiedDiagnosis || state.unifiedDiagnosis,
                investigatedComponents: payload.investigatedComponents || state.investigatedComponents,
                // NC-4.9 merges
                acousticMatch: payload.acousticMatch !== undefined ? payload.acousticMatch : state.acousticMatch,
                insulationResistance: payload.insulationResistance !== undefined ? payload.insulationResistance : state.insulationResistance,
                geodeticData: payload.geodeticData ? { ...state.geodeticData, ...payload.geodeticData } : state.geodeticData,
                lastUpdate: new Date().toISOString()
            };
        });
    },

    setHydraulic: (hydraulic) => {
        get().updateTelemetry({ hydraulic });
    },

    setMechanical: (mechanical) => {
        get().updateTelemetry({ mechanical });
    },

    setFinancials: (financials) => {
        get().updateTelemetry({ financials });
    },

    setConfig: (config) => {
        set((state) => ({
            ...state,
            ...config,
            lastUpdate: new Date().toISOString()
        }));
        // Trigger recalc with new config
        get().updateTelemetry({});
    },

    runDeepAnalysis: async () => {
        const state = get();

        // Construct basic asset for engine with extra telemetry field for the engine to consume
        const mockAsset: any = {
            id: state.identity.assetId || 'HPP-101',
            name: state.identity.assetName || 'Hydro Asset',
            type: 'HPP',
            location: state.identity.location || 'Unknown',
            coordinates: [0, 0],
            capacity: state.identity.machineConfig.ratedPowerMW,
            turbine_family: 'FRANCIS',
            turbine_variant: 'francis_vertical',
            status: 'Operational',
            turbine_config: {
                head: state.identity.machineConfig.ratedHeadM || 150,
                flow_max: state.identity.machineConfig.ratedFlowM3S || 45,
                runner_diameter: 1.2,
                commissioning_date: '2020-01-01',
                manufacturer: 'ANOHUBS',
                serial_number: 'SN-001'
            },
            telemetry: {
                latest: {
                    common: {
                        timestamp: new Date().toISOString(),
                        vibration: state.mechanical.vibrationX || 1.2,
                        temperature: state.mechanical.bearingTemp || 45,
                        flow: state.hydraulic.flow || 42,
                        head: state.hydraulic.head || 150
                    },
                    specialized: {
                        flowRate: state.hydraulic.flow || 42,
                        netHead: state.hydraulic.head || 150,
                        geodeticData: state.geodeticData,
                        acoustic: {
                            fingerprintMatch: state.acousticMatch
                        }
                    } as any
                },
                history: []
            }
        };

        try {
            const diagnosis = await MasterIntelligenceEngine.analyzeAsset(mockAsset as EnhancedAsset, []);
            set({ unifiedDiagnosis: diagnosis });
        } catch (error) {
            console.error("Deep AI Analysis failed:", error);
        }
    },

    toggleInvestigation: (componentId) => {
        set((state) => {
            const current = state.investigatedComponents || [];
            const isInvestigated = current.includes(componentId);
            const next = isInvestigated
                ? current.filter(id => id !== componentId)
                : [...current, componentId];

            return { investigatedComponents: next };
        });
    },

    loadScenario: (scenario) => {
        const { updateTelemetry, runDeepAnalysis } = get();

        switch (scenario) {
            case 'CAVITATION':
                updateTelemetry({
                    mechanical: { rpm: 480, vibrationX: 5.2, vibrationY: 4.8 },
                });
                // Trigger analysis to get the converged findings
                runDeepAnalysis();
                break;

            case 'BEARING_HAZARD':
                updateTelemetry({
                    mechanical: { rpm: 500, vibrationX: 3.8, bearingTemp: 82 },
                });
                runDeepAnalysis();
                break;

            case 'STRUCTURAL_ANOMALY':
                updateTelemetry({
                    mechanical: { vibrationX: 6.8, vibrationY: 7.2 },
                });
                runDeepAnalysis();
                break;

            case 'CHRONIC_MISALIGNMENT':
                updateTelemetry({
                    mechanical: { rpm: 500, vibrationX: 7.2, vibrationY: 1.5, bearingTemp: 68 },
                    // Inject 2x Harmonic Ratio via specialized specializedState for Rule 1
                    specializedState: {
                        ...get().specializedState,
                        acoustic: {
                            fingerprintMatch: 85,
                            harmonics: {
                                1: 2.0, // 1x Amplitude
                                2: 4.5  // 2x Amplitude (> 1.5x of 1x)
                            }
                        }
                    } as any
                });
                runDeepAnalysis();
                break;

            case 'NOMINAL':
            default:
                updateTelemetry({
                    mechanical: { rpm: 500, vibrationX: 1.2, vibrationY: 1.1, bearingTemp: 52 },
                    unifiedDiagnosis: null
                });
                break;
        }
    }
}));
