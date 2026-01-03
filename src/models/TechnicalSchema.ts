import Decimal from 'decimal.js';

export type TurbineType = 'Pelton' | 'Kaplan' | 'Francis';

export interface AssetIdentity {
    id: string;
    name: string;
    location: string;
    type: TurbineType;
}

export interface HydraulicStream {
    head: number;
    flow: number;
    efficiency: number;
    waterHead: Decimal; // High-precision Decimal for IEC 60041
    flowRate: Decimal;  // High-precision Decimal for IEC 60041
    cavitationThreshold: Decimal;
    currentHoopStress?: Decimal; // High-precision for reporting
    baselineOutputMW?: Decimal; // Performance benchmark
}

export interface AcousticMetrics {
    cavitationIntensity: number;
    ultrasonicLeakIndex: number;
    bearingGrindIndex: number;
    acousticBaselineMatch: number;
}

export interface MechanicalStream {
    alignment: number;
    vibration: number;
    vibrationX: number; // Orbit X-axis 
    vibrationY: number; // Orbit Y-axis
    rpm: number; // Rotational speed
    bearingTemp: number;
    radialClearance: number; // Added for ProfessionalReportEngine
    shaftAlignmentLimit?: number; // Added for MechanicalPanel
    boltSpecs: {
        grade: string;
        count: number;
        torque: number;
        diameter?: number; // Added for BoltTorqueCalculator
    };
    bearingType?: string;
    baselineOrbitCenter?: { x: number; y: number }; // For localStorage persistence
    vibrationHistory?: { x: number; y: number }[]; // For centralized engineering math history
    centerPath?: { x: number; y: number }[]; // For thermal drift visualization
    acousticNoiseFloor?: number; // dB - Added for Acoustic-Orbit Fusion
    acousticMetrics?: AcousticMetrics; // NEW: Real-time shadow acoustic data
    particleAnalysis?: any[]; // NEW: Ferography classification history
}

/**
 * Component Health Tracking System
 * Stores health scores and status for individual turbine components
 */
export interface ComponentHealthData {
    score: number;              // 0-100 health score from measurements
    status: 'OPTIMAL' | 'GOOD' | 'WARNING' | 'CRITICAL';
    lastMeasured: string;       // ISO timestamp of last measurement
    lastMeasurementValue?: number;  // Actual measured value
    component: string;          // Component identifier (e.g., 'bearing', 'runnerClearance')
}

export interface ComponentHealthRegistry {
    [assetId: string]: {
        [componentId: string]: ComponentHealthData;
    };
}

export interface TechnicalProjectState {
    identity: AssetIdentity;
    hydraulic: HydraulicStream;
    mechanical: MechanicalStream;
    // Added back to fix VisionAnalysis & LiveMathSync
    site: {
        grossHead: number;
        designFlow: number;
        waterQuality: string;
        temperature: number;
    };
    penstock: {
        diameter: number;
        length: number;
        index?: number;
        material: string;
        wallThickness: number;
        materialModulus: number; // GPa
        materialYieldStrength: number; // MPa
    };
    physics: {
        boltSafetyFactor: number;
        boltLoadKN: number;
        boltCapacityKN: number;
        hoopStressMPa: number;
        staticPressureBar: number;
        surgePressureBar: number;
        waterHammerPressureBar: number;
    };
    governor: GovernorState; // NEW: High-precision PID state
    francis?: FrancisState; // NEW: Francis Hub State
    componentHealth?: ComponentHealthRegistry;
    riskScore: number;
    lastRecalculation: string;
}

export interface EngineeringConstants {
    thermal: { criticalAmbientTemp: number; minClearanceForGrease: number };
    electrical: { nominalGridFrequency: number; gridFrequencyTolerance: number; criticalFrequencyThreshold: number };
    hydraulic: { cavitationFlowThreshold: number; cavitationHeadThreshold: number; targetRunnerClearance: number };
    maintenance: { jackingSafetyFactor: number; efficiencyLossPerHealthPoint: number };
    physics: { gravity: number; waterDensity: number };
}

export const ENGINEERING_CONSTANTS: EngineeringConstants = {
    thermal: { criticalAmbientTemp: 30, minClearanceForGrease: 0.10 },
    electrical: { nominalGridFrequency: 50.0, gridFrequencyTolerance: 0.5, criticalFrequencyThreshold: 98.2 },
    hydraulic: { cavitationFlowThreshold: 42.5, cavitationHeadThreshold: 152.0, targetRunnerClearance: 0.40 },
    maintenance: { jackingSafetyFactor: 1.5, efficiencyLossPerHealthPoint: 0.005 },
    physics: { gravity: 9.81, waterDensity: 1000 }
};

// Backwards compatibility for implicit "EngineeringConstants" used as value
export const EngineeringConstants = ENGINEERING_CONSTANTS;

export type PipeMaterial = 'STEEL' | 'GRP' | 'CONCRETE';

export interface PenstockSpecs {
    diameter: number;
    length: number;
    material: string;
    wallThickness: number;
    materialModulus: number;
    materialYieldStrength: number;
}

export type FrancisModuleStatus = 'green' | 'yellow' | 'red';

import { FrancisSensorData } from './turbine/types';

export interface FrancisState {
    modules: Record<string, FrancisModuleStatus>;
    healthScore: number;
    activeRisks: string[];
    sensors?: Partial<FrancisSensorData>;
}

export interface GovernorState {
    setpoint: Decimal;
    actualValue: Decimal;
    kp: Decimal;
    ki: Decimal;
    kd: Decimal;
    integralError: Decimal;
    previousError: Decimal;
    outputSignal: Decimal;
}

export type ProjectAction =
    | { type: 'UPDATE_HYDRAULIC'; payload: Partial<HydraulicStream> }
    | { type: 'UPDATE_MECHANICAL'; payload: Partial<MechanicalStream> }
    | { type: 'UPDATE_PENSTOCK'; payload: Partial<PenstockSpecs> }
    | { type: 'SET_ASSET'; payload: AssetIdentity }
    | { type: 'UPDATE_COMPONENT_HEALTH'; payload: { assetId: string; componentId: string; healthData: ComponentHealthData } }
    | { type: 'UPDATE_FRANCIS_MODULE'; payload: { moduleId: string; status: FrancisModuleStatus } }
    | { type: 'UPDATE_TELEMETRY_SUCCESS'; payload: TechnicalProjectState }
    | { type: 'UPDATE_VIBRATION_HISTORY'; payload: { x: number; y: number } }
    | { type: 'UPDATE_CENTER_PATH'; payload: { x: number; y: number } }
    | { type: 'UPDATE_ACOUSTIC_DATA'; payload: Partial<AcousticMetrics> }
    | { type: 'UPDATE_PARTICLE_DATA'; payload: any[] }
    | { type: 'UPDATE_GOVERNOR'; payload: Partial<GovernorState> }
    | { type: 'RESET_TO_DEMO' };

/**
 * HARDENING PHASE: IEC 60041 Result Types
 */
export interface PhysicsResult {
    hoopStress: Decimal;
    powerMW: Decimal;
    surgePressure: Decimal;
    eccentricity: Decimal; // e = sqrt(1 - (b^2 / a^2))
    performanceDelta: Decimal; // Delta_Perf = ((Actual - Baseline) / Baseline) * 100
    status: 'NOMINAL' | 'WARNING' | 'CRITICAL';
}

export interface DiagnosisMessage {
    code: string;
    en: string;
    bs: string;
}

export interface DiagnosisReport {
    severity: 'NOMINAL' | 'WARNING' | 'CRITICAL';
    messages: DiagnosisMessage[];
    safetyFactor: Decimal;
}

export const DEFAULT_TECHNICAL_STATE: TechnicalProjectState = {
    identity: {
        id: 'demo-1',
        name: 'HPP Demo',
        location: 'Virtual River',
        type: 'Pelton'
    },
    hydraulic: {
        head: 450,
        flow: 2.5,
        efficiency: 0.92,
        waterHead: new Decimal(450),
        flowRate: new Decimal(2.5),
        cavitationThreshold: new Decimal(0.5)
    },
    mechanical: {
        alignment: 0.02,
        vibration: 2.5,
        vibrationX: 0,
        vibrationY: 0,
        rpm: 500,
        bearingTemp: 45,
        radialClearance: 0.5,
        boltSpecs: {
            grade: '8.8',
            count: 12,
            torque: 450
        },
        baselineOrbitCenter: { x: 0, y: 0 },
        vibrationHistory: [],
        centerPath: []
    },
    site: {
        grossHead: 455,
        designFlow: 3.0,
        waterQuality: 'Clear',
        temperature: 15
    },
    penstock: {
        diameter: 1.5,
        length: 200,
        material: 'STEEL',
        wallThickness: 0.02,
        materialModulus: 210, // GPa
        materialYieldStrength: 250 // MPa
    },
    physics: {
        boltSafetyFactor: 1.5,
        boltLoadKN: 350,
        boltCapacityKN: 550,
        hoopStressMPa: 120,
        staticPressureBar: 45,
        surgePressureBar: 55,
        waterHammerPressureBar: 12.5
    },
    governor: {
        setpoint: new Decimal(50.0),
        actualValue: new Decimal(50.0),
        kp: new Decimal(1.2),
        ki: new Decimal(0.5),
        kd: new Decimal(0.1),
        integralError: new Decimal(0),
        previousError: new Decimal(0),
        outputSignal: new Decimal(0)
    },
    francis: {
        modules: {
            miv: 'green',
            penstock: 'green',
            cooling: 'green',
            drainage: 'green',
            bearings: 'red',
            alignment: 'green',
            lube: 'green',
            brakes: 'green',
            hpu: 'green',
            pid: 'green',
            dc: 'green'
        },
        healthScore: 88,
        activeRisks: ['Seal Leakage', 'PEAK SURGE DETECT'],
        sensors: {
            // Mock Data for Context Engine
            hoopStressMPa: 142.5,
            flowRate: 3.2,
            bearingTemp: 54.1,
            vibration: 0.85,
            activePowerMW: 125.4,
            voltageKV: 11.2,
            transformerOilTemp: 62.1,
            draft_tube_pressure: 0.15,
            guide_vane_opening: 85,
            runner_clearance: 0.8
        }
    },
    riskScore: 0,
    lastRecalculation: new Date().toISOString()
};
