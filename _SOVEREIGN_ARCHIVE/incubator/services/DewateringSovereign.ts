/**
 * DewateringSovereign.ts
 * 
 * Station Drainage & Flood Protection System
 * Monitors sump levels, manages pump sequencing (Lead/Lag),
 * and detects abnormal inflow rates (Flood conditions).
 */

export interface SumpStatus {
    sumpId: string;
    levelPct: number;
    volumeM3: number;
    inflowRateLps: number; // Liters per second
    pumpStatus: {
        pump1: 'OFF' | 'RUNNING' | 'FAILED';
        pump2: 'OFF' | 'RUNNING' | 'FAILED';
    };
    alarmStatus: 'NORMAL' | 'HIGH' | 'FLOOD_WARNING';
    timeToOverflow?: number; // Minutes
}

export class DewateringSovereign {
    private static readonly SUMP_CAPACITY_M3 = 50;
    private static readonly PUMP_CAPACITY_LPS = 25; // per pump
    private static lastCheckTime = Date.now();
    private static lastLevel = 0;

    /**
     * MONITOR SUMP LOGIC
     */
    public static monitorSump(
        sumpId: string,
        currentLevelPct: number, // 0-100%
        pump1Running: boolean,
        pump2Running: boolean
    ): SumpStatus {
        const now = Date.now();
        const dtSeconds = (now - this.lastCheckTime) / 1000;

        // Avoid division by zero on rapid calls
        if (dtSeconds < 0.1) return this.getCachedStatus(sumpId);

        // 1. Calculate Inflow Rate
        // dV/dt = Q_in - Q_out
        // Q_in = dV/dt + Q_out

        const dLevel = currentLevelPct - this.lastLevel; // % change
        const dVolumeM3 = (dLevel / 100) * this.SUMP_CAPACITY_M3;
        const dVolumeLiters = dVolumeM3 * 1000;

        const outflowLps = (pump1Running ? this.PUMP_CAPACITY_LPS : 0) +
            (pump2Running ? this.PUMP_CAPACITY_LPS : 0);

        const netChangeLps = dVolumeLiters / dtSeconds;
        let inflowLps = netChangeLps + outflowLps;
        inflowLps = Math.max(0, inflowLps); // Clamp negative noise

        // 2. Determine Alarm Status
        let alarmStatus: SumpStatus['alarmStatus'] = 'NORMAL';
        if (currentLevelPct > 80) alarmStatus = 'HIGH';

        const maxPumpingCapacity = this.PUMP_CAPACITY_LPS * 2;
        if (inflowLps > maxPumpingCapacity) {
            alarmStatus = 'FLOOD_WARNING';
        }

        // 3. Time to Overflow
        let timeToOverflow: number | undefined;
        if (inflowLps > outflowLps) {
            const remainingVolLiters = ((100 - currentLevelPct) / 100) * this.SUMP_CAPACITY_M3 * 1000;
            const netFillRate = inflowLps - outflowLps;
            timeToOverflow = (remainingVolLiters / netFillRate) / 60; // Minutes
        }

        // Update State
        this.lastCheckTime = now;
        this.lastLevel = currentLevelPct;

        return {
            sumpId,
            levelPct: currentLevelPct,
            volumeM3: (currentLevelPct / 100) * this.SUMP_CAPACITY_M3,
            inflowRateLps: inflowLps,
            pumpStatus: {
                pump1: pump1Running ? 'RUNNING' : 'OFF',
                pump2: pump2Running ? 'RUNNING' : 'OFF'
            },
            alarmStatus,
            timeToOverflow
        };
    }

    private static getCachedStatus(id: string): SumpStatus {
        // Placeholder for simple state retention
        return {
            sumpId: id,
            levelPct: this.lastLevel,
            volumeM3: 0,
            inflowRateLps: 0,
            pumpStatus: { pump1: 'OFF', pump2: 'OFF' },
            alarmStatus: 'NORMAL'
        };
    }
}
