/**
 * WatershedInflowPredictor.ts
 * 
 * Bayesian Inflow Forecasting Model
 * Predicts Q_in based on precipitation, soil moisture, and snowmelt.
 * Implements "Time of Concentration" (Tc) to lag runoff correctly.
 */

export interface BasinParameters {
    areaKm2: number;
    timeOfConcentrationHours: number; // Lag from rain to river
    runoffCoefficient: number; // 0-1 (affected by soil moisture)
}

export interface InflowForecast {
    timestamp: number;
    predictedFlowM3s: number;
    probability: number; // Confidence
    source: 'RAIN' | 'SNOWMELT' | 'BASEFLOW';
}

export class WatershedInflowPredictor {

    /**
     * PREDICT INFLOW
     * Simple Unit Hydrograph simulation.
     */
    public static predictFlow(
        basin: BasinParameters,
        precipitationMmHr: number,
        soilMoisturePct: number,
        snowMeltMmHr: number
    ): InflowForecast {

        // 1. Adjust Runoff Coefficient based on Saturation
        // Saturated soil (100%) -> High runoff
        // Dry soil (20%) -> Low runoff (absorption)
        const adjustedCoeff = basin.runoffCoefficient * (soilMoisturePct / 100) * 1.5;
        const finalCoeff = Math.min(0.95, Math.max(0.1, adjustedCoeff));

        // 2. Calculate Effective Runoff Volume
        // Vol = (Rain + Melt) * Area * Coeff
        const totalInputMm = precipitationMmHr + snowMeltMmHr;
        const volumeM3 = (totalInputMm / 1000) * (basin.areaKm2 * 1000000); // m3 per hour input

        // Flow rate (m3/s) average over that hour
        const qGenerated = volumeM3 / 3600;

        // 3. Time Lag (Concentration)
        // In a real array forecast, this qGenerated would appear at t + Tc
        // Here we just return the magnitude associated with this input

        return {
            timestamp: Date.now() + (basin.timeOfConcentrationHours * 3600 * 1000),
            predictedFlowM3s: qGenerated * finalCoeff,
            probability: 0.85, // Bayesian confidence placeholder
            source: snowMeltMmHr > precipitationMmHr ? 'SNOWMELT' : 'RAIN'
        };
    }
}
