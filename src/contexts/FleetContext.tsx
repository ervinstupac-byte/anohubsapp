import React, { createContext, useContext, useState, useMemo } from 'react';
import { useAssetContext } from './AssetContext.tsx';
import { useTelemetry } from './TelemetryContext.tsx';
import { useMaintenance } from './MaintenanceContext.tsx';
import { useInventory } from './InventoryContext.tsx';
import { useDiagnostic } from './DiagnosticContext.tsx';

export interface InflowPrediction {
    days30: number; // MWh
    days60: number; // MWh
    days90: number; // MWh
    snowCoverPercent: number;
}

export interface FleetHealthReport {
    assetId: string;
    assetName: string;
    healthScore: number; // 0-100
    efficiencyIndex: number; // %
    moneyAtRisk: number; // €
    readiness: 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'OPTIMAL' | 'LOW_PERFORMANCE' | 'CRITICAL_RISK';
    inflow: InflowPrediction;
    maintenanceROI?: {
        action: string;
        paybackDays: number;
        gainPercentage: number;
    };
}

interface FleetContextType {
    fleetReports: FleetHealthReport[];
    totalMoneyAtRisk: number;
    globalFleetHealth: number;
    loading: boolean;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export const FleetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { assets } = useAssetContext();
    const { telemetry } = useTelemetry();
    const { operatingHours } = useMaintenance();
    const { getMissingParts } = useInventory();
    const { activeDiagnoses } = useDiagnostic();
    const [loading] = useState(false);

    const fleetReports = useMemo(() => {
        return assets.map(asset => {
            const tel = telemetry[asset.id] || { vibration: 0, temperature: 0, efficiency: 0, output: 0 };
            const hours = operatingHours[asset.id] || 0;
            const missingParts = getMissingParts(asset.turbine_type || 'francis');

            // 1. HEALTH SCORE ALGORITHM
            let score = 100;
            if (tel.vibration > 0.05) score -= 20;
            if (tel.temperature > 75) score -= 15;
            if (missingParts.length > 0) score -= (missingParts.length * 5);

            // Maintenance proximity penalty
            const protocolThreshold = 2000; // Example major overhaul
            const hoursToService = protocolThreshold - (hours % protocolThreshold);
            if (hoursToService < 100) score -= 15;

            score = Math.max(0, Math.min(100, score));

            // 2. MONEY AT RISK
            // Formula: Capacity * Energy Price * Risk Duration * Probability
            const energyPrice = 150; // €/MWh
            const riskDuration = 120; // 5 days in hours
            let riskProbability = 0.05; // Base 5% probability

            const diagnostic = activeDiagnoses.find(d => d.message.includes(asset.id) || d.source === 'CORRELATED');
            if (diagnostic?.diagnosis?.severity === 'CRITICAL') riskProbability = 0.8;
            else if (diagnostic?.diagnosis?.severity === 'HIGH') riskProbability = 0.4;
            else if (tel.status === 'CRITICAL') riskProbability = 0.3;

            const moneyAtRisk = (asset.capacity || 10) * energyPrice * riskDuration * riskProbability;

            // 3. EFFICIENCY INDEX
            // Calculation: Real output / Calculated theoretical max (from HPP Builder context)
            // Simplified here: tel.efficiency directly from SCADA vs 96% benchmark
            const efficiencyIndex = tel.efficiency || 0;

            // 4. RESOURCE READINESS
            let readiness: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
            if (missingParts.length > 2) readiness = 'LOW';
            else if (missingParts.length > 0) readiness = 'MEDIUM';

            // 5. SATELLITE INFLOW SIMULATION
            const currentMonth = new Date().getMonth();
            let snowCover = (currentMonth >= 10 || currentMonth <= 3) ? 65 + Math.random() * 20 : 10 + Math.random() * 15;
            const baseMWh = (asset.capacity || 10) * 24;
            const inflow: InflowPrediction = {
                snowCoverPercent: snowCover,
                days30: baseMWh * 30 * (snowCover / 100) * 1.2,
                days60: baseMWh * 60 * (snowCover / 100) * 1.1,
                days90: baseMWh * 90 * (snowCover / 100) * 1.05
            };

            return {
                assetId: asset.id,
                assetName: asset.name,
                healthScore: score,
                efficiencyIndex,
                moneyAtRisk,
                readiness,
                inflow,
                status: (score < 50 ? 'CRITICAL_RISK' : efficiencyIndex < 92 ? 'LOW_PERFORMANCE' : 'OPTIMAL') as 'OPTIMAL' | 'LOW_PERFORMANCE' | 'CRITICAL_RISK'
            };
        });
    }, [assets, telemetry, operatingHours, activeDiagnoses, getMissingParts]);

    const totalMoneyAtRisk = useMemo(() =>
        fleetReports.reduce((sum, r) => sum + r.moneyAtRisk, 0),
        [fleetReports]);

    const globalFleetHealth = useMemo(() =>
        fleetReports.length > 0
            ? fleetReports.reduce((sum, r) => sum + r.healthScore, 0) / fleetReports.length
            : 100,
        [fleetReports]);

    return (
        <FleetContext.Provider value={{ fleetReports, totalMoneyAtRisk, globalFleetHealth, loading }}>
            {children}
        </FleetContext.Provider>
    );
};

export const useFleet = () => {
    const context = useContext(FleetContext);
    if (!context) throw new Error('useFleet must be used within a FleetProvider');
    return context;
};
