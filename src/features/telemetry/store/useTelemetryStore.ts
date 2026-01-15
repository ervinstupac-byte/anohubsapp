import { create } from 'zustand';
import { HydraulicStream, MechanicalStream, DiagnosisReport, PhysicsResult, DEFAULT_TECHNICAL_STATE, TechnicalProjectState } from '../../../models/TechnicalSchema';
import { AssetIdentity } from '../../../types/assetIdentity';
import { PhysicsEngine } from '../../physics-core/PhysicsEngine';
import { ExpertDiagnosisEngine } from '../../physics-core/ExpertDiagnosisEngine';

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
};

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

    lastUpdate: string;

    // Actions
    updateTelemetry: (payload: TelemetryUpdatePayload) => void;
    setHydraulic: (hydraulic: Partial<HydraulicStream>) => void;
    setMechanical: (mechanical: Partial<MechanicalStream>) => void;
    setConfig: (config: Partial<Pick<TechnicalProjectState, 'identity' | 'site' | 'penstock'>>) => void;
    setFinancials: (financials: TechnicalProjectState['financials']) => void;
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
    }
}));
