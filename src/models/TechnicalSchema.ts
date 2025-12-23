// Technical Data Schema for HPP Design Deep Link
// Defines the granular engineering parameters for the Project Backbone
// PHASE 13: Extended with AI, Financial, and Maintenance data

export type PipeMaterial = 'STEEL' | 'GRP' | 'PEHD' | 'CONCRETE';
export type BoltGrade = '4.6' | '5.6' | '8.8' | '10.9';

export interface SiteConditions {
    grossHead: number; // m
    designFlow: number; // m3/s
    waterQuality: 'CLEAN' | 'SILT' | 'SAND' | 'GLACIAL';
    temperature: number; // deg C
}

export interface PenstockSpecs {
    length: number; // m
    diameter: number; // mm
    wallThickness: number; // mm
    material: PipeMaterial;
    roughness: number; // mm (k)
    youngsModulus: number; // GPa
}

export interface MechanicalDetails {
    // Flange & Connection
    flangeType: 'FLAT' | 'RAISED_FACE' | 'RING_JOINT';
    boltSpecs: {
        count: number;
        diameter: number; // M16, M20 etc -> 16, 20
        grade: BoltGrade;
        torque: number; // Nm
    };
    sealMaterial: 'EPDM' | 'NBR' | 'VITON';

    // Turbine Mechanicals
    bearingType: 'Segmental' | 'Cylindrical' | 'Roller';
    shaftAlignmentLimit: number; // mm (e.g., 0.05)
    radialClearance: number; // mm
}

export interface Tolerances {
    maxSurgePressure: number; // % of static
    minSafetyFactor: number;
    maxVibration: number; // mm/s
}

export interface PhysicsState {
    staticPressureBar: number;
    surgePressureBar: number;
    waterHammerPressureBar: number;
    hoopStressMPa: number;
    boltLoadKN: number;
    boltCapacityKN: number;
    boltSafetyFactor: number;
    criticalAlerts: string[];
}

// Phase 13: Extended State Interfaces
import type { AssetIdentity } from '../types/assetIdentity';
import type { AIFinding } from '../types/aiFinding';
import type { MeasurementHistory, FineEngineeringLog } from '../types/trends';

export interface AIDiagnosisState {
    findings: AIFinding[];
    unverifiedCount: number;
    lastUpdated: string;
}

export interface FinancialSettings {
    electricityPriceEURperMWh: number;
    averageMaintenanceCostEURperHour: number;
    targetAvailability: number;  // 0-100%
}

// Engineering Constants - Single Source of Truth
export interface EngineeringConstants {
    physics: {
        waterDensity: number; // kg/m³
        gravity: number; // m/s²
        atmosphericPressure: number; // Pa
    };
    thermal: {
        criticalAmbientTemp: number; // °C
        minClearanceForGrease: number; // mm
    };
    electrical: {
        nominalGridFrequency: number; // Hz
        gridFrequencyTolerance: number; // ± Hz
        criticalFrequencyThreshold: number; // Hz (e.g., 98.2 triggers critical alarm)
    };
    hydraulic: {
        cavitationFlowThreshold: number; // m³/s
        cavitationHeadThreshold: number; // m
        targetRunnerClearance: number; // mm
    };
    maintenance: {
        efficiencyLossPerHealthPoint: number; // % loss per point below 100
        jackingSafetyFactor: number;
    };
}

export interface MaintenanceHistoryState {
    measurements: Map<string, MeasurementHistory>;
    engineeringLog: FineEngineeringLog;
    lastUpdated: string;
}

export interface TechnicalProjectState {
    site: SiteConditions;
    penstock: PenstockSpecs;
    mechanical: MechanicalDetails;
    tolerances: Tolerances;
    physics: PhysicsState;

    // Phase 13: Unified State
    assetIdentity: AssetIdentity | null;
    aiDiagnosis: AIDiagnosisState;
    financials: FinancialSettings;
    maintenanceHistory: MaintenanceHistoryState;

    // Engineering Constants - Single Source of Truth
    constants: EngineeringConstants;
}

export const DEFAULT_TECHNICAL_STATE: TechnicalProjectState = {
    site: { grossHead: 50, designFlow: 2.5, waterQuality: 'CLEAN', temperature: 15 },
    penstock: { length: 500, diameter: 1200, wallThickness: 10, material: 'STEEL', roughness: 0.045, youngsModulus: 210 },
    mechanical: {
        flangeType: 'RAISED_FACE',
        boltSpecs: { count: 12, diameter: 20, grade: '8.8', torque: 350 },
        sealMaterial: 'NBR',
        bearingType: 'Cylindrical',
        shaftAlignmentLimit: 0.05,
        radialClearance: 0.8
    },
    tolerances: { maxSurgePressure: 30, minSafetyFactor: 1.5, maxVibration: 2.5 },
    physics: {
        staticPressureBar: 0, surgePressureBar: 0, waterHammerPressureBar: 0,
        hoopStressMPa: 0, boltLoadKN: 0, boltCapacityKN: 0, boltSafetyFactor: 0, criticalAlerts: []
    },
    // Phase 13: Default values
    assetIdentity: null,
    aiDiagnosis: {
        findings: [],
        unverifiedCount: 0,
        lastUpdated: new Date().toISOString()
    },
    financials: {
        electricityPriceEURperMWh: 120,
        averageMaintenanceCostEURperHour: 150,
        targetAvailability: 95
    },
    maintenanceHistory: {
        measurements: new Map(),
        engineeringLog: {
            assetId: '',
            measurements: [],
            lastUpdated: new Date().toISOString()
        },
        lastUpdated: new Date().toISOString()
    },

    // Engineering Constants - Reactive Configuration
    constants: {
        physics: {
            waterDensity: 1000, // kg/m³
            gravity: 9.81, // m/s²
            atmosphericPressure: 101325 // Pa
        },
        thermal: {
            criticalAmbientTemp: 30, // °C
            minClearanceForGrease: 0.10 // mm
        },
        electrical: {
            nominalGridFrequency: 50.0, // Hz
            gridFrequencyTolerance: 0.5, // ± Hz
            criticalFrequencyThreshold: 98.2 // Hz - triggers critical alarm
        },
        hydraulic: {
            cavitationFlowThreshold: 42.5, // m³/s
            cavitationHeadThreshold: 152.0, // m
            targetRunnerClearance: 0.40 // mm
        },
        maintenance: {
            efficiencyLossPerHealthPoint: 0.0005, // 0.05% per point
            jackingSafetyFactor: 1.5
        }
    }
};
