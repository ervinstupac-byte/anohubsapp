/**
 * FRANCIS VERTICAL CONFIGURATION
 * Asset hierarchy for vertical shaft machines (<5 MW)
 */

import { AssetNode, AssetNodeType } from './AssetHierarchy';
import { ComponentPassport } from './MaintenanceChronicles';

// ========================================
// VERTICAL-SPECIFIC TELEMETRY
// ========================================

export interface VerticalTurbineTelemetry {
    // Axial monitoring (CRITICAL for vertical machines)
    axialDisplacement: number;      // mm - how much rotor lifted/dropped
    axialClearance: number;         // mm - current gap

    // Alignment monitoring
    shaftRunout: {
        top: number;                  // mm - deviation at top bearing
        bottom: number;               // mm - deviation at bottom
        total: number;                // mm - total indicated runout (TIR)
    };

    // Thrust bearing (carries entire weight!)
    thrustBearingTemp: number;      // °C - CRITICAL!
    thrustBearingPressure: number;  // MPa - contact pressure

    // Vertical alignment
    verticalityDeviation: number;   // mm/m - plumb line deviation
}

// ========================================
// FRANCIS VERTICAL ASSET TREE
// ========================================

/**
 * Creates Francis Vertical turbine asset hierarchy
 * Key difference: Thrust bearing at TOP carries entire rotating assembly
 */
export function createFrancisVerticalAssetTree(): AssetNode {
    const root: AssetNode = {
        id: 'UNIT_VERT_01',
        path: 'Unit_Vertical_01',
        name: 'Francis Vertical Unit 01',
        type: AssetNodeType.UNIT,
        telemetryEnabled: true,
        sensorIds: [],
        metadata: {
            manufacturer: 'ANDRITZ',
            serialNumber: 'FV-2024-001',
            installDate: '2024-02-15',
            specifications: {
                ratedPowerMW: 3.5,
                ratedHeadM: 95,
                ratedFlowM3S: 10,
                ratedRPM: 750,      // Higher RPM for vertical
                configuration: 'Vertical Shaft',
                shaftLength: 8500   // mm - very long vertical shaft!
            },
            criticality: 'CRITICAL'
        },
        children: []
    };

    // ========================================
    // TURBINE SECTION (Hanging at bottom)
    // ========================================

    const turbine: AssetNode = {
        id: 'TURBINE_VERT_01',
        path: 'Unit_Vertical_01/Turbine',
        name: 'Francis Turbine (Vertical)',
        type: AssetNodeType.TURBINE,
        parentId: 'UNIT_VERT_01',
        telemetryEnabled: true,
        metadata: {
            specifications: {
                runnerDiameterMM: 950,
                runnerWeight: 2800,  // kg - hangs from shaft!
                numberOfBlades: 13
            },
            criticality: 'CRITICAL'
        },
        children: []
    };

    // Runner (hangs at bottom of shaft)
    const runner: AssetNode = {
        id: 'RUNNER_VERT_01',
        path: 'Unit_Vertical_01/Turbine/Runner',
        name: 'Francis Runner (Vertical)',
        type: AssetNodeType.COMPONENT,
        parentId: 'TURBINE_VERT_01',
        telemetryEnabled: false,
        metadata: {
            specifications: {
                material: 'Stainless Steel 13Cr4Ni',
                weight: 2800,  // kg
                mountingMethod: 'Cone fit on vertical shaft'
            },
            criticality: 'CRITICAL'
        },
        children: []
    };

    turbine.children.push(runner);

    // ========================================
    // GENERATOR SECTION (At top, above turbine)
    // ========================================

    const generator: AssetNode = {
        id: 'GENERATOR_VERT_01',
        path: 'Unit_Vertical_01/Generator',
        name: 'Synchronous Generator (Vertical)',
        type: AssetNodeType.GENERATOR,
        parentId: 'UNIT_VERT_01',
        telemetryEnabled: true,
        metadata: {
            manufacturer: 'ABB',
            specifications: {
                ratedPowerMVA: 4.0,
                voltage: '11 kV',
                poles: 8,           // 750 RPM at 50 Hz
                rotorWeight: 4500   // kg - adds to thrust load!
            },
            criticality: 'CRITICAL'
        },
        children: []
    };

    // ========================================
    // THE HEAVY HANGER - THRUST BEARING
    // ========================================

    const bearings: AssetNode = {
        id: 'BEARINGS_VERT_01',
        path: 'Unit_Vertical_01/Generator/Bearings',
        name: 'Bearing Assembly (Vertical)',
        type: AssetNodeType.COMPONENT,
        parentId: 'GENERATOR_VERT_01',
        telemetryEnabled: true,
        metadata: {
            criticality: 'CRITICAL'
        },
        children: []
    };

    // THRUST BEARING - THE STAR OF VERTICAL MACHINES! ⭐
    const thrustBearing: AssetNode = {
        id: 'THRUST_BEARING_VERT',
        path: 'Unit_Vertical_01/Generator/Bearings/ThrustBearing',
        name: 'Thrust Bearing Assembly',
        type: AssetNodeType.SUBCOMPONENT,
        parentId: 'BEARINGS_VERT_01',
        telemetryEnabled: true,
        sensorIds: [
            'thrust_temp_pad_1',
            'thrust_temp_pad_2',
            'thrust_temp_pad_3',
            'thrust_temp_pad_4',
            'axial_displacement',
            'thrust_oil_pressure'
        ],
        metadata: {
            manufacturer: 'Michell Bearings',
            serialNumber: 'MICH-THRUST-2024-001',
            specifications: {
                type: 'Tilting Pad Thrust Bearing',
                numberOfPads: 8,
                bearingDiameter: 850,        // mm
                supportedLoad: 7300,         // kg (runner + rotor + shaft)
                maxLoad: 10000,              // kg  
                padMaterial: 'Babbitt (white metal)',
                lubricationType: 'Flooded oil bath'
            },
            criticality: 'CRITICAL'
        },
        children: []
    };

    // Guide Bearings (stabilize shaft)
    const guideBearingUpper: AssetNode = {
        id: 'GUIDE_BEARING_UPPER_VERT',
        path: 'Unit_Vertical_01/Generator/Bearings/GuideBearing_Upper',
        name: 'Guide Bearing (Upper)',
        type: AssetNodeType.SUBCOMPONENT,
        parentId: 'BEARINGS_VERT_01',
        telemetryEnabled: true,
        sensorIds: ['temp_guide_upper', 'vibration_radial_upper'],
        metadata: {
            specifications: {
                type: 'Cylindrical Roller',
                position: '500mm below thrust bearing'
            },
            criticality: 'HIGH'
        },
        children: []
    };

    const guideBearingLower: AssetNode = {
        id: 'GUIDE_BEARING_LOWER_VERT',
        path: 'Unit_Vertical_01/Generator/Bearings/GuideBearing_Lower',
        name: 'Guide Bearing (Lower)',
        type: AssetNodeType.SUBCOMPONENT,
        parentId: 'BEARINGS_VERT_01',
        telemetryEnabled: true,
        sensorIds: ['temp_guide_lower', 'vibration_radial_lower'],
        metadata: {
            specifications: {
                type: 'Cylindrical Roller',
                position: '4000mm below thrust bearing'
            },
            criticality: 'HIGH'
        },
        children: []
    };

    bearings.children.push(thrustBearing, guideBearingUpper, guideBearingLower);

    // Rotor and Stator
    const rotor: AssetNode = {
        id: 'ROTOR_VERT_01',
        path: 'Unit_Vertical_01/Generator/Rotor',
        name: 'Generator Rotor (Vertical)',
        type: AssetNodeType.COMPONENT,
        parentId: 'GENERATOR_VERT_01',
        telemetryEnabled: true,
        metadata: {
            specifications: {
                weight: 4500,  // kg - thrust bearing carries this!
                poles: 8
            }
        },
        children: []
    };

    generator.children.push(bearings, rotor);

    // ========================================
    // SHAFT (Very long vertical shaft)
    // ========================================

    const shaft: AssetNode = {
        id: 'SHAFT_VERT_01',
        path: 'Unit_Vertical_01/Shaft',
        name: 'Main Vertical Shaft',
        type: AssetNodeType.COMPONENT,
        parentId: 'UNIT_VERT_01',
        telemetryEnabled: true,
        sensorIds: ['shaft_runout_top', 'shaft_runout_mid', 'shaft_runout_bottom'],
        metadata: {
            specifications: {
                diameter: 320,      // mm
                totalLength: 8500,  // mm - 8.5 meters!
                material: 'Forged Steel 42CrMo4',
                weight: 1200        // kg
            },
            criticality: 'CRITICAL'
        },
        children: []
    };

    root.children.push(turbine, generator, shaft);

    return root;
}

// ========================================
// THRUST BEARING PASSPORT
// ========================================

export const VERTICAL_THRUST_BEARING_PASSPORT: ComponentPassport = {
    identity: {
        manufacturer: 'Michell Bearings',
        model: 'MB-850-TP8',
        serialNumber: 'MICH-THRUST-2024-001',
        partNumber: 'MB-850-8PAD-WM',
        installDate: '2024-02-15',
        warrantyExpiryDate: '2029-02-15'
    },

    mechanicalSpecs: {
        clearances: {
            axial: 0.250,       // mm - CRITICAL! Axijalni zazor
            radial: 0,          // N/A for thrust bearing
            tolerance: 'ISO f7'
        },

        boltTorques: {
            mountingBolts: 650,     // Nm - M30 bolts
            housingBolts: 380,
            torqueSequence: 'Star pattern, 3 stages'
        },

        weight: 580,        // kg - heavy!
        dimensions: {
            diameter: 850,    // mm - bearing diameter
            height: 220       // mm - thickness
        }
    },

    operatingLimits: {
        maxTemperature: 75,         // °C - Babbitt limit!
        maxSpeed: 800,              // RPM
        maxLoad: 10000,             // kg (~98 kN)
        vibrationLimit: 4.5         // mm/s axial
    },

    maintenanceSchedule: {
        nextInspectionDate: '2024-08-15',
        nextServiceDate: '2025-02-15',
        inspectionIntervalDays: 180,
        serviceIntervalHours: 8760,
        replacementIntervalYears: 20
    },

    consumables: {
        lubricationType: 'oil',
        lubricantGrade: 'ISO VG 46 Turbine Oil',
        lubricantQuantity: 150,     // liters in bearing housing
        refillIntervalHours: 8760,

        // Thrust bearing specific
        oilFlowRequirements: {
            minimumFlowRate: 50,      // L/min - needs lots of oil!
            optimalFlowRate: 75,
            maximumFlowRate: 120,
            minimumPressure: 0.8,     // bar
            optimalPressure: 1.2,
            maximumPressure: 2.0
        }
    } as any,

    spareParts: {
        criticalSpares: [
            'MB-850-PAD-SET (8 thrust pads)',
            'BABBITT-LAYER-KIT',
            'LEVELING-PLATE-SET'
        ],
        recommendedSpares: [
            'OIL-SEAL-850',
            'TEMP-SENSOR-PT100-THRUST'
        ],
        supplierInfo: 'Michell Bearings Ltd. +44-1234-567890'
    }
};

// ========================================
// THRUST FEVER LOGIC
// ========================================

export interface ThrustBearingStatus {
    status: 'HEALTHY' | 'WARNING' | 'ALARM' | 'CRITICAL';
    temperature: number;
    message: string;
    action: string;
    withinLimits: boolean;
}

export class ThrustBearingMonitor {
    /**
     * THE THRUST FEVER CHECK
     * Monitors thrust bearing temperature - CRITICAL for vertical machines!
     */
    checkThrustTemperature(thrustTemp: number): ThrustBearingStatus {
        // Thresholds for Babbitt thrust bearings
        const NORMAL = 50;      // °C - healthy operating temp
        const WARNING = 60;     // °C - getting warm
        const ALARM = 70;       // °C - too hot!
        const CRITICAL = 75;    // °C - Babbitt damage imminent!

        if (thrustTemp >= CRITICAL) {
            return {
                status: 'CRITICAL',
                temperature: thrustTemp,
                message: `🚨 THE GIANT IS MELTING! Thrust bearing at ${thrustTemp}°C - Babbitt failure imminent!`,
                action: 'EMERGENCY SHUTDOWN NOW! Stop turbine immediately to prevent catastrophic bearing failure!',
                withinLimits: false
            };
        }

        if (thrustTemp >= ALARM) {
            return {
                status: 'ALARM',
                temperature: thrustTemp,
                message: `🔴 THE GIANT IS EXHAUSTED! Thrust bearing at ${thrustTemp}°C - Reduce load immediately!`,
                action: 'REDUCE LOAD to 60% within 5 minutes. Check thrust pads immediately at next shutdown!',
                withinLimits: false
            };
        }

        if (thrustTemp >= WARNING) {
            return {
                status: 'WARNING',
                temperature: thrustTemp,
                message: `⚠️ The giant is getting tired... Thrust bearing at ${thrustTemp}°C`,
                action: 'Monitor closely. Check oil flow to thrust bearing. Schedule inspection.',
                withinLimits: true
            };
        }

        return {
            status: 'HEALTHY',
            temperature: thrustTemp,
            message: `✅ The giant is strong! Thrust bearing at ${thrustTemp}°C`,
            action: 'Continue normal operation.',
            withinLimits: true
        };
    }

    /**
     * Check axial displacement (lift-off sensor)
     */
    checkAxialDisplacement(
        displacement: number,
        nominalClearance: number
    ): {
        status: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
        message: string;
        actualPosition: 'CENTERED' | 'LIFTED' | 'DROPPED';
    } {
        // Displacement relative to normal position
        // Positive = rotor lifted up
        // Negative = rotor dropped down

        const tolerance = 0.100;  // mm - acceptable deviation

        if (displacement > nominalClearance + tolerance) {
            return {
                status: 'HIGH',
                message: `⚠️ Rotor lifted ${displacement.toFixed(3)} mm - Water thrust too high!`,
                actualPosition: 'LIFTED'
            };
        }

        if (displacement < -tolerance) {
            return {
                status: 'LOW',
                message: `⚠️ Rotor dropped ${Math.abs(displacement).toFixed(3)} mm - Excessive weight or low water pressure!`,
                actualPosition: 'DROPPED'
            };
        }

        return {
            status: 'NORMAL',
            message: `✅ Axial position normal: ${displacement.toFixed(3)} mm`,
            actualPosition: 'CENTERED'
        };
    }

    /**
     * Check vertical alignment (plumb line)
     */
    checkVerticality(runoutTop: number, runoutBottom: number, shaftLength: number): {
        status: 'ALIGNED' | 'SLIGHT_LEAN' | 'MISALIGNED';
        totalRunout: number;
        deviationPerMeter: number;
        message: string;
    } {
        const totalRunout = Math.sqrt(runoutTop ** 2 + runoutBottom ** 2);
        const deviationPerMeter = (totalRunout / shaftLength) * 1000;  // mm/m

        if (deviationPerMeter > 0.10) {
            return {
                status: 'MISALIGNED',
                totalRunout,
                deviationPerMeter,
                message: `🔴 Shaft leaning ${deviationPerMeter.toFixed(3)} mm/m - Realignment required!`
            };
        }

        if (deviationPerMeter > 0.05) {
            return {
                status: 'SLIGHT_LEAN',
                totalRunout,
                deviationPerMeter,
                message: `⚠️ Slight lean detected: ${deviationPerMeter.toFixed(3)} mm/m - Monitor closely`
            };
        }

        return {
            status: 'ALIGNED',
            totalRunout,
            deviationPerMeter,
            message: `✅ Perfectly plumb: ${deviationPerMeter.toFixed(3)} mm/m`
        };
    }
}
