import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Density Slice
  densityMode: 'comfortable' | 'compact';
  toggleDensity: () => void;

  // Demo Slice
  demoMode: boolean;
  toggleDemoMode: () => void;
  setDemoMode: (mode: { active: boolean; scenario?: string }) => void;

  // Toast Slice
  toasts: Array<{ id: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }>;
  showToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  hydrateSettings: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Density Logic
      densityMode: 'comfortable',
      toggleDensity: () => set((state) => ({
        densityMode: state.densityMode === 'comfortable' ? 'compact' : 'comfortable'
      })),

      // Demo Logic
      demoMode: false,
      toggleDemoMode: () => set((state) => ({ demoMode: !state.demoMode })),
      setDemoMode: (mode) => set({ demoMode: mode.active }),

      hydrateSettings: () => {
        // The 'persist' middleware handles this automatically, but we need 
        // this method to satisfy legacy calls in App.tsx. 
        console.log('[AppStore] Settings hydrated via middleware'); 
      },

      // Toast Logic
      toasts: [],
      showToast: (message, type = 'info') => {
        const id = Math.random().toString(36).substring(7);
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
        setTimeout(() => {
          set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, 4000);
      },
      removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
    }),
    { name: 'app-storage' }
  )
);

// Hook Shims for Backward Compatibility
export const useDensity = () => {
  const store = useAppStore();
  return { densityMode: store.densityMode, toggleDensity: store.toggleDensity };
};
export const useToast = () => {
  const store = useAppStore();
  return { showToast: store.showToast, removeToast: store.removeToast, toasts: store.toasts };
};

export const useDemoMode = () => {
  const store = useAppStore();
  return { 
    active: store.demoMode, 
    isDemoActive: store.demoMode, 
    toggleDemo: store.toggleDemoMode 
  };
};
