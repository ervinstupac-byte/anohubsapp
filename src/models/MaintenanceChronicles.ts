/**
 * MAINTENANCE CHRONICLES SYSTEM
 * Complete asset lifecycle management for field technicians
 */

import { AssetNode, AssetNodeType } from './AssetHierarchy';

// ========================================
// 1. COMPONENT PASSPORT SYSTEM
// ========================================

/**
 * The Component Passport - Identity card for every part
 * 
 * When you swap a bearing, you don't rebuild the fortress - 
 * you just update this passport!
 */
export interface ComponentPassport {
    // Core Identity
    identity: {
        manufacturer: string;
        model: string;
        serialNumber: string;
        partNumber?: string;
        manufactureDate?: string;
        installDate: string;
        warrantyExpiryDate?: string;
    };

    // Critical Specs for Mounters 🔧
    mechanicalSpecs: {
        // Clearances (Zazori) - in millimeters
        clearances?: {
            radial?: number;      // Radial clearance (zazor)
            axial?: number;       // Axial clearance
            bearing?: number;     // Bearing internal clearance
            tolerance?: string;   // ISO tolerance class (e.g., "H7/g6")
        };

        // Bolt Torques (Moment pritezanja) - in Nm
        boltTorques?: {
            mountingBolts?: number;       // Main mounting bolts
            coverBolts?: number;          // Cover plate bolts
            housingBolts?: number;        // Housing bolts
            torqueSequence?: string;      // "Cross-pattern" or "Sequential"
        };

        // Other mechanical data
        weight?: number;                // kg
        dimensions?: {
            length?: number;
            width?: number;
            height?: number;
            diameter?: number;
        };
    };

    // Operational Limits
    operatingLimits: {
        maxTemperature?: number;        // °C
        maxSpeed?: number;              // RPM
        maxLoad?: number;               // kN
        maxPressure?: number;           // bar
        vibrationLimit?: number;        // mm/s
    };

    // Maintenance Schedule
    maintenanceSchedule: {
        nextInspectionDate: string;     // ISO date
        nextServiceDate: string;
        inspectionIntervalDays: number;
        serviceIntervalHours?: number;  // Operating hours
        replacementIntervalYears?: number;
    };

    // Consumables & Lubrication
    consumables?: {
        lubricationType?: 'oil' | 'grease' | 'dry';
        lubricantGrade?: string;        // "ISO VG 68", "SKF LGWA 2"
        lubricantQuantity?: number;     // liters or kg
        refillIntervalHours?: number;
        filterType?: string;
        oilFlowRequirements?: {
            minimumFlowRate: number;
            optimalFlowRate: number;
            maximumFlowRate?: number;
            minimumPressure: number;
            optimalPressure: number;
            maximumPressure?: number;
        };
    };

    // Spare Parts Catalog
    spareParts?: {
        criticalSpares: string[];       // Part numbers of critical spares
        recommendedSpares: string[];
        supplierInfo?: string;
    };
}

/**
 * Example: Thrust Bearing Passport
 */
export const EXAMPLE_THRUST_BEARING_PASSPORT: ComponentPassport = {
    identity: {
        manufacturer: 'SKF',
        model: 'NN3020-AS-K-M-SP',
        serialNumber: 'SKF-TB-2024-00142',
        partNumber: '23020-CC/W33',
        manufactureDate: '2024-01-08',
        installDate: '2024-09-15',
        warrantyExpiryDate: '2026-09-15'
    },

    mechanicalSpecs: {
        clearances: {
            radial: 0.030,        // 30 microns radial clearance
            axial: 0.050,         // 50 microns axial play
            bearing: 0.025,       // Internal bearing clearance C3
            tolerance: 'k6/h7'    // ISO tolerance
        },

        boltTorques: {
            mountingBolts: 450,   // 450 Nm for M24 bolts
            coverBolts: 85,       // 85 Nm for cover
            housingBolts: 220,    // 220 Nm for housing
            torqueSequence: 'Cross-pattern, 3 stages: 50%, 75%, 100%'
        },

        weight: 42.5,           // kg
        dimensions: {
            diameter: 100,        // mm bore
            height: 85            // mm width
        }
    },

    operatingLimits: {
        maxTemperature: 90,     // °C - critical shutdown
        maxSpeed: 650,          // RPM - above rated
        maxLoad: 290,           // kN axial load capacity
        vibrationLimit: 7.1     // mm/s ISO 20816
    },

    maintenanceSchedule: {
        nextInspectionDate: '2025-03-15',
        nextServiceDate: '2025-09-15',
        inspectionIntervalDays: 180,    // Every 6 months
        serviceIntervalHours: 8760,      // Every year of operation
        replacementIntervalYears: 10     // Replace every 10 years
    },

    consumables: {
        lubricationType: 'grease',
        lubricantGrade: 'SKF LGWA 2',
        lubricantQuantity: 0.3,          // kg
        refillIntervalHours: 2000
    },

    spareParts: {
        criticalSpares: ['23020-CC/W33', 'SEAL-KIT-NN3020'],
        recommendedSpares: ['GREASE-LGWA2-1KG', 'LOCKNUT-AN20'],
        supplierInfo: 'SKF Direct +46-31-337-1000'
    }
};

// ========================================
// 2. SERVICE JOURNAL (The Story System)
// ========================================

/**
 * Service Log Entry - A "Story" about what happened to a component
 */
export interface ServiceLogEntry {
    id: string;
    timestamp: string;              // ISO UTC
    componentPath: string;          // "Unit_01/Generator/Bearings/ThrustBearing"

    // Who did what
    performedBy: {
        name: string;
        role: 'MOUNTER' | 'ENGINEER' | 'TECHNICIAN' | 'INSPECTOR';
        company?: string;
        licenseNumber?: string;
    };

    // What happened
    action: ServiceActionType;
    description: string;

    // Technical details
    workDetails?: {
        hoursMeter?: number;          // Operating hours at time of work
        measurements?: Record<string, number>;  // Clearances, torques measured
        partsReplaced?: string[];     // Serial numbers of parts replaced
        consumablesUsed?: Record<string, number>; // "oil": 5.2 liters
        toolsUsed?: string[];
    };

    // Verification
    verified?: {
        verifiedBy: string;
        verificationDate: string;
        approved: boolean;
        notes?: string;
    };

    // Attachments
    attachments?: {
        photos?: string[];            // File paths
        videos?: string[];
        reports?: string[];           // PDF reports
        certificates?: string[];      // Calibration certificates
    };
}

export enum ServiceActionType {
    INSTALLATION = 'INSTALLATION',
    INSPECTION = 'INSPECTION',
    MAINTENANCE = 'MAINTENANCE',
    REPAIR = 'REPAIR',
    REPLACEMENT = 'REPLACEMENT',
    CALIBRATION = 'CALIBRATION',
    CLEANING = 'CLEANING',
    LUBRICATION = 'LUBRICATION',
    ALIGNMENT = 'ALIGNMENT',
    BALANCING = 'BALANCING',
    TESTING = 'TESTING',
    ADJUSTMENT = 'ADJUSTMENT'
}

/**
 * Example: Shaft Seal Tightening Story
 */
export const EXAMPLE_SERVICE_LOG: ServiceLogEntry = {
    id: 'SVC-LOG-2026-001',
    timestamp: '2026-01-21T18:30:00Z',
    componentPath: 'Unit_01/Turbine/Shaft/ShaftSeal',

    performedBy: {
        name: 'Marko Kovač',
        role: 'MOUNTER',
        company: 'ANDRITZ Service d.o.o.',
        licenseNumber: 'MNT-HR-2024-0458'
    },

    action: ServiceActionType.ADJUSTMENT,
    description: 'Tightened shaft seal mounting bolts after detecting minor water seepage. Seal face inspected and found to be in good condition.',

    workDetails: {
        hoursMeter: 12450,
        measurements: {
            'bolt_torque_M16': 120,     // Nm - measured after tightening
            'seal_temperature': 38,      // °C
            'leakage_rate': 0           // ml/min - no leakage after adjustment
        },
        partsReplaced: [],
        consumablesUsed: {},
        toolsUsed: ['Torque wrench 20-200 Nm', 'Feeler gauges', 'Infrared thermometer']
    },

    verified: {
        verifiedBy: 'Ivan Petrović - Senior Engineer',
        verificationDate: '2026-01-21T19:15:00Z',
        approved: true,
        notes: 'Work completed to specification. No leakage detected during 30-minute run test.'
    },

    attachments: {
        photos: [
            '/service-logs/2026/001/seal-before.jpg',
            '/service-logs/2026/001/seal-after.jpg',
            '/service-logs/2026/001/torque-reading.jpg'
        ],
        reports: ['/service-logs/2026/001/seal-inspection-report.pdf']
    }
};

// ========================================
// 3. OPTIONAL MODULE SYSTEM (Power-Ups)
// ========================================

/**
 * Optional modules that "snap on" to machines based on configuration
 */
export interface OptionalModule {
    moduleType: string;
    enabled: boolean;
    applicableWhen: (assetNode: AssetNode) => boolean;  // Condition function
    components?: AssetNode[];  // Sub-components this module adds
}

/**
 * Lubrication Module - Only for machines >5 MW
 */
export const LUBRICATION_MODULE: OptionalModule = {
    moduleType: 'LUBRICATION_SYSTEM',
    enabled: true,
    applicableWhen: (asset: AssetNode) => {
        // Check if rated power > 5 MW
        const powerMW = asset.metadata.specifications?.ratedPowerMW || 0;
        return powerMW > 5;
    },
    components: [
        {
            id: 'LUB_PUMP_01',
            path: 'Unit_01/Generator/LubricationSystem/Pump',
            name: 'Lubrication Pump',
            type: AssetNodeType.SUBCOMPONENT,
            telemetryEnabled: true,
            sensorIds: ['pressure_lube_oil', 'flow_lube_oil'],
            metadata: {
                specifications: {
                    flowRate: 120,        // L/min
                    pressure: 2.5,        // bar
                    pumpType: 'Gear Pump'
                },
                criticality: 'HIGH'
            },
            children: []
        } as AssetNode,
        {
            id: 'LUB_COOLER_01',
            path: 'Unit_01/Generator/LubricationSystem/Cooler',
            name: 'Oil Cooler',
            type: AssetNodeType.SUBCOMPONENT,
            telemetryEnabled: true,
            sensorIds: ['temp_oil_inlet', 'temp_oil_outlet'],
            metadata: {
                specifications: {
                    coolingCapacity: 45,  // kW
                    coolantType: 'Water'
                }
            },
            children: []
        } as AssetNode
    ]
};

/**
 * Cooling System Module - For machines with air-gap cooling
 */
export const COOLING_MODULE: OptionalModule = {
    moduleType: 'COOLING_SYSTEM',
    enabled: true,
    applicableWhen: (asset: AssetNode) => {
        // Check if generator has air cooling specified
        const genNode = asset.children.find(c => c.type === AssetNodeType.GENERATOR);
        return genNode?.metadata.specifications?.coolingMethod === 'Air-cooled';
    },
    components: [
        {
            id: 'COOLING_FAN_01',
            path: 'Unit_01/Generator/CoolingSystem/Fan',
            name: 'Cooling Fan',
            type: AssetNodeType.SUBCOMPONENT,
            telemetryEnabled: true,
            sensorIds: ['rpm_cooling_fan', 'vibration_fan'],
            metadata: {},
            children: []
        } as AssetNode
    ]
};

// ========================================
// 4. ENHANCED ASSET NODE WITH PASSPORT
// ========================================

/**
 * Enhanced AssetNode with full maintenance capabilities
 */
export interface AssetNodeWithPassport extends AssetNode {
    passport: ComponentPassport;
    serviceHistory: ServiceLogEntry[];
    optionalModules?: OptionalModule[];
}

/**
 * Helper: Create a complete asset with passport
 */
export function createAssetWithPassport(
    baseNode: AssetNode,
    passport: ComponentPassport,
    serviceHistory: ServiceLogEntry[] = []
): AssetNodeWithPassport {
    return {
        ...baseNode,
        passport,
        serviceHistory
    };
}

/**
 * Helper: Update passport (when swapping a part)
 */
export function updateComponentPassport(
    asset: AssetNodeWithPassport,
    newPassport: Partial<ComponentPassport>
): AssetNodeWithPassport {
    return {
        ...asset,
        passport: {
            ...asset.passport,
            ...newPassport
        }
    };
}

/**
 * Helper: Add service log entry
 */
export function addServiceLog(
    asset: AssetNodeWithPassport,
    logEntry: ServiceLogEntry
): AssetNodeWithPassport {
    return {
        ...asset,
        serviceHistory: [...asset.serviceHistory, logEntry]
    };
}

/**
 * Example: Thrust Bearing with full passport and history
 */
export function createThrustBearingWithHistory(): AssetNodeWithPassport {
    const thrustBearing: AssetNode = {
        id: 'THRUST_BEARING',
        path: 'Unit_01/Generator/Bearings/ThrustBearing',
        name: 'Thrust Bearing',
        type: AssetNodeType.SUBCOMPONENT,
        parentId: 'BEARINGS_01',
        telemetryEnabled: true,
        sensorIds: ['temp_thrust_bearing', 'axial_displacement'],
        metadata: {
            criticality: 'CRITICAL'
        },
        children: []
    };

    return createAssetWithPassport(
        thrustBearing,
        EXAMPLE_THRUST_BEARING_PASSPORT,
        [
            // Installation log
            {
                id: 'SVC-LOG-2024-001',
                timestamp: '2024-09-15T10:00:00Z',
                componentPath: thrustBearing.path,
                performedBy: { name: 'Stefan Novak', role: 'MOUNTER', company: 'ANDRITZ' },
                action: ServiceActionType.INSTALLATION,
                description: 'Initial installation of thrust bearing during unit commissioning.',
                workDetails: {
                    measurements: {
                        'axial_clearance': 0.050,
                        'radial_clearance': 0.030,
                        'bolt_torque': 450
                    },
                    partsReplaced: ['23020-CC/W33']
                }
            },
            // 6-month inspection
            {
                id: 'SVC-LOG-2025-045',
                timestamp: '2025-03-20T14:30:00Z',
                componentPath: thrustBearing.path,
                performedBy: { name: 'Ana Horvat', role: 'INSPECTOR' },
                action: ServiceActionType.INSPECTION,
                description: 'Routine 6-month inspection. Bearing condition excellent.',
                workDetails: {
                    hoursMeter: 4320,
                    measurements: {
                        'temperature': 58,
                        'vibration': 2.1,
                        'axial_play': 0.051
                    }
                },
                verified: {
                    verifiedBy: 'Chief Inspector Josip Barić',
                    verificationDate: '2025-03-20T16:00:00Z',
                    approved: true
                }
            }
        ]
    );
}

// ========================================
// 5. THE INTEGRITY POLICE
// ========================================

export interface IntegrityReport {
    totalLogs: number;
    verifiedLogs: number;
    unverifiedLogs: number;
    integrityScore: number; // 0-100%
    pendingVerification: ServiceLogEntry[];
}

/**
 * Checks if maintenance stories are verified by a Senior Engineer
 */
export function verifyIntegrity(serviceHistory: ServiceLogEntry[]): IntegrityReport {
    const totalLogs = serviceHistory.length;
    if (totalLogs === 0) {
        return {
            totalLogs: 0,
            verifiedLogs: 0,
            unverifiedLogs: 0,
            integrityScore: 100, // No logs = no missing verification
            pendingVerification: []
        };
    }

    const verifiedLogs = serviceHistory.filter(log => log.verified && log.verified.approved).length;
    const unverifiedLogs = totalLogs - verifiedLogs;
    const integrityScore = (verifiedLogs / totalLogs) * 100;

    // Filter unverified logs for the "Yellow Sticker" list
    const pendingVerification = serviceHistory.filter(log => !log.verified || !log.verified.approved);

    return {
        totalLogs,
        verifiedLogs,
        unverifiedLogs,
        integrityScore,
        pendingVerification
    };
}
