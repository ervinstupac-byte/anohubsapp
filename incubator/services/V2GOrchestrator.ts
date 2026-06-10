/**
 * V2GOrchestrator.ts
 * 
 * Vehicle-to-Grid Fleet Orchestrator
 * Aggregates distributed EV capacity for grid stabilization
 * Triggers bidirectional discharge during low grid stability
 */

export interface EVAsset {
    vehicleId: string;
    owner: string;
    batteryCapacity: number; // kWh
    currentSoC: number; // %
    maxDischargeRate: number; // kW
    location: { lat: number; lon: number };
    availableForV2G: boolean;
}

export class V2GOrchestrator {
    private static evFleet: Map<string, EVAsset> = new Map();
    private static readonly STABILITY_THRESHOLD = 0.85;

    public static registerEV(ev: EVAsset): void {
        this.evFleet.set(ev.vehicleId, ev);
        console.log(`[V2G] EV registered: ${ev.vehicleId} (${ev.batteryCapacity} kWh)`);
    }

    public static aggregateCapacity(): {
        totalVehicles: number;
        availableCapacity: number; // MW
        totalEnergy: number; // MWh
    } {
        const available = Array.from(this.evFleet.values()).filter(ev => ev.availableForV2G);

        return {
            totalVehicles: available.length,
            availableCapacity: available.reduce((sum, ev) => sum + ev.maxDischargeRate, 0) / 1000,
            totalEnergy: available.reduce((sum, ev) => sum + (ev.batteryCapacity * ev.currentSoC / 100), 0) / 1000
        };
    }

    public static triggerDischarge(gridStabilityIndex: number): void {
        if (gridStabilityIndex >= this.STABILITY_THRESHOLD) return;

        const capacity = this.aggregateCapacity();
        const dischargeTarget = Math.min(5, capacity.availableCapacity); // Max 5 MW

        console.log(`\n[V2G] 🔋 Grid stability low (${(gridStabilityIndex * 100).toFixed(0)}%)`);
        console.log(`[V2G] Triggering V2G discharge: ${dischargeTarget.toFixed(1)} MW`);
        console.log(`  Fleet: ${capacity.totalVehicles} vehicles`);
        console.log(`  Energy available: ${capacity.totalEnergy.toFixed(1)} MWh`);
    }
}
