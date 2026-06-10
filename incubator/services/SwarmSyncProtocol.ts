/**
 * SwarmSyncProtocol.ts
 * 
 * Solar Inverter Swarm Synchronization
 * Broadcasts frequency reference for third-party inverters
 * Coordinated grid-following during Island Mode
 */

export interface SolarInverter {
    inverterId: string;
    capacityKW: number;
    currentOutput: number; // kW
    frequency: number; // Hz
    synchronized: boolean;
}

export class SwarmSyncProtocol {
    private static inverters: Map<string, SolarInverter> = new Map();
    private static masterFrequency = 50.0; // Hz

    public static registerInverter(inverter: SolarInverter): void {
        this.inverters.set(inverter.inverterId, inverter);
        console.log(`[Swarm] Inverter registered: ${inverter.inverterId} (${inverter.capacityKW} kW)`);
    }

    public static broadcastSyncSignal(masterFreq: number): void {
        this.masterFrequency = masterFreq;

        for (const inverter of this.inverters.values()) {
            const deviation = Math.abs(inverter.frequency - masterFreq);

            if (deviation < 0.05) {
                inverter.synchronized = true;
            } else {
                console.log(`[Swarm] Syncing ${inverter.inverterId}: ${inverter.frequency.toFixed(3)} → ${masterFreq.toFixed(3)} Hz`);
                inverter.frequency = masterFreq;
                inverter.synchronized = true;
            }
        }

        const syncCount = Array.from(this.inverters.values()).filter(i => i.synchronized).length;
        console.log(`[Swarm] ✅ ${syncCount}/${this.inverters.size} inverters synchronized`);
    }

    public static getSwarmStatus(): {
        totalInverters: number;
        synchronized: number;
        totalCapacity: number; // MW
    } {
        const all = Array.from(this.inverters.values());

        return {
            totalInverters: all.length,
            synchronized: all.filter(i => i.synchronized).length,
            totalCapacity: all.reduce((sum, i) => sum + i.capacityKW, 0) / 1000
        };
    }
}
