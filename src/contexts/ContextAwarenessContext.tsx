import React, { createContext, useContext, ReactNode } from 'react';
import { useContextEngine } from '../hooks/useContextEngine';
import { getContextFromRoute, ContextDefinition } from '../data/knowledge/ContextMap';
import { useLocation } from 'react-router-dom';

interface ContextAwarenessState {
    // Identity
    activeDefinition: ContextDefinition | null;

    // Knowledge
    activeContextNodes: any[]; // KnowledgeNode[]
    activeLogs: any[];
    activeWorkOrders: any[];
    liveMetrics: any[];
    diagnostics: any[]; // DiagnosticInsight[]

    // Formatting
    hasContext: boolean;
    hasCriticalRisks: boolean;
    isLoading: boolean;
    uploadLogData: (file: File) => Promise<void>;

    // Bi-Directional Sync
    setFocus: (componentId: string | null) => void;
    activeComponentId: string | null;

    // Depth of Truth (Phase 3)
    activeLayer: 'HUMAN' | 'HISTORY' | 'REALTIME';
    setActiveLayer: (layer: 'HUMAN' | 'HISTORY' | 'REALTIME') => void;

    playback: {
        isPlaying: boolean;
        currentTimestamp: number;
        totalDuration: number;
        progress: number; // 0-100%
        scrubTo: (percent: number) => void;
        togglePlay: () => void;
    };

    hiveStatus?: { connected: boolean; lastSync: number };
    patternWeights?: Record<string, number>;
    reinforcePattern?: (patternId: string, type: 'CONFIRMED' | 'REJECTED' | 'OVERRIDE') => void;
}

const ContextAwarenessContext = createContext<ContextAwarenessState | undefined>(undefined);

export const ContextAwarenessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const location = useLocation();

    // 1. Get Core Engine Data (Logs, Graphs)
    const engineData = useContextEngine(); // This hook handles the heavy lifting (Supabase, Logic)

    // 2. Get Static Definition (Title, Slogan)
    const activeDefinition = getContextFromRoute(location.pathname);

    const value: ContextAwarenessState = {
        activeDefinition,
        activeContextNodes: engineData.activeContext,
        activeLogs: engineData.activeLogs,
        activeWorkOrders: engineData.activeWorkOrders,
        liveMetrics: engineData.liveMetrics,
        diagnostics: engineData.diagnostics,
        hasContext: !!activeDefinition || engineData.activeContext.length > 0,
        hasCriticalRisks: engineData.hasCriticalRisks || false,
        isLoading: engineData.isLoading,
        uploadLogData: engineData.uploadLogData,

        // Depth Mapping
        activeLayer: engineData.activeLayer,
        setActiveLayer: engineData.setActiveLayer,
        playback: engineData.playback,

        hiveStatus: engineData.hiveStatus,
        patternWeights: engineData.patternWeights,
        reinforcePattern: engineData.reinforcePattern,
        setFocus: engineData.setFocus,
        activeComponentId: engineData.activeComponentId
    };

    return (
        <ContextAwarenessContext.Provider value={value}>
            {children}
        </ContextAwarenessContext.Provider>
    );
};

export const useContextAwareness = () => {
    const context = useContext(ContextAwarenessContext);
    if (!context) {
        throw new Error('useContextAwareness must be used within a ContextAwarenessProvider');
    }
    return context;
};
