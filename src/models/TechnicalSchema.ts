import Decimal from 'decimal.js';

import { AssetIdentity, TurbineType } from '../types/assetIdentity';

export type DemoScenario = 'NORMAL' | 'WATER_HAMMER' | 'BEARING_FAILURE' | 'CAVITATION' | 'GRID_LOSS' | 'INFRASTRUCTURE_STRESS';

export interface DemoState {
    active: boolean;
    scenario: DemoScenario | null;
}

export interface StructuralMetrics {
    wearIndex: number; // 0-100 (Cumulative fatigue)
    remainingLife: number; // 0-100 (%)
    fatigueCycles: number;
    estimatedFailureDate?: string;
    extendedLifeYears?: number;
    drf?: number; // Dynamic Risk Factor (NC-4.2)
    longevityLeak?: string; // Years lost (NC-4.2)
}

export interface HydrologyContext {
    upstreamLevel: number; // m
    downstreamLevel: number; // m
    forecastedInflow: number; // m3/s
    spillageRisk: number; // 0-100 (%)
}

export interface MarketData {
    energyPrice: number; // EUR/MWh
    revenueToday: number; // EUR
    profitabilityIndex: number; // 0-1 (Revenue vs Wear)
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
    insulationResistance?: number; // MOhm - Added for ISO/Megger
    axialPlay?: number; // mm - Added for expert diagnostic
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
        designPerformanceMW: number; // Manufacturer design output for benchmarking
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
        eccentricity: number; // NEW: Persisted eccentricity for reporting
        axialThrustKN?: number; // NEW: NC-4.2 MHE Specialization
        specificWaterConsumption?: number; // m3/kWh - Leakage monitor
        leakageStatus?: 'NOMINAL' | 'DEGRADING' | 'CRITICAL';
        volumetricLoss?: number; // NEW: NC-4.2 Volumetric Efficiency Monitor
    };
    governor: GovernorState; // NEW: High-precision PID state
    specializedState?: SpecializedState; // NEW: Specialized Hub State
    componentHealth?: ComponentHealthRegistry;
    diagnosis?: DiagnosisReport;
    riskScore: number;
    lastRecalculation: string;
    demoMode: DemoState;
    structural: StructuralMetrics;
    hydrology: HydrologyContext;
    market: MarketData;
    manualRules: string[];
    appliedMitigations: string[]; // NEW: NC-4.2 Persistent Mitigations
    financials?: {
        lostRevenueEuro: number;
        maintenanceBufferEuro: number;
        potentialDamageEUR: number;
        maintenanceSavingsEuro?: number; // NEW: NC-4.2 MHE Specialization
        leakageCostYearly?: number; // NEW: NC-4.2 Leakage Monitor
    };
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

export type SpecializedModuleStatus = 'green' | 'yellow' | 'red';

import { FrancisSensorData } from './turbine/types';

export interface SpecializedState {
    modules: Record<string, SpecializedModuleStatus>;
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
    | { type: 'UPDATE_SPECIALIZED_MODULE'; payload: { moduleId: string; status: SpecializedModuleStatus } }
    | { type: 'UPDATE_TELEMETRY_SUCCESS'; payload: TechnicalProjectState }
    | { type: 'UPDATE_VIBRATION_HISTORY'; payload: { x: number; y: number } }
    | { type: 'UPDATE_CENTER_PATH'; payload: { x: number; y: number } }
    | { type: 'UPDATE_ACOUSTIC_DATA'; payload: Partial<AcousticMetrics> }
    | { type: 'UPDATE_PARTICLE_DATA'; payload: any[] }
    | { type: 'UPDATE_GOVERNOR'; payload: Partial<GovernorState> }
    | { type: 'SET_DEMO_MODE'; payload: DemoState }
    | { type: 'START_SCENARIO'; payload: DemoScenario }
    | { type: 'UPDATE_SIMULATION'; payload: Partial<TechnicalProjectState> }
    | { type: 'UPDATE_STRUCTURAL'; payload: Partial<StructuralMetrics> }
    | { type: 'UPDATE_HYDROLOGY'; payload: Partial<HydrologyContext> }
    | { type: 'UPDATE_MARKET'; payload: Partial<MarketData> }
    | { type: 'ADD_MANUAL_RULE'; payload: string }
    | { type: 'APPLY_MITIGATION'; payload: string }
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
    axialThrustKN?: Decimal; // NEW: NC-4.2 MHE Specialization
    specificWaterConsumption: Decimal;
    performanceGap: Decimal; // (Actual / Design) * 100
    status: 'NOMINAL' | 'WARNING' | 'CRITICAL';
    volumetricLoss?: Decimal; // NEW: NC-4.2 Volumetric Efficiency Monitor
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
        assetId: 'demo-1',
        assetName: 'HPP Demo',
        turbineType: 'PELTON',
        manufacturer: 'Generic',
        commissioningYear: 2024,
        totalOperatingHours: 12500,
        hoursSinceLastOverhaul: 4200,
        startStopCount: 156,
        location: 'Demo Site',
        machineConfig: {
            orientation: 'HORIZONTAL',
            transmissionType: 'DIRECT',
            ratedPowerMW: 10,
            ratedSpeedRPM: 500,
            ratedHeadM: 100,
            ratedFlowM3S: 12,
            runnerDiameterMM: 1500,
            numberOfBlades: 15
        },
        sensorMatrix: {
            vibrationSensors: { generator: [], turbine: [] },
            temperatureSensors: { bearings: [], oilSystem: [], powerhouse: [] },
            pressureSensors: [],
            upgradeRecommendations: []
        },
        fluidIntelligence: {
            oilSystem: {
                oilType: 'ISO VG 46',
                oilCapacityLiters: 200,
                currentHours: 0,
                changeIntervalHours: 4000,
                lastChangeDate: '',
                nextChangeDue: '',
                waterContentPPM: 150,
                tan: 0.12,
                viscosityCSt: 46
            },
            filterSystem: { filterType: '10 Micron', installDate: '', deltaPBar: 0, deltaPAlarmBar: 1.5, filterClogged: false },
            temperatureCorrelation: { powerhouseAmbientC: 25, bearingTempsC: [], excessiveHeatDetected: false },
            healthScore: 100
        },
        environmentalBaseline: {
            noiseLevel: { operatingDB: 75, locations: { powerhouse: 70, turbinePit: 85, controlRoom: 60 }, regulatoryLimitDB: 85, complianceStatus: 'COMPLIANT' },
            ambientTemperature: 22.5,
            relativeHumidity: 45,
            penstockType: 'STEEL',
            penstockDiameterMM: 1200,
            penstockLengthM: 50,
            penstockThicknessMM: 12,
            sludgeRemoval: { hasSludgeCleaner: false, erosionRiskScore: 0 },
            waterQuality: { sedimentContentMGL: 10, abrasivityIndex: 'LOW', phLevel: 7.2 }
        },
        operationalMapping: {
            operatingPoints: [],
            currentPoint: null,
            hillChart: { dataPoints: 0, coveragePercent: 0, lastUpdated: '' },
            bestEfficiencyPoint: null
        },
        createdAt: new Date().toISOString(),
        createdBy: 'SYSTEM',
        lastUpdatedAt: new Date().toISOString(),
        version: '1.0'
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
        insulationResistance: 850,
        axialPlay: 0.15,
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
        temperature: 15,
        designPerformanceMW: 5.0
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
        waterHammerPressureBar: 12.5,
        eccentricity: 0.25,
        axialThrustKN: 0
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
    specializedState: {
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
    lastRecalculation: new Date().toISOString(),
    demoMode: {
        active: false,
        scenario: null
    },
    structural: {
        wearIndex: 5,
        remainingLife: 95,
        fatigueCycles: 1240,
        estimatedFailureDate: '2045-12-31',
        extendedLifeYears: 0
    },
    hydrology: {
        upstreamLevel: 455.2,
        downstreamLevel: 102.1,
        forecastedInflow: 12.5,
        spillageRisk: 0
    },
    market: {
        energyPrice: 85.0,
        revenueToday: 0,
        profitabilityIndex: 0.95
    },
    manualRules: [],
    appliedMitigations: [],
    financials: {
        lostRevenueEuro: 0,
        maintenanceBufferEuro: 150000,
        potentialDamageEUR: 0,
        maintenanceSavingsEuro: 0
    }
};
