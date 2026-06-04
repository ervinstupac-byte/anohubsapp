import { create } from 'zustand';
import { useEffect, useRef } from 'react';

// === TYPES ===
export type ModuleType = 'toolbox' | 'executive' | 'builder' | 'design-studio' | 'maintenance' | 'diagnostics';

export interface NavigationEntry {
    module: ModuleType;
    timestamp: number;
    assetId?: number;
    componentId?: string;
    sensorPath?: string;
}

interface WorkflowState {
    lastModule: ModuleType;
    navigationHistory: NavigationEntry[];
}

interface WorkflowStore extends WorkflowState {
    logNavigation: (entry: Omit<NavigationEntry, 'timestamp'>) => void;
    getLastVisitedModule: (assetId?: number) => ModuleType | null;
    clearHistory: () => void;
}

const STORAGE_KEY = 'anohub_workflow_state';
const CHANNEL_NAME = 'anohub_workflow_channel';

const defaultState: WorkflowState = {
    lastModule: 'toolbox',
    navigationHistory: []
};

// Initialize from localStorage
const getInitialState = (): WorkflowState => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : defaultState;
    } catch (e) {
        console.warn('[WorkflowStore] Storage parse failed, using default.');
        return defaultState;
    }
};

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
    ...getInitialState(),

    logNavigation: (entry: Omit<NavigationEntry, 'timestamp'>) => {
        const fullEntry: NavigationEntry = {
            ...entry,
            timestamp: Date.now()
        };
        set(prev => ({
            lastModule: entry.module,
            navigationHistory: [fullEntry, ...prev.navigationHistory].slice(0, 50)
        }));
    },

    getLastVisitedModule: (assetId?: number): ModuleType | null => {
        const state = get();
        if (!assetId) return state.lastModule;

        const lastForAsset = state.navigationHistory.find(
            entry => entry.assetId === assetId
        );
        return lastForAsset?.module || null;
    },

    clearHistory: () => {
        set(defaultState);
    },
}));

// Persist to localStorage and broadcast on state change
useWorkflowStore.subscribe((state) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Broadcast to other tabs
    try {
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.postMessage({
            type: 'WORKFLOW_UPDATE',
            state
        });
        channel.close();
    } catch (e) {
        // Ignore broadcast errors
    }
});

// React component to handle cross-tab sync
export const WorkflowSyncListener = () => {
    const channelRef = useRef<BroadcastChannel | null>(null);

    useEffect(() => {
        // Initialize BroadcastChannel
        try {
            channelRef.current = new BroadcastChannel(CHANNEL_NAME);
            channelRef.current.onmessage = (event) => {
                if (event.data?.type === 'WORKFLOW_UPDATE') {
                    useWorkflowStore.setState(event.data.state);
                }
            };
        } catch (e) {
            console.warn('[WorkflowStore] BroadcastChannel not supported');
        }

        // Storage event listener
        const handleStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                try {
                    useWorkflowStore.setState(JSON.parse(e.newValue));
                } catch {
                    // Ignore
                }
            }
        };
        window.addEventListener('storage', handleStorage);

        return () => {
            channelRef.current?.close();
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    return null;
};
