// Smart Start Service
// "The Fore-Brain" of the Turbine Start Sequence

export interface CheckItem {
    id: string;
    category: 'CRITICAL_WARNING' | 'TECHNICAL_CHECK' | 'LAB_MATERIAL';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    label: string;
    value?: string;
    status: 'OK' | 'WARNING' | 'CRITICAL' | 'PENDING';
    actionRequired?: string;
    isLegacyTrigger?: boolean;
}

export class SmartStartService {

    /**
     * Generates the dynamic Pre-Start Checklist based on machine state and Legacy Knowledge
     */
    static generateChecklist(turbineId: string): CheckItem[] {
        const checks: CheckItem[] = [];

        // Simulated State (Simulating DB reads)
        const machineState = {
            standbyDays: 92,
            greaseCycles: 45,
            currentShaftTemp: 12, // Celsius
            lastLaserAlign: 0.038, // mm/m
            hydrPressure: 120, // bar
            oilTan: 0.15,
            lastOilCheckDays: 3
        };

        // --- 1. CRITICAL WARNINGS (Legacy Mode Triggers) ---

        // [LEGACY #3] GREASE/SEAL DISASTER
        if (machineState.standbyDays > 30 && machineState.greaseCycles > 20) {
            checks.push({
                id: 'LEG-3',
                category: 'CRITICAL_WARNING',
                priority: 'HIGH',
                label: `RIZIK OD PRODORA VODE (Cycles: ${machineState.greaseCycles})`,
                status: 'CRITICAL',
                actionRequired: 'Obavezna ručna drenaža i vizuelni pregled zaptivke!',
                isLegacyTrigger: true,
                value: `${machineState.greaseCycles} Cycles`
            });
        }

        // [LEGACY #4] THERMAL OFFSET
        // Logic: if temp < 20, calculate offset
        if (machineState.currentShaftTemp < 20) {
            // Simplified expansion calc: Offset = L * alpha * deltaT
            const targetTemp = 55;
            const offset = (5.0 * 12e-6 * (targetTemp - machineState.currentShaftTemp) * 1000).toFixed(2);

            checks.push({
                id: 'LEG-4',
                category: 'CRITICAL_WARNING',
                priority: 'MEDIUM',
                label: `TERMIČKI OFFSET (Temp: ${machineState.currentShaftTemp}°C)`,
                status: 'WARNING',
                actionRequired: `Postaviti offset -${offset}mm (za radnih ${targetTemp}°C)`,
                isLegacyTrigger: true,
                value: `${machineState.currentShaftTemp}°C`
            });
        }

        // --- 2. TECHNICAL CHECKS (Real-Time) ---
        checks.push({
            id: 'TECH-1',
            category: 'TECHNICAL_CHECK',
            priority: 'HIGH',
            label: 'Centriranje (Lasersko)',
            value: `${machineState.lastLaserAlign} mm/m`,
            status: machineState.lastLaserAlign < 0.05 ? 'OK' : 'WARNING'
        });

        checks.push({
            id: 'TECH-2',
            category: 'TECHNICAL_CHECK',
            priority: 'HIGH',
            label: 'Hidraulički pritisak',
            value: `${machineState.hydrPressure} bar`,
            status: machineState.hydrPressure > 100 ? 'OK' : 'CRITICAL'
        });

        checks.push({
            id: 'TECH-3',
            category: 'TECHNICAL_CHECK',
            priority: 'MEDIUM',
            label: 'Akustični Test (AI)',
            value: 'Normal Baseline',
            status: 'OK'
        });

        // --- 3. LAB & MATERIALS ---
        checks.push({
            id: 'LAB-1',
            category: 'LAB_MATERIAL',
            priority: 'LOW',
            label: 'Analiza ulja (TAN & Vlaga)',
            value: `Prije ${machineState.lastOilCheckDays} dana`,
            status: 'OK'
        });

        checks.push({
            id: 'LAB-2',
            category: 'LAB_MATERIAL',
            priority: 'HIGH',
            label: 'Kavitacija vs Erozija',
            value: 'Radno kolo čisto',
            status: 'OK'
        });

        return checks;
    }
}
