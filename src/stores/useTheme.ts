import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'tactical-cyan' | 'tactical-red';

interface ThemeState {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    toggleNightOps: () => void;
}

export const useTheme = create<ThemeState>()(
    persist(
        (set) => ({
            mode: 'tactical-cyan',

            setMode: (mode) => {
                set({ mode });
                // Apply CSS variables
                document.documentElement.setAttribute('data-theme', mode);
            },

            toggleNightOps: () => {
                set((state) => {
                    const newMode = state.mode === 'tactical-cyan' ? 'tactical-red' : 'tactical-cyan';
                    document.documentElement.setAttribute('data-theme', newMode);
                    return { mode: newMode };
                });
            }
        }),
        {
            name: 'anohub-theme',
            version: 1
        }
    )
);
