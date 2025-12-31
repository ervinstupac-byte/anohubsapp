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

    // Formatting
    hasContext: boolean;
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
        hasContext: !!activeDefinition || engineData.activeContext.length > 0
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
