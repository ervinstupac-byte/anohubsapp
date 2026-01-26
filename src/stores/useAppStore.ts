import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * App Store (Zustand)
 * 
 * Manages UI state and session-specific data.
 * This includes demo modes, manual rules, and temporary UI flags.
 * 
 * Separation Rationale:
 * - UI state shouldn't be mixed with technical/physical state
 * - Session data is ephemeral or user-specific
 * - Zustand provides better performance than Context for frequent updates
 */

export type DemoScenario =
    | 'NORMAL'
    | 'WATER_HAMMER'
    | 'GRID_LOSS'
    | 'CAVITATION'
    | 'BEARING_FAILURE'
    | 'ALIGNMENT_DRIFT';

export interface DemoMode {
    active: boolean;
    scenario: DemoScenario | null;
}

interface AppState {
    // Demo Mode
    demoMode: DemoMode;

    // Manual Engineering Rules
    manualRules: string[];

    // Applied Mitigations
    appliedMitigations: string[];

    // UI Flags
    sidebarCollapsed: boolean;
    darkMode: boolean;

    // Actions
    setDemoMode: (mode: DemoMode) => void;
    startScenario: (scenario: DemoScenario) => void;
    stopDemo: () => void;

    addManualRule: (rule: string) => void;
    removeManualRule: (rule: string) => void;
    clearManualRules: () => void;

    applyMitigation: (mitigation: string) => void;
    removeMitigation: (mitigation: string) => void;
    clearMitigations: () => void;

    toggleSidebar: () => void;
    toggleDarkMode: () => void;

    // Reset
    reset: () => void;
}

const initialState = {
    demoMode: {
        active: false,
        scenario: null
    },
    manualRules: [],
    appliedMitigations: [],
    sidebarCollapsed: false,
    darkMode: false
};

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            ...initialState,

            // Demo Mode Actions
            setDemoMode: (mode: DemoMode) => {
                console.log('[AppStore] Demo mode set:', mode);
                set({ demoMode: mode });
            },

            startScenario: (scenario: DemoScenario) => {
                console.log('[AppStore] Starting scenario:', scenario);
                set({
                    demoMode: {
                        active: scenario !== 'NORMAL',
                        scenario: scenario === 'NORMAL' ? null : scenario
                    }
                });
            },

            stopDemo: () => {
                console.log('[AppStore] Stopping demo mode');
                set({
                    demoMode: {
                        active: false,
                        scenario: null
                    }
                });
            },

            // Manual Rules Actions
            addManualRule: (rule: string) => {
                set((state) => ({
                    manualRules: [...state.manualRules, rule]
                }));
            },

            removeManualRule: (rule: string) => {
                set((state) => ({
                    manualRules: state.manualRules.filter(r => r !== rule)
                }));
            },

            clearManualRules: () => {
                set({ manualRules: [] });
            },

            // Mitigation Actions
            applyMitigation: (mitigation: string) => {
                set((state) => {
                    const mitigations = new Set([...state.appliedMitigations, mitigation]);
                    return { appliedMitigations: Array.from(mitigations) };
                });
            },

            removeMitigation: (mitigation: string) => {
                set((state) => ({
                    appliedMitigations: state.appliedMitigations.filter(m => m !== mitigation)
                }));
            },

            clearMitigations: () => {
                set({ appliedMitigations: [] });
            },

            // UI Actions
            toggleSidebar: () => {
                set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
            },

            toggleDarkMode: () => {
                set((state) => ({ darkMode: !state.darkMode }));
            },

            // Reset
            reset: () => {
                console.log('[AppStore] Resetting to initial state');
                set(initialState);
            }
        }),
        {
            name: 'anohub-app-store',
            partialize: (state) => ({
                // Only persist relevant data
                demoMode: state.demoMode,
                manualRules: state.manualRules,
                appliedMitigations: state.appliedMitigations,
                sidebarCollapsed: state.sidebarCollapsed,
                darkMode: state.darkMode
            })
        }
    )
);

// Selectors for optimized subscriptions
export const useDemoMode = () => useAppStore((state) => state.demoMode);
export const useManualRules = () => useAppStore((state) => state.manualRules);
export const useAppliedMitigations = () => useAppStore((state) => state.appliedMitigations);
export const useSidebarState = () => useAppStore((state) => state.sidebarCollapsed);
export const useDarkMode = () => useAppStore((state) => state.darkMode);
