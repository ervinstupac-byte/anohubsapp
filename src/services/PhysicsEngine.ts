import { TechnicalProjectState, PhysicsResult, ENGINEERING_CONSTANTS } from '../models/TechnicalSchema';
import Decimal from 'decimal.js';
import { MarketPriceEngine } from './MarketPriceEngine';
import { ProfileLoader } from './ProfileLoader';
import { FinancialImpactEngine } from './FinancialImpactEngine';

// Configuration for HPP environment precision
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * PHYSICS ENGINE: NC-4.2 NEURAL CORE
 * Centralized high-precision engineering logic using decimal.js.
 * Standards: IEC 60041, Barlow's Formula.
 */
export const PhysicsEngine = {
    /**
     * CORE PHYSICS: Recalculates the entire project state based on technical streams.
     */
    recalculatePhysics: (state: TechnicalProjectState): PhysicsResult => {
        const { hydraulic, penstock, mechanical, identity } = state;
        const turbineType = identity.turbineType;

        // High-Precision Decimal conversions
        const head = new Decimal(hydraulic.head);
        const flow = new Decimal(hydraulic.flow);
        const d = new Decimal(penstock.diameter);
        const t = new Decimal(penstock.wallThickness);
        const E = new Decimal(penstock.materialModulus).mul(1e9); // GPa to Pa
        const waterDensity = new Decimal(ENGINEERING_CONSTANTS.physics.waterDensity);
        const gravity = new Decimal(ENGINEERING_CONSTANTS.physics.gravity);
        const baselinePower = hydraulic.baselineOutputMW || new Decimal(100); // Default placeholder

        // 1. Flow Velocity (v = Q / A)
        const radius = d.div(2);
        const area = radius.pow(2).mul(Decimal.acos(-1));
        const velocity = flow.div(area);

        // 2. Wave Velocity & Surge (Joukowsky Equation)
        const pressureWaveVelocity = calculateWaveVelocity(d, t, E);
        const surgePressurePa = waterDensity.mul(pressureWaveVelocity).mul(velocity);

        // 3. Hoop Stress (Barlow's Formula)
        const staticPressurePa = waterDensity.mul(gravity).mul(head);
        const totalPressurePa = staticPressurePa.plus(surgePressurePa);
        const hoopStress = totalPressurePa.mul(d).div(t.mul(2)).div(1e6); // MPa

        // 4. Power Output (P = rho * g * H * Q * eta)
        const normalizedEfficiency = new Decimal(hydraulic.efficiency).gt(1)
            ? new Decimal(hydraulic.efficiency).div(100)
            : new Decimal(hydraulic.efficiency);
        const powerWatts = waterDensity.mul(gravity).mul(head).mul(flow).mul(normalizedEfficiency);
        const powerMW = powerWatts.div(1e6);

        // 5. Performance Delta (Delta_Perf = ((Actual - Baseline) / Baseline) * 100)
        const performanceDelta = powerMW.sub(baselinePower).div(baselinePower).mul(100);

        // 6. Orbit Eccentricity (e = sqrt(1 - (b^2 / a^2)))
        const vibX = new Decimal(mechanical.vibrationX || 0).abs();
        const vibY = new Decimal(mechanical.vibrationY || 0).abs();

        // --- HYBRID PHYSICS ADAPTATION (NC-4.2 Directive) ---
        // Pelton machines have different vibration signatures than Francis/Kaplan
        let adjustedVibX = vibX;
        let adjustedVibY = vibY;

        if (turbineType === 'PELTON') {
            // Pelton vibration is often impulse-driven (jet impact)
            adjustedVibX = vibX.mul(1.1); // Add impulsive safety factor
        } else if (turbineType === 'KAPLAN') {
            // Kaplan vibration often related to blade tip cavitation/vortex
            adjustedVibY = vibY.mul(1.05);
        }

        const a = Decimal.max(adjustedVibX, adjustedVibY);
        const b = Decimal.min(adjustedVibX, adjustedVibY);
        const eccentricity = a.isZero() ? new Decimal(0) : Decimal.sqrt(new Decimal(1).sub(b.pow(2).div(a.pow(2))));

        // 7. Safety Status Assignment
        let status: 'NOMINAL' | 'WARNING' | 'CRITICAL' = 'NOMINAL';
        const hoopSF = new Decimal(penstock.materialYieldStrength).div(hoopStress.gt(0) ? hoopStress : 1);

        const powerKW = powerMW.mul(1000);
        const specificWaterConsumption = powerKW.isZero() ? new Decimal(0) : flow.mul(3600).div(powerKW);

        const designPower = new Decimal(state.site.designPerformanceMW || 5.0);
        const performanceGap = designPower.isZero() ? new Decimal(100) : powerMW.div(designPower).mul(100);

        // 9. Leakage Status Flag
        const designFlow = new Decimal(state.site.designFlow || 3.0);
        const designSWC = designFlow.mul(3600).div(designPower.mul(1000));
        let leakageStatus: 'NOMINAL' | 'DEGRADING' | 'CRITICAL' = 'NOMINAL';

        const axialThrustKN = PhysicsEngine.calculateAxialThrust(state);

        // --- DYNAMIC PLUGIN FORMULAS (NC-4.2) ---
        let volumetricLoss = new Decimal(0);
        const profile = ProfileLoader.getProfile(turbineType);
        if (profile?.math.formulas.calculateVolumetricLoss) {
            volumetricLoss = new Decimal(profile.math.formulas.calculateVolumetricLoss(state, profile.math.constants));
        }

        if (specificWaterConsumption.gt(designSWC.mul(1.10))) leakageStatus = 'CRITICAL';
        else if (specificWaterConsumption.gt(designSWC.mul(1.03))) leakageStatus = 'DEGRADING';

        if (hoopSF.lt(1.5) || eccentricity.gt(0.85) || axialThrustKN.gt(250) || leakageStatus === 'CRITICAL') status = 'CRITICAL';
        else if (hoopSF.lt(2.0) || eccentricity.gt(0.75) || axialThrustKN.gt(180) || leakageStatus === 'DEGRADING') status = 'WARNING';

        return {
            hoopStress,
            powerMW,
            surgePressure: surgePressurePa.div(1e5), // Bar
            eccentricity,
            performanceDelta,
            axialThrustKN,
            specificWaterConsumption,
            performanceGap,
            status,
            volumetricLoss
        };
    },

    /**
     * AXIAL THRUST PHYSICS
     * Delegate to Plugin if available.
     */
    calculateAxialThrust: (state: TechnicalProjectState): Decimal => {
        const profile = ProfileLoader.getProfile(state.identity.turbineType);
        if (profile?.math.formulas.calculateAxialThrust) {
            return new Decimal(profile.math.formulas.calculateAxialThrust(state, profile.math.constants));
        }
        return new Decimal(0);
    },

    /**
     * Master recalibration including state synchronization.
     */
    recalculateProjectPhysics: (state: TechnicalProjectState): TechnicalProjectState => {
        const result = PhysicsEngine.recalculatePhysics(state);
        const newState = {
            ...state,
            physics: {
                ...state.physics,
                hoopStressMPa: result.hoopStress.toNumber(),
                staticPressureBar: new Decimal(state.hydraulic.head).div(10).toNumber(),
                surgePressureBar: result.surgePressure.toNumber(),
                waterHammerPressureBar: result.surgePressure.toNumber(),
                eccentricity: result.eccentricity.toNumber(),
                axialThrustKN: result.axialThrustKN ? result.axialThrustKN.toNumber() : 0,
                specificWaterConsumption: result.specificWaterConsumption.toNumber(),
                leakageStatus: (result as any).leakageStatus || 'NOMINAL',
                volumetricLoss: result.volumetricLoss ? result.volumetricLoss.toNumber() : 0
            },
            riskScore: result.status === 'CRITICAL' ? 100 : (result.status === 'WARNING' ? 50 : 0),
            lastRecalculation: new Date().toISOString(),
        };

        // 7. Structural & Market Logic (NC-4.2 Expansion)
        const structural = PhysicsEngine.calculateStructuralLife(newState, result);
        const market = MarketPriceEngine.calculateMarketMetrics(newState);

        // Update State with new indices
        const finalState = {
            ...newState,
            structural,
            market,
            financials: FinancialImpactEngine.calculateImpact(newState, result)
        };

        return finalState;
    },

    calculateStructuralLife: (state: TechnicalProjectState, physics: PhysicsResult) => {
        let { wearIndex, remainingLife, fatigueCycles } = state.structural;

        // Grid Stress Factor (NC-4.2 Synthesis)
        const gridStressFactor = PhysicsEngine.calculateGridStress(state);

        // Fatigue Accumulator Logic
        // Increment cycles if transient events are active
        if (state.demoMode.active) {
            let cycleIncrement = 0;
            if (state.demoMode.scenario === 'WATER_HAMMER') {
                cycleIncrement = 25; // Massive shock
                wearIndex += 0.05 * gridStressFactor;
            } else if (state.demoMode.scenario === 'GRID_LOSS') {
                cycleIncrement = 10; // RPM overshoot stress
                wearIndex += 0.02 * gridStressFactor;
            }
            fatigueCycles += cycleIncrement;
        }

        // Mechanical wear from vibration (also affected by Grid Stability Stress)
        const vibFactor = physics.eccentricity.toNumber() * 0.01 * gridStressFactor;
        wearIndex += vibFactor;

        // Calculate remaining life (%)
        remainingLife = Math.max(0, 100 - (wearIndex));

        return { wearIndex, remainingLife, fatigueCycles };
    },

    /**
     * GRID STABILITY STRESS ENGINE
     * Accelerates wear based on frequency deviation stabilization effort.
     */
    calculateGridStress: (state: TechnicalProjectState): number => {
        const freq = state.specializedState?.sensors?.gridFrequency || 50.0;
        const deltaF = Math.abs(50.0 - freq);

        // If deltaF > 0.1, the governor is working hard to stabilize
        // We multiply wear by up to 1.5x during high-stress stabilization
        if (deltaF > 0.1) {
            return 1.0 + Math.min(0.5, (deltaF - 0.1) * 2); // 1.0 to 1.5x scaling
        }

        return 1.0; // Nominal
    },


    calculateSpecificSpeed: (n: number, power: number, head: number): number => {
        const dH = new Decimal(head);
        if (dH.isZero()) return 0;
        return new Decimal(n).mul(new Decimal(power).sqrt()).div(dH.pow(1.25)).toDecimalPlaces(0).toNumber();
    },

    // --- EXPERT DIAGNOSTIC THRESHOLDS (ISO & INDUSTRIAL STANDARDS) ---

    /**
     * ISO 10816-3 Vibration Severity (Group 3: Large machines < 15MW)
     */
    getVibrationVerdict: (velocityMMs: number): 'Good' | 'Satisfactory' | 'Unsatisfactory' | 'Unacceptable' => {
        if (velocityMMs < 1.1) return 'Good';
        if (velocityMMs < 2.8) return 'Satisfactory';
        if (velocityMMs < 4.5) return 'Unsatisfactory';
        return 'Unacceptable';
    },

    /**
     * Bearing Temperature Thresholds
     */
    getBearingTempVerdict: (tempC: number): 'Normal' | 'Warning' | 'Critical' => {
        if (tempC < 65) return 'Normal';
        if (tempC < 80) return 'Warning';
        return 'Critical';
    },

    /**
     * Insulation Resistance (Megger Standard: 1M Ohm per 1kV + 1)
     */
    getInsulationVerdict: (resistanceMOhm: number, ratedVoltageKV: number = 0.4): 'Healthy' | 'Degraded' | 'Critical' => {
        const minAcceptable = ratedVoltageKV + 1;
        if (resistanceMOhm > 100) return 'Healthy';
        if (resistanceMOhm > minAcceptable) return 'Degraded';
        return 'Critical';
    },

    /**
     * Axial Play (Standard for Francis < 5MW)
     */
    getAxialPlayVerdict: (playMM: number): 'Nominal' | 'Warning' | 'Critical' => {
        if (playMM < 0.25) return 'Nominal';
        if (playMM < 0.50) return 'Warning';
        return 'Critical';
    },

    /**
     * MAINTENANCE URGENCY LEVEL (1-5)
     * 1: Nominal, 5: Immediate Intervention Required
     */
    calculateMaintenanceUrgency: (state: TechnicalProjectState): number => {
        let score = 1;
        const mech = state.mechanical;

        // Vibration Impact
        const vibVerdict = PhysicsEngine.getVibrationVerdict(mech.vibration);
        if (vibVerdict === 'Unacceptable') score = Math.max(score, 5);
        else if (vibVerdict === 'Unsatisfactory') score = Math.max(score, 4);
        else if (vibVerdict === 'Satisfactory') score = Math.max(score, 2);

        // Temperature Impact
        const tempVerdict = PhysicsEngine.getBearingTempVerdict(mech.bearingTemp);
        if (tempVerdict === 'Critical') score = Math.max(score, 5);
        else if (tempVerdict === 'Warning') score = Math.max(score, 3);

        // Insulation Impact
        const insVerdict = PhysicsEngine.getInsulationVerdict(mech.insulationResistance || 500);
        if (insVerdict === 'Critical') score = Math.max(score, 5);
        else if (insVerdict === 'Degraded') score = Math.max(score, 3);

        // Operational History Stress
        const hours = state.identity.hoursSinceLastOverhaul || 0;
        if (hours > 20000) score = Math.max(score, 4); // Major service past due
        else if (hours > 15000) score = Math.max(score, 3);

        const starts = state.identity.startStopCount || 0;
        if (starts > 500) score = Math.max(score, 3); // High cycling stress

        return score;
    }
};

/**
 * Pomoćna funkcija za brzinu zvučnog vala u elastičnom cjevovodu
 */
function calculateWaveVelocity(d: Decimal, t: Decimal, E: Decimal): Decimal {
    const K = new Decimal(2.15e9); // Bulk modulus vode (Pa)
    const rho = new Decimal(1000);
    const elasticFactor = K.div(E).mul(d.div(t));
    return K.div(rho).div(new Decimal(1).plus(elasticFactor)).squareRoot();
}
