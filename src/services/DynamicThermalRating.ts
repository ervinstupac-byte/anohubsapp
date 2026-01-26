/**
 * DynamicThermalRating.ts
 * 
 * Real-Time Thermal Model of Generator Windings
 * Uses fiber-optic temperature sensors for continuous monitoring
 * Enables "Overdrive Mode" (115% load) when thermal headroom exists
 */

export interface FiberOpticSensor {
    sensorId: string;
    location: string; // 'STATOR_A', 'STATOR_B', 'ROTOR', etc.
    temperature: number; // °C
    timestamp: number;
}

export interface ThermalModel {
    timestamp: number;
    peakTemperature: number; // °C
    avgTemperature: number; // °C
    thermalLimit: number; // °C (Class F: 155°C)
    thermalMargin: number; // °C
    safetyMargin: number; // % (10% default)
    overdriveAllowed: boolean;
    maxSafeLoad: number; // MW
}

export interface OverdriveStatus {
    mode: 'DESIGN' | 'OVERDRIVE';
    currentLoad: number; // MW
    designLoad: number; // MW (100%)
    overdriveLoad: number; // MW (115%)
    loadFactor: number; // % of design
    timeInOverdrive: number; // hours
}

export class DynamicThermalRating {
    private static readonly DESIGN_LOAD = 50; // MW
    private static readonly OVERDRIVE_LOAD = 57.5; // MW (115%)
    private static readonly THERMAL_LIMIT = 155; // °C (Class F insulation)
    private static readonly SAFETY_MARGIN = 0.10; // 10%

    private static fiberSensors: Map<string, FiberOpticSensor> = new Map();
    private static overdriveStatus: OverdriveStatus = {
        mode: 'DESIGN',
        currentLoad: 0,
        designLoad: this.DESIGN_LOAD,
        overdriveLoad: this.OVERDRIVE_LOAD,
        loadFactor: 0,
        timeInOverdrive: 0
    };

    /**
     * Initialize fiber-optic temperature sensors
     */
    public static initializeSensors(): void {
        console.log('[Thermal] Initializing fiber-optic temperature sensors...');

        const locations = [
            'STATOR_WINDING_A1', 'STATOR_WINDING_A2', 'STATOR_WINDING_A3',
            'STATOR_WINDING_B1', 'STATOR_WINDING_B2', 'STATOR_WINDING_B3',
            'STATOR_WINDING_C1', 'STATOR_WINDING_C2', 'STATOR_WINDING_C3',
            'ROTOR_WINDING_01', 'ROTOR_WINDING_02',
            'STATOR_CORE', 'BEARING_DE', 'BEARING_NDE'
        ];

        for (const location of locations) {
            this.fiberSensors.set(location, {
                sensorId: `FO-${location}`,
                location,
                temperature: 40 + Math.random() * 10, // 40-50°C ambient
                timestamp: Date.now()
            });
        }

        console.log(`[Thermal] ✅ ${this.fiberSensors.size} fiber-optic sensors initialized`);
        console.log(`  Thermal limit: ${this.THERMAL_LIMIT}°C (Class F)`);
        console.log(`  Safety margin: ${(this.SAFETY_MARGIN * 100).toFixed(0)}%`);
    }

    /**
     * Update thermal model based on current load
     */
    public static updateThermalModel(currentLoad: number): ThermalModel {
        // Simulate thermal response (in production: actual sensor readings)
        const loadFactor = currentLoad / this.DESIGN_LOAD;
        const heatGeneration = Math.pow(loadFactor, 2); // I²R losses

        // Update sensor temperatures
        for (const sensor of this.fiberSensors.values()) {
            // Base temp + load-dependent rise
            const basetemp = 45;
            const loadRise = heatGeneration * 60; // Up to 60°C rise at 115%
            const locationFactor = sensor.location.includes('STATOR') ? 1.0 : 0.8;

            sensor.temperature = basetemp + (loadRise * locationFactor) + (Math.random() - 0.5) * 2;
            sensor.timestamp = Date.now();
        }

        // Calculate thermal parameters
        const temperatures = Array.from(this.fiberSensors.values()).map(s => s.temperature);
        const peakTemperature = Math.max(...temperatures);
        const avgTemperature = temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length;

        const effectiveLimit = this.THERMAL_LIMIT * (1 - this.SAFETY_MARGIN);
        const thermalMargin = effectiveLimit - peakTemperature;
        const overdriveAllowed = thermalMargin > 10; // Need 10°C margin

        // Calculate max safe load
        let maxSafeLoad = this.DESIGN_LOAD;
        if (overdriveAllowed) {
            // Inverse calculation: what load gives us T_limit?
            const availableRise = effectiveLimit - 45; // From base temp
            const maxHeatGen = availableRise / 60;
            const maxLoadFactor = Math.sqrt(maxHeatGen);
            maxSafeLoad = Math.min(this.OVERDRIVE_LOAD, maxLoadFactor * this.DESIGN_LOAD);
        }

        return {
            timestamp: Date.now(),
            peakTemperature,
            avgTemperature,
            thermalLimit: this.THERMAL_LIMIT,
            thermalMargin,
            safetyMargin: this.SAFETY_MARGIN * 100,
            overdriveAllowed,
            maxSafeLoad
        };
    }

    /**
     * Activate overdrive mode
     */
    public static activateOverdrive(targetLoad: number): { success: boolean; message: string } {
        const thermal = this.updateThermalModel(targetLoad);

        if (!thermal.overdriveAllowed) {
            return {
                success: false,
                message: `Thermal margin insufficient: ${thermal.thermalMargin.toFixed(1)}°C (need >10°C)`
            };
        }

        if (targetLoad > thermal.maxSafeLoad) {
            return {
                success: false,
                message: `Load ${targetLoad.toFixed(0)} MW exceeds thermal limit (max: ${thermal.maxSafeLoad.toFixed(0)} MW)`
            };
        }

        this.overdriveStatus.mode = 'OVERDRIVE';
        this.overdriveStatus.currentLoad = targetLoad;
        this.overdriveStatus.loadFactor = (targetLoad / this.DESIGN_LOAD) * 100;

        console.log('\n' + '🔥'.repeat(40));
        console.log('OVERDRIVE MODE ACTIVATED');
        console.log('🔥'.repeat(40));
        console.log(`Target Load: ${targetLoad.toFixed(1)} MW (${this.overdriveStatus.loadFactor.toFixed(0)}%)`);
        console.log(`Peak Temperature: ${thermal.peakTemperature.toFixed(1)}°C`);
        console.log(`Thermal Margin: ${thermal.thermalMargin.toFixed(1)}°C`);
        console.log(`Operating within physics limits ✅`);
        console.log('🔥'.repeat(40) + '\n');

        return {
            success: true,
            message: `Overdrive active: ${targetLoad.toFixed(0)} MW`
        };
    }

    /**
     * Deactivate overdrive mode
     */
    public static deactivateOverdrive(): void {
        if (this.overdriveStatus.mode === 'OVERDRIVE') {
            console.log('[Thermal] Deactivating overdrive mode');
            this.overdriveStatus.mode = 'DESIGN';
            this.overdriveStatus.currentLoad = this.DESIGN_LOAD;
            this.overdriveStatus.loadFactor = 100;
        }
    }

    /**
     * Get overdrive status
     */
    public static getOverdriveStatus(): OverdriveStatus {
        return { ...this.overdriveStatus };
    }

    /**
     * Get hottest sensor
     */
    public static getHottestSensor(): FiberOpticSensor {
        let hottest = Array.from(this.fiberSensors.values())[0];
        for (const sensor of this.fiberSensors.values()) {
            if (sensor.temperature > hottest.temperature) {
                hottest = sensor;
            }
        }
        return hottest;
    }
}

// Initialize
// DynamicThermalRating.initializeSensors(); // DISABLED: Call manually to avoid blocking startup
