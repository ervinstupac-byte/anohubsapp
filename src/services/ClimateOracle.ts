/**
 * CLIMATE ORACLE
 * The Predictive Strategist ⛈️🔮
 * Translates global weather forecasts into preemptive fleet actions.
 */

export interface WeatherForecast {
    region: string;
    rainMmNext24h: number;
    rainMmNext48h: number;
    rainMmNext72h: number;
    stormProbability: number; // 0-100%
}

export interface FleetStrategy {
    action: string;
    reason: string;
    urgency: 'ROUTINE' | 'HIGH' | 'EMERGENCY';
}

export class ClimateOracle {

    /**
     * ANALYZE FORECAST
     * Decides if the fleet needs to move water *before* it rains.
     */
    analyzeForecast(forecast: WeatherForecast): FleetStrategy {
        // Thresholds
        const EXTREME_RAIN_MM = 100; // 100-year storm territory in some regions

        if (forecast.rainMmNext72h > EXTREME_RAIN_MM) {
            return {
                action: 'PREEMPTIVE_RELEASE_ALL_RESERVOIRS',
                reason: `100-year Rain Event (${forecast.rainMmNext72h}mm) detected in 72h window. Create buffer volume immediately.`,
                urgency: 'EMERGENCY'
            };
        }

        if (forecast.rainMmNext48h > 50) {
            return {
                action: 'INCREASE_GENERATION_TO_MAX',
                reason: `Heavy Rain (${forecast.rainMmNext48h}mm) incoming. Lower reservoir levels by generating power.`,
                urgency: 'HIGH'
            };
        }

        return {
            action: 'MAINTAIN_OPTIMAL_HEAD',
            reason: 'Weather within normal operational parameters. Maximize head for efficiency.',
            urgency: 'ROUTINE'
        };
    }
}
