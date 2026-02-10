/**
 * ControlMathService.ts
 * 
 * NC-2000: Control Systems Mathematical Foundation
 * PID control, Governor logic, and Setpoint Optimization
 * 
 * Migrated from: useEngineeringMath.ts
 * Standards: IEC 61346 (Control Systems), IEEE 1115 (Governor Performance)
 */

import Decimal from 'decimal.js';

// ============================================================================
// TYPES
// ============================================================================

export interface PIDParameters {
    kp: number;           // Proportional gain
    ki: number;           // Integral gain
    kd: number;           // Derivative gain
    setpoint: number;     // Target value
    integralLimit?: number; // Anti-windup limit
}

export interface PIDState {
    integralError: number;
    previousError: number;
    lastOutput?: number;
}

export interface GovernorState extends PIDState {
    actualValue: number;
    setpoint: number;
    wicketGateSetpoint?: number;
}

export interface PIDResult {
    controlSignal: number;
    error: number;
    pTerm: number;
    iTerm: number;
    dTerm: number;
    newIntegralError: number;
    newPreviousError: number;
}

export interface GovernorResult {
    controlSignal: number;
    error: number;
    recommendedGatePosition: number;
    recommendedRPM: number;
    stability: 'STABLE' | 'OSCILLATING' | 'UNSTABLE';
}

// ============================================================================
// PID CONTROLLER
// ============================================================================

/**
 * Calculate PID control signal
 * Standard PID formula: u(t) = Kp·e(t) + Ki·∫e(t)dt + Kd·de(t)/dt
 */
export function calculatePID(
    params: PIDParameters,
    state: PIDState,
    currentValue: number,
    dt: number = 1.0
): PIDResult {
    const kp = new Decimal(params.kp);
    const ki = new Decimal(params.ki);
    const kd = new Decimal(params.kd);
    const setpoint = new Decimal(params.setpoint);
    const actual = new Decimal(currentValue);
    
    // Error calculation
    const error = setpoint.minus(actual);
    
    // Proportional term
    const pTerm = kp.mul(error);
    
    // Integral term (with anti-windup)
    let integralError = new Decimal(state.integralError).plus(error.mul(dt));
    if (params.integralLimit) {
        const limit = new Decimal(params.integralLimit);
        integralError = Decimal.min(limit, Decimal.max(integralError.neg(), integralError));
    }
    const iTerm = ki.mul(integralError);
    
    // Derivative term (on measurement, not error - avoids derivative kick)
    const previousError = new Decimal(state.previousError);
    const dTerm = kd.mul(error.minus(previousError)).div(dt);
    
    // Total control signal
    const controlSignal = pTerm.plus(iTerm).plus(dTerm);
    
    return {
        controlSignal: controlSignal.toNumber(),
        error: error.toNumber(),
        pTerm: pTerm.toNumber(),
        iTerm: iTerm.toNumber(),
        dTerm: dTerm.toNumber(),
        newIntegralError: integralError.toNumber(),
        newPreviousError: error.toNumber()
    };
}

/**
 * Calculate incremental PID (velocity form)
 * Better for digital implementations
 */
export function calculateIncrementalPID(
    params: PIDParameters,
    state: PIDState,
    currentValue: number,
    dt: number = 1.0
): PIDResult {
    const kp = new Decimal(params.kp);
    const ki = new Decimal(params.ki);
    const kd = new Decimal(params.kd);
    const setpoint = new Decimal(params.setpoint);
    const actual = new Decimal(currentValue);
    
    const error = setpoint.minus(actual);
    const previousError = new Decimal(state.previousError);
    
    // Incremental terms
    const pTerm = kp.mul(error.minus(previousError));
    const iTerm = ki.mul(error).mul(dt);
    const dTerm = kd.mul(error.minus(previousError.mul(2)).plus(new Decimal(state.integralError))).div(dt);
    
    // Delta output
    const deltaU = pTerm.plus(iTerm).plus(dTerm);
    const lastOutput = new Decimal(state.lastOutput || 0);
    const controlSignal = lastOutput.plus(deltaU);
    
    // Update state
    const integralError = new Decimal(state.integralError).plus(error.mul(dt));
    
    return {
        controlSignal: controlSignal.toNumber(),
        error: error.toNumber(),
        pTerm: pTerm.toNumber(),
        iTerm: iTerm.toNumber(),
        dTerm: dTerm.toNumber(),
        newIntegralError: previousError.toNumber(), // Store previous error as integral for next cycle
        newPreviousError: error.toNumber()
    };
}

// ============================================================================
// GOVERNOR CONTROL
// ============================================================================

const DEFAULT_GOVERNOR_PARAMS: PIDParameters = {
    kp: 2.0,      // Standard hydro governor gain
    ki: 0.5,      // Integral for steady-state error elimination
    kd: 0.1,      // Small derivative for stability
    setpoint: 600, // 600 RPM standard
    integralLimit: 100
};

/**
 * Calculate governor control for turbine speed regulation
 * Implements IEEE 1115 compliant governor logic
 */
export function calculateGovernorControl(
    currentRPM: number,
    targetRPM: number = 600,
    state?: GovernorState,
    gatePosition?: number
): GovernorResult {
    const params: PIDParameters = {
        ...DEFAULT_GOVERNOR_PARAMS,
        setpoint: targetRPM
    };
    
    const pidState: PIDState = state || {
        integralError: 0,
        previousError: 0
    };
    
    const pidResult = calculatePID(params, pidState, currentRPM);
    
    // Calculate recommended gate position based on control signal
    // Gate position typically 0-100%, where 50% is nominal
    const baseGatePosition = gatePosition || 50;
    const gateAdjustment = pidResult.controlSignal / 10; // Scale factor
    let recommendedGatePosition = baseGatePosition + gateAdjustment;
    
    // Clamp gate position to safe limits (10% - 95%)
    recommendedGatePosition = Math.max(10, Math.min(95, recommendedGatePosition));
    
    // Calculate recommended RPM based on gate position
    // Simplified: linear relationship around operating point
    const rpmPerPercentGate = targetRPM / 50; // Assuming 50% = target RPM
    const recommendedRPM = recommendedGatePosition * rpmPerPercentGate;
    
    // Stability assessment based on error magnitude and control signal
    const errorMag = Math.abs(pidResult.error);
    const controlMag = Math.abs(pidResult.controlSignal);
    
    let stability: GovernorResult['stability'] = 'STABLE';
    if (errorMag > 50 || controlMag > 100) {
        stability = 'UNSTABLE';
    } else if (errorMag > 20 || controlMag > 50) {
        stability = 'OSCILLATING';
    }
    
    return {
        controlSignal: pidResult.controlSignal,
        error: pidResult.error,
        recommendedGatePosition,
        recommendedRPM,
        stability
    };
}

/**
 * Calculate wicket gate adjustment for load rejection
 * Emergency response calculation
 */
export function calculateEmergencyGateClosure(
    currentLoadMW: number,
    targetLoadMW: number,
    currentGatePosition: number,
    responseTimeMs: number = 100
): { newGatePosition: number; closureRate: number; warning: string } {
    const loadDiff = new Decimal(currentLoadMW).minus(targetLoadMW);
    const absDiff = loadDiff.abs();
    
    // Normalized closure rate (percent per second)
    const baseClosureRate = absDiff.greaterThan(50) ? 20 : 10;
    const closureRate = baseClosureRate * (1000 / responseTimeMs); // Adjust for response time
    
    // Calculate new gate position
    const adjustment = loadDiff.greaterThan(0) 
        ? -absDiff.div(5) // Reduce gate on overload
        : absDiff.div(10); // Increase gate on underload
    
    const newPosition = new Decimal(currentGatePosition).plus(adjustment);
    const clampedPosition = Decimal.max(10, Decimal.min(95, newPosition));
    
    let warning = "";
    if (absDiff.greaterThan(100)) {
        warning = "🚨 EMERGENCY: Load rejection >100MW! Immediate gate closure required.";
    } else if (absDiff.greaterThan(50)) {
        warning = "⚠️ WARNING: Significant load change detected.";
    }
    
    return {
        newGatePosition: clampedPosition.toNumber(),
        closureRate,
        warning
    };
}

// ============================================================================
// SETPOINT OPTIMIZATION
// ============================================================================

export interface OptimizationResult {
    optimalSetpoint: number;
    expectedEfficiency: number;
    powerOutput: number;
    confidence: number;
}

/**
 * Optimize setpoint for best efficiency point (BEP)
 * Uses hill curve approximation
 */
export function optimizeSetpointForBEP(
    currentHead: number,
    currentFlow: number,
    turbineType: 'FRANCIS' | 'KAPLAN' | 'PELTON',
    hillCurveData?: { flow: number[]; head: number[]; efficiency: number[] }
): OptimizationResult {
    // Default BEP values by turbine type
    const bepValues = {
        FRANCIS: { flowRatio: 0.85, headRatio: 1.0, efficiency: 0.94 },
        KAPLAN: { flowRatio: 0.90, headRatio: 1.0, efficiency: 0.93 },
        PELTON: { flowRatio: 0.80, headRatio: 1.0, efficiency: 0.92 }
    };
    
    const bep = bepValues[turbineType];
    
    // Calculate optimal flow for current head
    const optimalFlow = new Decimal(currentFlow).mul(bep.flowRatio);
    
    // Simplified efficiency calculation around BEP
    const flowDeviation = new Decimal(currentFlow).minus(optimalFlow).abs().div(optimalFlow);
    const efficiencyPenalty = flowDeviation.mul(0.1); // 10% penalty per unit deviation
    const expectedEfficiency = new Decimal(bep.efficiency).minus(efficiencyPenalty);
    
    // Power output estimate
    const rho = new Decimal(1000);  // Water density
    const g = new Decimal(9.81);    // Gravity
    const Q = optimalFlow;
    const H = new Decimal(currentHead);
    const eta = expectedEfficiency;
    
    const powerOutput = rho.mul(g).mul(Q).mul(H).mul(eta).div(1e6); // MW
    
    // Confidence based on how close we are to known hill curve data
    let confidence = 0.95;
    if (hillCurveData) {
        // Check if operating point is within measured data range
        const minFlow = Math.min(...hillCurveData.flow);
        const maxFlow = Math.max(...hillCurveData.flow);
        if (currentFlow < minFlow || currentFlow > maxFlow) {
            confidence = 0.75; // Extrapolating
        }
    }
    
    return {
        optimalSetpoint: optimalFlow.toNumber(),
        expectedEfficiency: expectedEfficiency.toNumber(),
        powerOutput: powerOutput.toNumber(),
        confidence
    };
}

/**
 * Calculate convergence alpha (stability margin)
 * Returns value between 0 and 1, where 1 is perfectly converged
 */
export function calculateConvergenceAlpha(
    currentValue: number,
    targetValue: number,
    previousValue: number,
    tolerance: number = 0.01
): number {
    const current = new Decimal(currentValue);
    const target = new Decimal(targetValue);
    const previous = new Decimal(previousValue);
    
    // Error from target
    const currentError = current.minus(target).abs();
    const previousError = previous.minus(target).abs();
    
    // Are we converging?
    const isConverging = currentError.lessThan(previousError);
    
    // Calculate alpha based on error magnitude
    let alpha: Decimal;
    if (currentError.lessThan(tolerance)) {
        alpha = new Decimal(1.0); // Converged
    } else {
        alpha = new Decimal(1).div(currentError.plus(1));
        if (!isConverging) {
            alpha = alpha.mul(0.5); // Penalty for divergence
        }
    }
    
    return alpha.toNumber();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Clamp a value to safe operating range
 */
export function clampToSafeRange(
    value: number,
    min: number,
    max: number,
    safetyMargin: number = 0.05
): number {
    const range = max - min;
    const safeMin = min + range * safetyMargin;
    const safeMax = max - range * safetyMargin;
    return Math.max(safeMin, Math.min(safeMax, value));
}

/**
 * Rate limiter for smooth transitions
 */
export function applyRateLimit(
    currentValue: number,
    targetValue: number,
    maxRate: number,
    dt: number
): number {
    const diff = targetValue - currentValue;
    const maxChange = maxRate * dt;
    
    if (Math.abs(diff) <= maxChange) {
        return targetValue;
    }
    
    return currentValue + Math.sign(diff) * maxChange;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class ControlMathService {
    static calculatePID = calculatePID;
    static calculateIncrementalPID = calculateIncrementalPID;
    static calculateGovernorControl = calculateGovernorControl;
    static calculateEmergencyGateClosure = calculateEmergencyGateClosure;
    static optimizeSetpointForBEP = optimizeSetpointForBEP;
    static calculateConvergenceAlpha = calculateConvergenceAlpha;
    static clampToSafeRange = clampToSafeRange;
    static applyRateLimit = applyRateLimit;
    static DEFAULT_GOVERNOR_PARAMS = DEFAULT_GOVERNOR_PARAMS;
}

export default ControlMathService;
