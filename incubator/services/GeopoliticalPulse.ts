/**
 * GeopoliticalPulse.ts
 * 
 * Global Intelligence Feed
 * Aggregates external non-industrial data for market prediction
 * Predicts price spikes 12 hours before they manifest
 */

export interface IntelligenceFeed {
    timestamp: number;
    weather: {
        windForecast: number; // MWh expected from wind
        solarForecast: number; // MWh expected from solar
        temperatureForecast: number; // °C (affects demand)
    };
    geopolitical: {
        events: string[];
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    };
    competitors: {
        estimatedOutput: number; // MW (basin-wide)
        maintenance: string[]; // Plants offline
    };
    news: {
        sentiment: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
        headlines: string[];
    };
}

export interface PriceSpikePrediction {
    timestamp: number; // When spike expected
    hoursAhead: number;
    predictedPrice: number; // EUR/MWh
    currentPrice: number; // EUR/MWh
    spike: number; // % increase
    confidence: number; // 0-1
    drivers: string[]; // What's causing it
}

export class GeopoliticalPulse {
    private static readonly LOOKBACK_HOURS = 168; // 7 days
    private static feedHistory: IntelligenceFeed[] = [];

    /**
     * Aggregate intelligence from external sources
     */
    public static async aggregateIntelligence(): Promise<IntelligenceFeed> {
        console.log('[GeoPulse] Aggregating global intelligence...');

        // In production: Query actual APIs
        // - Weather satellites: ECMWF, NOAA
        // - Energy news: Bloomberg, Reuters
        // - Competitor data: ENTSO-E transparency platform

        const feed: IntelligenceFeed = {
            timestamp: Date.now(),
            weather: await this.queryWeatherSatellites(),
            geopolitical: await this.scanGeopoliticalEvents(),
            competitors: await this.estimateCompetitorOutput(),
            news: await this.analyzeEnergyNews()
        };

        this.feedHistory.push(feed);

        // Keep last 7 days
        const cutoff = Date.now() - this.LOOKBACK_HOURS * 60 * 60 * 1000;
        this.feedHistory = this.feedHistory.filter(f => f.timestamp >= cutoff);

        return feed;
    }

    /**
     * Query weather satellites for renewable forecasts
     */
    private static async queryWeatherSatellites(): Promise<IntelligenceFeed['weather']> {
        // Mock data - in production: ECMWF API
        return {
            windForecast: 2500 + Math.random() * 1000, // MWh
            solarForecast: 1800 + Math.random() * 500,
            temperatureForecast: 15 + Math.random() * 10
        };
    }

    /**
     * Scan geopolitical events
     */
    private static async scanGeopoliticalEvents(): Promise<IntelligenceFeed['geopolitical']> {
        // Mock data - in production: News APIs, GDELT
        const events = [
            'EU carbon price trading at €85/ton (+3%)',
            'Germany extends nuclear shutdown timeline',
            'Balkan cold front expected next week'
        ];

        return {
            events,
            riskLevel: 'MEDIUM'
        };
    }

    /**
     * Estimate competitor production
     */
    private static async estimateCompetitorOutput(): Promise<IntelligenceFeed['competitors']> {
        // Mock data - in production: ENTSO-E transparency platform
        return {
            estimatedOutput: 450, // MW basin-wide
            maintenance: ['HE Orlovac (Unit 2)', 'HE Rijeka (Unit 1)']
        };
    }

    /**
     * Analyze energy news sentiment
     */
    private static async analyzeEnergyNews(): Promise<IntelligenceFeed['news']> {
        // Mock data - in production: Bloomberg API + NLP
        return {
            sentiment: 'BULLISH',
            headlines: [
                'Croatian demand up 5% YoY',
                'Regional interconnector expansion delayed',
                'Gas storage at 95% capacity'
            ]
        };
    }

    /**
     * Predict price spike 12 hours ahead
     */
    public static predictPriceSpike(hoursAhead: number = 12): PriceSpikePrediction | null {
        if (this.feedHistory.length < 24) {
            console.log('[GeoPulse] Insufficient data for prediction');
            return null;
        }

        console.log(`[GeoPulse] Predicting price spike ${hoursAhead} hours ahead...`);

        const latest = this.feedHistory[this.feedHistory.length - 1];
        const currentPrice = 65; // Mock current price

        // Prediction model (simplified - in production: ML model)
        let predictedPrice = currentPrice;
        const drivers: string[] = [];

        // Factor 1: Low renewable forecast → higher prices
        const totalRenewable = latest.weather.windForecast + latest.weather.solarForecast;
        if (totalRenewable < 3000) {
            predictedPrice += 15;
            drivers.push('Low renewable generation forecast');
        }

        // Factor 2: Cold weather → higher demand
        if (latest.weather.temperatureForecast < 5) {
            predictedPrice += 20;
            drivers.push('Cold weather increasing demand');
        }

        // Factor 3: Competitor maintenance → reduced supply
        if (latest.competitors.maintenance.length > 0) {
            predictedPrice += 10 * latest.competitors.maintenance.length;
            drivers.push(`${latest.competitors.maintenance.length} competitor units offline`);
        }

        // Factor 4: Geopolitical risk
        if (latest.geopolitical.riskLevel === 'HIGH' || latest.geopolitical.riskLevel === 'CRITICAL') {
            predictedPrice += 25;
            drivers.push('Elevated geopolitical risk');
        }

        // Factor 5: Market sentiment
        if (latest.news.sentiment === 'BULLISH') {
            predictedPrice += 10;
            drivers.push('Bullish market sentiment');
        }

        const spike = ((predictedPrice - currentPrice) / currentPrice) * 100;

        // Only return if significant spike expected (>20%)
        if (spike < 20) {
            return null;
        }

        const prediction: PriceSpikePrediction = {
            timestamp: Date.now() + hoursAhead * 60 * 60 * 1000,
            hoursAhead,
            predictedPrice,
            currentPrice,
            spike,
            confidence: 0.75,
            drivers
        };

        console.log(`[GeoPulse] 🚨 PRICE SPIKE PREDICTED:`);
        console.log(`  In ${hoursAhead} hours: €${predictedPrice.toFixed(0)} (+${spike.toFixed(0)}%)`);
        console.log(`  Drivers: ${drivers.length}`);

        return prediction;
    }

    /**
     * Get strategic recommendations
     */
    public static getStrategicRecommendations(): string[] {
        const latest = this.feedHistory[this.feedHistory.length - 1];
        if (!latest) return [];

        const recommendations: string[] = [];

        // Renewable competition
        const totalRenewable = latest.weather.windForecast + latest.weather.solarForecast;
        if (totalRenewable > 4000) {
            recommendations.push('⚠️ High renewable output expected - prepare for price suppression');
            recommendations.push('💡 Consider shifting load to off-peak hours');
        }

        // Competitor maintenance
        if (latest.competitors.maintenance.length > 2) {
            recommendations.push('✅ Multiple competitors offline - opportunity for market share');
            recommendations.push('💡 Increase generation during peak hours');
        }

        // Weather-driven demand
        if (latest.weather.temperatureForecast < 5 || latest.weather.temperatureForecast > 30) {
            recommendations.push('📊 Extreme temperature forecast - expect demand surge');
            recommendations.push('💡 Maximize availability during peak demand windows');
        }

        // Geopolitical
        if (latest.geopolitical.riskLevel === 'HIGH') {
            recommendations.push('🔴 Elevated geopolitical risk - volatile prices expected');
            recommendations.push('💡 Hedge exposure with forward contracts');
        }

        return recommendations;
    }

    /**
     * Export intelligence report
     */
    public static exportReport(): string {
        const latest = this.feedHistory[this.feedHistory.length - 1];
        if (!latest) return 'No data available';

        const prediction = this.predictPriceSpike(12);
        const recommendations = this.getStrategicRecommendations();

        let report = '';
        report += '═'.repeat(80) + '\n';
        report += 'GEOPOLITICAL INTELLIGENCE REPORT\n';
        report += '═'.repeat(80) + '\n';
        report += `Generated: ${new Date().toISOString()}\n\n`;

        report += 'WEATHER & RENEWABLES:\n';
        report += `  Wind Forecast: ${latest.weather.windForecast.toFixed(0)} MWh\n`;
        report += `  Solar Forecast: ${latest.weather.solarForecast.toFixed(0)} MWh\n`;
        report += `  Temperature: ${latest.weather.temperatureForecast.toFixed(0)}°C\n\n`;

        report += 'COMPETITOR ANALYSIS:\n';
        report += `  Basin Output: ${latest.competitors.estimatedOutput} MW\n`;
        report += `  Maintenance: ${latest.competitors.maintenance.length} units\n`;
        latest.competitors.maintenance.forEach(m => {
            report += `    - ${m}\n`;
        });
        report += '\n';

        report += 'GEOPOLITICAL RISK:\n';
        report += `  Level: ${latest.geopolitical.riskLevel}\n`;
        latest.geopolitical.events.forEach(e => {
            report += `  • ${e}\n`;
        });
        report += '\n';

        if (prediction) {
            report += 'PRICE SPIKE PREDICTION:\n';
            report += `  Predicted: €${prediction.predictedPrice.toFixed(0)} in ${prediction.hoursAhead} hours\n`;
            report += `  Spike: +${prediction.spike.toFixed(0)}%\n`;
            report += `  Confidence: ${(prediction.confidence * 100).toFixed(0)}%\n`;
            report += '  Drivers:\n';
            prediction.drivers.forEach(d => {
                report += `    - ${d}\n`;
            });
            report += '\n';
        }

        report += 'STRATEGIC RECOMMENDATIONS:\n';
        recommendations.forEach(r => {
            report += `  ${r}\n`;
        });

        report += '═'.repeat(80) + '\n';

        return report;
    }
}
