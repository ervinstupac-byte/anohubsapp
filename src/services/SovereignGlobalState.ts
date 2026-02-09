/**
 * SovereignGlobalState.ts
 * 
 * The "Single Source of Truth".
 * Aggregates all domain states into one immutable-style snapshot.
 */

// Define Sub-State Interfaces (Placeholder or imported if existing)
export interface PhysicsMetrics {
    vibration: number;
    temperature: number;
    pressure: number;
    efficiency: number;
    cavitation: number;
}

export interface FinancialVelocity {
    revenuePerHour: number;
    molecularDebtRate: number;
    netProfitRate: number;
}

export interface StructuralIntegrity {
    fatigueAccumulated: number;
    remainingLifeEstimates: Record<string, number>; // Component -> Years
}

export interface GlobalState {
    timestamp: number;
    physics: PhysicsMetrics;
    finance: FinancialVelocity;
    integrity: StructuralIntegrity;
    crossCorrelations: Record<string, number>; // Pair key -> r value
}

class SovereignGlobalStateSingleton {
    private static instance: SovereignGlobalStateSingleton;
    private currentState: GlobalState | null = null;

    private constructor() {
        // Initialize with Safe Defaults
        this.currentState = {
            timestamp: Date.now(),
            physics: { vibration: 0, temperature: 0, pressure: 0, efficiency: 0, cavitation: 0 },
            finance: { revenuePerHour: 0, molecularDebtRate: 0, netProfitRate: 0 },
            integrity: { fatigueAccumulated: 0, remainingLifeEstimates: {} },
            crossCorrelations: {}
        };
    }

    public static getInstance(): SovereignGlobalStateSingleton {
        if (!SovereignGlobalStateSingleton.instance) {
            SovereignGlobalStateSingleton.instance = new SovereignGlobalStateSingleton();
        }
        return SovereignGlobalStateSingleton.instance;
    }

    public updateState(partial: Partial<GlobalState>): GlobalState {
        // Safety guard: ensure currentState exists
        if (!this.currentState) {
            console.warn('[SovereignGlobalState] currentState was null, reinitializing');
            this.currentState = {
                timestamp: Date.now(),
                physics: { vibration: 0, temperature: 0, pressure: 0, efficiency: 0, cavitation: 0 },
                finance: { revenuePerHour: 0, molecularDebtRate: 0, netProfitRate: 0 },
                integrity: { fatigueAccumulated: 0, remainingLifeEstimates: {} },
                crossCorrelations: {}
            };
        }
        
        this.currentState = {
            ...this.currentState,
            ...partial,
            timestamp: Date.now()
        };
        // Notify subscribers (Event Bus) could go here
        return this.currentState;
    }

    public getState(): GlobalState {
        // Safety guard: return safe defaults if currentState is null
        if (!this.currentState) {
            console.warn('[SovereignGlobalState] getState called before initialization');
            return {
                timestamp: Date.now(),
                physics: { vibration: 0, temperature: 0, pressure: 0, efficiency: 0, cavitation: 0 },
                finance: { revenuePerHour: 0, molecularDebtRate: 0, netProfitRate: 0 },
                integrity: { fatigueAccumulated: 0, remainingLifeEstimates: {} },
                crossCorrelations: {}
            };
        }
        return { ...this.currentState }; // Return copy to enforce immutability
    }
}

export const SovereignGlobalState = SovereignGlobalStateSingleton.getInstance();
