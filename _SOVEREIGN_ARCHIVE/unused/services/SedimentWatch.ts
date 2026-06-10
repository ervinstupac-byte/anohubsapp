/**
 * SedimentWatch.ts
 * 
 * Sediment & Abrasion Protection
 * Monitors Turbidity/Sand concentration.
 * Calculates "Abrasion Risk Index". Triggers shutdown if bad.
 */

export interface SedimentStatus {
    turbidityNTU: number;
    sandContentPPM: number;
    abrasionRiskIndex: number; // 0-100
    safeToOperate: boolean;
    recommendation: string;
}

export class SedimentWatch {
    private static readonly SAND_LIMIT_PPM = 5000; // 5 g/l is VERY HIGH, stop.
    private static readonly ABRASION_START_PPM = 500; // 0.5 g/l starts wear

    /**
     * ANALYZE SEDIMENT LOAD
     */
    public static analyze(
        turbidityNTU: number,
        acousticSandSignalV: number // 0-10V from sensor
    ): SedimentStatus {
        // Convert signal to PPM (Calibrated curve)
        // Ppm = sig * 1000 roughly
        const sandPPM = acousticSandSignalV * 500;

        // Calculate Risk
        // Risk grows exponentially with concentration and Velocity^3 (V is ~ Head/Flow).
        // Assume constant operating point for risk metric.
        let risk = 0;
        if (sandPPM < this.ABRASION_START_PPM) {
            risk = (sandPPM / this.ABRASION_START_PPM) * 20; // 0-20 (Low impact)
        } else {
            risk = 20 + ((sandPPM - this.ABRASION_START_PPM) / (this.SAND_LIMIT_PPM - this.ABRASION_START_PPM)) * 80;
        }
        risk = Math.min(100, risk);

        let safe = true;
        let recommendation = 'Normal Operation';

        if (sandPPM > this.SAND_LIMIT_PPM) {
            safe = false;
            recommendation = `CRITICAL: Sand ${sandPPM.toFixed(0)} ppm excessive! STOP UNIT to save runner.`;
        } else if (risk > 60) {
            recommendation = `WARNING: Heavy abrasion wear (Risk ${risk.toFixed(0)}). Reduce load or flush desander.`;
        }

        return {
            turbidityNTU,
            sandContentPPM: sandPPM,
            abrasionRiskIndex: risk,
            safeToOperate: safe,
            recommendation
        };
    }
}
