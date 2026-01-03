import { TechnicalProjectState, PhysicsResult, ENGINEERING_CONSTANTS } from '../models/TechnicalSchema';
import Decimal from 'decimal.js';

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
        const turbineType = identity.type;

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

        if (turbineType === 'Pelton') {
            // Pelton vibration is often impulse-driven (jet impact)
            adjustedVibX = vibX.mul(1.1); // Add impulsive safety factor
        } else if (turbineType === 'Kaplan') {
            // Kaplan vibration often related to blade tip cavitation/vortex
            adjustedVibY = vibY.mul(1.05);
        }

        const a = Decimal.max(adjustedVibX, adjustedVibY);
        const b = Decimal.min(adjustedVibX, adjustedVibY);
        const eccentricity = a.isZero() ? new Decimal(0) : Decimal.sqrt(new Decimal(1).sub(b.pow(2).div(a.pow(2))));

        // 7. Safety Status Assignment
        let status: 'NOMINAL' | 'WARNING' | 'CRITICAL' = 'NOMINAL';
        const hoopSF = new Decimal(penstock.materialYieldStrength).div(hoopStress.gt(0) ? hoopStress : 1);

        if (hoopSF.lt(1.5) || eccentricity.gt(0.85)) status = 'CRITICAL';
        else if (hoopSF.lt(2.0) || eccentricity.gt(0.75)) status = 'WARNING';

        return {
            hoopStress,
            powerMW,
            surgePressure: surgePressurePa.div(1e5), // Bar
            eccentricity,
            performanceDelta,
            status
        };
    },

    /**
     * Master recalibration including state synchronization.
     */
    recalculateProjectPhysics: (state: TechnicalProjectState): TechnicalProjectState => {
        const result = PhysicsEngine.recalculatePhysics(state);
        return {
            ...state,
            physics: {
                ...state.physics,
                hoopStressMPa: result.hoopStress.toNumber(),
                staticPressureBar: new Decimal(state.hydraulic.head).div(10).toNumber(),
                surgePressureBar: result.surgePressure.toNumber(),
                waterHammerPressureBar: result.surgePressure.toNumber(),
                eccentricity: result.eccentricity.toNumber(),
            },
            riskScore: result.status === 'CRITICAL' ? 100 : (result.status === 'WARNING' ? 50 : 0),
            lastRecalculation: new Date().toISOString(),
        };
    },

    calculateSpecificSpeed: (n: number, power: number, head: number): number => {
        const dH = new Decimal(head);
        if (dH.isZero()) return 0;
        return new Decimal(n).mul(new Decimal(power).sqrt()).div(dH.pow(1.25)).toDecimalPlaces(0).toNumber();
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
