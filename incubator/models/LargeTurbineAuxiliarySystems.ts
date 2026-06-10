/**
 * LARGE TURBINE AUXILIARY SYSTEMS
 * Forced Lubrication & Cooling modules for >5MW Francis turbines
 */

import { AssetNode, AssetNodeType } from './AssetHierarchy';
import { ComponentPassport } from './MaintenanceChronicles';

// ========================================
// EXTENDED TELEMETRY FOR BIG MACHINES
// ========================================

export interface AuxiliarySystemTelemetry {
    // Lubrication system
    oilPressure: number;        // bar (critical!)
    oilTemperature: number;     // °C
    oilFlowRate: number;        // L/min
    oilTankLevel: number;       // %

    // Cooling system
    coolingWaterFlow: number;   // L/min
    coolingWaterInletTemp: number;  // °C
    coolingWaterOutletTemp: number; // °C

    // Pump status
    mainPumpRunning: boolean;
    standbyPumpRunning: boolean;
}

// ========================================
// OIL FOUNTAIN - FORCED LUBRICATION MODULE
// ========================================

/**
 * Creates complete forced lubrication system asset tree
 * For machines >5 MW that need continuous oil circulation
 */
export function createForcedLubricationModule(parentPath: string): AssetNode {
    const lubricationSystem: AssetNode = {
        id: 'LUBRICATION_SYSTEM',
        path: `${parentPath}/LubricationSystem`,
        name: 'Forced Lubrication System',
        type: AssetNodeType.COMPONENT,
        parentId: parentPath.split('/').pop() || '',
        telemetryEnabled: true,
        sensorIds: ['oil_pressure_main', 'oil_temp_tank', 'oil_level'],
        metadata: {
            manufacturer: 'Voith Turbo',
            specifications: {
                systemType: 'Forced Circulation',
                oilType: 'ISO VG 68',
                totalCapacity: 500,  // liters
                operatingPressure: 2.5,  // bar
                flowRate: 120  // L/min
            },
            criticality: 'CRITICAL'
        },
        children: []
    };

    // OIL PUMPS (Main + Standby)
    const oilPumps: AssetNode = {
        id: 'OIL_PUMPS',
        path: `${lubricationSystem.path}/OilPumps`,
        name: 'Oil Pump Assembly',
        type: AssetNodeType.SUBCOMPONENT,
        parentId: 'LUBRICATION_SYSTEM',
        telemetryEnabled: true,
        metadata: {
            criticality: 'CRITICAL'
        },
        children: []
    };

    // Main Pump
    const mainPump: AssetNode = {
        id: 'MAIN_OIL_PUMP',
        path: `${oilPumps.path}/MainPump`,
        name: 'Main Oil Pump',
        type: AssetNodeType.SUBCOMPONENT,
        parentId: 'OIL_PUMPS',
        telemetryEnabled: true,
        sensorIds: ['pump_main_pressure', 'pump_main_current', 'pump_main_vibration'],
        metadata: {
            manufacturer: 'Rexroth',
            serialNumber: 'PUMP-MAIN-2024-001',
            specifications: {
                type: 'Gear Pump',
                flow: 120,  // L/min
                pressure: 3.0,  // bar max
                power: 4.5  // kW
            },
            criticality: 'CRITICAL'
        },
        children: []
    };

    // Standby Pump (auto-starts if main fails)
    const standbyPump: AssetNode = {
        id: 'STANDBY_OIL_PUMP',
        path: `${oilPumps.path}/StandbyPump`,
        name: 'Standby Oil Pump',
        type: AssetNodeType.SUBCOMPONENT,
        parentId: 'OIL_PUMPS',
        telemetryEnabled: true,
        sensorIds: ['pump_standby_pressure', 'pump_standby_current'],
        metadata: {
            manufacturer: 'Rexroth',
            serialNumber: 'PUMP-STBY-2024-002',
            specifications: {
                type: 'Gear Pump',
                flow: 120,
                pressure: 3.0,
                autoStartPressure: 1.5  // bar - triggers if main pressure drops
            },
            criticality: 'HIGH'
        },
        children: []
    };

    oilPumps.children.push(mainPump, standbyPump);

    // OIL TANK
    const oilTank: AssetNode = {
        id: 'OIL_TANK',
        path: `${lubricationSystem.path}/OilTank`,
        name: 'Oil Reservoir Tank',
        type: AssetNodeType.SUBCOMPONENT,
        parentId: 'LUBRICATION_SYSTEM',
        telemetryEnabled: true,
        sensorIds: ['tank_level', 'tank_temperature'],
        metadata: {
            specifications: {
                capacity: 500,  // liters
                material: 'Stainless Steel 304',
                heaterPower: 2.0,  // kW for cold starts
                minLevel: 30  // % alarm threshold
            },
            criticality: 'HIGH'
        },
        children: []
    };

    // OIL FILTERS
    const oilFilters: AssetNode = {
        id: 'OIL_FILTERS',
        path: `${lubricationSystem.path}/OilFilters`,
        name: 'Oil Filter Assembly',
        type: AssetNodeType.SUBCOMPONENT,
        parentId: 'LUBRICATION_SYSTEM',
        telemetryEnabled: true,
        sensorIds: ['filter_diff_pressure'],
        metadata: {
            specifications: {
                filterType: 'Duplex Cartridge',
                micronRating: 25,  // µm
                maxDifferentialPressure: 2.0  // bar
            },
            criticality: 'HIGH'
        },
        children: []
    };

    lubricationSystem.children.push(oilPumps, oilTank, oilFilters);

    return lubricationSystem;
}

// ========================================
// COOLING BREATH - COOLING WATER MODULE
// ========================================

/**
 * Creates cooling water system for bearing temperature control
 */
export function createCoolingWaterModule(parentPath: string): AssetNode {
    const coolingSystem: AssetNode = {
        id: 'COOLING_SYSTEM',
        path: `${parentPath}/CoolingSystem`,
        name: 'Bearing Cooling Water System',
        type: AssetNodeType.COMPONENT,
        parentId: parentPath.split('/').pop() || '',
        telemetryEnabled: true,
        sensorIds: ['cooling_flow', 'cooling_temp_in', 'cooling_temp_out'],
        metadata: {
            specifications: {
                systemType: 'Closed Loop Heat Exchanger',
                coolantType: 'Water + Glycol (10%)',
                designFlow: 80,  // L/min
                inletTempMax: 25,  // °C
                outletTempMax: 45  // °C
            },
            criticality: 'HIGH'
        },
        children: []
    };

    // Heat Exchanger
    const heatExchanger: AssetNode = {
        id: 'HEAT_EXCHANGER',
        path: `${coolingSystem.path}/HeatExchanger`,
        name: 'Plate Heat Exchanger',
        type: AssetNodeType.SUBCOMPONENT,
        parentId: 'COOLING_SYSTEM',
        telemetryEnabled: true,
        metadata: {
            manufacturer: 'Alfa Laval',
            specifications: {
                type: 'Brazed Plate',
                coolingCapacity: 45,  // kW
                plates: 30
            }
        },
        children: []
    };

    // Circulation Pump
    const coolingPump: AssetNode = {
        id: 'COOLING_PUMP',
        path: `${coolingSystem.path}/CirculationPump`,
        name: 'Cooling Water Pump',
        type: AssetNodeType.SUBCOMPONENT,
        parentId: 'COOLING_SYSTEM',
        telemetryEnabled: true,
        sensorIds: ['cooling_pump_flow', 'cooling_pump_pressure'],
        metadata: {
            specifications: {
                flow: 80,  // L/min
                head: 25,  // m
                power: 1.5  // kW
            }
        },
        children: []
    };

    coolingSystem.children.push(heatExchanger, coolingPump);

    return coolingSystem;
}

// ========================================
// BIG BEARING PASSPORT WITH OIL REQUIREMENTS
// ========================================

export const BIG_THRUST_BEARING_PASSPORT: ComponentPassport = {
    identity: {
        manufacturer: 'SKF',
        model: 'NN3052-AS-K-M-SP',  // Larger bearing
        serialNumber: 'SKF-TB-LARGE-2024-001',
        partNumber: '23052-CC/W33',
        installDate: '2024-09-15',
        warrantyExpiryDate: '2029-09-15'
    },

    mechanicalSpecs: {
        clearances: {
            radial: 0.040,      // mm - larger bearing
            axial: 0.070,
            bearing: 0.035,
            tolerance: 'k6/h8'
        },
        boltTorques: {
            mountingBolts: 850,  // Nm - much higher!
            coverBolts: 180,
            housingBolts: 420,
            torqueSequence: 'Star pattern, 4 stages: 25%, 50%, 75%, 100%'
        },
        weight: 185,  // kg (vs 42.5 for small)
        dimensions: {
            diameter: 260,  // mm bore (vs 100 for small)
            height: 170
        }
    },

    operatingLimits: {
        maxTemperature: 85,
        maxSpeed: 500,
        maxLoad: 850,  // kN
        vibrationLimit: 7.1
    },

    maintenanceSchedule: {
        nextInspectionDate: '2025-03-15',
        nextServiceDate: '2025-09-15',
        inspectionIntervalDays: 180,
        serviceIntervalHours: 8760,
        replacementIntervalYears: 15
    },

    // THE CRITICAL ADDITION FOR BIG MACHINES!
    consumables: {
        lubricationType: 'oil',  // Not grease!
        lubricantGrade: 'ISO VG 68 Turbine Oil',
        lubricantQuantity: 500,  // liters in system
        refillIntervalHours: 8760,

        // 🔥 NEW: Oil flow requirements
        oilFlowRequirements: {
            minimumFlowRate: 15,     // L/min per bearing
            optimalFlowRate: 20,      // L/min
            maximumFlowRate: 30,      // L/min
            minimumPressure: 1.5,     // bar - CRITICAL!
            optimalPressure: 2.5,     // bar
            maximumPressure: 3.5      // bar
        }
    },

    spareParts: {
        criticalSpares: ['23052-CC/W33', 'SEAL-KIT-NN3052', 'OIL-PUMP-REXROTH'],
        recommendedSpares: ['OIL-FILTER-CARTRIDGE', 'TEMP-SENSOR-PT100'],
        supplierInfo: 'SKF Direct +46-31-337-1000'
    }
};

// ========================================
// RED ALERT SHIELD - CRITICAL SAFETY LOGIC
// ========================================

export interface SafetyTripCondition {
    parameter: string;
    threshold: number;
    comparison: '<' | '>' | '==';
    severity: 'WARNING' | 'TRIP';
    action: string;
    description: string;
}

export const OIL_PRESSURE_SAFETY_TRIPS: SafetyTripCondition[] = [
    {
        parameter: 'oilPressure',
        threshold: 1.0,
        comparison: '<',
        severity: 'TRIP',
        action: 'EMERGENCY_SHUTDOWN',
        description: '🚨 CRITICAL: Oil pressure below 1.0 bar - BEARING DAMAGE IMMINENT!'
    },
    {
        parameter: 'oilPressure',
        threshold: 1.5,
        comparison: '<',
        severity: 'WARNING',
        action: 'ALARM',
        description: '⚠️ WARNING: Oil pressure below minimum (1.5 bar) - Start standby pump!'
    },
    {
        parameter: 'oilPressure',
        threshold: 3.8,
        comparison: '>',
        severity: 'WARNING',
        action: 'ALARM',
        description: '⚠️ WARNING: Oil pressure too high - Check relief valve'
    }
];

export const COOLING_FLOW_SAFETY_TRIPS: SafetyTripCondition[] = [
    {
        parameter: 'coolingWaterFlow',
        threshold: 40,
        comparison: '<',
        severity: 'WARNING',
        action: 'REDUCE_LOAD',
        description: '⚠️ WARNING: Cooling flow low - Reduce load to 70%'
    },
    {
        parameter: 'coolingWaterOutletTemp',
        threshold: 55,
        comparison: '>',
        severity: 'TRIP',
        action: 'EMERGENCY_SHUTDOWN',
        description: '🚨 CRITICAL: Cooling water outlet too hot - Bearing overheating!'
    }
];

/**
 * THE RED ALERT SHIELD
 * Monitors critical parameters and triggers emergency shutdown
 */
export class SafetyShield {
    private activeAlarms: SafetyTripCondition[] = [];

    /**
     * Check all safety conditions
     * Returns true if turbine must TRIP (emergency shutdown)
     */
    checkSafetyConditions(telemetry: AuxiliarySystemTelemetry): {
        tripRequired: boolean;
        warnings: SafetyTripCondition[];
        trips: SafetyTripCondition[];
        actions: string[];
    } {
        const warnings: SafetyTripCondition[] = [];
        const trips: SafetyTripCondition[] = [];
        const actions: string[] = [];

        // Check oil pressure
        for (const condition of OIL_PRESSURE_SAFETY_TRIPS) {
            if (this.evaluateCondition(telemetry.oilPressure, condition)) {
                if (condition.severity === 'TRIP') {
                    trips.push(condition);
                    actions.push(condition.action);
                } else {
                    warnings.push(condition);
                    actions.push(condition.action);
                }
            }
        }

        // Check cooling
        for (const condition of COOLING_FLOW_SAFETY_TRIPS) {
            const value = condition.parameter === 'coolingWaterFlow'
                ? telemetry.coolingWaterFlow
                : telemetry.coolingWaterOutletTemp;

            if (this.evaluateCondition(value, condition)) {
                if (condition.severity === 'TRIP') {
                    trips.push(condition);
                    actions.push(condition.action);
                } else {
                    warnings.push(condition);
                    actions.push(condition.action);
                }
            }
        }

        return {
            tripRequired: trips.length > 0,
            warnings,
            trips,
            actions: Array.from(new Set(actions))  // Remove duplicates
        };
    }

    private evaluateCondition(value: number, condition: SafetyTripCondition): boolean {
        switch (condition.comparison) {
            case '<': return value < condition.threshold;
            case '>': return value > condition.threshold;
            case '==': return value === condition.threshold;
            default: return false;
        }
    }

    /**
     * Execute emergency shutdown sequence
     */
    executeEmergencyShutdown(reason: SafetyTripCondition): void {
        console.log('🚨🚨🚨 EMERGENCY SHUTDOWN INITIATED 🚨🚨🚨');
        console.log(`Reason: ${reason.description}`);
        console.log('Actions:');
        console.log('  1. Close guide vanes to ZERO (0.5 seconds)');
        console.log('  2. Trip generator circuit breaker');
        console.log('  3. Engage mechanical brake');
        console.log('  4. Sound alarm klaxon');
        console.log('  5. Notify control room');
        console.log('  6. Log event in safety system');
        console.log();
        console.log('⛔ TURBINE STOPPED - DO NOT RESTART WITHOUT INVESTIGATION!');
    }
}
