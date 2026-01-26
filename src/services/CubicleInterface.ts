/**
 * CUBICLE INTERFACE
 * The Data Handshake between Electrical and Mechanical Systems
 * 
 * Defines the communication protocol between electrical cubicles
 * (Excitation, Protection, Control) and the mechanical assets they serve.
 */

import type { AssetNode } from '../models/AssetHierarchy';
import type { ProtectionVoice } from './SCADAHeartbeat';

// ============================================================================
// DATA STRUCTURES
// ============================================================================

export interface ExcitationCubicleData {
    cubicleId: string;
    cubicleName: string;
    generatorId: string; // linked asset

    // Real-time Measurements
    fieldCurrent: number; // A
    fieldVoltage: number; // V
    fieldResistance: number; // Ω (calculated V/I)

    // Reference Values
    ratedFieldCurrent: number; // A
    ratedFieldVoltage: number; // V
    ratedFieldResistance: number; // Ω

    // Deviations
    currentDeviation: number; // % from rated
    voltageDeviation: number; // % from rated
    resistanceDeviation: number; // % from rated

    // Alarm Status
    alarms: ExcitationAlarm[];

    // Last Update
    timestamp: Date;
    quality: 'GOOD' | 'STALE' | 'BAD';
    alarm?: boolean; // Summary alarm flag
}

export interface ExcitationAlarm {
    alarmId: string;
    severity: 'WARNING' | 'ALARM' | 'TRIP';
    parameter: 'FIELD_CURRENT' | 'FIELD_VOLTAGE' | 'FIELD_RESISTANCE';

    // Alarm Details
    currentValue: number;
    threshold: number;
    deviation: number; // %

    // Expert Diagnosis
    diagnosis: string;
    recommendation: string;

    // Timing
    triggeredAt: Date;
    acknowledged: boolean;
}

export interface ProtectionRelayData {
    relayId: string;
    relayName: string;
    protectionType: '87_DIFFERENTIAL' | '51_OVERCURRENT' | '64_GROUND_FAULT' | '32_REVERSE_POWER';

    // Measured Values
    measuredCurrent?: number; // A
    measuredVoltage?: number; // V

    // Trip Status
    tripped: boolean;
    tripReason?: string;
    tripTime?: Date;

    // Settings
    pickupSetting: number;
    timedelay: number; // seconds

    // Status
    healthy: boolean;
    lastTest?: Date;
}

export interface CubicleToAssetLink {
    cubicleId: string;
    assetId: string;
    linkType: 'EXCITATION' | 'PROTECTION' | 'CONTROL';
    dataFlow: 'CUBICLE_TO_ASSET' | 'ASSET_TO_CUBICLE' | 'BIDIRECTIONAL';

    // Mapped Parameters
    mappedParameters: {
        cubicleParameter: string;
        assetParameter: string;
        conversionFactor?: number;
    }[];
}

// ============================================================================
// CUBICLE INTERFACE SERVICE
// ============================================================================

export class CubicleInterface {

    /**
     * FIELD RESISTANCE MONITORING
     * The "Rotor Cramp" Detector
     * 
     * Monitors field resistance and triggers alarm when deviation > 15%
     * This detects shorted turns in the rotor winding BEFORE vibration starts!
     */
    monitorFieldResistance(
        fieldCurrent: number,
        fieldVoltage: number,
        ratedResistance: number,
        generatorId: string
    ): ExcitationCubicleData {
        const timestamp = new Date();

        // Calculate actual field resistance: R = V / I
        const fieldResistance = fieldCurrent > 0 ? fieldVoltage / fieldCurrent : 0;

        // Calculate deviations
        const resistanceDeviation = ratedResistance > 0
            ? ((fieldResistance - ratedResistance) / ratedResistance) * 100
            : 0;

        // Rated values (typical for medium hydro generator)
        const ratedFieldCurrent = 150; // A
        const ratedFieldVoltage = ratedResistance * ratedFieldCurrent; // V

        const currentDeviation = ((fieldCurrent - ratedFieldCurrent) / ratedFieldCurrent) * 100;
        const voltageDeviation = ((fieldVoltage - ratedFieldVoltage) / ratedFieldVoltage) * 100;

        // Generate alarms
        const alarms = this.generateExcitationAlarms(
            fieldResistance,
            ratedResistance,
            resistanceDeviation,
            fieldCurrent,
            fieldVoltage
        );

        return {
            cubicleId: 'EXCIT_01',
            cubicleName: 'Excitation Cubicle',
            generatorId,
            fieldCurrent,
            fieldVoltage,
            fieldResistance,
            ratedFieldCurrent,
            ratedFieldVoltage,
            ratedFieldResistance: ratedResistance,
            currentDeviation,
            voltageDeviation,
            resistanceDeviation,
            alarms,
            timestamp,
            quality: 'GOOD'
        };
    }

    /**
     * Generate excitation alarms based on field resistance deviation
     */
    private generateExcitationAlarms(
        fieldResistance: number,
        ratedResistance: number,
        resistanceDeviation: number,
        fieldCurrent: number,
        fieldVoltage: number
    ): ExcitationAlarm[] {
        const alarms: ExcitationAlarm[] = [];
        const now = new Date();

        // ALARM: Field Resistance Drop > 15% (SHORTED TURNS!)
        if (resistanceDeviation < -15) {
            alarms.push({
                alarmId: 'FIELD_RES_LOW',
                severity: 'ALARM',
                parameter: 'FIELD_RESISTANCE',
                currentValue: fieldResistance,
                threshold: ratedResistance * 0.85, // -15%
                deviation: resistanceDeviation,
                diagnosis: '🔥 ROTOR CRAMP DETECTED! Field resistance dropped by 15%. This indicates SHORTED TURNS in the rotor winding!',
                recommendation: '⚠️ Check for shorted turns BEFORE the giant starts to shake! Inspect rotor winding for insulation breakdown. This can cause severe vibration and bearing damage.',
                triggeredAt: now,
                acknowledged: false
            });
        }

        // ALARM: Field Resistance Increase > 15% (LOOSE CONNECTIONS!)
        if (resistanceDeviation > 15) {
            alarms.push({
                alarmId: 'FIELD_RES_HIGH',
                severity: 'WARNING',
                parameter: 'FIELD_RESISTANCE',
                currentValue: fieldResistance,
                threshold: ratedResistance * 1.15, // +15%
                deviation: resistanceDeviation,
                diagnosis: '⚡ Field resistance increased by 15%. This indicates LOOSE CONNECTIONS or OVERHEATING!',
                recommendation: 'Check brush contact pressure, slip ring condition, and rotor winding temperature. Tighten connections if needed.',
                triggeredAt: now,
                acknowledged: false
            });
        }

        // WARNING: Field Current Low
        if (fieldCurrent < 100) { // Assuming rated is 150A
            alarms.push({
                alarmId: 'FIELD_CURRENT_LOW',
                severity: 'WARNING',
                parameter: 'FIELD_CURRENT',
                currentValue: fieldCurrent,
                threshold: 100,
                deviation: ((fieldCurrent - 150) / 150) * 100,
                diagnosis: 'Field current is low. Generator may be under-excited.',
                recommendation: 'Check excitation system AVR settings and field circuit continuity.',
                triggeredAt: now,
                acknowledged: false
            });
        }

        return alarms;
    }

    /**
     * PROTECTION RELAY INTERFACE
     * Monitors electrical faults and publishes to SCADA
     */
    checkProtectionRelays(relays: ProtectionRelayData[]): {
        activeTrips: ProtectionRelayData[];
        faultCount: number;
        scadaAlerts: string[];
    } {
        const activeTrips = relays.filter(r => r.tripped);
        const faultCount = activeTrips.length;

        const scadaAlerts: string[] = [];

        activeTrips.forEach(relay => {
            let alertMessage = '';

            switch (relay.protectionType) {
                case '87_DIFFERENTIAL':
                    alertMessage = `🚨 DIFFERENTIAL PROTECTION TRIP (87): ${relay.relayName}. INTERNAL FAULT detected! Isolate generator immediately!`;
                    break;
                case '51_OVERCURRENT':
                    alertMessage = `⚡ OVERCURRENT TRIP (51): ${relay.relayName}. Current: ${relay.measuredCurrent}A exceeded ${relay.pickupSetting}A. Check for external short circuit.`;
                    break;
                case '64_GROUND_FAULT':
                    alertMessage = `⚠️ GROUND FAULT TRIP (64): ${relay.relayName}. Insulation breakdown detected. Check stator winding and cable insulation.`;
                    break;
                case '32_REVERSE_POWER':
                    alertMessage = `🔄 REVERSE POWER TRIP (32): ${relay.relayName}. Generator is motoring! Check turbine control and guide vanes.`;
                    break;
            }

            scadaAlerts.push(alertMessage);
        });

        return {
            activeTrips,
            faultCount,
            scadaAlerts
        };
    }

    /**
     * THE DATA HANDSHAKE
     * Link cubicle data to mechanical assets in the asset hierarchy
     */
    linkCubicleToAsset(
        excitationData: ExcitationCubicleData,
        generatorAsset: AssetNode
    ): {
        assetId: string;
        assetName: string;
        electricalHealth: 'HEALTHY' | 'WARNING' | 'ALARM' | 'CRITICAL';
        mechanicalHealth: 'HEALTHY' | 'WARNING' | 'ALARM' | 'CRITICAL';
        combinedHealth: 'HEALTHY' | 'WARNING' | 'ALARM' | 'CRITICAL';
        recommendations: string[];
    } {
        // Determine electrical health from cubicle alarms
        const hasAlarm = excitationData.alarms.some(a => a.severity === 'ALARM' || a.severity === 'TRIP');
        const hasWarning = excitationData.alarms.some(a => a.severity === 'WARNING');

        const electricalHealth = hasAlarm ? 'ALARM' : hasWarning ? 'WARNING' : 'HEALTHY';

        // Get mechanical health from asset (simplified - would come from telemetry)
        const mechanicalHealth = 'HEALTHY' as 'HEALTHY' | 'WARNING' | 'ALARM' | 'CRITICAL'; // placeholder

        // Combined health = worst of the two
        const combinedHealth = electricalHealth === 'ALARM' || mechanicalHealth === 'ALARM' ? 'ALARM' :
            electricalHealth === 'WARNING' || mechanicalHealth === 'WARNING' ? 'WARNING' :
                'HEALTHY';

        // Compile recommendations
        const recommendations = excitationData.alarms.map(a => a.recommendation);

        return {
            assetId: generatorAsset.id,
            assetName: generatorAsset.name,
            electricalHealth,
            mechanicalHealth,
            combinedHealth,
            recommendations
        };
    }

    /**
     * Create a protection relay object
     */
    createProtectionRelay(
        relayId: string,
        relayName: string,
        protectionType: ProtectionRelayData['protectionType'],
        pickupSetting: number,
        tripped: boolean = false
    ): ProtectionRelayData {
        return {
            relayId,
            relayName,
            protectionType,
            pickupSetting,
            timedelay: 0.1, // 100ms
            tripped,
            healthy: !tripped,
            measuredCurrent: 0,
            measuredVoltage: 0
        };
    }
}
