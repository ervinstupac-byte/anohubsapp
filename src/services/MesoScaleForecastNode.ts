/**
 * MesoScaleForecastNode.ts
 * 
 * Local Meteorological Intelligence
 * Ingests local weather station data to Refine (Bias Correct) global models (GFS/ECMWF).
 * Detects micro-climate events missed by coarse grids.
 */

export interface WeatherState {
    pressure: number; // hPa
    tempC: number;
    humidity: number;
    windSpeed: number;
}

export interface RefinedForecast {
    originalPrediction: WeatherState;
    refinedPrediction: WeatherState;
    biasDetected: boolean;
    stormArrivalDeltaHours: number; // Negative = Arriving earlier
}

export class MesoScaleForecastNode {

    /**
     * REFINE FORECAST
     * Compares Local observed trends vs Global Model predictions for "Now".
     * Applies the delta to the future forecast.
     */
    public static refine(
        localObs: WeatherState,
        globalModelNow: WeatherState,
        globalModelFuture: WeatherState
    ): RefinedForecast {

        // 1. Calculate Bias
        const pBias = localObs.pressure - globalModelNow.pressure;
        const tBias = localObs.tempC - globalModelNow.tempC;

        // 2. Storm Arrival Logic
        // If pressure is dropping FASTER than model, storm is accelerating.
        let arrivalShift = 0;
        if (pBias < -2.0) {
            // Pressure is 2hPa lower than predicted -> Storm likely 1-2 hours early
            arrivalShift = -2.0;
        }

        // 3. Apply Correction
        const refined: WeatherState = {
            pressure: globalModelFuture.pressure + pBias,
            tempC: globalModelFuture.tempC + tBias,
            humidity: globalModelFuture.humidity, // Complex to adjust
            windSpeed: globalModelFuture.windSpeed * (localObs.windSpeed > globalModelNow.windSpeed ? 1.2 : 1.0)
        };

        return {
            originalPrediction: globalModelFuture,
            refinedPrediction: refined,
            biasDetected: Math.abs(pBias) > 1.0 || Math.abs(tBias) > 2.0,
            stormArrivalDeltaHours: arrivalShift
        };
    }
}
