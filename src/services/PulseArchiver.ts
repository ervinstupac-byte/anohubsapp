/**
 * PulseArchiver.ts
 * 
 * Historical Pulse Archiving System
 * Samples SovereignPulse metrics every 10 minutes
 * for long-term trend analysis and health monitoring.
 */

export interface PulseSample {
    timestamp: number;
    liveROI: number;
    systemIntegrity: number;
    unityIndex: number;
    avgLatency: number;
    activeHealings: number;
    silentMode: boolean;
}

export class PulseArchiver {
    private static samples: PulseSample[] = [];
    private static archiveInterval: NodeJS.Timeout | null = null;
    private static readonly SAMPLE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

    /**
     * Start automatic pulse archiving
     */
    public static startArchiving(): void {
        console.log('[PulseArchiver] Starting 10-minute pulse sampling...');

        // Take initial sample
        this.takeSample();

        // Schedule periodic sampling
        this.archiveInterval = setInterval(() => {
            this.takeSample();
        }, this.SAMPLE_INTERVAL_MS);
    }

    /**
     * Stop archiving
     */
    public static stopArchiving(): void {
        if (this.archiveInterval) {
            clearInterval(this.archiveInterval);
            this.archiveInterval = null;
            console.log('[PulseArchiver] Archiving stopped');
        }
    }

    /**
     * Take a pulse sample
     */
    private static takeSample(): void {
        // In production: Query actual system state
        const sample: PulseSample = {
            timestamp: Date.now(),
            liveROI: 125480, // Would get from ValueCompounder
            systemIntegrity: 97.3, // Would calculate from health metrics
            unityIndex: 1.0,
            avgLatency: 12.4, // Would get from SovereignKernel
            activeHealings: 0, // Would get from SovereignHealer
            silentMode: true // Would get from SilenceProtocol
        };

        this.samples.push(sample);

        // Persist to database
        this.persistSample(sample);

        console.log(`[PulseArchiver] Sample #${this.samples.length} recorded: €${sample.liveROI.toLocaleString()}, ${sample.systemIntegrity.toFixed(1)}% integrity`);

        // Cleanup old samples (keep last 30 days in memory)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        this.samples = this.samples.filter(s => s.timestamp >= thirtyDaysAgo);
    }

    /**
     * Persist sample to database
     */
    private static async persistSample(sample: PulseSample): Promise<void> {
        // In production: Save to Supabase
        // await supabase.from('pulse_archive').insert(sample)
    }

    /**
     * Get historical samples for trend analysis
     */
    public static getSamples(
        startTime?: number,
        endTime?: number
    ): PulseSample[] {
        let filtered = this.samples;

        if (startTime) {
            filtered = filtered.filter(s => s.timestamp >= startTime);
        }

        if (endTime) {
            filtered = filtered.filter(s => s.timestamp <= endTime);
        }

        return filtered;
    }

    /**
     * Calculate trend over period
     */
    public static calculateTrend(
        metric: keyof PulseSample,
        hours: number = 24
    ): {
        current: number;
        average: number;
        min: number;
        max: number;
        trend: 'IMPROVING' | 'STABLE' | 'DEGRADING';
    } {
        const startTime = Date.now() - (hours * 60 * 60 * 1000);
        const samples = this.getSamples(startTime);

        if (samples.length === 0) {
            return {
                current: 0,
                average: 0,
                min: 0,
                max: 0,
                trend: 'STABLE'
            };
        }

        const values = samples.map(s => s[metric] as number);
        const current = values[values.length - 1];
        const average = values.reduce((a, b) => a + b, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);

        // Simple trend detection (compare recent vs older samples)
        const midpoint = Math.floor(samples.length / 2);
        const recentAvg = values.slice(midpoint).reduce((a, b) => a + b, 0) / (values.length - midpoint);
        const olderAvg = values.slice(0, midpoint).reduce((a, b) => a + b, 0) / midpoint;

        let trend: 'IMPROVING' | 'STABLE' | 'DEGRADING' = 'STABLE';
        const delta = recentAvg - olderAvg;

        // For metrics where higher is better (ROI, integrity)
        if (metric === 'liveROI' || metric === 'systemIntegrity' || metric === 'unityIndex') {
            if (delta > average * 0.05) trend = 'IMPROVING';
            else if (delta < -average * 0.05) trend = 'DEGRADING';
        }
        // For metrics where lower is better (latency)
        else if (metric === 'avgLatency') {
            if (delta < -average * 0.05) trend = 'IMPROVING';
            else if (delta > average * 0.05) trend = 'DEGRADING';
        }

        return { current, average, min, max, trend };
    }

    /**
     * Get summary statistics
     */
    public static getStats(): {
        totalSamples: number;
        oldestSample: number | null;
        newestSample: number | null;
        coverageDays: number;
    } {
        return {
            totalSamples: this.samples.length,
            oldestSample: this.samples[0]?.timestamp || null,
            newestSample: this.samples[this.samples.length - 1]?.timestamp || null,
            coverageDays: this.samples.length > 0
                ? (Date.now() - this.samples[0].timestamp) / (1000 * 60 * 60 * 24)
                : 0
        };
    }
}
