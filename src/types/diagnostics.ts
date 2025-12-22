/**
 * Expert Diagnosis Engine Types
 * Risk assessment and health scoring for turbine assets
 */

export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type HealthZone = 'GREEN' | 'YELLOW' | 'RED';
export type LubricationType = 'OIL' | 'GREASE';
export type FilterTrend = 'STABLE' | 'INCREASING' | 'CRITICAL';

// ==================== RISK ASSESSMENTS ====================

export interface ThermalRisk {
    detected: boolean;
    severity: RiskSeverity;
    description: string;
    descriptionDE: string;
}

export interface AxialThrustRisk {
    detected: boolean;
    frontClearanceMM: number;
    backClearanceMM: number;
    differencePercent: number;
    severity: RiskSeverity;
    recommendation: string;
    recommendationDE: string;
}

export interface SensorCoverageRisk {
    coverage: number;  // 0-100%
    missingLocations: string[];
    severity: RiskSeverity;
    digitalTwinReadiness: number;  // 0-100%
    suggestion: string;
    suggestionDE: string;
}

export interface JackingRisk {
    detected: boolean;
    pressureBar: number;
    rotorWeightTons: number;
    requiredPressureBar: number;
    severity: RiskSeverity;
    alarm: string;
    alarmDE: string;
}

export interface GridRisk {
    detected: boolean;
    frequencyHz: number;
    severity: RiskSeverity;
    message: string;
    messageDE: string;
}

export interface Risk {
    type: 'THERMAL' | 'MECHANICAL' | 'HYDRAULIC' | 'SENSORY' | 'STARTUP';
    severity: RiskSeverity;
    description: string;
    descriptionDE?: string;
}

export interface Suggestion {
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
    descriptionDE?: string;
    estimatedCost?: number;
}

// ==================== HEALTH SCORE ====================

export interface HealthScore {
    overall: number;  // 0-100
    breakdown: {
        thermal: number;
        mechanical: number;
        hydraulic: number;
        sensory: number;
    };
    criticalRisks: Risk[];
    maintenanceSuggestions: Suggestion[];
    optimizedAreas: string[];
}

export interface DiagnosticResults {
    thermalRisk: ThermalRisk;
    axialThrustRisk?: AxialThrustRisk;
    sensorCoverage: SensorCoverageRisk;
    jackingRisk?: JackingRisk;
    gridRisk?: GridRisk;
    financialImpact?: FinancialImpact;
    cavitationRisk?: { severity: RiskSeverity; message: string };
    timestamp: string;
}

// ==================== FINANCIAL IMPACT ====================

export interface FinancialSettings {
    electricityPriceEURperMWh: number;
    averageMaintenanceCostEURperHour: number;
    targetAvailability: number;  // 0-100%
}

export interface FinancialImpact {
    healthScore: number;
    zone: HealthZone;
    estimatedLossEUR30Days: number;
    breakdown: {
        downtimeRisk: number;
        efficiencyLoss: number;
        emergencyRepairCost: number;
    };
    recommendation: string;
    recommendationDE: string;
}

// ==================== HYDRAULIC INTELLIGENCE ====================

export interface OilLifeClock {
    installDateISO: string;
    currentOperatingHours: number;
    equivalentHours: number;  // Adjusted for temperature
    changeIntervalHours: number;
    remainingLife: number;  // 0-100%
    nextChangeDate: string;
}

export interface FilterDeltaPMap {
    currentDeltaPBar: number;
    alarmThresholdBar: number;
    history: { timestamp: string; deltaPBar: number }[];
    trend: FilterTrend;
    daysUntilChange: number;
}

export interface HydraulicIntelligence {
    oilLife: OilLifeClock;
    filterStatus: FilterDeltaPMap;
}

// ==================== OPERATIONAL CONDITIONS ====================

export interface OperationalConditions {
    noiseDB: number;
    waterLevelM: number;  // At intake
    ambientTempC: number;
    riverTempC: number;
}

// ==================== SENSOR TOPOLOGY ====================

export interface SensorLocation {
    id: string;
    x: number;  // SVG coordinates
    y: number;
    type: 'VIBRATION' | 'TEMPERATURE' | 'PRESSURE';
    status: 'OK' | 'WARNING' | 'ALARM';
    label: string;
    value?: number;
    unit?: string;
}
