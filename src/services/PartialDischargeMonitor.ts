/**
 * PartialDischargeMonitor.ts
 * 
 * UHF & Acoustic PD Monitoring
 * Integrates pulse amplitude and count to assess Insulation Health.
 * Detects breakdown precursors in Transformer/GIS.
 */

export interface PDHealth {
    amplitudePc: number; // Pico-Coulombs (converted from UHF mV)
    pulseRatePPS: number; // Pulses per second
    trackingActive: boolean;
    insulationHealthIndex: number; // 0-100
    status: 'HEALTHY' | 'ACTIVITY_DETECTED' | 'BREAKDOWN_RISK';
}

export class PartialDischargeMonitor {

    /**
     * EVALUATE PD ACTIVITY
     */
    public static analyze(
        uhfSignalMv: number, // Sensor raw
        acousticSignalDb: number
    ): PDHealth {

        // 1. Signal Conversion (Mock calibration)
        const amplitudePc = uhfSignalMv * 10;

        // 2. Pulse Rate Logic (Simulated from signal noise or external counter)
        // Assume if signal high, rate is high
        const pulseRate = amplitudePc > 100 ? 50 + (amplitudePc / 10) : 0;

        // 3. Health Index Calculation
        // Base 100
        // Penalty for Amplitude
        // Penalty for Acoustic confirmation (means physical damage/source confirmed)

        let health = 100;

        if (amplitudePc > 100) health -= 10;
        if (amplitudePc > 500) health -= 30;
        if (amplitudePc > 1000) health -= 50;

        if (acousticSignalDb > 20) health -= 20; // Acoustic confirmed

        health = Math.max(0, health);

        // 4. Status
        let status: PDHealth['status'] = 'HEALTHY';
        if (health < 80) status = 'ACTIVITY_DETECTED';
        if (health < 40) status = 'BREAKDOWN_RISK';

        return {
            amplitudePc,
            pulseRatePPS: pulseRate,
            trackingActive: amplitudePc > 200, // Surface tracking?
            insulationHealthIndex: health,
            status
        };
    }
}
