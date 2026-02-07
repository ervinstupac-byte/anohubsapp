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

// Singleton RCA service for reactive analysis
const rcaService = new RCAService();

// NC-300: Historical buffer for sparklines (50-point capacity)
const signalHistoryManager = new SignalBufferManager(50);

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
    isCommanderMode: boolean; // Protocol NC-8.0 Implementation

    // NC-300: Unified RCA Results (replaces local DiagnosticRCA state)
    rcaResults: RCAResult[];
    selectedDiagnosticId: string | null; // For context-aware UI filtering
    connectionStatus: ConnectionStatus;

    // NC-23: Fleet State Slice
    fleet: {
        totalMW: number;
        efficiencyAvg: number;
        activeAssets: number;
        status: 'NOMINAL' | 'CRITICAL';
        lastOptimization?: number; // timestamp
    };
    units: Record<string, any>;
    gridFrequency: number;

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

    // NC-87.1: Maintenance Safety
    isMaintenanceLocked: boolean;
    toggleLOTO: () => void;

    // NC-23: Fleet Actions
    updateFleetMetrics: (metrics: Partial<TelemetryState['fleet']>) => void;
    triggerFleetAlert: (message: string, severity: 'INFO' | 'WARNING' | 'CRITICAL') => void;
    distributeFleetLoad: (targetTotalMW: number) => void;
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

            // NC-300: Signal filter mode - gauges use filtered, RCA uses raw
            isFilteredMode: true,
            filterType: 'SMA' as FilterType,

            // NC-23: Initial Fleet State
            fleet: {
                totalMW: 0,
                efficiencyAvg: 0,
                activeAssets: 0,
                status: 'NOMINAL'
            },
            units: {},
            gridFrequency: 50.000,
            isMaintenanceLocked: false,
            toggleLOTO: () => {
                set((state) => {
                    const next = !state.isMaintenanceLocked;
                    // Log to Ledger
                    import('../../../services/EventJournal').then(({ EventJournal }) => {
                        EventJournal.append('LOTO_TOGGLE', {
                            locked: next,
                            operator: 'MONOLIT_ARCHITECT',
                            timestamp: new Date().toISOString()
                        });
                    });
                    return { isMaintenanceLocked: next };
                });
            },

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
                        physics: { ...DEFAULT_TECHNICAL_STATE.physics, ...state.physics } as any,
                        diagnosis: state.diagnosis || undefined
                    };

                    // 3. Run Logic Engines
                    // We use the Pure Physics Engine to get derived physics metrics
                    const physicsResult = PhysicsEngine.recalculatePhysics(calcContext);

                    // NC-85.2: Async efficiency override via Worker
                    // We fire this as a side-effect to avoid locking the store update
                    // Ideally we would await this, but that makes the store async.
                    // For now, we fire-and-forget, and a separate action will update the precise efficiency later.
                    // OR: We just rely on the component layer for visuals (HydrologyLab)
                    // But to satisfy "All Charts use Async", we should trigger it here.

                    import('../../../lib/engines/KaplanEngine').then(async ({ KaplanEngine }) => {
                        const engine = new KaplanEngine();
                        const efficiency = await engine.calculateEfficiencyAsync(
                            calcContext.hydraulic.head || 100,
                            calcContext.hydraulic.flow || 40,
                            20
                        );

                        // NC-85.2: Apply async physics result to store
                        // We use functional set to merge into existing physics state
                        set((s) => ({
                            physics: {
                                ...s.physics,
                                efficiency
                            }
                        }));
                    }).catch(err => console.error('Async efficiency calculation failed:', err));

                    // We run Expert Diagnosis on the result
                    const assessment = ExpertDiagnosisEngine.runExpertDiagnosis(physicsResult, calcContext);

                    // NC-300: Run RCA Engine with reactive trigger
                    const f0 = (nextMechanical.rpm ?? 0) / 60;
                    const vibration = nextMechanical.vibrationX ?? 0;
                    const syntheticPeaks: FrequencyPeak[] = [];
                    if (vibration > 3.0) syntheticPeaks.push({ frequencyHz: f0, amplitudeMmS: vibration * 0.8 });
                    if (vibration > 1.5) syntheticPeaks.push({ frequencyHz: f0 * 2, amplitudeMmS: vibration * 0.4 });

                    const rcaInput: RCAInput = {
                        rpm: nextMechanical.rpm ?? 0,
                        metrics: {
                            vibrationMmS: vibration,
                            efficiencyPercent: nextHydraulic.efficiency ?? 92,
                            bearingTempC: nextMechanical.bearingTemp ?? 45,
                            bearingTempRateOfChange: 0.3 // Would be calculated from history
                        },
                        peaks: syntheticPeaks,
                        maintenance: {
                            // NC-300: Use baseline DNA if available
                            shaftPlumbnessDeviation: state.baselineState?.plumbnessDeviation ?? 0.02,
                            // NC-300: Wire bearing clearances from baseline DNA
                            bearingClearances: state.baselineState?.bearingClearances
                        },
                        specifications: {
                            // NC-300: Use baseline DNA if available
                            runnerMaterial: (state.baselineState?.runnerMaterial ?? 'Cast Steel') as 'Cast Steel' | '13Cr4Ni' | 'Bronze'
                        }
                    };

                    // Only run RCA if vibration exceeds watch threshold
                    const rcaResults = vibration > ENGINEERING_THRESHOLDS.vibration['2x_RPM_WARNING']
                        ? rcaService.analyze(rcaInput)
                        : [];

                    // NC-300: Record historical data for sparklines
                    if (payload.mechanical?.vibrationX !== undefined) {
                        signalHistoryManager.record('vibrationX', payload.mechanical.vibrationX);
                    }
                    if (payload.mechanical?.vibrationY !== undefined) {
                        signalHistoryManager.record('vibrationY', payload.mechanical.vibrationY);
                    }
                    if (payload.mechanical?.bearingTemp !== undefined) {
                        signalHistoryManager.record('bearingTemp', payload.mechanical.bearingTemp);
                    }
                    if (payload.hydraulic?.head !== undefined) {
                        signalHistoryManager.record('head', payload.hydraulic.head);
                    }
                    if (payload.hydraulic?.flow !== undefined) {
                        signalHistoryManager.record('flow', payload.hydraulic.flow);
                    }

                    // NC-300: Update RCA history (keep last 10 batches)
                    const updatedRcaHistory = rcaResults.length > 0
                        ? [...state.rcaResultsHistory.slice(-9), rcaResults]
                        : state.rcaResultsHistory;

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
                        acousticMatch: payload.acousticMatch !== undefined ? payload.acousticMatch : state.acousticMatch,
                        insulationResistance: payload.insulationResistance !== undefined ? payload.insulationResistance : state.insulationResistance,
                        geodeticData: payload.geodeticData ? { ...state.geodeticData, ...payload.geodeticData } : state.geodeticData,
                        lastUpdate: new Date().toISOString(),
                        // NC-300: Include RCA results and history in state update
                        rcaResults,
                        rcaResultsHistory: updatedRcaHistory,
                        // NC-300: Include telemetry history snapshot for sparklines
                        telemetryHistory: {
                            vibrationX: signalHistoryManager.getBuffer('vibrationX')?.getAll() ?? [],
                            vibrationY: signalHistoryManager.getBuffer('vibrationY')?.getAll() ?? [],
                            bearingTemp: signalHistoryManager.getBuffer('bearingTemp')?.getAll() ?? [],
                            head: signalHistoryManager.getBuffer('head')?.getAll() ?? [],
                            flow: signalHistoryManager.getBuffer('flow')?.getAll() ?? []
                        }
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

            // NC-23: Update aggregated fleet metrics
            updateFleetMetrics: (metrics) => {
                set((state) => ({
                    fleet: { ...state.fleet, ...metrics }
                }));
            },

            // NC-89: 24h projection helper for UI TrendArrow and charts
            compute24hProjection: (signalId: string, horizonMs = 24 * 3600 * 1000, steps = 24) => {
                try {
                    const buffer = signalHistoryManager.getBuffer(signalId);
                    if (!buffer) return { points: [] };
                    const pts = buffer.getAll().map(dp => ({ t: dp.timestamp, y: dp.value }));
                    if (pts.length < 2) return { points: [] };

                    const n = pts.length;
                    const meanT = pts.reduce((s, p) => s + p.t, 0) / n;
                    const meanY = pts.reduce((s, p) => s + p.y, 0) / n;

                    const Sxx = pts.reduce((s, p) => s + Math.pow(p.t - meanT, 2), 0);
                    const Sxy = pts.reduce((s, p) => s + (p.t - meanT) * (p.y - meanY), 0);
                    const a = Sxx === 0 ? 0 : Sxy / Sxx; // slope (y per ms)
                    const b = meanY - a * meanT; // intercept

                    const now = Date.now();
                    const interval = Math.max(1, Math.floor(horizonMs / Math.max(1, steps)));
                    const points: { t: number; y: number }[] = [];
                    for (let i = 1; i <= steps; i++) {
                        const t = now + i * interval;
                        const y = isFinite(a) ? a * t + b : pts[pts.length - 1].y;
                        points.push({ t, y });
                    }
                    return { points };
                } catch (e) {
                    console.warn('[TelemetryStore] compute24hProjection failed', e);
                    return { points: [] };
                }
            },

            updateFleetMetrics: (metrics) => {
                set((state) => ({
                    fleet: { ...state.fleet, ...metrics }
                }));
            },

            distributeFleetLoad: (targetTotalMW) => {
                const { units } = get();
                const nextUnits = { ...units };
                const plantCount = Object.keys(units).length || 1;
                const share = targetTotalMW / plantCount;

                Object.keys(units).forEach(id => {
                    nextUnits[id] = { ...nextUnits[id], targetLoadMW: share };
                });

                set({ units: nextUnits, fleet: { ...get().fleet, totalMW: targetTotalMW } });
            },

            setBaselineFromWizard: (data) => set({ baselineState: data }),
            toggleFilteredMode: () => set((state) => ({ isFilteredMode: !state.isFilteredMode })),
            setFilterType: (filterType) => set({ filterType }),

            triggerFleetAlert: async (message, severity) => {
                // Dynamically import to avoid circular dependency if AlertJournal imports store
                try {
                    const { AlertJournal } = await import('../../../services/AlertJournal');
                    const hash = Math.random().toString(36).substring(7).toUpperCase(); // simplified hash for demo
                    // We assume AlertJournal has a method, if not we create a generic log
                    // For now, logging to console and attempting to add to journal logic if exposed
                    // AlertJournal.log(...) is the usual pattern

                    // Since AlertJournal.log might not be static or exposed directly, we rely on the 
                    // existing system's journal or just console for this MVP step if the service isn't fully robust yet.
                    // However, Protocol NC-22 ensured AlertJournal was active.

                    AlertJournal.logEvent(
                        severity,
                        `[FLEET_SWARM] ${message} // HASH: ${hash}`,
                        'Sovereign_Algorithm_NC23'
                    );
                } catch (e) {
                    console.warn('[FleetAlert] Failed to log:', e);
                }
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
                isMaintenanceLocked: state.isMaintenanceLocked
            })
        }
    )
);
