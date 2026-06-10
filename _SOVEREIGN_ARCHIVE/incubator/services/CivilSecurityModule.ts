/**
 * CivilSecurityModule.ts
 * 
 * Civil & Structural Security Integration
 * Integrates piezometer data, uplift pressure, and seismic monitoring
 * into the sovereign SCADA core
 */

export interface PiezometerData {
    id: string;
    location: string;
    elevation: number; // m
    pressure: number; // bar
    upliftForce: number; // kN/m² (calculated)
    timestamp: number;
}

export interface SeismicData {
    stationId: string;
    peakGroundAcceleration: number; // g (fraction of gravity)
    frequency: number; // Hz
    magnitude: number; // Richter scale (if available)
    timestamp: number;
}

export interface DamStabilityGauge {
    safetyFactor: number;
    waterLevel: number; // m
    upliftPressure: number; // bar (average)
    seismicActivity: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH';
    status: 'SAFE' | 'MONITORING' | 'WARNING' | 'CRITICAL';
    lastUpdate: number;
}

export class CivilSecurityModule {
    private static piezometers: Map<string, PiezometerData> = new Map();
    private static seismicStations: Map<string, SeismicData> = new Map();
    private static stabilityGauge: DamStabilityGauge | null = null;

    /**
     * Register piezometer sensor
     */
    public static registerPiezometer(data: PiezometerData): void {
        // Calculate uplift force from pressure
        const upliftForce = data.pressure * 100; // bar to kN/m² (simplified)
        data.upliftForce = upliftForce;

        this.piezometers.set(data.id, data);

        // Update stability gauge
        this.updateStabilityGauge();

        console.log(`[CivilSecurity] Piezometer ${data.id}: ${data.pressure.toFixed(2)} bar (${upliftForce.toFixed(0)} kN/m² uplift)`);
    }

    /**
     * Register seismic event
     */
    public static registerSeismicEvent(data: SeismicData): void {
        this.seismicStations.set(data.stationId, data);

        // Classify seismic activity
        let activity: SeismicData['magnitude'] extends number ? 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' : 'NONE';

        if (data.peakGroundAcceleration < 0.02) {
            activity = 'NONE'; // < 2% g - not noticeable
        } else if (data.peakGroundAcceleration < 0.05) {
            activity = 'LOW'; // 2-5% g - minor
        } else if (data.peakGroundAcceleration < 0.15) {
            activity = 'MODERATE'; // 5-15% g - noticeable
        } else {
            activity = 'HIGH'; // > 15% g - potentially damaging
        }

        if (activity === 'HIGH' || activity === 'MODERATE') {
            console.log(`[CivilSecurity] ⚠️ SEISMIC EVENT: ${data.stationId} - ${data.peakGroundAcceleration.toFixed(3)}g`);
            this.triggerSeismicProtocol(data);
        }

        this.updateStabilityGauge();
    }

    /**
     * Update dam stability gauge in real-time
     */
    private static updateStabilityGauge(): void {
        // Calculate average uplift pressure
        const piezometerArray = Array.from(this.piezometers.values());
        const avgUpliftPressure = piezometerArray.length > 0
            ? piezometerArray.reduce((sum, p) => sum + p.pressure, 0) / piezometerArray.length
            : 0;

        // Get current water level (would come from reservoir sensor)
        const waterLevel = 85.0; // Mock value - meters above foundation

        // Simplified safety factor calculation
        // In production: Use DamStabilityService for full calculation
        const safetyFactor = this.calculateSimplifiedSafetyFactor(waterLevel, avgUpliftPressure);

        // Determine seismic activity
        const seismicArray = Array.from(this.seismicStations.values());
        const maxPGA = seismicArray.length > 0
            ? Math.max(...seismicArray.map(s => s.peakGroundAcceleration))
            : 0;

        let seismicActivity: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH';
        if (maxPGA < 0.02) seismicActivity = 'NONE';
        else if (maxPGA < 0.05) seismicActivity = 'LOW';
        else if (maxPGA < 0.15) seismicActivity = 'MODERATE';
        else seismicActivity = 'HIGH';

        // Determine overall status
        let status: DamStabilityGauge['status'];
        if (safetyFactor >= 1.5 && seismicActivity === 'NONE') {
            status = 'SAFE';
        } else if (safetyFactor >= 1.2 && (seismicActivity === 'NONE' || seismicActivity === 'LOW')) {
            status = 'MONITORING';
        } else if (safetyFactor >= 1.0) {
            status = 'WARNING';
        } else {
            status = 'CRITICAL';
        }

        this.stabilityGauge = {
            safetyFactor,
            waterLevel,
            upliftPressure: avgUpliftPressure,
            seismicActivity,
            status,
            lastUpdate: Date.now()
        };

        if (status === 'WARNING' || status === 'CRITICAL') {
            console.log(`[CivilSecurity] 🚨 DAM STATUS: ${status} - SF: ${safetyFactor.toFixed(2)}`);
        }
    }

    /**
     * Simplified safety factor (for real-time gauge)
     */
    private static calculateSimplifiedSafetyFactor(waterLevel: number, upliftPressure: number): number {
        // Simplified: SF ≈ 1 + (100 - waterLevel)/50 - upliftPressure/10
        // Real calculation would use full DamStabilityService
        const baseFS = 1.8;
        const waterEffect = (100 - waterLevel) / 50;
        const upliftEffect = upliftPressure / 10;

        return Math.max(0.5, baseFS + waterEffect - upliftEffect);
    }

    /**
     * Trigger seismic response protocol
     */
    private static triggerSeismicProtocol(data: SeismicData): void {
        console.log('\n' + '═'.repeat(80));
        console.log('SEISMIC RESPONSE PROTOCOL ACTIVATED');
        console.log('═'.repeat(80));
        console.log(`Station: ${data.stationId}`);
        console.log(`PGA: ${data.peakGroundAcceleration.toFixed(3)}g`);
        console.log(`Frequency: ${data.frequency.toFixed(1)} Hz`);

        if (data.peakGroundAcceleration > 0.15) {
            console.log('\n⚠️ HIGH SEISMIC ACTIVITY - ACTIONS:');
            console.log('  1. Inspect dam and powerhouse for damage');
            console.log('  2. Check pendulum displacements');
            console.log('  3. Review piezometer readings for anomalies');
            console.log('  4. Reduce reservoir level if PGA > 0.25g');
        } else {
            console.log('\n📊 MODERATE SEISMIC ACTIVITY - ACTIONS:');
            console.log('  1. Monitor structural sensors');
            console.log('  2. Increase inspection frequency');
        }

        console.log('═'.repeat(80) + '\n');
    }

    /**
     * Get current stability gauge
     */
    public static getStabilityGauge(): DamStabilityGauge | null {
        return this.stabilityGauge;
    }

    /**
     * Get all piezometer readings
     */
    public static getPiezometers(): PiezometerData[] {
        return Array.from(this.piezometers.values());
    }

    /**
     * Get seismic data
     */
    public static getSeismicData(): SeismicData[] {
        return Array.from(this.seismicStations.values());
    }
}
