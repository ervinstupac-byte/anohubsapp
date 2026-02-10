/**
 * PhysicsMathService.ts
 * 
 * NC-2000: Absolute Mathematical Foundation
 * Centralized high-precision physics calculations for all CEREBRO components.
 * 
 * Migrated from: useEngineeringMath.ts
 * Standards: IEC 60041 (Water Hammer), ISO 10816 (Vibration)
 */

import Decimal from 'decimal.js';
import { UnitConverter } from './UnitConverter';

// ============================================================================
// CONSTANTS (NC-10001)
// ============================================================================

export const PHYSICS_CONSTANTS = {
    GRAVITY: 9.81, // m/s²
    WATER_DENSITY: 1000, // kg/m³
    STEEL_ELASTIC_MODULUS_MPA: 210000, // MPa
    WAVE_SPEED_WATER: 1200, // m/s
    ATMOSPHERIC_PRESSURE_PA: 101325, // Pa
    PI: Math.PI
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface VibrationPoint {
    x: number;
    y: number;
    timestamp?: number;
}

export interface OrbitCenter {
    x: number;
    y: number;
}

export interface AcousticMetrics {
    cavitationIntensity: number;
    ultrasonicLeakIndex: number;
    bearingGrindIndex: number;
    acousticBaselineMatch: number;
}

export interface PenstockSpecs {
    diameter: number;        // meters
    wallThickness: number; // meters
    materialModulus: number; // GPa
    materialYieldStrength: number; // MPa
}

export interface HydraulicState {
    flow: number;           // m³/s
    pressure: number;       // bar
    baselineOutputMW?: number;
}

export interface MechanicalState {
    vibrationHistory: VibrationPoint[];
    vibrationX: number;
    vibrationY: number;
    baselineOrbitCenter?: OrbitCenter;
    acousticMetrics?: AcousticMetrics;
}

// ============================================================================
// ORBIT ANALYSIS
// ============================================================================

export interface OrbitAnalysisResult {
    eccentricity: number;
    isElliptical: boolean;
    isStructuralLoosenessConfirmed: boolean;
    peakAngle: number;
    centerMigration: number;
    migrationAngle: number;
    currentCenter: { x: number; y: number };
    baselineCenter: OrbitCenter | null;
    a_axis: number;
    b_axis: number;
}

/**
 * Analyze shaft orbit from vibration history
 * Calculates eccentricity, center migration, and structural looseness
 */
export function analyzeOrbit(
    vibrationHistory: VibrationPoint[],
    turbineType: string,
    baselineOrbitCenter?: OrbitCenter,
    acousticMetrics?: AcousticMetrics
): OrbitAnalysisResult {
    const PI = Decimal.acos(-1);
    
    // Handle empty history properly - return zero eccentricity instead of undefined
    if (!vibrationHistory || vibrationHistory.length === 0) {
        return {
            eccentricity: 0,
            isElliptical: false,
            isStructuralLoosenessConfirmed: false,
            peakAngle: 0,
            centerMigration: 0,
            migrationAngle: 0,
            currentCenter: { x: 0, y: 0 },
            baselineCenter: baselineOrbitCenter || null,
            a_axis: 0,
            b_axis: 0
        };
    }


    // Calculate max and average positions
    let maxX = new Decimal(0);
    let maxY = new Decimal(0);
    let sumX = new Decimal(0);
    let sumY = new Decimal(0);

    vibrationHistory.forEach(p => {
        const px = new Decimal(p.x);
        const py = new Decimal(p.y);
        if (px.abs().greaterThan(maxX)) maxX = px.abs();
        if (py.abs().greaterThan(maxY)) maxY = py.abs();
        sumX = sumX.plus(px);
        sumY = sumY.plus(py);
    });

    const count = new Decimal(vibrationHistory.length);
    const avgX = sumX.div(count);
    const avgY = sumY.div(count);

    // Major and minor axes
    const a_axis = maxX.greaterThan(maxY) ? maxX : maxY;
    const b_axis = maxX.greaterThan(maxY) ? maxY : maxX;

    // Eccentricity: e = sqrt(1 - (b² / a²))
    let eccentricity = new Decimal(0);
    if (vibrationHistory.length >= 3 && a_axis.greaterThan(0)) {
        const bSquared = b_axis.pow(2);
        const aSquared = a_axis.pow(2);
        eccentricity = Decimal.sqrt(new Decimal(1).minus(bSquared.div(aSquared)));
    }

    const isElliptical = eccentricity.greaterThan(0.75);

    // Structural looseness detection (Directive 2)
    // Contextual thresholding based on turbine type
    const eccentricityLimit = turbineType === 'PELTON' ? new Decimal(0.82) : new Decimal(0.78);
    
    const metrics = acousticMetrics || {
        cavitationIntensity: 0,
        ultrasonicLeakIndex: 0,
        bearingGrindIndex: 0,
        acousticBaselineMatch: 1.0
    };

    const isStructuralLoosenessConfirmed = eccentricity.greaterThan(eccentricityLimit) &&
        (metrics.cavitationIntensity > 6 || metrics.bearingGrindIndex > 6);

    // Center migration from baseline
    let centerMigration = new Decimal(0);
    let migrationAngle = new Decimal(0);

    if (baselineOrbitCenter && vibrationHistory.length > 0) {
        const bX = new Decimal(Number.isFinite(baselineOrbitCenter.x) ? baselineOrbitCenter.x : 0);
        const bY = new Decimal(Number.isFinite(baselineOrbitCenter.y) ? baselineOrbitCenter.y : 0);

        const dx = avgX.minus(bX);
        const dy = avgY.minus(bY);

        centerMigration = Decimal.sqrt(dx.pow(2).plus(dy.pow(2)));
        // Angle in degrees: atan2(dy, dx) * 180 / π
        migrationAngle = Decimal.atan2(dy, dx).mul(180).div(PI).plus(360).mod(360);
    }

    // Peak displacement angle
    let peakPoint: VibrationPoint = { x: 0, y: 0 };
    let maxD = new Decimal(0);
    
    vibrationHistory.forEach(p => {
        const dist = Decimal.sqrt(new Decimal(p.x).pow(2).plus(new Decimal(p.y).pow(2)));
        if (dist.greaterThan(maxD)) {
            maxD = dist;
            peakPoint = p;
        }
    });

    const peakAngle = Decimal.atan2(new Decimal(peakPoint.y).neg(), new Decimal(peakPoint.x))
        .mul(180).div(PI).plus(360).mod(360);

    return {
        eccentricity: eccentricity.toNumber(),
        isElliptical,
        isStructuralLoosenessConfirmed,
        peakAngle: peakAngle.toNumber(),
        centerMigration: centerMigration.toNumber(),
        migrationAngle: migrationAngle.toNumber(),
        currentCenter: { x: avgX.toNumber(), y: avgY.toNumber() },
        baselineCenter: baselineOrbitCenter || null,
        a_axis: a_axis.toNumber(),
        b_axis: b_axis.toNumber()
    };
}

// ============================================================================
// WATER HAMMER (IEC 60041)
// ============================================================================

export interface WaterHammerResult {
    waveSpeed: number;        // m/s
    maxSurgeBar: number;      // bar
    maxSurgePa: number;       // Pa
    burstSafetyFactor: number;
    recommendation: string;
    velocity: number;         // m/s
}

/**
 * Calculate water hammer effects per IEC 60041
 * Uses Joukowsky equation for pressure surge
 */
export function calculateWaterHammer(
    penstock: PenstockSpecs,
    flow: number,
    hoopStress: number
): WaterHammerResult {
    // Material properties
    const K = new Decimal(2.15e9);  // Bulk modulus of water (Pa) - KEEPING AS LOCAL CONSTANT FOR NOW UNLESS REQUESTED GLOBALLY
    const rho = new Decimal(PHYSICS_CONSTANTS.WATER_DENSITY);   // Water density (kg/m³)
    
    // Young's modulus: Prefer penstock spec (GPa), fallback to constant (converted from MPa to GPa)
    const modulusGPa = penstock.materialModulus || (PHYSICS_CONSTANTS.STEEL_ELASTIC_MODULUS_MPA / 1000);
    const E = new Decimal(modulusGPa).mul(1e9);  // Convert GPa to Pa

    // Penstock geometry
    const d_pipe = Decimal.abs(new Decimal(penstock.diameter || 1.0));
    let e_wall = new Decimal(penstock.wallThickness ?? 0.01);
    if (e_wall.lessThanOrEqualTo(0)) e_wall = e_wall.abs();
    if (e_wall.lessThanOrEqualTo(0)) e_wall = new Decimal(0.01);

    // Wave speed: a = √(K/ρ / (1 + K/E × d/e))
    // Note: User specified WAVE_SPEED_WATER = 1200, but the formula calculates celerity in the pipe (a), not just in water.
    // The calculated 'a' is usually < 1200 m/s due to pipe elasticity.
    // We will keep the Joukowsky calculation as it is more accurate for the specific pipe.
    const waveSpeed = Decimal.sqrt(
        K.div(rho).div(
            new Decimal(1).plus(K.div(E).mul(d_pipe.div(e_wall)))
        )
    );

    // Flow velocity
    const area = new Decimal(PHYSICS_CONSTANTS.PI).mul(d_pipe.div(2).pow(2));
    const velocity = new Decimal(flow).div(area);

    // Pressure surge (Joukowsky equation): ΔP = ρ × a × v
    const deltaP_Pa = rho.mul(waveSpeed).mul(velocity);
    const deltaP_Bar = new Decimal(UnitConverter.paToBar(deltaP_Pa));

    // Burst safety factor
    const yieldStrength = new Decimal(penstock.materialYieldStrength || 250);
    const hoopStressDecimal = new Decimal(hoopStress || 1);
    const burstSafetyFactor = yieldStrength.div(hoopStressDecimal);

    // IEC 60041 recommendations
    let recommendation = "IEC 60041: Operational parameters within design envelope.";
    if (burstSafetyFactor.lessThan(1.5)) {
        recommendation = "🚨 IEC 60041 CRITICAL: Safety Factor below 1.5. Immediate pressure reduction or structural inspection required!";
    } else if (burstSafetyFactor.lessThan(2.0)) {
        recommendation = "⚠️ IEC 60041 WARNING: SF < 2.0. Monitor transient pressure peaks closely.";
    }

    return {
        waveSpeed: waveSpeed.toNumber(),
        maxSurgeBar: deltaP_Bar.toNumber(),
        maxSurgePa: deltaP_Pa.toNumber(),
        burstSafetyFactor: burstSafetyFactor.toNumber(),
        recommendation,
        velocity: velocity.toNumber()
    };
}

export interface HoopStressResult {
    stressMPa: number;
    utilizationRatio: number;
}

export function calculateHoopStress(
    headM: number,
    surgePressureBar: number,
    diameterM: number,
    thicknessM: number,
    yieldStrengthMPa: number = 235 // Default to S235
): HoopStressResult {
    const rho = new Decimal(PHYSICS_CONSTANTS.WATER_DENSITY);
    const gravity = new Decimal(PHYSICS_CONSTANTS.GRAVITY);

    const head = Decimal.max(new Decimal(headM || 0), 0);
    // Surge pressure is the dynamic component (Delta P)
    const surgePa = new Decimal(UnitConverter.barToPa(surgePressureBar || 0));
    const diameter = new Decimal(diameterM || 0);
    const thickness = new Decimal(thicknessM || 0);

    if (diameter.lessThanOrEqualTo(0) || thickness.lessThanOrEqualTo(0)) {
        return { stressMPa: 0, utilizationRatio: 0 };
    }

    // P_static = rho * g * h
    const staticPressurePa = rho.mul(gravity).mul(head);
    
    // Total Pressure (P_static + Delta P_dynamic)
    const totalPressurePa = staticPressurePa.plus(surgePa);

    // Formula: sigma = (P * D) / (2 * t)
    // Result in Pa
    const hoopStressPa = totalPressurePa.mul(diameter).div(thickness.mul(2));
    const stressMPa = UnitConverter.paToMPa(hoopStressPa);
    
    // Calculate Utilization Ratio (Current Stress / Yield Strength)
    const utilizationRatio = stressMPa / (yieldStrengthMPa || 1); // Avoid division by zero

    return { stressMPa, utilizationRatio };
}

// ============================================================================
// THRUST CALCULATIONS
// ============================================================================

export interface ThrustResult {
    totalKN: number;
    factor: number;
    deltaPBar: number;
}

/**
 * Calculate hydraulic thrust on bearings
 * Based on pressure differential and flow conditions
 */
export function calculateThrust(
    waterHammerSurgeBar: number,
    flow: number
): ThrustResult {
    const deltaP_Bar = new Decimal(waterHammerSurgeBar);
    
    // Thrust calculation with flow-dependent factor
    const flowFactor = new Decimal(flow > 40 ? 0.1 : 0);
    const thrustKN = deltaP_Bar.mul(1.5).mul(new Decimal(0.4).plus(flowFactor));
    
    // Efficiency factor degrades at high flow
    const factor = new Decimal(0.94).minus(flowFactor);

    return {
        totalKN: thrustKN.toNumber(),
        factor: factor.toNumber(),
        deltaPBar: deltaP_Bar.toNumber()
    };
}

// ============================================================================
// PERFORMANCE ANALYSIS
// ============================================================================

export interface PerformanceResult {
    delta: number;           // Performance deviation %
    actualPower: number;    // MW
    baselinePower: number;  // MW
}

/**
 * Calculate performance delta from baseline
 */
export function calculatePerformanceDelta(
    actualPowerMW: number,
    baselinePowerMW: number
): PerformanceResult {
    const actual = new Decimal(actualPowerMW);
    const baseline = new Decimal(baselinePowerMW);

    let delta = new Decimal(0);
    if (baseline.greaterThan(0)) {
        delta = actual.minus(baseline).div(baseline).mul(100);
    }

    return {
        delta: delta.toNumber(),
        actualPower: actualPowerMW,
        baselinePower: baselinePowerMW
    };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert degrees to radians
 */
export function degToRad(degrees: number): number {
    return new Decimal(degrees).mul(Decimal.acos(-1)).div(180).toNumber();
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians: number): number {
    return new Decimal(radians).mul(180).div(Decimal.acos(-1)).toNumber();
}

/**
 * Calculate vector magnitude
 */
export function vectorMagnitude(x: number, y: number): number {
    return Decimal.sqrt(new Decimal(x).pow(2).plus(new Decimal(y).pow(2))).toNumber();
}

/**
 * Calculate angle between two vectors (in degrees)
 */
export function vectorAngle(x1: number, y1: number, x2: number, y2: number): number {
    const PI = Decimal.acos(-1);
    const dot = new Decimal(x1).mul(x2).plus(new Decimal(y1).mul(y2));
    const mag1 = vectorMagnitude(x1, y1);
    const mag2 = vectorMagnitude(x2, y2);
    
    if (mag1 === 0 || mag2 === 0) return 0;
    
    const cosAngle = dot.div(new Decimal(mag1).mul(mag2));
    return Decimal.acos(cosAngle.clampedTo(-1, 1)).mul(180).div(PI).toNumber();
}

/**
 * NC-8001: Total Unit Efficiency Calculation
 * Formula: η_total = Π(η_i) = η_turbine * η_generator * η_transformer * η_transmission
 * 
 * Ensures non-zero values for Guest sessions by forcing defaults if missing or in Guest mode.
 */
export function calculateTotalEfficiency(
    etaTurbine: number,
    etaGenerator?: number,
    etaTransformer?: number,
    etaTransmission?: number,
    isGuestMode: boolean = false
): number {
    // Force Guest values if missing or explicitly in Guest mode
    // Guest defaults: gen=0.98, trans=0.99, line=0.99
    const eGen = (isGuestMode || etaGenerator === undefined) ? 0.98 : etaGenerator;
    const eTrans = (isGuestMode || etaTransformer === undefined) ? 0.99 : etaTransformer;
    const eLine = (isGuestMode || etaTransmission === undefined) ? 0.99 : etaTransmission;
    
    // Safety check for turbine efficiency (sometimes passed as 0-100, sometimes 0-1)
    // We assume input is 0-1. If > 1, normalize it.
    const eTurbine = etaTurbine > 1 ? etaTurbine / 100 : etaTurbine;

    return new Decimal(eTurbine)
        .mul(eGen)
        .mul(eTrans)
        .mul(eLine)
        .toNumber();
}

// ============================================================================
// SERVICE CLASS (for dependency injection compatibility)
// ============================================================================

export class PhysicsMathService {
    static analyzeOrbit = analyzeOrbit;
    static calculateWaterHammer = calculateWaterHammer;
    static calculateHoopStress = calculateHoopStress;
    static calculateThrust = calculateThrust;
    static calculatePerformanceDelta = calculatePerformanceDelta;
    static degToRad = degToRad;
    static radToDeg = radToDeg;
    static vectorMagnitude = vectorMagnitude;
    static vectorAngle = vectorAngle;
    static calculateTotalEfficiency = calculateTotalEfficiency;
}

export default PhysicsMathService;
