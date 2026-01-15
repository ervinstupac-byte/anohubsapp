import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';

// === TYPES ===
export type ModuleType = 'toolbox' | 'executive' | 'builder' | 'design-studio' | 'maintenance' | 'diagnostics';

export interface NavigationEntry {
    module: ModuleType;
    timestamp: number;
    assetId?: string;
    componentId?: string;
    sensorPath?: string;
}

interface WorkflowState {
    lastModule: ModuleType;
    navigationHistory: NavigationEntry[];
}

interface WorkflowContextType {
    state: WorkflowState;
    logNavigation: (entry: Omit<NavigationEntry, 'timestamp'>) => void;
    getLastVisitedModule: (assetId?: string) => ModuleType | null;
    clearHistory: () => void;
}

const STORAGE_KEY = 'anohub_workflow_state';
const CHANNEL_NAME = 'anohub_workflow_channel';

const defaultState: WorkflowState = {
    lastModule: 'toolbox',
    navigationHistory: []
};

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

/**
 * WorkflowProvider - Cross-Module State Management with Multi-Tab Sync
 * 
 * Uses BroadcastChannel API for instant cross-tab synchronization.
 * Falls back to StorageEvent for broader browser support.
 */
export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<WorkflowState>(() => {
        console.log('[WorkflowContext] Step 1: Initializing State...');
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            console.log('[WorkflowContext] Step 1b: Loaded from storage:', stored ? 'YES' : 'NO');
            return stored ? JSON.parse(stored) : defaultState;
        } catch (e) {
            console.warn('[WorkflowContext] Step 1b: Storage parse failed, using default.');
            return defaultState;
        }
    });

    const channelRef = useRef<BroadcastChannel | null>(null);

    // Initialize BroadcastChannel
    useEffect(() => {
        try {
            channelRef.current = new BroadcastChannel(CHANNEL_NAME);

            channelRef.current.onmessage = (event) => {
                if (event.data?.type === 'WORKFLOW_UPDATE') {
                    setState(event.data.state);
                }
            };
        } catch (e) {
            // BroadcastChannel not supported, fallback to storage events
            console.warn('[Workflow] BroadcastChannel not supported, using fallback');
        }

        // Fallback: StorageEvent listener for older browsers
        const handleStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                try {
                    setState(JSON.parse(e.newValue));
                } catch {
                    // Ignore parse errors
                }
            }
        };

        window.addEventListener('storage', handleStorage);

        return () => {
            channelRef.current?.close();
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    // Persist to localStorage and broadcast on state change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

        // Broadcast to other tabs
        channelRef.current?.postMessage({
            type: 'WORKFLOW_UPDATE',
            state
        });
    }, [state]);

    const logNavigation = useCallback((entry: Omit<NavigationEntry, 'timestamp'>) => {
        const fullEntry: NavigationEntry = {
            ...entry,
            timestamp: Date.now()
        };

        setState(prev => ({
            lastModule: entry.module,
            navigationHistory: [fullEntry, ...prev.navigationHistory].slice(0, 50) // Keep last 50
        }));
    }, []);

    const getLastVisitedModule = useCallback((assetId?: string): ModuleType | null => {
        if (!assetId) return state.lastModule;

        const lastForAsset = state.navigationHistory.find(
            entry => entry.assetId === assetId
        );
        return lastForAsset?.module || null;
    }, [state]);

    const clearHistory = useCallback(() => {
        setState(defaultState);
    }, []);

    const value = useMemo(() => ({
        state,
        logNavigation,
        getLastVisitedModule,
        clearHistory
    }), [state, logNavigation, getLastVisitedModule, clearHistory]);

    return (
        <WorkflowContext.Provider value={value}>
            {children}
        </WorkflowContext.Provider>
    );
};

export const useWorkflow = () => {
    const context = useContext(WorkflowContext);
    if (!context) {
        throw new Error('useWorkflow must be used within a WorkflowProvider');
    }
    return context;
};

// Optional hook for logging navigation on route change
export const useWorkflowNavigation = (module: ModuleType, assetId?: string) => {
    // Safety Wrapper: Don't crash if context is missing during early render
    let logNavigation: ((entry: Omit<NavigationEntry, 'timestamp'>) => void) | undefined;
    try {
        const wf = useWorkflow();
        logNavigation = wf.logNavigation;
    } catch {
        // Fallback or ignore if context not yet mounted (though shouldn't happen inside Provider)
    }

    useEffect(() => {
        if (logNavigation) {
            logNavigation({ module, assetId });
        }
    }, [module, assetId, logNavigation]);
};
