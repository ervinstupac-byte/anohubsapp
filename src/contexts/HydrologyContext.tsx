import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCerebro } from './ProjectContext';

interface HydrologyState {
    upstreamLevel: number;
    downstreamLevel: number;
    forecastedInflow: number;
    spillageRisk: number;
}

const HydrologyContext = createContext<HydrologyState | undefined>(undefined);

export const HydrologyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { state: cerebroState, dispatch } = useCerebro();

    // Logic: Calculate spillage risk based on inflow vs discharge capacity
    useEffect(() => {
        const inflow = cerebroState.hydrology?.forecastedInflow || 12.5;
        const currentDischarge = cerebroState.hydraulic?.flow || 42.5;
        const maxCapacity = 150.0; // Benchmark for this HPP

        // Spillage risk = (Inflow - Capacity) normalized
        let risk = 0;
        if (inflow > maxCapacity * 0.8) {
            risk = ((inflow - (maxCapacity * 0.8)) / (maxCapacity * 0.2)) * 100;
        }

        const spillageRisk = Math.min(100, Math.max(0, risk));

        if (spillageRisk !== cerebroState.hydrology?.spillageRisk) {
            dispatch({
                type: 'UPDATE_HYDROLOGY',
                payload: { spillageRisk }
            });
        }
    }, [cerebroState.hydrology?.forecastedInflow, cerebroState.hydraulic?.flow, dispatch]);

    return (
        <HydrologyContext.Provider value={cerebroState.hydrology}>
            {children}
        </HydrologyContext.Provider>
    );
};

export const useHydrology = () => {
    const context = useContext(HydrologyContext);
    if (!context) throw new Error('useHydrology must be used within HydrologyProvider');
    return context;
};
