import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { TechnicalProjectState } from '../core/TechnicalSchema';
import { useTelemetry } from './TelemetryContext';
import { useAssetContext } from './AssetContext';
import { ProjectStateManager } from '../core/ProjectStateManager';

export { ProjectStateManager };

const ProjectStateContext = createContext<TechnicalProjectState | undefined>(undefined);

export const ProjectStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const telemetryCtx = useTelemetry();
    const assetCtx = useAssetContext();
    const [state, setState] = useState<TechnicalProjectState>(ProjectStateManager.getState());

    // subscribe to manager changes
    useEffect(() => {
        const unsub = ProjectStateManager.subscribe((s) => setState(s));
        return unsub;
    }, []);

    // NC-20301: Debounced telemetry sync (500ms) to prevent CPU thrashing
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            try {
                ProjectStateManager.updateFromTelemetry(telemetryCtx.telemetry, assetCtx.assets);
            } catch (e) { /* ignore */ }
        }, 500);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [telemetryCtx.telemetry, assetCtx.assets]);

    return (
        <ProjectStateContext.Provider value={state}>
            {children}
        </ProjectStateContext.Provider>
    );
};

export const useProjectState = () => {
    const ctx = useContext(ProjectStateContext);
    if (!ctx) throw new Error('useProjectState must be used inside ProjectStateProvider');
    return ctx;
};

export default ProjectStateManager;
