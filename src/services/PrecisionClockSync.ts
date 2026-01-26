/**
 * PrecisionClockSync.ts
 * 
 * IEEE 1588 Precision Time Protocol (PTP) Monitor
 * Ensures nanosecond-level synchronization across the mesh.
 * Tracks "Offset From Master" and "Path Delay".
 */

export interface ClockState {
    unitId: string;
    ptpState: 'MASTER' | 'SLAVE' | 'PASSIVE' | 'FAULTY';
    offsetFromMasterNs: number; // Nanoseconds
    meanPathDelayNs: number;
    grandmasterId: string;
    syncStatus: 'LOCKED' | 'DRIFTING' | 'FREERUN';
}

export class PrecisionClockSync {
    private static readonly MAX_DRIFT_NS = 50;

    /**
     * PROCESS PTP TELEMETRY
     * Ingests hardware timestamp data from network cards (NICs).
     */
    public static monitorClock(
        unitId: string,
        offsetNs: number,
        pathDelayNs: number,
        currentState: ClockState['ptpState']
    ): ClockState {

        let syncStatus: ClockState['syncStatus'] = 'LOCKED';

        // 1. Drift Check
        if (Math.abs(offsetNs) > this.MAX_DRIFT_NS) {
            syncStatus = 'DRIFTING';
            console.warn(`[PTP] 🕰️ Unit ${unitId} clock drifting! Offset ${offsetNs}ns > ${this.MAX_DRIFT_NS}ns`);
        }

        // 2. Free-run detection (if huge offset or state generic)
        if (Math.abs(offsetNs) > 1000000) { // 1ms
            syncStatus = 'FREERUN'; // Effectively lost sync
        }

        return {
            unitId,
            ptpState: currentState,
            offsetFromMasterNs: offsetNs,
            meanPathDelayNs: pathDelayNs,
            grandmasterId: 'GM_ID_00:11:22:33:44:55',
            syncStatus
        };
    }
}
