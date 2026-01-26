/**
 * ResonanceHarvesterManager.ts
 * 
 * Piezoelectric Energy Recovery from Mechanical Vibrations
 * Converts structural stress into electrical energy
 * Maps recovered energy against bearing RUL for optimization
 */

export interface PiezoSensor {
    sensorId: string;
    location: string;
    voltage: number; // mV
    power: number; // mW
    frequency: number; // Hz
    cumulativeEnergy: number; // Wh
}

export interface EnergyRecovery {
    timestamp: number;
    totalPowerRecovered: number; // W
    annualRecovery: number; // kWh/year
    monetaryValue: number; // EUR/year
    bearingRULImpact: number; // hours gained (vibration reduction)
}

export class ResonanceHarvesterManager {
    private static piezoSensors: Map<string, PiezoSensor> = new Map();
    private static readonly ENERGY_PRICE = 70; // EUR/MWh

    public static initialize(): void {
        console.log('[Resonance] Initializing piezoelectric harvesters...');

        // Install on high-vibration points
        const locations = [
            'BEARING_UPPER', 'BEARING_LOWER', 'BEARING_THRUST',
            'STATOR_FRAME_1', 'STATOR_FRAME_2', 'STATOR_FRAME_3',
            'PENSTOCK_COUPLING', 'DRAFT_TUBE_WALL'
        ];

        for (const location of locations) {
            this.piezoSensors.set(location, {
                sensorId: `PIEZO-${location}`,
                location,
                voltage: 0,
                power: 0,
                frequency: 0,
                cumulativeEnergy: 0
            });
        }

        console.log(`[Resonance] ✅ ${this.piezoSensors.size} piezo harvesters installed`);
    }

    public static harvestVibrationEnergy(
        vibrationLevel: number, // mm/s RMS
        operatingLoad: number // MW
    ): EnergyRecovery {
        const baseFrequency = 50; // Hz (grid frequency)

        // Update sensors based on vibration
        for (const sensor of this.piezoSensors.values()) {
            const locationFactor = sensor.location.includes('BEARING') ? 1.5 : 1.0;
            sensor.voltage = vibrationLevel * 12 * locationFactor; // mV
            sensor.frequency = baseFrequency + Math.random() * 10;
            sensor.power = Math.pow(sensor.voltage / 1000, 2) / 50; // P = V²/R (50Ω load)
            sensor.cumulativeEnergy += sensor.power / 1000; // Wh
        }

        const totalPowerRecovered = Array.from(this.piezoSensors.values())
            .reduce((sum, s) => sum + s.power, 0);

        const hoursPerYear = 8760;
        const annualRecovery = (totalPowerRecovered / 1000) * hoursPerYear; // kWh/year
        const monetaryValue = annualRecovery * (this.ENERGY_PRICE / 1000); // EUR/year

        // RUL impact: vibration damping extends bearing life
        const dampingFactor = Math.min(0.05, totalPowerRecovered / 10000);
        const bearingRULImpact = dampingFactor * 8760; // hours per year

        const recovery: EnergyRecovery = {
            timestamp: Date.now(),
            totalPowerRecovered,
            annualRecovery,
            monetaryValue,
            bearingRULImpact
        };

        if (totalPowerRecovered > 100) {
            console.log(`[Resonance] Harvesting ${totalPowerRecovered.toFixed(0)}W from vibrations`);
            console.log(`  Annual value: €${monetaryValue.toFixed(0)}`);
            console.log(`  Bearing life extension: +${bearingRULImpact.toFixed(0)} hours`);
        }

        return recovery;
    }

    public static getSensorData(): PiezoSensor[] {
        return Array.from(this.piezoSensors.values());
    }
}

// ResonanceHarvesterManager.initialize(); // DISABLED: Call manually to avoid blocking startup
