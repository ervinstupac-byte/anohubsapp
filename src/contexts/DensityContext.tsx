import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export type DensityMode = 'compact' | 'relaxed';

interface DensityContextType {
    mode: DensityMode;
    toggleDensity: () => void;
    setDensity: (mode: DensityMode) => void;
    spacing: {
        padding: string;
        gap: string;
        fontSizeScale: number; // 1 for relaxed, 0.85 for compact
    };
}

const DensityContext = createContext<DensityContextType | undefined>(undefined);

export const useDensity = () => {
    const context = useContext(DensityContext);
    if (!context) {
        throw new Error('useDensity must be used within a DensityProvider');
    }
    return context;
};

export const DensityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<DensityMode>(() =>
        (localStorage.getItem('anohub_density_mode') as DensityMode) || 'relaxed'
    );

    // Persist to LocalStorage
    React.useEffect(() => {
        localStorage.setItem('anohub_density_mode', mode);
    }, [mode]);

    // Cross-Tab Sync
    React.useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'anohub_density_mode' && e.newValue) {
                setMode(e.newValue as DensityMode);
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const toggleDensity = useCallback(() => {
        setMode(prev => prev === 'relaxed' ? 'compact' : 'relaxed');
    }, []);

    const setDensity = useCallback((newMode: DensityMode) => {
        setMode(newMode);
    }, []);

    const spacing = useMemo(() => ({
        padding: mode === 'compact' ? 'p-3' : 'p-5',
        gap: mode === 'compact' ? 'gap-3' : 'gap-5',
        fontSizeScale: mode === 'compact' ? 0.85 : 1
    }), [mode]);

    const value = useMemo(() => ({
        mode,
        toggleDensity,
        setDensity,
        spacing
    }), [mode, toggleDensity, setDensity, spacing]);

    return (
        <DensityContext.Provider value={value}>
            {children}
        </DensityContext.Provider>
    );
};
