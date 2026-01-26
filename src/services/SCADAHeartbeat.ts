/**
 * SCADA HEARTBEAT
 * The Nervous System of the Fortress
 * 
 * Integrates three distinct "voices" into unified station control:
 * - PLC Voice: Real-time process data (temperatures, pressures, flows)
 * - Protection Voice: Electrical fault monitoring
 * - Civil Voice: Infrastructure and environmental data
 */

// ============================================================================
// DATA STRUCTURES
// ============================================================================

export interface PLCVoice {
    timestamp: Date;
    quality: 'GOOD' | 'STALE' | 'BAD';

    // Turbine Process Data
    turbineRPM: number;
    turbinePower: number; // kW
    guideVaneOpening: number; // %

    // Hydraulic Data
    inletPressure: number; // bar
    outletPressure: number; // bar
    flowRate: number; // m³/s

    // Temperature Monitoring
    bearingTemps: {
        guideBearing: number; // °C
        thrustBearing: number; // °C
        generatorBearing: number; // °C
    };

    // Oil System
    oilPressure: number; // bar
    oilTemperature: number; // °C

    // Cooling System
    coolingFlowRate: number; // L/min
    coolingInletTemp: number; // °C
    coolingOutletTemp: number; // °C
}

export interface ProtectionVoice {
    timestamp: Date;
    quality: 'GOOD' | 'STALE' | 'BAD';

    // Generator Protection
    generatorFaults: {
        overcurrent_51: boolean;
        differential_87: boolean;
        groundFault_64: boolean;
        reversepower_32: boolean;
    };

    // Excitation Cubicle
    excitationData: {
        fieldCurrent: number; // A
        fieldVoltage: number; // V
        fieldResistance: number; // Ω (calculated V/I)
        ratedResistance: number; // Ω (design value)
        resistanceDeviation: number; // % from rated
        alarm: boolean; // true if deviation > 15%
        alarmMessage?: string;
    };

    // Transformer Protection
    transformerFaults: {
        overtemperature: boolean;
        bucholzAlarm: boolean;

        differentialTrip: boolean;
    };

    // NEW: Consolidated trip list for Auditor
    activeTrips: string[];
}

export interface CivilVoice {
    timestamp: Date;
    quality: 'GOOD' | 'STALE' | 'BAD';

    // River Monitoring
    riverLevel: number; // m - specific ecological measurement point
    upstreamLevel: number; // m above reference
    downstreamLevel: number; // m above reference
    reservoirLevel: number; // m above reference

    // Trash Rack Monitoring
    trashRackDeltaP: number; // mbar (differential pressure)
    trashRackUpstreamLevel: number; // m
    trashRackDownstreamLevel: number; // m

    // Environmental
    ambientTemperature: number; // °C
    waterTemperature: number; // °C
    sedimentLevel: number; // mg/L

    // Structural Health
    damDeformation: number; // mm
    foundationSettlement: number; // mm
    vibrationLevel: number; // mm/s
}

export interface SCADASnapshot {
    timestamp: Date;
    plcVoice: PLCVoice;
    protectionVoice: ProtectionVoice;
    civilVoice: CivilVoice;
    overallQuality: 'GOOD' | 'DEGRADED' | 'FAILED';
}

// ============================================================================
// SCADA HEARTBEAT SERVICE
// ============================================================================

export class SCADAHeartbeat {

    /**
     * MASTER AGGREGATION FUNCTION
     * Collects data from all three voices and returns unified snapshot
     */
    collectAllVoices(
        plcData: Partial<PLCVoice>,
        protectionData: Partial<ProtectionVoice>,
        civilData: Partial<CivilVoice>
    ): SCADASnapshot {
        const now = new Date();

        // Build PLC Voice
        const plcVoice: PLCVoice = {
            timestamp: now,
            quality: this.assessDataQuality(plcData),
            turbineRPM: plcData.turbineRPM ?? 0,
            turbinePower: plcData.turbinePower ?? 0,
            guideVaneOpening: plcData.guideVaneOpening ?? 0,
            inletPressure: plcData.inletPressure ?? 0,
            outletPressure: plcData.outletPressure ?? 0,
            flowRate: plcData.flowRate ?? 0,
            bearingTemps: plcData.bearingTemps ?? {
                guideBearing: 0,
                thrustBearing: 0,
                generatorBearing: 0
            },
            oilPressure: plcData.oilPressure ?? 0,
            oilTemperature: plcData.oilTemperature ?? 0,
            coolingFlowRate: plcData.coolingFlowRate ?? 0,
            coolingInletTemp: plcData.coolingInletTemp ?? 0,
            coolingOutletTemp: plcData.coolingOutletTemp ?? 0
        };

        // Build Protection Voice
        const protectionVoice: ProtectionVoice = {
            timestamp: now,
            quality: this.assessDataQuality(protectionData),
            generatorFaults: protectionData.generatorFaults ?? {
                overcurrent_51: false,
                differential_87: false,
                groundFault_64: false,
                reversepower_32: false
            },
            excitationData: this.buildExcitationData(protectionData.excitationData),
            transformerFaults: protectionData.transformerFaults ?? {
                overtemperature: false,
                bucholzAlarm: false,
                differentialTrip: false
            },
            activeTrips: this.collectActiveTrips(protectionData)
        };

        // Build Civil Voice
        const civilVoice: CivilVoice = {
            timestamp: now,
            quality: this.assessDataQuality(civilData),
            riverLevel: civilData.riverLevel ?? civilData.downstreamLevel ?? 0, // Default to downstream if explicit river level missing
            upstreamLevel: civilData.upstreamLevel ?? 0,
            downstreamLevel: civilData.downstreamLevel ?? 0,
            reservoirLevel: civilData.reservoirLevel ?? 0,
            trashRackDeltaP: civilData.trashRackDeltaP ?? 0,
            trashRackUpstreamLevel: civilData.trashRackUpstreamLevel ?? 0,
            trashRackDownstreamLevel: civilData.trashRackDownstreamLevel ?? 0,
            ambientTemperature: civilData.ambientTemperature ?? 15,
            waterTemperature: civilData.waterTemperature ?? 10,
            sedimentLevel: civilData.sedimentLevel ?? 0,
            damDeformation: civilData.damDeformation ?? 0,
            foundationSettlement: civilData.foundationSettlement ?? 0,
            vibrationLevel: civilData.vibrationLevel ?? 0
        };

        // Determine overall quality
        const qualities = [plcVoice.quality, protectionVoice.quality, civilVoice.quality];
        const overallQuality = qualities.includes('BAD') ? 'FAILED' :
            qualities.includes('STALE') ? 'DEGRADED' : 'GOOD';

        return {
            timestamp: now,
            plcVoice,
            protectionVoice,
            civilVoice,
            overallQuality
        };
    }

    /**
     * Build excitation data with field resistance calculation and alarm logic
     */
    private buildExcitationData(data?: Partial<ProtectionVoice['excitationData']>): ProtectionVoice['excitationData'] {
        const fieldCurrent = data?.fieldCurrent ?? 0;
        const fieldVoltage = data?.fieldVoltage ?? 0;
        const ratedResistance = data?.ratedResistance ?? 1.0; // Ω

        // Calculate actual field resistance: R = V / I
        const fieldResistance = fieldCurrent > 0 ? fieldVoltage / fieldCurrent : 0;

        // Calculate deviation from rated
        const resistanceDeviation = ratedResistance > 0
            ? ((fieldResistance - ratedResistance) / ratedResistance) * 100
            : 0;

        // Alarm logic: 15% deviation triggers warning
        const alarm = Math.abs(resistanceDeviation) > 15;
        const alarmMessage = alarm
            ? resistanceDeviation < -15
                ? '⚠️ ROTOR CRAMP DETECTED! Field resistance dropped by 15%. Check for shorted turns before vibration starts!'
                : '⚠️ Field resistance increased by 15%. Check for loose connections or overheating!'
            : undefined;

        return {
            fieldCurrent,
            fieldVoltage,
            fieldResistance,
            ratedResistance,
            resistanceDeviation,
            alarm,
            alarmMessage
        };
    }

    /**
     * Assess data quality based on value presence and freshness
     */
    private assessDataQuality(data: any): 'GOOD' | 'STALE' | 'BAD' {
        if (!data || Object.keys(data).length === 0) return 'BAD';

        // Check if timestamp is present and recent (within 5 seconds)
        if (data.timestamp) {
            const age = Date.now() - new Date(data.timestamp).getTime();
            if (age > 5000) return 'STALE';
        }

        return 'GOOD';
    }

    /**
     * Get PLC Voice only
     */
    getPLCVoice(data: Partial<PLCVoice>): PLCVoice {
        return this.collectAllVoices(data, {}, {}).plcVoice;
    }

    /**
     * Get Protection Voice only
     */
    getProtectionVoice(data: Partial<ProtectionVoice>): ProtectionVoice {
        return this.collectAllVoices({}, data, {}).protectionVoice;
    }

    /**
     * Get Civil Voice only
     */
    getCivilVoice(data: Partial<CivilVoice>): CivilVoice {
        return this.collectAllVoices({}, {}, data).civilVoice;
    }

    /**
     * Helper: Collect all active trip names into a single list
     */
    private collectActiveTrips(data: Partial<ProtectionVoice>): string[] {
        const trips: string[] = [];

        if (data.generatorFaults?.overcurrent_51) trips.push('GENERATOR_OVERCURRENT_51');
        if (data.generatorFaults?.differential_87) trips.push('GENERATOR_DIFFERENTIAL_87');
        if (data.generatorFaults?.groundFault_64) trips.push('GENERATOR_GROUND_FAULT_64');
        if (data.generatorFaults?.reversepower_32) trips.push('GENERATOR_REVERSE_POWER_32');

        if (data.transformerFaults?.overtemperature) trips.push('TRANSFORMER_OVERTEMP');
        if (data.transformerFaults?.bucholzAlarm) trips.push('TRANSFORMER_BUCHOLZ');
        if (data.transformerFaults?.differentialTrip) trips.push('TRANSFORMER_DIFFERENTIAL');

        if (data.excitationData?.alarm && (data.excitationData.resistanceDeviation < -15)) {
            trips.push('EXCITATION_ROTOR_CRAMP');
        }

        return trips;
    }
}
