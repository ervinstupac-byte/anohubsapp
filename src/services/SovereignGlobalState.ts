/**
 * SovereignGlobalState.ts
 * 
 * The "Single Source of Truth".
 * Aggregates all domain states into one immutable-style snapshot.
 * NC-1300: Cross-tab communication hub for Dashboard, Forensics, and Strategy views
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

export interface ViewState {
    view: 'DASHBOARD' | 'FORENSICS' | 'STRATEGY';
    timestamp: number;
    data?: any;
}

export interface GlobalState {
    timestamp: number;
    physics: PhysicsMetrics;
    finance: FinancialVelocity;
    integrity: StructuralIntegrity;
    crossCorrelations: Record<string, number>; // Pair key -> r value
    activeView: ViewState;
    viewHistory: ViewState[];
}

// Event types for cross-tab communication
type StateChangeListener = (state: GlobalState, prevState: GlobalState | null) => void;
type ViewChangeListener = (viewState: ViewState, prevView: ViewState | null) => void;

class SovereignGlobalStateSingleton {
    private static instance: SovereignGlobalStateSingleton;
    private currentState: GlobalState | null = null;
    private stateChangeListeners: Set<StateChangeListener> = new Set();
    private viewChangeListeners: Set<ViewChangeListener> = new Set();

    private constructor() {
        // Initialize with Safe Defaults
        this.currentState = {
            timestamp: Date.now(),
            physics: { vibration: 0, temperature: 0, pressure: 0, efficiency: 0, cavitation: 0 },
            finance: { revenuePerHour: 0, molecularDebtRate: 0, netProfitRate: 0 },
            integrity: { fatigueAccumulated: 0, remainingLifeEstimates: {} },
            crossCorrelations: {},
            activeView: { view: 'DASHBOARD', timestamp: Date.now() },
            viewHistory: []
        };
    }

    public static getInstance(): SovereignGlobalStateSingleton {
        if (!SovereignGlobalStateSingleton.instance) {
            SovereignGlobalStateSingleton.instance = new SovereignGlobalStateSingleton();
        }
        return SovereignGlobalStateSingleton.instance;
    }

    // --- CROSS-TAB COMMUNICATION ---

    /**
     * Subscribe to all state changes (Dashboard, Forensics, Strategy)
     */
    public subscribeToStateChanges(listener: StateChangeListener): () => void {
        this.stateChangeListeners.add(listener);
        return () => this.stateChangeListeners.delete(listener);
    }

    /**
     * Subscribe to view changes only (tab switches)
     */
    public subscribeToViewChanges(listener: ViewChangeListener): () => void {
        this.viewChangeListeners.add(listener);
        return () => this.viewChangeListeners.delete(listener);
    }

    /**
     * Switch active view (cross-tab communication)
     */
    public switchView(view: ViewState['view'], data?: any): GlobalState {
        const prevView = this.currentState?.activeView || null;
        const newViewState: ViewState = {
            view,
            timestamp: Date.now(),
            data
        };

        this.updateState({
            activeView: newViewState,
            viewHistory: [...(this.currentState?.viewHistory || []), newViewState].slice(-20) // Keep last 20
        });

        // Notify view change listeners
        this.viewChangeListeners.forEach(listener => listener(newViewState, prevView));
        
        console.log(`[SovereignGlobalState] View switched to ${view}`, data);
        return this.getState();
    }

    /**
     * Broadcast message to all views
     */
    public broadcastToViews(message: { type: string; payload: any }): void {
        this.stateChangeListeners.forEach(listener => {
            listener(this.getState(), this.currentState);
        });
        console.log(`[SovereignGlobalState] Broadcast: ${message.type}`, message.payload);
    }

    // --- STATE MANAGEMENT ---

    public updateState(partial: Partial<GlobalState>): GlobalState {
        const prevState = this.currentState ? { ...this.currentState } : null;
        
        // Safety guard: ensure currentState exists
        if (!this.currentState) {
            console.warn('[SovereignGlobalState] currentState was null, reinitializing');
            this.currentState = {
                timestamp: Date.now(),
                physics: { vibration: 0, temperature: 0, pressure: 0, efficiency: 0, cavitation: 0 },
                finance: { revenuePerHour: 0, molecularDebtRate: 0, netProfitRate: 0 },
                integrity: { fatigueAccumulated: 0, remainingLifeEstimates: {} },
                crossCorrelations: {},
                activeView: { view: 'DASHBOARD', timestamp: Date.now() },
                viewHistory: []
            };
        }
        
        this.currentState = {
            ...this.currentState,
            ...partial,
            timestamp: Date.now()
        };

        // Notify all state change listeners
        this.stateChangeListeners.forEach(listener => listener(this.getState(), prevState));
        
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
                crossCorrelations: {},
                activeView: { view: 'DASHBOARD', timestamp: Date.now() },
                viewHistory: []
            };
        }
        return { ...this.currentState }; // Return copy to enforce immutability
    }

    /**
     * Get current active view
     */
    public getActiveView(): ViewState {
        return this.getState().activeView;
    }

    /**
     * Get view history for audit trail
     */
    public getViewHistory(): ViewState[] {
        return this.getState().viewHistory;
    }
}

export const SovereignGlobalState = SovereignGlobalStateSingleton.getInstance();
