/**
 * GLOBAL SITE HIERARCHY
 * Complete hydropower station asset structure
 */

import { AssetNodeType } from './AssetHierarchy';

// ========================================
// EXPANDED ASSET NODE TYPES
// ========================================

export enum GlobalAssetNodeType {
    // Original types
    SITE = 'site',
    POWERHOUSE = 'powerhouse',
    UNIT = 'unit',
    TURBINE = 'turbine',
    GENERATOR = 'generator',
    COMPONENT = 'component',
    SUBCOMPONENT = 'subcomponent',

    // NEW: Civil structures
    CIVIL_STRUCTURE = 'civil_structure',
    INTAKE = 'intake',
    PENSTOCK = 'penstock',
    CONCRETE_FOUNDATION = 'concrete_foundation',

    // NEW: Electrical systems
    ELECTRICAL_SYSTEM = 'electrical_system',
    TRANSFORMER = 'transformer',
    CUBICLE = 'cubicle',
    SWITCHGEAR = 'switchgear',

    // NEW: Control systems
    CONTROL_SYSTEM = 'control_system',
    SCADA = 'scada',
    PLC = 'plc'
}

// ========================================
// LIFECYCLE TRACKING
// ========================================

export interface AssetLifecycle {
    installDate: string;              // ISO date
    commissioningDate: string;
    expectedLifeYears: number;        // Design life
    actualAge: number;                // Calculated from install date
    remainingLife: number;            // Expected - actual
    healthIndex: number;              // 0-100% (degradation factor)
    replacementDue: string;           // Projected replacement date

    // Degradation tracking
    degradationRate: number;          // % per year
    acceleratedAgingFactors?: string[]; // "High sediment", "Frequent starts", etc.
}

// ========================================
// GLOBAL SITE STRUCTURE
// ========================================

export interface GlobalSiteNode {
    // Core identification
    id: string;
    path: string;
    name: string;
    type: GlobalAssetNodeType;
    parentId?: string;

    // Hierarchy
    children: GlobalSiteNode[];

    // Metadata
    metadata: {
        manufacturer?: string;
        serialNumber?: string;
        specifications?: Record<string, any>;
        criticality?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    };

    // NEW: Lifecycle tracking
    lifecycle: AssetLifecycle;

    // Telemetry
    telemetryEnabled: boolean;
    sensorIds?: string[];

    // NEW: Cross-references (links between systems)
    linkedAssets?: {
        type: 'AFFECTS' | 'MONITORS' | 'CONTROLS' | 'POWERS';
        targetPath: string;
        relationship: string;
    }[];
}

// ========================================
// SITE ROOT STRUCTURE
// ========================================

/**
 * THE NEW WORLD STRUCTURE
 * 
 * Site_Hydro_Station
 * ├── Civil_Infrastructure
 * │   ├── Intake
 * │   ├── Penstock
 * │   └── Powerhouse
 * │       └── Concrete_Foundation
 * ├── Electrical_System
 * │   ├── Main_Transformer
 * │   └── Cubicles
 * │       ├── Excitation_Cubicle
 * │       ├── Protection_Cubicle
 * │       └── Synchronization_Cubicle
 * ├── Control_System
 * │   ├── SCADA
 * │   └── Unit_Controllers (PLCs)
 * └── Generation_Units
 *     ├── Unit_01 (Horizontal Francis)
 *     └── Unit_02 (Vertical Francis)
 */

export const GLOBAL_SITE_SCHEMA: GlobalSiteNode = {
    id: 'SITE_001',
    path: 'Site_Hydro_Station',
    name: 'Hydropower Station Rijeka',
    type: GlobalAssetNodeType.SITE,
    telemetryEnabled: true,

    lifecycle: {
        installDate: '2024-01-15',
        commissioningDate: '2024-09-01',
        expectedLifeYears: 50,
        actualAge: 0.5,
        remainingLife: 49.5,
        healthIndex: 100,
        replacementDue: '2074-01-15',
        degradationRate: 0.5  // 0.5% per year
    },

    metadata: {
        specifications: {
            totalCapacityMW: 15.5,
            numberOfUnits: 2,
            headMin: 40,
            headMax: 150,
            location: 'Rijeka, Croatia'
        },
        criticality: 'CRITICAL'
    },

    children: [
        // Will be filled with civil, electrical, control, and generation unit nodes
    ]
};

// ========================================
// CIVIL INFRASTRUCTURE
// ========================================

export interface CivilStructureTelemetry {
    // Concrete monitoring
    concreteSettlement: number;       // mm - Settlement (slijeganje)
    concreteStrain: number;           // microstrain
    crackWidth: number;               // mm
    temperature: number;              // °C - concrete temp

    // Intake
    waterLevel?: number;              // m
    trashRackDifferential?: number;   // m - clogging indicator

    // Penstock
    penstockPressure?: number;        // bar
    penstockVibration?: number;       // mm/s
}

export const CIVIL_INFRASTRUCTURE_SCHEMA: GlobalSiteNode = {
    id: 'CIVIL_001',
    path: 'Site_Hydro_Station/Civil_Infrastructure',
    name: 'Civil Infrastructure',
    type: GlobalAssetNodeType.CIVIL_STRUCTURE,
    telemetryEnabled: true,

    lifecycle: {
        installDate: '2023-06-01',
        commissioningDate: '2024-01-15',
        expectedLifeYears: 100,  // Concrete lasts longest!
        actualAge: 2.5,
        remainingLife: 97.5,
        healthIndex: 99,
        replacementDue: '2123-06-01',
        degradationRate: 0.1
    },

    metadata: {
        criticality: 'CRITICAL'
    },

    children: [
        {
            id: 'POWERHOUSE_CONCRETE',
            path: 'Site_Hydro_Station/Civil_Infrastructure/Powerhouse',
            name: 'Powerhouse Foundation',
            type: GlobalAssetNodeType.CONCRETE_FOUNDATION,
            telemetryEnabled: true,
            sensorIds: ['settlement_north', 'settlement_south', 'settlement_east', 'settlement_west'],

            lifecycle: {
                installDate: '2023-08-01',
                commissioningDate: '2024-01-15',
                expectedLifeYears: 100,
                actualAge: 2.3,
                remainingLife: 97.7,
                healthIndex: 99.5,
                replacementDue: '2123-08-01',
                degradationRate: 0.05
            },

            // 🔗 THE CONCRETE INFLUENCE!
            linkedAssets: [
                {
                    type: 'AFFECTS',
                    targetPath: 'Site_Hydro_Station/Generation_Units/Unit_Vertical_01/Generator/Bearings/ThrustBearing',
                    relationship: 'Concrete settlement affects thrust bearing alignment'
                }
            ],

            metadata: {
                specifications: {
                    concreteGrade: 'C40/50',
                    volumeM3: 2500,
                    reinforcementTonnes: 180
                },
                criticality: 'CRITICAL'
            },

            children: []
        }
    ]
};

// ========================================
// ELECTRICAL SYSTEM
// ========================================

export interface ElectricalTelemetry {
    // Generator electrical
    voltage: number;                  // kV
    current: number;                  // A
    activePower: number;              // MW
    reactivePower: number;            // MVAr
    powerFactor: number;              // 0-1
    frequency: number;                // Hz

    // Excitation
    excitationVoltage: number;        // V
    excitationCurrent: number;        // A
    fieldResistance: number;          // ohms

    // Stator & Rotor health indicators
    statorTemp: {
        phase_A: number;
        phase_B: number;
        phase_C: number;
    };
    rotorTemp: number;
    insulationResistance: number;     // Mohms
    partialDischarge: number;         // pC
}

export const ELECTRICAL_SYSTEM_SCHEMA: GlobalSiteNode = {
    id: 'ELEC_001',
    path: 'Site_Hydro_Station/Electrical_System',
    name: 'Electrical System',
    type: GlobalAssetNodeType.ELECTRICAL_SYSTEM,
    telemetryEnabled: true,

    lifecycle: {
        installDate: '2024-03-01',
        commissioningDate: '2024-08-15',
        expectedLifeYears: 30,
        actualAge: 0.8,
        remainingLife: 29.2,
        healthIndex: 100,
        replacementDue: '2054-03-01',
        degradationRate: 1.0
    },

    metadata: {
        criticality: 'CRITICAL'
    },

    children: [
        {
            id: 'EXCITATION_CUBICLE',
            path: 'Site_Hydro_Station/Electrical_System/Cubicles/Excitation',
            name: 'Excitation Cubicle',
            type: GlobalAssetNodeType.CUBICLE,
            telemetryEnabled: true,
            sensorIds: ['excitation_voltage', 'excitation_current', 'field_resistance'],

            lifecycle: {
                installDate: '2024-04-10',
                commissioningDate: '2024-08-15',
                expectedLifeYears: 25,
                actualAge: 0.7,
                remainingLife: 24.3,
                healthIndex: 100,
                replacementDue: '2049-04-10',
                degradationRate: 1.2
            },

            // 🔗 THE ELECTRICAL MIRROR!
            linkedAssets: [
                {
                    type: 'MONITORS',
                    targetPath: 'Site_Hydro_Station/Generation_Units/Unit_01/Generator/Rotor',
                    relationship: 'Excitation data reflects rotor winding health'
                },
                {
                    type: 'CONTROLS',
                    targetPath: 'Site_Hydro_Station/Generation_Units/Unit_01/Generator',
                    relationship: 'Controls generator excitation and voltage regulation'
                }
            ],

            metadata: {
                manufacturer: 'ABB',
                specifications: {
                    type: 'Static Excitation System',
                    maxExcitationVoltage: 250,  // V
                    maxCurrent: 800  // A
                },
                criticality: 'HIGH'
            },

            children: []
        },

        {
            id: 'PROTECTION_CUBICLE',
            path: 'Site_Hydro_Station/Electrical_System/Cubicles/Protection',
            name: 'Protection & Relay Cubicle',
            type: GlobalAssetNodeType.CUBICLE,
            telemetryEnabled: true,
            sensorIds: ['relay_status', 'fault_counter'],

            lifecycle: {
                installDate: '2024-04-12',
                commissioningDate: '2024-08-15',
                expectedLifeYears: 25,
                actualAge: 0.7,
                remainingLife: 24.3,
                healthIndex: 100,
                replacementDue: '2049-04-12',
                degradationRate: 1.2
            },

            linkedAssets: [
                {
                    type: 'MONITORS',
                    targetPath: 'Site_Hydro_Station/Generation_Units/Unit_01/Generator/Stator',
                    relationship: 'Monitors stator currents and detects faults'
                }
            ],

            metadata: {
                specifications: {
                    protectionFunctions: [
                        'Overcurrent (50/51)',
                        'Differential (87G)',
                        'Reverse Power (32)',
                        'Loss of Excitation (40)',
                        'Stator Ground Fault (64G)'
                    ]
                },
                criticality: 'CRITICAL'
            },

            children: []
        }
    ]
};

// ========================================
// ELECTRICAL-MECHANICAL INTEGRATION
// ========================================

/**
 * HOW ELECTRICAL CUBICLES CONNECT TO GENERATOR
 * 
 * Pattern: Bidirectional data flow
 * 
 * EXCITATION CUBICLE → GENERATOR ROTOR
 * - Cubicle provides: excitation voltage, current
 * - Generates derived metrics:
 *   • Field resistance (V/I) - detects shorted turns
 *   • Rotor temperature estimate from I²R losses
 *   • Under/over excitation detection
 * 
 * PROTECTION CUBICLE → GENERATOR STATOR  
 * - Cubicle provides: phase currents, voltages
 * - Generates derived metrics:
 *   • Stator unbalance (asymmetry %)
 *   • Phase temperature correlation
 *   • Insulation health from partial discharge
 */

export interface GeneratorElectricalHealth {
    // Derived from Excitation Cubicle
    rotor: {
        fieldResistance: number;        // Ohms
        fieldResistanceDeviation: number; // % from baseline
        rotorTempEstimate: number;      // °C (from I²R)
        excitationStatus: 'NORMAL' | 'UNDER_EXCITED' | 'OVER_EXCITED';
        shortedTurnsDetected: boolean;
    };

    // Derived from Protection Cubicle
    stator: {
        phaseUnbalance: number;         // % asymmetry
        avgTemperature: number;         // °C
        hottestPhase: 'A' | 'B' | 'C';
        insulationHealth: 'GOOD' | 'FAIR' | 'POOR';
        partialDischargeLevel: number;  // pC
    };

    // Overall assessment
    overallHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
    recommendations: string[];
}

/**
 * Example function showing the electrical mirror
 */
export function calculateGeneratorElectricalHealth(
    electricalTelemetry: ElectricalTelemetry
): GeneratorElectricalHealth {
    // Field resistance check
    const baselineFieldResistance = 0.8;  // Ohms
    const fieldResistanceDeviation =
        ((electricalTelemetry.fieldResistance - baselineFieldResistance) / baselineFieldResistance) * 100;

    const shortedTurns = fieldResistanceDeviation < -10;  // >10% drop = shorted turns

    // Rotor temperature estimate from I²R losses
    const rotorI2R = Math.pow(electricalTelemetry.excitationCurrent, 2) *
        electricalTelemetry.fieldResistance;
    const rotorTempEstimate = 40 + (rotorI2R / 100);  // Simplified

    // Phase unbalance
    const avgCurrent = (electricalTelemetry.current) / 3;  // Simplified - should be per phase
    const phaseUnbalance = 5;  // Calculate from actual phase currents

    // Stator temperature
    const avgStatorTemp = (
        electricalTelemetry.statorTemp.phase_A +
        electricalTelemetry.statorTemp.phase_B +
        electricalTelemetry.statorTemp.phase_C
    ) / 3;

    return {
        rotor: {
            fieldResistance: electricalTelemetry.fieldResistance,
            fieldResistanceDeviation,
            rotorTempEstimate,
            excitationStatus: 'NORMAL',
            shortedTurnsDetected: shortedTurns
        },
        stator: {
            phaseUnbalance,
            avgTemperature: avgStatorTemp,
            hottestPhase: 'A',
            insulationHealth: electricalTelemetry.insulationResistance > 1000 ? 'GOOD' : 'POOR',
            partialDischargeLevel: electricalTelemetry.partialDischarge
        },
        overallHealth: shortedTurns ? 'CRITICAL' : 'HEALTHY',
        recommendations: shortedTurns ? ['Inspect rotor winding for shorted turns immediately!'] : []
    };
}

// ========================================
// CONCRETE → THRUST BEARING LINK
// ========================================

/**
 * THE CONCRETE INFLUENCE
 * 
 * When concrete settles, it affects thrust bearing alignment!
 * 
 * Powerhouse Concrete Foundation
 *   └─ Settlement Sensors (4 corners)
 *       └─ Detects: differential settlement
 *           └─ Triggers: Thrust Bearing Alignment Check
 *               └─ Action: "Verticality check required - concrete moved!"
 */

export interface ConcreteInfluenceAlert {
    settlement: {
        north: number;
        south: number;
        east: number;
        west: number;
        differential: number;  // Max - Min
    };
    affectedAssets: string[];  // Paths to thrust bearings
    alignmentCheckRequired: boolean;
    urgency: 'ROUTINE' | 'SCHEDULED' | 'URGENT';
    message: string;
}

export function checkConcreteInfluence(
    concreteSettlement: { north: number; south: number; east: number; west: number }
): ConcreteInfluenceAlert {
    const settlements = [
        concreteSettlement.north,
        concreteSettlement.south,
        concreteSettlement.east,
        concreteSettlement.west
    ];

    const differential = Math.max(...settlements) - Math.min(...settlements);

    if (differential > 2.0) {
        return {
            settlement: { ...concreteSettlement, differential },
            affectedAssets: ['Unit_Vertical_01/Generator/Bearings/ThrustBearing'],
            alignmentCheckRequired: true,
            urgency: 'URGENT',
            message: `🚨 CRITICAL: Differential settlement ${differential.toFixed(1)} mm! Thrust bearing alignment check REQUIRED!`
        };
    }

    if (differential > 1.0) {
        return {
            settlement: { ...concreteSettlement, differential },
            affectedAssets: ['Unit_Vertical_01/Generator/Bearings/ThrustBearing'],
            alignmentCheckRequired: true,
            urgency: 'SCHEDULED',
            message: `⚠️ Differential settlement ${differential.toFixed(1)} mm. Schedule thrust bearing alignment check.`
        };
    }

    return {
        settlement: { ...concreteSettlement, differential },
        affectedAssets: [],
        alignmentCheckRequired: false,
        urgency: 'ROUTINE',
        message: `✅ Concrete stable: ${differential.toFixed(1)} mm differential (acceptable)`
    };
}
