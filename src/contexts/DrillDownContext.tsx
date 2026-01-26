import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface DrillDownLevel {
    label: string;
    path: string;
    contextId?: string; // e.g. assetId
}

interface DrillDownContextType {
    breadcrumbs: DrillDownLevel[];
    drillDown: (level: DrillDownLevel) => void;
    goBack: () => void;
    currentLevel: DrillDownLevel | undefined;
    resetDrillDown: () => void;
}

const DrillDownContext = createContext<DrillDownContextType | undefined>(undefined);

export const useDrillDown = () => {
    const context = useContext(DrillDownContext);
    if (!context) {
        throw new Error('useDrillDown must be used within a DrillDownProvider');
    }
    return context;
};

export const DrillDownProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [breadcrumbs, setBreadcrumbs] = useState<DrillDownLevel[]>([{ label: 'Home', path: '/' }]);

    const drillDown = useCallback((level: DrillDownLevel) => {
        setBreadcrumbs(prev => {
            // Avoid duplicates if clicking same link
            if (prev[prev.length - 1]?.path === level.path) return prev;
            return [...prev, level];
        });
        navigate(level.path);
    }, [navigate]);

    const goBack = useCallback(() => {
        setBreadcrumbs(prev => {
            if (prev.length <= 1) return prev;
            const newHistory = prev.slice(0, -1);
            const parent = newHistory[newHistory.length - 1];
            navigate(parent.path);
            return newHistory;
        });
    }, [navigate]);

    const resetDrillDown = useCallback(() => {
        setBreadcrumbs([{ label: 'Home', path: '/' }]);
    }, []);

    // Sync with location helps if user uses browser back button
    // (This acts as a naive sync, ideally we'd parse URL)
    React.useEffect(() => {
        if (location.pathname === '/') {
            setBreadcrumbs([{ label: 'Home', path: '/' }]);
        }
    }, [location]);

    const value = {
        breadcrumbs,
        drillDown,
        goBack,
        currentLevel: breadcrumbs[breadcrumbs.length - 1],
        resetDrillDown
    };

    return (
        <DrillDownContext.Provider value={value}>
            {children}
        </DrillDownContext.Provider>
    );
};
