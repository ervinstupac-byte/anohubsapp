/**
 * GridSyncDictator.ts
 * 
 * External Plant Synchronization Protocol
 * Validates incoming plants before allowing grid connection
 * Rejects if phase angle deviation >2°
 */

export interface SyncRequest {
    plantId: string;
    voltage: number; // kV
    frequency: number; // Hz
    phaseAngle: number; // degrees
    timestamp: number;
}

export class GridSyncDictator {
    private static readonly MAX_PHASE_DEVIATION = 2.0; // degrees
    private static readonly MAX_FREQ_DEVIATION = 0.1; // Hz
    private static readonly MAX_VOLTAGE_DEVIATION = 0.5; // kV

    public static evaluateSyncRequest(request: SyncRequest): {
        approved: boolean;
        reason: string;
    } {
        console.log(`\n[GridSync] Evaluating sync request: ${request.plantId}`);
        console.log(`  Voltage: ${request.voltage} kV`);
        console.log(`  Frequency: ${request.frequency} Hz`);
        console.log(`  Phase: ${request.phaseAngle}°`);

        const referenceVoltage = 10.5;
        const referenceFrequency = 50.0;
        const referencePhase = 0;

        const voltageDev = Math.abs(request.voltage - referenceVoltage);
        const freqDev = Math.abs(request.frequency - referenceFrequency);
        const phaseDev = Math.abs(request.phaseAngle - referencePhase);

        // Check phase angle (CRITICAL)
        if (phaseDev > this.MAX_PHASE_DEVIATION) {
            return {
                approved: false,
                reason: `Phase angle deviation ${phaseDev.toFixed(2)}° > ${this.MAX_PHASE_DEVIATION}° limit`
            };
        }

        // Check frequency
        if (freqDev > this.MAX_FREQ_DEVIATION) {
            return {
                approved: false,
                reason: `Frequency deviation ${freqDev.toFixed(3)} Hz > ${this.MAX_FREQ_DEVIATION} Hz limit`
            };
        }

        // Check voltage
        if (voltageDev > this.MAX_VOLTAGE_DEVIATION) {
            return {
                approved: false,
                reason: `Voltage deviation ${voltageDev.toFixed(2)} kV > ${this.MAX_VOLTAGE_DEVIATION} kV limit`
            };
        }

        console.log('  ✅ SYNC APPROVED - within all tolerances');
        return { approved: true, reason: 'All parameters within limits' };
    }
}
