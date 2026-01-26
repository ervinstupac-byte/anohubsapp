// Commissioning Context - State Management for Commissioning Mode
// Manages active commissioning sessions across the app

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CommissioningSession } from '../services/CommissioningService';

interface CommissioningContextType {
    activeSession: CommissioningSession | null;
    setActiveSession: (session: CommissioningSession | null) => void;
    isCommissioningMode: boolean;
    startCommissioningMode: () => void;
    exitCommissioningMode: () => void;
}

const CommissioningContext = createContext<CommissioningContextType | undefined>(undefined);

export function useCommissioning() {
    const context = useContext(CommissioningContext);
    if (!context) {
        throw new Error('useCommissioning must be used within CommissioningProvider');
    }
    return context;
}

export const CommissioningProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeSession, setActiveSession] = useState<CommissioningSession | null>(null);
    const [isCommissioningMode, setIsCommissioningMode] = useState(false);

    const startCommissioningMode = () => {
        setIsCommissioningMode(true);
        console.log('🔧 Commissioning Mode ACTIVATED');
    };

    const exitCommissioningMode = () => {
        setIsCommissioningMode(false);
        setActiveSession(null);
        console.log('🔧 Commissioning Mode EXITED');
    };

    return (
        <CommissioningContext.Provider
            value={{
                activeSession,
                setActiveSession,
                isCommissioningMode,
                startCommissioningMode,
                exitCommissioningMode
            }}
        >
            {children}
        </CommissioningContext.Provider>
    );
};
