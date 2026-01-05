import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * THEME STORE (NC-4.2 COMMAND)
 * 
 * Modes:
 * - tactical-cyan: Default industrial interface
 * - tactical-red: Night ops mode  
 * - field-contrast: High-contrast for poorly lit turbine halls (no glows, max readability)
 */
type ThemeMode = 'tactical-cyan' | 'tactical-red' | 'field-contrast';

interface ThemeState {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    toggleNightOps: () => void;
    toggleFieldMode: () => void;
    isFieldMode: () => boolean;
}

export const useTheme = create<ThemeState>()(
    persist(
        (set, get) => ({
            mode: 'tactical-cyan',

            setMode: (mode) => {
                set({ mode });
                applyTheme(mode);
            },

            toggleNightOps: () => {
                set((state) => {
                    const newMode = state.mode === 'tactical-cyan' ? 'tactical-red' : 'tactical-cyan';
                    applyTheme(newMode);
                    return { mode: newMode };
                });
            },

            /**
             * FIELD MODE TOGGLE
             * Strips all ambient glows, orbs, and blur effects for maximum readability
             * in poorly lit turbine halls or direct sunlight conditions.
             */
            toggleFieldMode: () => {
                set((state) => {
                    const newMode = state.mode === 'field-contrast' ? 'tactical-cyan' : 'field-contrast';
                    applyTheme(newMode);
                    return { mode: newMode };
                });
            },

            isFieldMode: () => get().mode === 'field-contrast'
        }),
        {
            name: 'anohub-theme',
            version: 2
        }
    )
);

/**
 * Apply theme to document root
 */
function applyTheme(mode: ThemeMode): void {
    document.documentElement.setAttribute('data-theme', mode);

    // Apply CSS class for field mode optimizations
    if (mode === 'field-contrast') {
        document.documentElement.classList.add('field-mode');
        document.documentElement.classList.remove('ambient-mode');
    } else {
        document.documentElement.classList.remove('field-mode');
        document.documentElement.classList.add('ambient-mode');
    }
}
