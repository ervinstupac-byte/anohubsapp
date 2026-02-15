import { useMemo } from 'react';
import { useTelemetryStore } from '../../telemetry/store/useTelemetryStore'; // Adjust path based on structure
import { useAssetConfig } from '../../../contexts/AssetConfigContext';
import { calculateRevenueLoss } from '../logic/FinancialCalculator';
import { FinancialInput, FinancialOutput } from '../types';

export const useFinancialInsights = (): FinancialOutput => {
    // 1. Consume Data
    const { physics, mechanical } = useTelemetryStore();
    const { config } = useAssetConfig();

    // 2. Map to Strict Logic Input
    const input: FinancialInput = useMemo(() => {
        // Extract with fallbacks
        // physics.powerMW is not available in TechnicalProjectState['physics']
        const currentMW = 0; // Or derive from hydraulic.powerKW if needed
        const designMW = config?.site?.designPerformanceMW || 10.0; // Default or from config

        // Determine if running (Example logic: RPM > 10)
        const isRunning = (mechanical.rpm || 0) > 10;

        return {
            market: {
                energyPricePerMWh: 85.0, // Should come from MarketStore eventually
                currency: 'EUR'
            },
            technical: {
                currentActivePowerMW: currentMW,
                designRatedPowerMW: designMW,
                currentEfficiencyPercent: 0, // Not used in current Loss calc but required by type
                isTurbineRunning: isRunning
            }
        };
    }, [physics, mechanical, config]);

    // 3. Execute Pure Logic
    const result = useMemo(() => calculateRevenueLoss(input), [input]);

    return result;
};
