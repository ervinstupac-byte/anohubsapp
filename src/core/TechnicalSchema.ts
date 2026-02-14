import Decimal from 'decimal.js';

import { AssetIdentity, FluidIntelligence } from '../types/assetIdentity';
import { AssetPassport, InspectionImage, Asset } from '../types';

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
    head: number; // Unit: Meters [m]
    flow: number; // Unit: Cubic Meters per Second [m³/s]
    efficiency: number; // Unit: Percentage [0-100] or Ratio [0-1] (Normalized in Service)
    waterHead: Decimal; // Unit: Meters [m] (High-precision)
    flowRate: Decimal;  // Unit: Cubic Meters per Second [m³/s] (High-precision)
    sigma?: number; // Unit: Dimensionless (Thoma sigma)
    cavitationThreshold: Decimal; // Unit: Sigma [dimensionless]
    currentHoopStress?: Decimal; // Unit: MegaPascals [MPa]
    baselineOutputMW?: Decimal; // Unit: MegaWatts [MW]
    powerKW?: number; // Unit: KiloWatts [kW]
    guideVaneOpening?: number; // Unit: Percentage [%]
}

export interface AcousticMetrics {
    cavitationIntensity: number; // Unit: Decibels [dB] (Relative)
    ultrasonicLeakIndex: number; // Unit: Index [0-10]
    bearingGrindIndex: number; // Unit: Index [0-10]
    acousticBaselineMatch: number; // Unit: Percentage [0-1]
}

export interface MechanicalStream {
    alignment: number; // Unit: Millimeters [mm] (Offset)
    vibration: number; // Unit: Millimeters per Second [mm/s] (RMS)
    vibrationX: number; // Unit: Millimeters per Second [mm/s]
    vibrationY: number; // Unit: Millimeters per Second [mm/s]
    rpm: number; // Unit: Revolutions Per Minute [RPM]
    bearingTemp: number; // Unit: Celsius [°C]
    radialClearance: number; // Unit: Millimeters [mm]
    shaftAlignmentLimit?: number; // Unit: Millimeters [mm]
    boltSpecs: {
        grade: string;
        count: number;
        torque: number; // Unit: Newton-Meters [Nm]
        diameter?: number; // Unit: Millimeters [mm]
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
    powerKW?: number; // convenience field
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
    [assetId: number]: {
        [componentId: string]: ComponentHealthData;
    };
}

export interface TechnicalProjectState {
    identity: AssetIdentity;
    hydraulic: HydraulicStream;
    mechanical: MechanicalStream;
    // Added back to fix VisionAnalysis & LiveMathSync
    site: {
        grossHead: number; // Unit: Meters [m]
        designFlow: number; // Unit: Cubic Meters per Second [m³/s]
        waterQuality: string;
        temperature: number; // Unit: Celsius [°C]
        designPerformanceMW: number; // Unit: MegaWatts [MW]
    };
    fluidIntelligence: FluidIntelligence; // NC-10030: Integrated Lube Logic
    penstock: {
        diameter: number; // Unit: Meters [m]
        length: number; // Unit: Meters [m]
        index?: number;
        material: string;
        wallThickness: number; // Unit: Meters [m]
        materialModulus: number; // Unit: GigaPascals [GPa]
        materialYieldStrength: number; // Unit: MegaPascals [MPa]
    };
    physics: {
        boltSafetyFactor: number; // Unit: Dimensionless [Ratio]
        boltLoadKN: number; // Unit: KiloNewtons [kN]
        boltCapacityKN: number; // Unit: KiloNewtons [kN]
        hoopStressMPa: number; // Unit: MegaPascals [MPa]
        staticPressureBar: number; // Unit: Bar [bar]
        surgePressureBar: number; // Unit: Bar [bar]
        waterHammerPressureBar: number; // Unit: Bar [bar]
        eccentricity: number; // Unit: Ratio [0-1]
        axialThrustKN?: number; // Unit: KiloNewtons [kN]
        specificWaterConsumption?: number; // Unit: Cubic Meters per KiloWatt-Hour [m³/kWh]
        leakageStatus?: 'NOMINAL' | 'DEGRADING' | 'CRITICAL';
        volumetricLoss?: number; // Unit: Percentage [%]
        netHead?: number; // Unit: Meters [m]
        headLoss?: number; // Unit: Meters [m]
    };
    governor: GovernorState; // NEW: High-precision PID state
    specializedState?: SpecializedState; // NEW: Specialized Hub State
    componentHealth?: ComponentHealthRegistry;
    investigatedComponents: string[];
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
        maintenanceSavingsEuro?: number | undefined;
        leakageCostYearly?: number | undefined;
        currentRevenueEURh?: number;
        operationalCostsEURh?: number;
        energyPrice?: number;
        lossCalculation?: any;
    };
    assetPassport?: AssetPassport;
    images?: InspectionImage[];
    selectedAsset?: Asset | null;
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

export interface SpecializedState {
    modules: Record<string, SpecializedModuleStatus>;
    healthScore: number;
    activeRisks: string[];
    sensors?: Record<string, any>;
    acoustic?: {
        fingerprintMatch: number;
        harmonics: Record<number, number>;
    };
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
    | { type: 'UPDATE_COMPONENT_HEALTH'; payload: { assetId: number; componentId: string; healthData: ComponentHealthData } }
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
    hoopStress: Decimal; // Unit: MegaPascals [MPa]
    powerMW: Decimal; // Unit: MegaWatts [MW]
    surgePressure: Decimal; // Unit: Bar [bar]
    eccentricity: Decimal; // Unit: Ratio [0-1] (e = sqrt(1 - (b^2 / a^2)))
    performanceDelta: Decimal; // Unit: Percentage [%] (Delta_Perf = ((Actual - Baseline) / Baseline) * 100)
    axialThrustKN?: Decimal; // Unit: KiloNewtons [kN] (NC-4.2 MHE Specialization)
    specificWaterConsumption: Decimal; // Unit: Cubic Meters per KiloWatt-Hour [m³/kWh]
    performanceGap: Decimal; // Unit: Percentage [%] ((Actual / Design) * 100)
    status: 'NOMINAL' | 'WARNING' | 'CRITICAL';
    volumetricLoss?: Decimal; // Unit: Percentage [%] (NC-4.2 Volumetric Efficiency Monitor)
    boltLoadKN?: Decimal; // Unit: KiloNewtons [kN]
    boltSafetyFactor?: Decimal; // Unit: Dimensionless [Ratio]
    boltCapacityKN?: Decimal; // Unit: KiloNewtons [kN]
    netHead?: Decimal; // Unit: Meters [m]
    headLoss?: Decimal; // Unit: Meters [m]
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
    metrics?: {
        extendedLifeYears?: number;
        [key: string]: any;
    };
}

export const DEFAULT_TECHNICAL_STATE: TechnicalProjectState = {
    identity: {
        assetId: 1,
        assetName: 'HPP Demo',
        turbineType: 'PELTON',
        manufacturer: 'Generic',
        commissioningYear: 2024,
        totalOperatingHours: 12500,
        hoursSinceLastOverhaul: 4200,
        startStopCount: 156,
        lastMajorOverhaul: '2023-01-15',
        lastAlignmentDate: '2025-10-01',
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
                viscosityCSt: 46,
                oilPressureBar: 2.5, // NC-10030: Dynamic Oil Pressure
                oilTemperatureC: 45, // NC-10030: Dynamic Oil Temp
                oilLevelPercent: 85  // NC-10030: Dynamic Tank Level
            },
            filterSystem: { 
                filterType: '10 Micron', 
                installDate: '', 
                deltaPBar: 0, 
                deltaPAlarmBar: 1.5, 
                filterClogged: false,
                inletPressureBar: 2.5, // NC-10030
                outletPressureBar: 2.5 // NC-10030
            },
            coolingSystem: { // NC-10030
                coolingWaterInletTempC: 15,
                coolingWaterOutletTempC: 20,
                oilInletTempC: 45,
                oilOutletTempC: 35,
                coolingWaterFlowLmin: 50
            },
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
            viscosityCSt: 46,
            oilPressureBar: 2.5,
            oilTemperatureC: 45,
            oilLevelPercent: 85
        },
        filterSystem: { 
            filterType: '10 Micron', 
            installDate: '', 
            deltaPBar: 0, 
            deltaPAlarmBar: 1.5, 
            filterClogged: false,
            inletPressureBar: 2.5,
            outletPressureBar: 2.5
        },
        coolingSystem: {
            coolingWaterInletTempC: 15,
            coolingWaterOutletTempC: 20,
            oilInletTempC: 45,
            oilOutletTempC: 35,
            coolingWaterFlowLmin: 50
        },
        temperatureCorrelation: { powerhouseAmbientC: 25, bearingTempsC: [], excessiveHeatDetected: false },
        healthScore: 100
    },
    mechanical: {
        alignment: 0.02,
        vibration: 2.5,
        vibrationX: 0.055,
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
    investigatedComponents: [],
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
