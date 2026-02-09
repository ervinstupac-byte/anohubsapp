import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HydraulicStream, MechanicalStream, DiagnosisReport, PhysicsResult, DEFAULT_TECHNICAL_STATE, TechnicalProjectState, SpecializedState } from '../../../core/TechnicalSchema';
import { AssetIdentity } from '../../../types/assetIdentity';
import { PhysicsEngine } from '../../../core/PhysicsEngine';
import { ExpertDiagnosisEngine } from '../../physics-core/ExpertDiagnosisEngine';
import { UnifiedDiagnosis, MasterIntelligenceEngine } from '../../../services/MasterIntelligenceEngine';
import { EnhancedAsset, TurbineConfiguration, FrancisSensorData } from '../../../models/turbine/types';
import { RCAService, RCAInput, RCAResult } from '../../../lib/automation/RCAService';
import { ConnectionStatus, FrequencyPeak, ENGINEERING_THRESHOLDS } from '../../../types/plc';
import { plcGateway } from '../../../core/PLCGateway';
import { CommissioningState } from '../../../lib/commissioning/WizardService';
import { SignalBufferManager, BufferedDataPoint } from '../../../utils/CircularBuffer';
import { FilterType } from '../../../utils/SignalFilter';
import { EfficiencyOptimizer } from '../../../services/EfficiencyOptimizer';
import { TruthJudge, Verdict, SensorHistory } from '../../../services/TruthJudge';
import { ThePulseEngine, SovereignPulse } from '../../../services/ThePulseEngine';
import { PulseArchiver } from '../../../services/PulseArchiver';

// Singleton RCA service for reactive analysis
const rcaService = new RCAService();

// NC-300: Historical buffer for sparklines (50-point capacity)
const signalHistoryManager = new SignalBufferManager(50);

// TruthJudge instance for sensor validation
const truthJudge = new TruthJudge();

const SCHEMA_VERSION = 2;

/**
 * BASELINE STATE
 * "Born Perfect" measurements from commissioning wizard.
 * This is the DNA that the RCA Engine uses for diagnostics.
 */
export interface BaselineState {
    plumbnessDeviation: number;        // mm/m - from alignment step
    bearingClearances: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    runnerMaterial: string;             // 13Cr4Ni, Cast Steel, Bronze
    ceramicCoatingApplied: boolean;
    insulationResistance: number;       // MΩ
    guideVaneGapSymmetry: number;       // mm - absolute difference top vs bottom
    qualityViolation: boolean;          // The Mark of Shame
    commissioningDate: string;          // ISO timestamp
}

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

type SessionLedgerEntry = {
    timestamp: number;
    action: 'START' | 'MANUAL_OVERRIDE' | 'ACKNOWLEDGE' | 'CONFIG_CHANGE' | 'SNAPSHOT_SAVE' | 'SNAPSHOT_LOAD';
    componentId: string | null;
    previousValue: any;
    newValue: any;
    hash: string;
};

interface TelemetryState {
    // High-Frequency Data
    hydraulic: HydraulicStream;
    mechanical: MechanicalStream;
    // Derived Calculations
    physics: Partial<PhysicsResult>;
    diagnosis: DiagnosisReport | null;
    // NC-300: Hill-chart optimizer delta to optimum
    deltaToOptimum?: number;

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
    isCommanderMode: boolean; // Protocol NC-8.0 Implementation

    // NC-300: Unified RCA Results (replaces local DiagnosticRCA state)
    rcaResults: RCAResult[];
    selectedDiagnosticId: string | null; // For context-aware UI filtering
    connectionStatus: ConnectionStatus;

    // NC-300: Persistence Layer - "Born Perfect" baseline from commissioning
    baselineState: BaselineState | null;
    rcaResultsHistory: RCAResult[][]; // Last 10 RCA analysis batches

    // NC-300: Historical buffer for sparklines (50 data points per signal)
    telemetryHistory: {
        vibrationX: BufferedDataPoint<number>[];
        vibrationY: BufferedDataPoint<number>[];
        bearingTemp: BufferedDataPoint<number>[];
        head: BufferedDataPoint<number>[];
        flow: BufferedDataPoint<number>[];
    };

    // NC-300: Signal filter mode toggle (UI uses filtered, RCA uses raw)
    isFilteredMode: boolean;
    filterType: FilterType;
    schemaVersion: number;
    // SCADA: Alarm integration
    activeAlarms: { id: string; severity: 'CRITICAL' | 'WARNING' | 'INFO'; message: string; timestamp: number; acknowledged: boolean }[];
    sessionLedger?: SessionLedgerEntry[];

    // Actions
    updateTelemetry: (payload: TelemetryUpdatePayload) => void;
    setHydraulic: (hydraulic: Partial<HydraulicStream>) => void;
    setMechanical: (mechanical: Partial<MechanicalStream>) => void;
    setConfig: (config: Partial<Pick<TechnicalProjectState, 'identity' | 'site' | 'penstock'>>) => void;
    setFinancials: (financials: TechnicalProjectState['financials']) => void;
    runDeepAnalysis: () => Promise<void>;
    toggleInvestigation: (componentId: string) => void;
    loadScenario: (scenario: DemoScenario) => void;
    toggleCommanderMode: () => void; // Protocol NC-8.0
    selectDiagnostic: (diagnosticId: string | null) => void; // NC-300: Context awareness
    setBaselineFromWizard: (data: CommissioningState) => void; // NC-300: DNA Link
    toggleFilteredMode: () => void; // NC-300: Signal filter toggle
    setFilterType: (filterType: FilterType) => void; // NC-300: Filter type selection
    // NC-300: Ledger state for dossier hashes (G99 audit integrity)
    ledgerState: { dossierHashes: Record<string, string> };
    recordDossierHash: (snapshotId: string, hash: string) => void;
    hardResetIfSchemaMismatch: () => boolean;
    
    // Fleet Management Properties
    units: Record<string, any>;
    fleet: Record<string, any>;
    gridFrequency: number;
    
    // Electrical Model Properties for Total Unit Efficiency
    electrical: {
        generatorEfficiency: number; // η_generator (0-100%)
        transformerEfficiency: number; // η_transformer (0-100%)
        transmissionEfficiency: number; // η_transmission (0-100%)
    };
    
    // TruthJudge Integration - Sensor Validation
    sensorValidation: {
        vibrationX: { isReliable: boolean; confidence: number; verdict: Verdict; lastValue?: number; lastTimestamp: number };
        vibrationY: { isReliable: boolean; confidence: number; verdict: Verdict; lastValue?: number; lastTimestamp: number };
        bearingTemp: { isReliable: boolean; confidence: number; verdict: Verdict; lastValue?: number; lastTimestamp: number };
        head: { isReliable: boolean; confidence: number; verdict: Verdict; lastValue?: number; lastTimestamp: number };
        flow: { isReliable: boolean; confidence: number; verdict: Verdict; lastValue?: number; lastTimestamp: number };
    };
    
    // Sovereign Pulse Integration
    sovereignPulse: {
        index: number;
        subIndices: {
            physical: number;
            financial: number;
            environmental: number;
            cyber: number;
        };
        systemicRisks: string[];
        globalStatus: 'OPTIMAL' | 'STRESSED' | 'CRITICAL' | 'DORMANT';
    };
    // SCADA: Alarm actions
    pushAlarm: (alarm: { id: string; severity: 'CRITICAL' | 'WARNING' | 'INFO'; message: string }) => void;
    acknowledgeAllAlarms: () => void;
    recordLedgerEvent?: (entry: SessionLedgerEntry) => void;
    // Memory management
    cleanup: () => void;
    dispose: () => void;
}

export const useTelemetryStore = create<TelemetryState>()(
    persist(
        (set, get) => ({
            hydraulic: DEFAULT_TECHNICAL_STATE.hydraulic,
            mechanical: DEFAULT_TECHNICAL_STATE.mechanical,
            physics: {},
            diagnosis: null,

            identity: DEFAULT_TECHNICAL_STATE.identity,
            site: DEFAULT_TECHNICAL_STATE.site,
            penstock: DEFAULT_TECHNICAL_STATE.penstock,
            specializedState: DEFAULT_TECHNICAL_STATE.specializedState,
            deltaToOptimum: undefined,

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
            isCommanderMode: true,

            // NC-300: RCA State
            rcaResults: [],
            selectedDiagnosticId: null,
            connectionStatus: plcGateway.getConnectionStatus(),

            // NC-300: Persistence Layer - initialized as null/empty
            baselineState: null,
            rcaResultsHistory: [],

            // NC-300: Historical buffer - initialized empty
            telemetryHistory: {
                vibrationX: [],
                vibrationY: [],
                bearingTemp: [],
                head: [],
                flow: []
            },
            sessionLedger: [],
            
            // Fleet Management - initialized with defaults
            units: {},
            fleet: {},
            gridFrequency: 50.0,
            
            // Electrical Model Properties for Total Unit Efficiency
            electrical: {
                generatorEfficiency: 0.95, // η_generator (0-100%)
                transformerEfficiency: 0.98, // η_transformer (0-100%)
                transmissionEfficiency: 0.99, // η_transmission (0-100%)
                statorTemp: 65, // °C
                rotorFlux: 98.5, // %
                transformerDGA: 0.02 // %
            },
            
            // TruthJudge Integration - Sensor Validation
            sensorValidation: {
                vibrationX: { isReliable: true, confidence: 1.0, verdict: { winner: 'SENSOR_A', confidence: 1.0, reason: 'Initial State', action: 'TRUST_A' }, lastValue: 0, lastTimestamp: Date.now() },
                vibrationY: { isReliable: true, confidence: 1.0, verdict: { winner: 'SENSOR_A', confidence: 1.0, reason: 'Initial State', action: 'TRUST_A' }, lastValue: 0, lastTimestamp: Date.now() },
                bearingTemp: { isReliable: true, confidence: 1.0, verdict: { winner: 'SENSOR_A', confidence: 1.0, reason: 'Initial State', action: 'TRUST_A' }, lastValue: 0, lastTimestamp: Date.now() },
                head: { isReliable: true, confidence: 1.0, verdict: { winner: 'SENSOR_A', confidence: 1.0, reason: 'Initial State', action: 'TRUST_A' }, lastValue: 0, lastTimestamp: Date.now() },
                flow: { isReliable: true, confidence: 1.0, verdict: { winner: 'SENSOR_A', confidence: 1.0, reason: 'Initial State', action: 'TRUST_A' }, lastValue: 0, lastTimestamp: Date.now() }
            },
            
            // Sovereign Pulse Integration - Dynamic Calculation
            sovereignPulse: ThePulseEngine.calculatePulse(
                [100], // Initial asset health array
                0, // Initial revenue rate
                50, // Market price
                0, // Active alarms
                0, // Cyber threat level
                0  // Eco violations
            ),

            // NC-300: Signal filter mode - gauges use filtered, RCA uses raw
            isFilteredMode: true,
            filterType: 'SMA' as FilterType,
            // NC-300: Ledger state
            ledgerState: { dossierHashes: {} },
            schemaVersion: SCHEMA_VERSION,
            activeAlarms: [],

            updateTelemetry: (payload: TelemetryUpdatePayload) => {
                const state = get();
                
                // TruthJudge validation for each sensor
                if (payload.hydraulic?.head !== undefined) {
                    const headVerdict = truthJudge.validateSensor(
                        'head',
                        payload.hydraulic.head,
                        state.sensorValidation.head.lastValue ?? state.hydraulic.head ?? 0,
                        state.sensorValidation.head.lastTimestamp
                    );
                    if (headVerdict.action === 'USE_FALLBACK') {
                        console.warn('TruthJudge: Head sensor unreliable, using fallback');
                        payload.hydraulic!.head = state.hydraulic.head;
                    }
                    set((s) => ({
                        ...s,
                        sensorValidation: {
                            ...s.sensorValidation,
                            head: {
                                ...s.sensorValidation.head,
                                lastValue: payload.hydraulic?.head || 0,
                                lastTimestamp: Date.now(),
                                isReliable: headVerdict.action !== 'USE_FALLBACK',
                                confidence: headVerdict.confidence,
                                verdict: headVerdict
                            }
                        }
                    }));
                }
                
                if (payload.mechanical?.vibrationX !== undefined) {
                    const vibXVerdict = truthJudge.validateSensor(
                        'vibrationX',
                        payload.mechanical.vibrationX,
                        state.sensorValidation.vibrationX.lastValue ?? state.mechanical.vibrationX ?? 0,
                        state.sensorValidation.vibrationX.lastTimestamp
                    );
                    if (vibXVerdict.action === 'USE_FALLBACK') {
                        console.warn('TruthJudge: VibrationX sensor unreliable, using fallback');
                        payload.mechanical!.vibrationX = state.mechanical.vibrationX;
                    }
                    set((s) => ({
                        ...s,
                        sensorValidation: {
                            ...s.sensorValidation,
                            vibrationX: {
                                ...s.sensorValidation.vibrationX,
                                lastValue: payload.mechanical?.vibrationX || 0,
                                lastTimestamp: Date.now(),
                                isReliable: vibXVerdict.action !== 'USE_FALLBACK',
                                confidence: vibXVerdict.confidence,
                                verdict: vibXVerdict
                            }
                        }
                    }));
                }
                
                if (payload.mechanical?.vibrationY !== undefined) {
                    const vibYVerdict = truthJudge.validateSensor(
                        'vibrationY',
                        payload.mechanical.vibrationY,
                        state.sensorValidation.vibrationY.lastValue ?? state.mechanical.vibrationY ?? 0,
                        state.sensorValidation.vibrationY.lastTimestamp
                    );
                    if (vibYVerdict.action === 'USE_FALLBACK') {
                        console.warn('TruthJudge: VibrationY sensor unreliable, using fallback');
                        payload.mechanical!.vibrationY = state.mechanical.vibrationY;
                    }
                    set((s) => ({
                        ...s,
                        sensorValidation: {
                            ...s.sensorValidation,
                            vibrationY: {
                                ...s.sensorValidation.vibrationY,
                                lastValue: payload.mechanical?.vibrationY || 0,
                                lastTimestamp: Date.now(),
                                isReliable: vibYVerdict.action !== 'USE_FALLBACK',
                                confidence: vibYVerdict.confidence,
                                verdict: vibYVerdict
                            }
                        }
                    }));
                }
                
                if (payload.mechanical?.bearingTemp !== undefined) {
                    const tempVerdict = truthJudge.validateSensor(
                        'bearingTemp',
                        payload.mechanical.bearingTemp,
                        state.sensorValidation.bearingTemp.lastValue ?? state.mechanical.bearingTemp ?? 0,
                        state.sensorValidation.bearingTemp.lastTimestamp
                    );
                    if (tempVerdict.action === 'USE_FALLBACK') {
                        console.warn('TruthJudge: Bearing temp sensor unreliable, using fallback');
                        payload.mechanical!.bearingTemp = state.mechanical.bearingTemp;
                    }
                    set((s) => ({
                        ...s,
                        sensorValidation: {
                            ...s.sensorValidation,
                            bearingTemp: {
                                ...s.sensorValidation.bearingTemp,
                                lastValue: payload.mechanical?.bearingTemp || 0,
                                lastTimestamp: Date.now(),
                                isReliable: tempVerdict.action !== 'USE_FALLBACK',
                                confidence: tempVerdict.confidence,
                                verdict: tempVerdict
                            }
                        }
                    }));
                }
                
                if (payload.hydraulic?.flow !== undefined) {
                    const flowVerdict = truthJudge.validateSensor(
                        'flow',
                        payload.hydraulic.flow,
                        state.sensorValidation.flow.lastValue ?? state.hydraulic.flow ?? 0,
                        state.sensorValidation.flow.lastTimestamp
                    );
                    if (flowVerdict.action === 'USE_FALLBACK') {
                        console.warn('TruthJudge: Flow sensor unreliable, using fallback');
                        payload.hydraulic!.flow = state.hydraulic.flow;
                    }
                    set((s) => ({
                        ...s,
                        sensorValidation: {
                            ...s.sensorValidation,
                            flow: {
                                ...s.sensorValidation.flow,
                                lastValue: payload.hydraulic?.flow || 0,
                                lastTimestamp: Date.now(),
                                isReliable: flowVerdict.action !== 'USE_FALLBACK',
                                confidence: flowVerdict.confidence,
                                verdict: flowVerdict
                            }
                        }
                    }));
                }

                // Update telemetry with validated values
                set((state) => ({
                    hydraulic: { ...state.hydraulic, ...payload.hydraulic },
                    mechanical: { ...state.mechanical, ...payload.mechanical },
                    identity: payload.identity ?? state.identity,
                    site: payload.site ?? state.site,
                    penstock: payload.penstock ?? state.penstock,
                    diagnosis: payload.diagnosis ?? state.diagnosis,
                    financials: payload.financials ?? state.financials,
                    structural: payload.structural ?? state.structural,
                    specializedState: payload.specializedState ?? state.specializedState,
                    unifiedDiagnosis: payload.unifiedDiagnosis ?? state.unifiedDiagnosis,
                    investigatedComponents: payload.investigatedComponents ?? state.investigatedComponents,
                    acousticMatch: payload.acousticMatch ?? state.acousticMatch,
                    insulationResistance: payload.insulationResistance ?? state.insulationResistance,
                    geodeticData: payload.geodeticData ?? state.geodeticData,
                    lastUpdate: new Date().toISOString(),
                    // Not part of TelemetryUpdatePayload: keep existing store state
                    magneticData: state.magneticData,
                    isCommanderMode: state.isCommanderMode,
                    rcaResults: state.rcaResults,
                    selectedDiagnosticId: state.selectedDiagnosticId,
                    connectionStatus: state.connectionStatus,
                    baselineState: state.baselineState,
                    rcaResultsHistory: state.rcaResultsHistory,
                    telemetryHistory: {
                        vibrationX: payload.mechanical?.vibrationX !== undefined ? 
                            [...state.telemetryHistory.vibrationX, { value: payload.mechanical.vibrationX, timestamp: Date.now() }] : 
                            state.telemetryHistory.vibrationX,
                        vibrationY: payload.mechanical?.vibrationY !== undefined ? 
                            [...state.telemetryHistory.vibrationY, { value: payload.mechanical.vibrationY, timestamp: Date.now() }] : 
                            state.telemetryHistory.vibrationY,
                        bearingTemp: payload.mechanical?.bearingTemp !== undefined ? 
                            [...state.telemetryHistory.bearingTemp, { value: payload.mechanical.bearingTemp, timestamp: Date.now() }] : 
                            state.telemetryHistory.bearingTemp,
                        head: payload.hydraulic?.head !== undefined ? 
                            [...state.telemetryHistory.head, { value: payload.hydraulic.head, timestamp: Date.now() }] : 
                            state.telemetryHistory.head,
                        flow: payload.hydraulic?.flow !== undefined ? 
                            [...state.telemetryHistory.flow, { value: payload.hydraulic.flow, timestamp: Date.now() }] : 
                            state.telemetryHistory.flow
                    },
                    // Update Sovereign Pulse with new telemetry
                    sovereignPulse: ThePulseEngine.calculatePulse(
                        [state.mechanical.vibrationX || 100], // Asset health from vibration
                        state.financials?.lostRevenueEuro || 0, // Revenue rate
                        50, // Market price
                        state.activeAlarms?.length || 0, // Active alarms
                        0, // Cyber threat level
                        0  // Eco violations
                    )
                }));
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
            },

            toggleCommanderMode: () => {
                set((state) => ({ isCommanderMode: !state.isCommanderMode }));
            },

            // NC-300: Context-aware diagnostic selection
            selectDiagnostic: (diagnosticId) => {
                set({ selectedDiagnosticId: diagnosticId });
            },

            // NC-300: DNA Link - Establish baseline from commissioning wizard
            setBaselineFromWizard: (data: CommissioningState) => {
                const baseline: BaselineState = {
                    plumbnessDeviation: data.alignment.plumbnessDeviation,
                    bearingClearances: {
                        top: data.bearings.clearanceTop,
                        bottom: data.bearings.clearanceBottom,
                        left: data.bearings.clearanceLeft,
                        right: data.bearings.clearanceRight
                    },
                    runnerMaterial: data.metallurgy.runnerMaterial,
                    ceramicCoatingApplied: data.metallurgy.ceramicCoatingApplied,
                    insulationResistance: data.electrical.insulationResistance,
                    guideVaneGapSymmetry: Math.abs(
                        data.hydraulic.guideVaneGapTopAvg - data.hydraulic.guideVaneGapBottomAvg
                    ),
                    qualityViolation: data.hydraulic.qualityViolation || false,
                    commissioningDate: new Date().toISOString()
                };
                set({ baselineState: baseline });
                console.log('🧬 [TelemetryStore] Baseline DNA established:', baseline);
            },

            // NC-300: Toggle filtered mode for signal display
            toggleFilteredMode: () => {
                set((state) => ({ isFilteredMode: !state.isFilteredMode }));
            },

            // NC-300: Set filter type (SMA, EMA, NONE)
            setFilterType: (filterType: FilterType) => {
                set({ filterType });
            },

            // NC-300: Record dossier hash for G99 audits
            recordDossierHash: (snapshotId: string, hash: string) => {
                set((state) => ({
                    ledgerState: {
                        dossierHashes: {
                            ...state.ledgerState.dossierHashes,
                            [snapshotId]: hash
                        }
                    }
                }));
            },

            hardResetIfSchemaMismatch: () => {
                try {
                    const key = 'monolit-telemetry-store';
                    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
                    if (!raw) return false;
                    const parsed = JSON.parse(raw);
                    const saved = parsed?.state?.schemaVersion;
                    if (saved !== SCHEMA_VERSION) {
                        if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
                        set({
                            hydraulic: DEFAULT_TECHNICAL_STATE.hydraulic,
                            mechanical: DEFAULT_TECHNICAL_STATE.mechanical,
                            physics: {},
                            diagnosis: null,
                            identity: DEFAULT_TECHNICAL_STATE.identity,
                            site: DEFAULT_TECHNICAL_STATE.site,
                            penstock: DEFAULT_TECHNICAL_STATE.penstock,
                            specializedState: DEFAULT_TECHNICAL_STATE.specializedState,
                            deltaToOptimum: undefined,
                            financials: DEFAULT_TECHNICAL_STATE.financials,
                            structural: DEFAULT_TECHNICAL_STATE.structural,
                            unifiedDiagnosis: null,
                            investigatedComponents: [],
                            geodeticData: { settlement: 0.12, tilt: 0.05 },
                            magneticData: { eccentricity: 0.25, fluxBalance: 98.5 },
                            acousticMatch: 99.2,
                            insulationResistance: 1250,
                            lastUpdate: new Date().toISOString(),
                            isCommanderMode: true,
                            rcaResults: [],
                            selectedDiagnosticId: null,
                            connectionStatus: plcGateway.getConnectionStatus(),
                            baselineState: null,
                            rcaResultsHistory: [],
                            telemetryHistory: {
                                vibrationX: [],
                                vibrationY: [],
                                bearingTemp: [],
                                head: [],
                                flow: []
                            },
                            isFilteredMode: true,
                            filterType: 'SMA' as FilterType,
                            ledgerState: { dossierHashes: {} },
                            schemaVersion: SCHEMA_VERSION
                        });
                        return true;
                    }
                    return false;
                } catch {
                    return false;
                }
            },

            pushAlarm: (alarm) => {
                set((state) => {
                    const entry = {
                        id: alarm.id,
                        severity: alarm.severity,
                        message: alarm.message,
                        timestamp: Date.now(),
                        acknowledged: false
                    };
                    const next = [...state.activeAlarms, entry].slice(-25);
                    return { activeAlarms: next };
                });
            },

            acknowledgeAllAlarms: () => {
                set((state) => {
                    const acked = state.activeAlarms.map(a => ({ ...a, acknowledged: true }));
                    return { activeAlarms: acked };
                });
            },

            recordLedgerEvent: (entry: SessionLedgerEntry) => {
                set((state) => ({
                    sessionLedger: [...(state.sessionLedger || []), entry].slice(-200)
                }));
            },

            // Memory management methods
            cleanup: () => {
                const state = get();
                // Clear transient data to prevent memory leaks
                set({
                    ...state,
                    rcaResults: [],
                    activeAlarms: [],
                    telemetryHistory: {
                        vibrationX: signalHistoryManager.getBuffer('vibrationX')?.getAll()?.slice(-20) ?? [],
                        vibrationY: signalHistoryManager.getBuffer('vibrationY')?.getAll()?.slice(-20) ?? [],
                        bearingTemp: signalHistoryManager.getBuffer('bearingTemp')?.getAll()?.slice(-20) ?? [],
                        head: signalHistoryManager.getBuffer('head')?.getAll()?.slice(-20) ?? [],
                        flow: signalHistoryManager.getBuffer('flow')?.getAll()?.slice(-20) ?? []
                    }
                });
            },

            dispose: () => {
                // Complete cleanup - clear all buffers and reset state
                // Clear all signal buffers
                ['vibrationX', 'vibrationY', 'bearingTemp', 'head', 'flow'].forEach(signalId => {
                    const buffer = signalHistoryManager.getBuffer(signalId);
                    if (buffer) buffer.clear();
                });
                
                set({
                    hydraulic: DEFAULT_TECHNICAL_STATE.hydraulic,
                    mechanical: DEFAULT_TECHNICAL_STATE.mechanical,
                    physics: {},
                    diagnosis: null,
                    rcaResults: [],
                    activeAlarms: [],
                    telemetryHistory: {
                        vibrationX: [],
                        vibrationY: [],
                        bearingTemp: [],
                        head: [],
                        flow: []
                    },
                    investigatedComponents: [],
                    selectedDiagnosticId: null,
                    lastUpdate: new Date().toISOString()
                });
            }
        }),
        {
            name: 'monolit-telemetry-store',
            // NC-300: Only persist critical state, NOT transient telemetry
            partialize: (state) => ({
                baselineState: state.baselineState,
                site: state.site,
                identity: state.identity,
                rcaResultsHistory: state.rcaResultsHistory.slice(-10), // Last 10 only
                isFilteredMode: state.isFilteredMode,
                filterType: state.filterType,
                ledgerState: state.ledgerState,
                sessionLedger: state.sessionLedger?.slice(-50) ?? [],
                schemaVersion: state.schemaVersion
            })
        }
    )
);
