/**
 * TransformerOilAnalyst.ts
 * 
 * Online Dissolved Gas Analysis (DGA) Monitor
 * Implements Duval Triangle 1 Logic to classify faults:
 * PD (Partial Discharge), D1/D2 (Discharges), T1/T2/T3 (Thermal).
 * Triggers CRITICAL alerts on Acetylene (C2H2) trends (Arcing).
 */

export interface DGAReport {
    timestamp: number;
    gasses: { H2: number; CH4: number; C2H6: number; C2H4: number; C2H2: number };
    duvalCoordinates: { ch4: number; c2h4: number; c2h2: number }; // %
    faultType: string;
    acetyleneTrend: 'STABLE' | 'RISING' | 'CRITICAL_SPIKE';
    recommendation: string;
}

export class TransformerOilAnalyst {

    /**
     * ANALYZE GASES (ppm)
     */
    public static analyze(
        h2: number, ch4: number, c2h6: number, c2h4: number, c2h2: number,
        prevC2H2: number
    ): DGAReport {

        // 1. Acetylene Trend Check (Arcing Indicator)
        let c2h2Trend: DGAReport['acetyleneTrend'] = 'STABLE';
        if (c2h2 > prevC2H2 * 1.1 && c2h2 > 5) c2h2Trend = 'RISING';
        if (c2h2 > 10 && c2h2 > prevC2H2 * 1.5) c2h2Trend = 'CRITICAL_SPIKE';

        // 2. Duval Triangle 1 Calculation
        // Only valid if total combustible gases > threshold, but we compute anyway for logic
        const sum = ch4 + c2h4 + c2h2;
        let pCH4 = 0, pC2H4 = 0, pC2H2 = 0;

        if (sum > 0) {
            pCH4 = (ch4 / sum) * 100;
            pC2H4 = (c2h4 / sum) * 100;
            pC2H2 = (c2h2 / sum) * 100;
        }

        // 3. Fault Classification (Duval Triangle 1 simplified zones)
        let fault = 'NORMAL';
        if (sum < 50) {
            fault = 'NORMAL'; // Low levels
        } else {
            if (pC2H2 >= 87) fault = 'PD (Partial Discharge)';
            else if (pC2H2 >= 29) {
                // High Energy Discharge
                if (pC2H4 >= 23) fault = 'D2 (High Energy Discharge)';
                else fault = 'D1 (Low Energy Discharge)';
            } else if (pC2H4 < 23) {
                // Thermal
                if (pC2H2 > 4) fault = 'D1 (Low Energy Discharge)'; // Zone overlap approx
                else fault = 'T1 (Thermal < 300C)';
            } else {
                // Thermal High
                if (pC2H4 >= 50) fault = 'T3 (Thermal > 700C)';
                else fault = 'T2 (Thermal 300-700C)';
            }
        }

        // 4. Recommendation
        let rec = 'Monitor monthly';
        if (c2h2Trend === 'CRITICAL_SPIKE' || fault.startsWith('D2')) {
            rec = 'CRITICAL: DE-ENERGIZED & RETEST. Arcing suspected.';
        } else if (fault.startsWith('T3')) {
            rec = 'WARNING: Reduce Load. Check Cooling.';
        }

        return {
            timestamp: Date.now(),
            gasses: { H2: h2, CH4: ch4, C2H6: c2h6, C2H4: c2h4, C2H2: c2h2 },
            duvalCoordinates: { ch4: pCH4, c2h4: pC2H4, c2h2: pC2H2 },
            faultType: fault,
            acetyleneTrend: c2h2Trend,
            recommendation: rec
        };
    }
}
