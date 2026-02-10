/**
 * sovereign-core.d.ts
 * 
 * NC-2400: Unified Type System for Sovereign Components
 * 
 * Centralizes all shared types to eliminate conflicts across services and components
 */

// ============================================================================
// CORE TYPE DEFINITIONS
// ============================================================================

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SovereignVerdict {
  recommendation: string;
  action: string;
  financialImpact: string;
  confidence: number;
  urgency: UrgencyLevel;
  reasoning: string[];
}

export interface IntegrityMetrics {
  coreMathVerified: boolean;
  decimalPrecision: boolean;
  physicsBoundaries: boolean;
  integrityScore: number;
  lastVerification: string;
  sentinelStatus: 'OK' | 'WARNING' | 'CRITICAL';
  boundaryStatus: 'OK' | 'WARNING' | 'CRITICAL';
}

export interface SovereignMemory {
  drawing42: string;
  fieldNote: string;
  wisdom: string;
}

// ============================================================================
// MATH SERVICE TYPES
// ============================================================================

export interface PenstockSpecs {
  diameter: number;
  wallThickness: number;
  materialModulus: number;
  materialYieldStrength: number;
}

export interface WaterHammerResult {
  waveSpeed: number;
  maxSurgeBar: number;
  burstSafetyFactor: number;
}

export interface OrbitData {
  x: number;
  y: number;
  timestamp: number;
}

export interface OrbitAnalysisResult {
  eccentricity: number;
  isElliptical: boolean;
  centerMigration: number;
  migrationAngle: number;
  currentCenter: { x: number; y: number };
}

export interface PIDParams {
  kp: number;
  ki: number;
  kd: number;
  setpoint: number;
  integralLimit?: number;
}

export interface PIDState {
  integralError: number;
  previousError: number;
}

export interface PIDResult {
  controlSignal: number;
  error: number;
  pTerm: number;
  iTerm: number;
  dTerm: number;
  newIntegralError?: number;
}

export interface GovernorParams {
  currentRPM: number;
  targetRPM: number;
  gatePosition: number;
  loadPercentage: number;
}

export interface GovernorResult {
  controlSignal: number;
  error: number;
  recommendedGatePosition: number;
  recommendedRPM: number;
  stability: 'STABLE' | 'UNSTABLE' | 'CRITICAL';
}

export interface EmergencyClosureParams {
  currentGatePosition: number;
  loadRejectionPercentage: number;
  maxClosureRate: number;
}

export interface EmergencyClosureResult {
  newGatePosition: number;
  closureRate: number;
  warning: string;
}

export interface ThermalSpecs {
  ambientTemperature: number;      // °C
  operatingTemperature: number;    // °C
  shaftLength: number;             // meters
  runnerDiameterMM: number;        // mm
  materialType: 'STEEL' | 'STAINLESS' | 'TITANIUM' | 'CUSTOM';
  customAlpha?: number;            // Optional custom expansion coefficient
}

export interface ThermalGrowthResult {
  growthMM: number;
  growthMils: number;              // thousandths of an inch
  coefficient: number;
  targetTemp: number;
  deltaT: number;
  clearanceRequired: number;       // mm
  compensationStatus: 'OK' | 'WARNING' | 'CRITICAL';
}

export interface LabyrinthGapResult {
  baseGap: number;                 // mm
  adjustedGap: number;               // mm after thermal compensation
  compensation: number;              // mm compensation applied
  temp: number;                    // Current temperature
  alarmThreshold: number;          // mm
}

export interface HeatTransferResult {
  heatFlow: number;                // Watts
  surfaceTemp: number;             // °C
  deltaT: number;                  // Temperature gradient
  timeToEquilibrium: number;        // minutes
}

export interface ThermalStressResult {
  stressMPa: number;               // MPa
  strainPercent: number;            // percentage
  safetyFactor: number;            // dimensionless
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
}

// ============================================================================
// FINANCIAL TYPES
// ============================================================================

export interface MarketData {
  energyPricePerMWh: number;
  currency: string;
}

export interface TechnicalData {
  currentActivePowerMW: number;
  designRatedPowerMW: number;
  isTurbineRunning?: boolean;
  currentEfficiencyPercent?: number;
}

export interface RevenueLossResult {
  revenueLossPerHour: number;
  monthlyLoss: number;
  annualLoss: number;
  hourlyLossEuro: number;
  efficiencyLossPercent: number;
}

export interface NPVCalculationParams {
  initialInvestment: number;
  cashFlows: number[];
  discountRate: number;
  years: number;
}

export interface NPVResult {
  npv: number;
  irr: number;
  paybackPeriod: number;
  isProfitable: boolean;
  roi: number;
}

// ============================================================================
// TELEMETRY TYPES
// ============================================================================

export interface PhysicsTelemetry {
  powerMW?: number;
  efficiency?: number;
  vibration?: number;
  temperature?: number;
  pressure?: number;
}

export interface HydraulicTelemetry {
  baselineOutputMW?: number;
  flowRate?: number;
  head?: number;
  efficiency?: number;
  cavitationIndex?: number;
}

export interface MechanicalTelemetry {
  rpm?: number;
  bearingTemperature?: number;
  vibration?: number;
  gatePosition?: number;
  oilPressure?: number;
}

export interface IdentityTelemetry {
  projectId?: string;
  operatorId?: string;
  timestamp?: string;
  version?: string;
}

export interface TelemetryData {
  physics?: PhysicsTelemetry;
  hydraulic?: HydraulicTelemetry;
  mechanical?: MechanicalTelemetry;
  identity?: IdentityTelemetry;
}

// ============================================================================
// UI COMPONENT TYPES
// ============================================================================

export interface StatusIndicator {
  status: 'OK' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';
  message: string;
  timestamp: string;
}

export interface ExperienceLedgerEntry {
  id: string;
  timestamp: string;
  operatorSignature: string;
  setpointChanges: {
    parameter: string;
    oldValue: number | string;
    newValue: number | string;
    reason: string;
  }[];
  verdict: SovereignVerdict;
  financialImpact: string;
}

// ============================================================================
// EXPORTED CONSTANTS
// ============================================================================

export const SOVEREIGN_CONSTANTS = {
  NC_2100: 'NC-2100',
  NC_2200: 'NC-2200',
  NC_2300: 'NC-2300',
  NC_2400: 'NC-2400',
  DEFAULT_RPM: 600,
  DEFAULT_EFFICIENCY: 90,
  CRITICAL_RPM_DEVIATION: 10,
  MINIMUM_INTEGRITY_SCORE: 70,
  MAXIMUM_BUNDLE_SIZE_MB: 2,
  DECIMAL_PRECISION: 30,
  THERMAL_COEFFICIENTS: {
    STEEL: 12e-6,
    STAINLESS: 16e-6,
    TITANIUM: 8.6e-6
  }
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ServiceStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'MAINTENANCE';

export interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  lastCheck: string;
  responseTime: number;
  errorCount: number;
}

export interface SystemHealthReport {
  overallStatus: ServiceStatus;
  services: ServiceHealth[];
  integrityScore: number;
  lastVerification: string;
  uptime: number;
}
