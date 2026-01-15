import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

/**
 * Asset Configuration Context
 * 
 * Manages STATIC, READ-ONLY configuration for an asset.
 * This data rarely changes and is loaded once at initialization.
 * 
 * Separation Rationale:
 * - Static config shouldn't trigger re-renders when live telemetry updates
 * - Config can be loaded from API without mixing with operational state
 * - Clear boundary between configuration and operation
 */

export interface SiteParameters {
    grossHead: number;              // meters
    designFlow: number;             // m³/s
    waterQuality: string;           // 'CLEAN' | 'SEDIMENT' | 'ABRASIVE'
    temperature: number;            // °C
    designPerformanceMW: number;
}

export interface PenstockSpecification {
    diameter: number;               // meters
    length: number;                 // meters
    material: string;               // 'STEEL' | 'CONCRETE' | 'GRP'
    wallThickness: number;          // meters
    materialModulus: number;        // GPa
    materialYieldStrength: number;  // MPa
}

export interface MachineConfiguration {
    orientation: 'VERTICAL' | 'HORIZONTAL';
    transmissionType: 'DIRECT' | 'BELT' | 'GEAR';
    ratedPowerMW: number;
    ratedSpeedRPM: number;
    ratedHeadM: number;
    ratedFlowM3S: number;
    runnerDiameterMM: number;
    numberOfBlades: number;
}

export interface AssetConfig {
    // Identity
    assetId: string;
    assetName: string;
    turbineType: 'PELTON' | 'FRANCIS' | 'KAPLAN';
    manufacturer: string;
    commissioningYear: number;
    totalOperatingHours: number;
    hoursSinceLastOverhaul: number;
    startStopCount: number;
    location: string;

    // Static Parameters
    site: SiteParameters;
    penstock: PenstockSpecification;
    machineConfig: MachineConfiguration;

    // Metadata
    version: string;
    createdAt: string;
    createdBy: string;
    lastUpdatedAt: string;
}

interface AssetConfigContextValue {
    config: AssetConfig | null;
    isLoading: boolean;
    error: string | null;
    loadConfig: (assetId: string) => Promise<void>;
    updateConfig: (updates: Partial<AssetConfig>) => void;
}

const AssetConfigContext = createContext<AssetConfigContextValue | undefined>(undefined);

const DEFAULT_CONFIG: AssetConfig = {
    assetId: 'DEMO-UNIT-001',
    assetName: 'Francis Turbine Demo',
    turbineType: 'FRANCIS',
    manufacturer: 'AnoHUB Systems',
    commissioningYear: 2020,
    totalOperatingHours: 45000,
    hoursSinceLastOverhaul: 8500,
    startStopCount: 1200,
    location: 'Demo Site',

    site: {
        grossHead: 125,
        designFlow: 12.5,
        waterQuality: 'CLEAN',
        temperature: 20,
        designPerformanceMW: 15
    },

    penstock: {
        diameter: 2.5,
        length: 450,
        material: 'STEEL',
        wallThickness: 0.025,
        materialModulus: 210,
        materialYieldStrength: 355
    },

    machineConfig: {
        orientation: 'VERTICAL',
        transmissionType: 'DIRECT',
        ratedPowerMW: 15,
        ratedSpeedRPM: 500,
        ratedHeadM: 125,
        ratedFlowM3S: 12.5,
        runnerDiameterMM: 1500,
        numberOfBlades: 15
    },

    version: '1.0',
    createdAt: new Date().toISOString(),
    createdBy: 'System',
    lastUpdatedAt: new Date().toISOString()
};

const STORAGE_KEY = 'ANOHUB_ASSET_CONFIG';

export const AssetConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<AssetConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load configuration on mount
    useEffect(() => {
        const loadFromStorage = () => {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    console.log('[AssetConfigContext] Loaded config from storage:', parsed.assetId);
                    setConfig(parsed);
                } else {
                    console.log('[AssetConfigContext] No stored config, using defaults');
                    setConfig(DEFAULT_CONFIG);
                }
            } catch (err) {
                console.error('[AssetConfigContext] Failed to load config:', err);
                setError('Failed to load asset configuration');
                setConfig(DEFAULT_CONFIG);
            } finally {
                setIsLoading(false);
            }
        };

        loadFromStorage();
    }, []);

    // Persist config changes
    useEffect(() => {
        if (config && !isLoading) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        }
    }, [config, isLoading]);

    const loadConfig = async (assetId: string): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            // TODO: Replace with actual API call
            // const response = await fetch(`/api/assets/${assetId}/config`);
            // const data = await response.json();

            // For now, simulate API delay
            await new Promise(resolve => setTimeout(resolve, 100));

            console.log(`[AssetConfigContext] Loaded config for asset: ${assetId}`);
            // setConfig(data);
        } catch (err) {
            console.error('[AssetConfigContext] Failed to load config:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    };

    const updateConfig = (updates: Partial<AssetConfig>): void => {
        if (!config) return;

        const updatedConfig: AssetConfig = {
            ...config,
            ...updates,
            lastUpdatedAt: new Date().toISOString()
        };

        console.log('[AssetConfigContext] Config updated:', Object.keys(updates));
        setConfig(updatedConfig);
    };

    return (
        <AssetConfigContext.Provider value={{ config, isLoading, error, loadConfig, updateConfig }}>
            {children}
        </AssetConfigContext.Provider>
    );
};

export const useAssetConfig = (): AssetConfigContextValue => {
    const context = useContext(AssetConfigContext);
    if (!context) {
        throw new Error('useAssetConfig must be used within AssetConfigProvider');
    }
    return context;
};
