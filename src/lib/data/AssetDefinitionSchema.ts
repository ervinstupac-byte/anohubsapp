
/**
 * AssetDefinitionSchema.ts
 * NC-13900: Onboarding DNA Extraction
 * Defines the JSON structure for Sovereign Asset Digital Twins
 * Extracted from AssetOnboardingWizard.tsx
 */

export type TurbineType = 'PELTON' | 'KAPLAN' | 'FRANCIS';
export type Orientation = 'VERTICAL' | 'HORIZONTAL';
export type TransmissionType = 'DIRECT' | 'GEARBOX';
export type PenstockMaterial = 'CONCRETE' | 'STEEL' | 'PLASTIC' | 'FRP';
export type SensorMountingType = 'PERMANENT' | 'MAGNETIC' | 'ADHESIVE';
export type SensorAxis = '1-AXIS' | '3-AXIS' | 'RADIAL' | 'AXIAL' | 'TANGENTIAL';

export interface VibrationSensor {
    id: string;
    location: string;
    sensorType: 'ACCELEROMETER' | 'VELOCITY' | 'DISPLACEMENT';
    installed: boolean;
    mountingType: SensorMountingType;
    measurementAxis: SensorAxis;
}

export interface SensorMatrix {
    vibrationSensors: {
        generator: VibrationSensor[];
        turbine: VibrationSensor[];
        gearbox: VibrationSensor[];
    };
    upgradeRecommendations?: string[];
}

export interface MachineConfig {
    orientation: Orientation;
    transmissionType: TransmissionType;
}

export interface SpecializedAdvanced {
    frontRunnerClearanceMM: number;
    backRunnerClearanceMM: number;
    spiralClearanceMM: number;
    labyrinthGaps: {
        upperLabyrinthMM: number;
        lowerLabyrinthMM: number;
        sealType: 'METALLIC' | 'ELASTOMERIC' | 'CARBON';
    };
    draftTubePressure: {
        nominalBar: number;
        minBar: number;
        maxBar: number;
        sensorInstalled: boolean;
    };
    backRunnerPressure: {
        nominalBar: number;
        minBar: number;
        maxBar: number;
        sensorInstalled: boolean;
    };
    axialThrustBalanced: boolean;
    pressureDifferenceBar: number;
}

export interface ShaftJackingSystem {
    enabled: boolean;
    systemPressureBar: number;
    systemFlowLPM: number;
    liftingDistance001MM: number;
    jackingDurationSeconds: number;
    minimumJackingPressureBar: number;
    pressureSensorInstalled: boolean;
    flowSensorInstalled: boolean;
    positionSensorInstalled: boolean;
}

export interface EnvironmentalBaseline {
    penstockType: PenstockMaterial;
    sludgeRemoval: {
        hasSludgeCleaner: boolean;
        erosionRiskScore: number;
    };
    noiseLevel: {
        operatingDB: number;
    };
}

export interface FluidIntelligence {
    healthScore: number;
    oilAnalysis: {
        isoCleanliness: string;
        waterContentPPM: number;
        lastSampleDate: string;
    };
}

/**
 * The Complete Sovereign Asset DNA
 */
export interface AssetDefinition {
    assetId: string;
    assetName: string;
    location: string;
    type: TurbineType;
    commissionDate: number;
    createdBy: string;
    
    machineConfig: MachineConfig;
    sensorMatrix: SensorMatrix;
    specializedAdvanced?: SpecializedAdvanced;
    shaftJacking?: ShaftJackingSystem;
    environmentalBaseline: EnvironmentalBaseline;
    fluidIntelligence: FluidIntelligence;
}

/**
 * Default Schema Template
 */
export const DEFAULT_ASSET_SCHEMA: Partial<AssetDefinition> = {
    type: 'FRANCIS',
    machineConfig: {
        orientation: 'VERTICAL',
        transmissionType: 'DIRECT'
    },
    environmentalBaseline: {
        penstockType: 'STEEL',
        sludgeRemoval: {
            hasSludgeCleaner: false,
            erosionRiskScore: 0
        },
        noiseLevel: {
            operatingDB: 75
        }
    }
};
