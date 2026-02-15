import { useMemo } from 'react';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';

export interface SmartAction {
    id: string;
    title: string;
    description: string; // The "Command"
    type: 'OPTIMIZATION' | 'SAFETY' | 'MAINTENANCE';
    impact: string; // "+$50/hr" or "Prevent Failure"
    actionFn?: () => void; // Potential hook for auto-execution
}

export const useSmartActions = (): SmartAction[] => {
    const { hydraulic, mechanical, physics } = useTelemetryStore();

    // Telemetry Snapshots (with defaults)
    const bearingTemp = mechanical.bearingTemp || 0;
    const vibration = mechanical.vibration || 0;
    const efficiency = hydraulic.efficiency || 0.9;
    // physics.powerMW is not available in TechnicalProjectState['physics']
    const powerMW = 0; // Or derive from hydraulic.powerKW if needed

    // MOCK Thresholds (normally these come from AssetConfig)
    const MAX_BEARING_TEMP = 65;
    const MAX_VIBRATION = 2.0;

    const actions = useMemo(() => {
        const activeActions: SmartAction[] = [];

        // RULE 1: Thermal Stabilization
        // If Temp is high, suggest load shed
        if (bearingTemp > MAX_BEARING_TEMP) {
            activeActions.push({
                id: 'thermal-load-shed',
                title: 'Thermal Violation',
                description: `Reduce Active Load by 5% to stabilize Thrust Bearing Temp (${bearingTemp}°C).`,
                type: 'SAFETY',
                impact: 'Prevent Babbitt Wipe'
            });
        }

        // RULE 2: Cavitation Avoidance (Rough Zone)
        // High vibration + Low Efficiency usually means draft tube vortex or cavitation
        if (vibration > MAX_VIBRATION && efficiency < 0.85) {
            activeActions.push({
                id: 'cavitation-shift',
                title: 'Rough Zone Operation',
                description: 'Shift operational setpoint: Increase Power > 5MW or Shut Down.',
                type: 'MAINTENANCE',
                impact: 'Reduce Vibration -40%'
            });
        }

        // RULE 3: Efficiency Tuning (The "Money" Rule)
        // If efficiency is just slightly off peak (e.g., 88-91%) but could be 94%
        if (efficiency > 0.85 && efficiency < 0.92) {
            activeActions.push({
                id: 'peak-efficiency-tune',
                title: 'Revenue Opportunity',
                description: 'Adjust Guide Vanes: +2% Opening to hit Best Efficiency Point.',
                type: 'OPTIMIZATION',
                impact: '+ €12.50 / hour'
            });
        }

        return activeActions;
    }, [bearingTemp, vibration, efficiency, powerMW]);

    return actions;
};
