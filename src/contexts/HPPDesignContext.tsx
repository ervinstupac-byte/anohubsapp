import React, { createContext, useContext, useState } from 'react';

export interface HPPDesignData {
    design_name: string;
    recommended_turbine: string;
    parameters: {
        head: number;
        flow: number;
        efficiency: number;
        powerFactor?: number;
        waterQuality?: string;
        flowVariation?: string;
    };
    calculations: {
        powerMW: number;
        energyGWh: number;
        annualGWh: string;
        n_sq: string;
    };
    asset_id?: string;
    created_at?: string;
}

interface HPPDesignContextType {
    currentDesign: HPPDesignData | null;
    setDesign: (design: HPPDesignData) => void;
    resetDesign: () => void;
}

const HPPDesignContext = createContext<HPPDesignContextType | undefined>(undefined);

export const HPPDesignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentDesign, setCurrentDesign] = useState<HPPDesignData | null>(null);

    const setDesign = (design: HPPDesignData) => {
        setCurrentDesign(design);
    };

    const resetDesign = () => {
        setCurrentDesign(null);
    };

    const value = {
        currentDesign,
        setDesign,
        resetDesign
    };

    return (
        <HPPDesignContext.Provider value={value}>
            {children}
        </HPPDesignContext.Provider>
    );
};

export const useHPPDesign = () => {
    const context = useContext(HPPDesignContext);
    if (!context) {
        throw new Error('useHPPDesign must be used within HPPDesignProvider');
    }
    return context;
};
