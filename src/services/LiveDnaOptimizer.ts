/**
 * LiveDnaOptimizer.ts
 * 
 * Bayesian Adaptation Module
 * Machine learning loop that updates turbine efficiency curves
 * based on actual performance vs. theoretical Hill Charts
 * 
 * Shifts from "Manufacturer Defaults" to "Live Machine Realities"
 */

export interface EfficiencyDataPoint {
    timestamp: number;
    head: number; // m
    flow: number; // m³/s
    power: number; // MW
    theoreticalEfficiency: number; // % (from Hill Chart)
    actualEfficiency: number; // % (measured)
    delta: number; // % deviation
}

export interface AdaptedHillChart {
    turbineType: 'FRANCIS' | 'KAPLAN' | 'PELTON' | 'BANKI';
    assetId: string;
    dataPoints: Array<{
        head: number;
        flow: number;
        efficiency: number; // Bayesian-updated
        confidence: number; // 0-1
    }>;
    lastUpdate: number;
    samplesUsed: number;
}

export class LiveDnaOptimizer {
    private static trainingData: Map<string, EfficiencyDataPoint[]> = new Map();
    private static adaptedCharts: Map<string, AdaptedHillChart> = new Map();
    private static readonly LEARNING_RATE = 0.05; // Bayesian update weight
    private static readonly MIN_SAMPLES = 100; // Minimum samples before adaptation

    /**
     * Record actual performance data point
     */
    public static recordPerformance(
        assetId: string,
        head: number,
        flow: number,
        power: number,
        theoreticalEfficiency: number
    ): EfficiencyDataPoint {
        // Calculate actual efficiency
        const rho = 1000; // kg/m³
        const g = 9.81; // m/s²
        const theoreticalPower = (rho * g * flow * head) / 1e6; // MW
        const actualEfficiency = (power / theoreticalPower) * 100;

        const delta = actualEfficiency - theoreticalEfficiency;

        const dataPoint: EfficiencyDataPoint = {
            timestamp: Date.now(),
            head,
            flow,
            power,
            theoreticalEfficiency,
            actualEfficiency,
            delta
        };

        // Store training data
        if (!this.trainingData.has(assetId)) {
            this.trainingData.set(assetId, []);
        }
        this.trainingData.get(assetId)!.push(dataPoint);

        // Keep last 10,000 samples
        const data = this.trainingData.get(assetId)!;
        if (data.length > 10000) {
            data.shift();
        }

        // Trigger adaptation if enough samples
        if (data.length >= this.MIN_SAMPLES && data.length % 50 === 0) {
            this.performBayesianUpdate(assetId);
        }

        return dataPoint;
    }

    /**
     * Perform Bayesian update of efficiency curve
     */
    private static performBayesianUpdate(assetId: string): void {
        const data = this.trainingData.get(assetId);
        if (!data || data.length < this.MIN_SAMPLES) return;

        console.log(`[LiveDNA] Performing Bayesian update for ${assetId} (${data.length} samples)`);

        // Get turbine type
        const turbineType = this.inferTurbineType(assetId);

        // Create grid of operating points
        const headBins = 10;
        const flowBins = 10;

        const headRange = this.getRange(data.map(d => d.head));
        const flowRange = this.getRange(data.map(d => d.flow));

        const adaptedPoints: AdaptedHillChart['dataPoints'] = [];

        // For each grid cell, calculate Bayesian-updated efficiency
        for (let h = 0; h < headBins; h++) {
            for (let f = 0; f < flowBins; f++) {
                const head = headRange.min + (h / headBins) * (headRange.max - headRange.min);
                const flow = flowRange.min + (f / flowBins) * (flowRange.max - flowRange.min);

                // Find nearby samples
                const nearby = data.filter(d =>
                    Math.abs(d.head - head) < (headRange.max - headRange.min) / headBins &&
                    Math.abs(d.flow - flow) < (flowRange.max - flowRange.min) / flowBins
                );

                if (nearby.length > 0) {
                    // Bayesian update: Prior (theoretical) + Likelihood (actual data)
                    const theoreticalEff = nearby[0].theoreticalEfficiency; // Prior
                    const actualEffAvg = nearby.reduce((sum, d) => sum + d.actualEfficiency, 0) / nearby.length;

                    // Weighted average: more samples = more weight to actual
                    const weight = Math.min(1, nearby.length / 100);
                    const updatedEfficiency = theoreticalEff * (1 - weight * this.LEARNING_RATE) +
                        actualEffAvg * (weight * this.LEARNING_RATE);

                    const confidence = Math.min(1, nearby.length / 200);

                    adaptedPoints.push({
                        head,
                        flow,
                        efficiency: updatedEfficiency,
                        confidence
                    });
                }
            }
        }

        // Store adapted chart
        const adaptedChart: AdaptedHillChart = {
            turbineType,
            assetId,
            dataPoints: adaptedPoints,
            lastUpdate: Date.now(),
            samplesUsed: data.length
        };

        this.adaptedCharts.set(assetId, adaptedChart);

        console.log(`[LiveDNA] ✅ Updated Hill Chart for ${assetId} with ${adaptedPoints.length} points`);

        // Calculate improvement
        const avgDelta = data.slice(-100).reduce((sum, d) => sum + Math.abs(d.delta), 0) / 100;
        console.log(`[LiveDNA] Avg prediction error: ${avgDelta.toFixed(2)}% (vs manufacturer defaults)`);
    }

    /**
     * Get adapted efficiency for operating point
     */
    public static getAdaptedEfficiency(
        assetId: string,
        head: number,
        flow: number
    ): {
        efficiency: number;
        confidence: number;
        source: 'ADAPTED' | 'THEORETICAL';
    } {
        const chart = this.adaptedCharts.get(assetId);

        if (!chart) {
            return {
                efficiency: 90, // Default fallback
                confidence: 0,
                source: 'THEORETICAL'
            };
        }

        // Find nearest data point
        let nearest = chart.dataPoints[0];
        let minDist = Infinity;

        for (const point of chart.dataPoints) {
            const dist = Math.sqrt(
                Math.pow(point.head - head, 2) +
                Math.pow(point.flow - flow, 2)
            );
            if (dist < minDist) {
                minDist = dist;
                nearest = point;
            }
        }

        return {
            efficiency: nearest.efficiency,
            confidence: nearest.confidence,
            source: 'ADAPTED'
        };
    }

    /**
     * Get range of values
     */
    private static getRange(values: number[]): { min: number; max: number } {
        return {
            min: Math.min(...values),
            max: Math.max(...values)
        };
    }

    /**
     * Infer turbine type from asset ID
     */
    private static inferTurbineType(assetId: string): AdaptedHillChart['turbineType'] {
        if (assetId.includes('1') || assetId.includes('2')) return 'FRANCIS';
        if (assetId.includes('3') || assetId.includes('4')) return 'KAPLAN';
        if (assetId.includes('5')) return 'PELTON';
        if (assetId.includes('6')) return 'BANKI';
        return 'FRANCIS';
    }

    /**
     * Get adaptation statistics
     */
    public static getAdaptationStats(assetId: string): {
        samplesCollected: number;
        chartAdapted: boolean;
        avgImprovement: number; // % efficiency improvement
        lastUpdate: number;
    } {
        const data = this.trainingData.get(assetId) || [];
        const chart = this.adaptedCharts.get(assetId);

        const avgImprovement = data.length > 0
            ? data.slice(-100).reduce((sum, d) => sum + d.delta, 0) / Math.min(100, data.length)
            : 0;

        return {
            samplesCollected: data.length,
            chartAdapted: !!chart,
            avgImprovement,
            lastUpdate: chart?.lastUpdate || 0
        };
    }

    /**
     * Export adapted Hill Chart
     */
    public static exportAdaptedChart(assetId: string): string {
        const chart = this.adaptedCharts.get(assetId);
        if (!chart) return 'No adapted chart available';

        let export_str = '';
        export_str += `ADAPTED HILL CHART - ${assetId}\n`;
        export_str += `Type: ${chart.turbineType}\n`;
        export_str += `Samples: ${chart.samplesUsed}\n`;
        export_str += `Last Update: ${new Date(chart.lastUpdate).toISOString()}\n\n`;
        export_str += `Head(m)\tFlow(m³/s)\tEfficiency(%)\tConfidence\n`;

        chart.dataPoints.forEach(p => {
            export_str += `${p.head.toFixed(1)}\t${p.flow.toFixed(2)}\t${p.efficiency.toFixed(2)}\t${p.confidence.toFixed(2)}\n`;
        });

        return export_str;
    }
}
