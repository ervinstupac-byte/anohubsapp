/**
 * ThermalMathService.ts
 * 
 * NC-2000: Thermal Mathematical Foundation
 * Thermal growth compensation, heat transfer, and thermal stress calculations
 * 
 * Migrated from: useEngineeringMath.ts
 * Standards: NC-4.2 (Thermal Compensation Protocol)
 */

import Decimal from 'decimal.js';

// ============================================================================
// TYPES
// ============================================================================

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

// ============================================================================
// MATERIAL PROPERTIES
// ============================================================================

const MATERIAL_COEFFICIENTS = {
    STEEL: 11.5e-6,           // 1/°C - Carbon steel
    STAINLESS: 16.0e-6,       // 1/°C - Stainless steel
    TITANIUM: 8.6e-6,         // 1/°C - Titanium alloy
    CUSTOM: 0
};

const MATERIAL_THERMAL_CONDUCTIVITY = {
    STEEL: 50,               // W/(m·K)
    STAINLESS: 16,
    TITANIUM: 7,
    CUSTOM: 0
};

// ============================================================================
// THERMAL GROWTH CALCULATIONS
// ============================================================================

/**
 * Calculate thermal growth compensation (NC-4.2)
 * Delta_L = alpha × L × Delta_T
 */
export function calculateThermalGrowth(specs: ThermalSpecs): ThermalGrowthResult {
    const alpha = new Decimal(specs.customAlpha || MATERIAL_COEFFICIENTS[specs.materialType]);
    const shaftLength = new Decimal(specs.shaftLength);
    const ambient = new Decimal(specs.ambientTemperature);
    const operating = new Decimal(specs.operatingTemperature);
    
    const deltaT = operating.minus(ambient);
    
    // Thermal growth in meters, convert to mm
    const growthM = alpha.mul(shaftLength).mul(deltaT);
    const growthMM = growthM.mul(1000);
    const growthMils = growthMM.mul(39.37); // Convert mm to mils
    
    // Required clearance depends on growth magnitude
    // Standard practice: 2x growth for safety margin
    const clearanceRequired = growthMM.mul(2);
    
    // Status determination
    let compensationStatus: ThermalGrowthResult['compensationStatus'] = 'OK';
    if (growthMM.greaterThan(0.5)) {
        compensationStatus = 'CRITICAL';
    } else if (growthMM.greaterThan(0.2)) {
        compensationStatus = 'WARNING';
    }
    
    return {
        growthMM: growthMM.toNumber(),
        growthMils: growthMils.toNumber(),
        coefficient: alpha.toNumber(),
        targetTemp: specs.operatingTemperature,
        deltaT: deltaT.toNumber(),
        clearanceRequired: clearanceRequired.toNumber(),
        compensationStatus
    };
}

/**
 * Calculate labyrinth seal gap adjustment based on temperature
 * Used for maintaining proper seal clearance across operating temperatures
 */
export function calculateLabyrinthGapAdjustment(
    baseGapMM: number,
    currentTempC: number,
    referenceTempC: number = 20,
    housingMaterial: 'STEEL' | 'ALUMINUM' = 'STEEL',
    turbineDiameterMM: number = 1000
): LabyrinthGapResult {
    const alpha = housingMaterial === 'STEEL' 
        ? new Decimal(11.5e-6) 
        : new Decimal(23.0e-6); // Aluminum
    
    const base = new Decimal(baseGapMM);
    const temp = new Decimal(currentTempC);
    const ref = new Decimal(referenceTempC);
    const diameter = new Decimal(turbineDiameterMM).div(1000); // Convert to meters
    
    const deltaT = temp.minus(ref);
    
    // Housing expansion/contraction
    const housingGrowth = alpha.mul(diameter).mul(deltaT).mul(1000); // mm
    
    // Gap decreases when housing expands (hot), increases when contracts (cold)
    const adjustedGap = base.minus(housingGrowth);
    const compensation = housingGrowth;
    
    // Alarm threshold: 80% of base gap or critical minimum
    const criticalMin = new Decimal(0.1); // 0.1mm absolute minimum
    const alarmThreshold = Decimal.max(criticalMin, base.mul(0.8));
    
    return {
        baseGap: base.toNumber(),
        adjustedGap: adjustedGap.toNumber(),
        compensation: compensation.toNumber(),
        temp: currentTempC,
        alarmThreshold: alarmThreshold.toNumber()
    };
}

/**
 * Get adjusted alarm threshold for gap monitoring
 * Accounts for thermal compensation
 */
export function getAdjustedThreshold(
    baseGapMM: number,
    currentTempC: number,
    turbineDiameterMM: number,
    safetyFactor: number = 0.8
): number {
    const result = calculateLabyrinthGapAdjustment(
        baseGapMM,
        currentTempC,
        20, // Reference at 20°C
        'STEEL',
        turbineDiameterMM
    );
    
    return new Decimal(result.adjustedGap).mul(safetyFactor).toNumber();
}

// ============================================================================
// HEAT TRANSFER CALCULATIONS
// ============================================================================

/**
 * Calculate steady-state heat transfer
 * Q = h × A × ΔT
 */
export function calculateHeatTransfer(
    heatTransferCoeff: number,    // W/(m²·K)
    surfaceArea: number,         // m²
    surfaceTemp: number,         // °C
    ambientTemp: number,          // °C
    material: 'STEEL' | 'STAINLESS' | 'TITANIUM' = 'STEEL'
): HeatTransferResult {
    const h = new Decimal(heatTransferCoeff);
    const A = new Decimal(surfaceArea);
    const T_surface = new Decimal(surfaceTemp);
    const T_ambient = new Decimal(ambientTemp);
    
    const deltaT = T_surface.minus(T_ambient);
    const heatFlow = h.mul(A).mul(deltaT);
    
    // Thermal mass estimation for time to equilibrium
    // Simplified: assumes typical turbine bearing housing thermal mass
    const thermalMass = new Decimal(surfaceArea).mul(500); // J/K estimate
    const tau = thermalMass.div(h.mul(A)); // Time constant
    const timeToEquilibrium = tau.mul(5).div(60); // 5 time constants to ~99%, convert to minutes
    
    return {
        heatFlow: heatFlow.toNumber(),
        surfaceTemp: surfaceTemp,
        deltaT: deltaT.toNumber(),
        timeToEquilibrium: timeToEquilibrium.toNumber()
    };
}

/**
 * Calculate thermal stress in constrained components
 * sigma = E × alpha × deltaT
 */
export function calculateThermalStress(
    elasticModulusGPa: number,
    thermalExpansionCoeff: number,
    deltaT: number,
    poissonRatio: number = 0.3
): { stressMPa: number; strain: number; isYieldRisk: boolean } {
    const E = new Decimal(elasticModulusGPa).mul(1e9); // Convert to Pa
    const alpha = new Decimal(thermalExpansionCoeff);
    const dT = new Decimal(deltaT);
    const nu = new Decimal(poissonRatio);
    
    // Thermal stress (constrained expansion)
    const stressPa = E.mul(alpha).mul(dT).div(new Decimal(1).minus(nu));
    const stressMPa = stressPa.div(1e6);
    
    // Thermal strain
    const strain = alpha.mul(dT);
    
    // Yield risk assessment (typical steel yield ~250 MPa)
    const yieldStrength = new Decimal(250);
    const isYieldRisk = stressMPa.greaterThan(yieldStrength.mul(0.8)); // 80% of yield
    
    return {
        stressMPa: stressMPa.toNumber(),
        strain: strain.toNumber(),
        isYieldRisk
    };
}

// ============================================================================
// TEMPERATURE MONITORING
// ============================================================================

export interface TemperatureAlert {
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    message: string;
    recommendedAction: string;
}

/**
 * Generate temperature-based alerts for bearing monitoring
 */
export function generateTemperatureAlerts(
    bearingTemp: number,
    ambientTemp: number,
    turbineType: string,
    operatingHours: number
): TemperatureAlert[] {
    const alerts: TemperatureAlert[] = [];
    const temp = new Decimal(bearingTemp);
    const ambient = new Decimal(ambientTemp);
    
    // Temperature rise above ambient
    const rise = temp.minus(ambient);
    
    // Warning thresholds
    if (temp.greaterThan(85)) {
        alerts.push({
            severity: 'CRITICAL',
            message: `Bearing temperature ${bearingTemp}°C exceeds critical threshold (85°C)`,
            recommendedAction: 'Immediate inspection required. Consider load reduction.'
        });
    } else if (temp.greaterThan(70)) {
        alerts.push({
            severity: 'WARNING',
            message: `Bearing temperature ${bearingTemp}°C elevated (threshold: 70°C)`,
            recommendedAction: 'Monitor closely. Check lubrication system.'
        });
    }
    
    // Temperature rise check
    if (rise.greaterThan(40)) {
        alerts.push({
            severity: 'WARNING',
            message: `Temperature rise ${rise.toNumber().toFixed(1)}°C above ambient excessive`,
            recommendedAction: 'Verify cooling system operation.'
        });
    }
    
    // Aging unit consideration
    if (operatingHours > 50000 && temp.greaterThan(65)) {
        alerts.push({
            severity: 'INFO',
            message: 'Bearing temperature consistent with unit age and operating hours',
            recommendedAction: 'Schedule maintenance during next outage.'
        });
    }
    
    return alerts;
}

/**
 * Predict bearing temperature based on load and ambient conditions
 * Simplified thermal model
 */
export function predictBearingTemperature(
    currentLoadMW: number,
    ratedLoadMW: number,
    ambientTemp: number,
    baseBearingTemp: number = 55,
    loadFactor: number = 0.3 // °C per % load
): { predictedTemp: number; confidence: number } {
    const load = new Decimal(currentLoadMW);
    const rated = new Decimal(ratedLoadMW);
    const ambient = new Decimal(ambientTemp);
    const base = new Decimal(baseBearingTemp);
    const factor = new Decimal(loadFactor);
    
    // Load contribution
    const loadPercent = load.div(rated).mul(100);
    const loadContribution = loadPercent.mul(factor);
    
    // Predicted temperature
    const predicted = base.plus(loadContribution).plus(ambient.minus(20).mul(0.5));
    
    // Confidence based on load range (lower confidence at extremes)
    let confidence = 0.9;
    if (loadPercent.lessThan(20) || loadPercent.greaterThan(110)) {
        confidence = 0.75;
    }
    
    return {
        predictedTemp: predicted.toNumber(),
        confidence
    };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert Celsius to Fahrenheit
 */
export function celsiusToFahrenheit(celsius: number): number {
    return new Decimal(celsius).mul(9).div(5).plus(32).toNumber();
}

/**
 * Convert Fahrenheit to Celsius
 */
export function fahrenheitToCelsius(fahrenheit: number): number {
    return new Decimal(fahrenheit).minus(32).mul(5).div(9).toNumber();
}

/**
 * Calculate temperature gradient through a wall
 * Linear approximation
 */
export function calculateTemperatureGradient(
    hotSideTemp: number,
    coldSideTemp: number,
    wallThicknessMM: number,
    distanceFromHotMM: number
): number {
    const hot = new Decimal(hotSideTemp);
    const cold = new Decimal(coldSideTemp);
    const thickness = new Decimal(wallThicknessMM);
    const distance = new Decimal(distanceFromHotMM);
    
    const totalGradient = hot.minus(cold);
    const normalizedPosition = distance.div(thickness);
    
    return hot.minus(totalGradient.mul(normalizedPosition)).toNumber();
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class ThermalMathService {
    static calculateThermalGrowth = calculateThermalGrowth;
    static calculateLabyrinthGapAdjustment = calculateLabyrinthGapAdjustment;
    static getAdjustedThreshold = getAdjustedThreshold;
    static calculateHeatTransfer = calculateHeatTransfer;
    static calculateThermalStress = calculateThermalStress;
    static generateTemperatureAlerts = generateTemperatureAlerts;
    static predictBearingTemperature = predictBearingTemperature;
    static celsiusToFahrenheit = celsiusToFahrenheit;
    static fahrenheitToCelsius = fahrenheitToCelsius;
    static calculateTemperatureGradient = calculateTemperatureGradient;
    static MATERIAL_COEFFICIENTS = MATERIAL_COEFFICIENTS;
    static MATERIAL_THERMAL_CONDUCTIVITY = MATERIAL_THERMAL_CONDUCTIVITY;
}

export default ThermalMathService;
