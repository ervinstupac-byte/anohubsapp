import { DiagnosticInsight } from '../hooks/useContextEngine';

/**
 * Diagnostic Engine - The "Whisperer"
 * Applies heuristic engineering rules to sensor data to generate insights.
 */

export const evaluateDiagnostics = (componentId: string, sensors: any, inputs?: any): DiagnosticInsight[] => {
    const insights: DiagnosticInsight[] = [];

    if (!componentId || !sensors) return insights;

    // --- PENSTOCK LOGIC ---
    if (componentId.includes('penstock')) {
        // Rule: Water Hammer Risk
        // If Pressure > 18 bar (converted to Hoop Stress proxy or distinct sensor)
        // AND Closure Time < 2s (Simulated input or derived)

        // For simulation purposes, we map hoopStressMPa to Pressure roughly (1 MPa = 10 bar)
        // Let's assume hoopStress 130MPa ~ 13 Bar. If > 180 MPa -> High Pressure.
        // Or we use specific provided sensors if they existed. 
        // We'll use the user's specific text logic.

        const pressureBar = (sensors.hoopStressMPa || 0) / 10; // Approx conversion for demo
        const closureTime = inputs?.closureTime || 1.5; // Simulated unsafe closure if not provided

        if (pressureBar > 18 && closureTime < 2) {
            insights.push({
                id: 'd-pen-hammer',
                type: 'critical',
                messageKey: 'common.sidebar.insights.waterHammerCritical',
                value: `${pressureBar.toFixed(1)} bar`
            });
        }

        // Secondary Rule: High Hoop Stress (Existing)
        if ((sensors.hoopStressMPa || 0) > 150) {
            insights.push({
                id: 'd-pen-stress',
                type: 'warning',
                messageKey: 'common.sidebar.insights.highPressure',
                value: sensors.hoopStressMPa
            });
        }
    }

    // --- TRANSFORMER LOGIC ---
    if (componentId.includes('transformer')) {
        // Rule: Thermal Overload
        // If Load > 90% AND Oil Temp > 65°C

        const load = inputs?.load || 92; // Simulated active load
        const oilTemp = sensors.transformerOilTemp || 0;

        if (load > 90 && oilTemp > 65) {
            insights.push({
                id: 'd-trans-thermal',
                type: 'warning', // User said "NOTICE", which usually implies Warning/Info, but logic suggests urgency. Warning fits "Notice".
                messageKey: 'common.sidebar.insights.substationThermal',
                value: `${oilTemp.toFixed(1)}°C`
            });
        }
    }

    // --- GENERATOR LOGIC ---
    if (componentId.includes('generator')) {
        // Rule: Field Flashing (Excitation)
        // If Voltage < 10% nominal but speed > 90% -> Field Flashing Required (Startup context)
        // Simplified for demo
        if ((sensors.voltageKV || 0) < 2 && (sensors.activePowerMW || 0) < 1) {
            insights.push({
                id: 'd-gen-excitation',
                type: 'safe',
                messageKey: 'common.sidebar.insights.fieldFlashing'
            });
        }
    }

    return insights;
};

export function getConfidenceScore(..._args: any[]): number {
    return 50;
}
