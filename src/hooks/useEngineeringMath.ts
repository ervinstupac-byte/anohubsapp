import { useMemo } from 'react';
import { useCerebro } from '../contexts/ProjectContext';
import Decimal from 'decimal.js';

/**
 * useEngineeringMath - The Neural Core's Math Engine
 * Centralized high-precision calculations for all CEREBRO components.
 */
export const useEngineeringMath = () => {
    const { state } = useCerebro();
    const { mechanical, hydraulic, physics, penstock, governor } = state;

    return useMemo(() => {
        const PI = Decimal.acos(-1);
        // --- ORBIT ANALYSIS ---
        const history = mechanical.vibrationHistory || [];

        let maxX = new Decimal(0);
        let maxY = new Decimal(0);
        let sumX = new Decimal(0);
        let sumY = new Decimal(0);

        history.forEach(p => {
            const px = new Decimal(p.x);
            const py = new Decimal(p.y);
            if (px.abs().greaterThan(maxX)) maxX = px.abs();
            if (py.abs().greaterThan(maxY)) maxY = py.abs();
            sumX = sumX.plus(px);
            sumY = sumY.plus(py);
        });

        const count = new Decimal(history.length || 1);
        const avgX = sumX.div(count);
        const avgY = sumY.div(count);

        const a_axis = maxX.greaterThan(maxY) ? maxX : maxY;
        const b_axis = maxX.greaterThan(maxY) ? maxY : maxX;

        // e = sqrt(1 - (b^2 / a^2))
        let eccentricity = new Decimal(0);
        if (a_axis.greaterThan(0)) {
            eccentricity = Decimal.sqrt(new Decimal(1).minus(b_axis.pow(2).div(a_axis.pow(2))));
        }

        const isElliptical = eccentricity.greaterThan(0.75);

        // --- ACOUSTIC-ORBIT FUSION (Directive 2) ---
        // Enhanced: If eccentricity > 0.8 AND (Cavitation > 7 OR Bearing Grind > 7)
        const metrics = mechanical.acousticMetrics || {
            cavitationIntensity: 0,
            ultrasonicLeakIndex: 0,
            bearingGrindIndex: 0,
            acousticBaselineMatch: 1.0
        };
        const isStructuralLoosenessConfirmed = eccentricity.greaterThan(0.8) &&
            (metrics.cavitationIntensity > 7 || metrics.bearingGrindIndex > 7);

        // --- CENTER MIGRATION ---
        let centerMigration = new Decimal(0);
        let migrationAngle = new Decimal(0);
        const baseline = mechanical.baselineOrbitCenter;

        if (baseline && history.length > 0) {
            const bX = new Decimal(baseline.x);
            const bY = new Decimal(baseline.y);

            const dx = avgX.minus(bX);
            const dy = avgY.minus(bY);

            centerMigration = Decimal.sqrt(dx.pow(2).plus(dy.pow(2)));
            // Angle in degrees
            migrationAngle = Decimal.atan2(dy, dx).mul(180).div(PI).plus(360).mod(360);
        }

        // --- WATER HAMMER (IEC 60041) ---
        // a = sqrt((K/rho) / (1 + (K/E) * (d/e)))
        const K = new Decimal(2.15e9); // Bulk modulus of water (Pa)
        const rho = new Decimal(1000); // Water density (kg/m3)
        const E = new Decimal(penstock.materialModulus).mul(1e9); // GPa to Pa
        const d_pipe = new Decimal(penstock.diameter);
        const e_wall = new Decimal(penstock.wallThickness || 0.01);

        // a = wave speed
        const waveSpeed = Decimal.sqrt(
            K.div(rho).div(new Decimal(1).plus(K.div(E).mul(d_pipe.div(e_wall))))
        );

        // Delta_V = change in velocity (assuming full rejection for worst case)
        // v = Q / (pi * (d/2)^2)
        const area = PI.mul(d_pipe.div(2).pow(2));
        const velocity = hydraulic.flowRate.div(area);

        // Pressure rise DeltaP = rho * a * v (Joukowsky)
        const deltaP_Pa = rho.mul(waveSpeed).mul(velocity);
        const deltaP_Bar = deltaP_Pa.div(100000);

        // --- BURST SAFETY FACTOR (Task 3) ---
        const yieldStrength = new Decimal(penstock.materialYieldStrength);
        const hoopStress = new Decimal(physics.hoopStressMPa || 1);
        const burstSafetyFactor = yieldStrength.div(hoopStress.greaterThan(0) ? hoopStress : new Decimal(1));

        let iecRecommendation = "IEC 60041: Operational parameters within design envelope.";
        if (burstSafetyFactor.lessThan(1.5)) {
            iecRecommendation = "🚨 IEC 60041 CRITICAL: Safety Factor below 1.5. Immediate pressure reduction or structural inspection required!";
        } else if (burstSafetyFactor.lessThan(2.0)) {
            iecRecommendation = "⚠️ IEC 60041 WARNING: SF < 2.0. Monitor transient pressure peaks closely.";
        }

        // --- GOVERNOR PID (CONVERGENCE ALPHA) ---
        const err = governor.setpoint.minus(governor.actualValue);
        const p_term = governor.kp.mul(err);
        const i_term = governor.ki.mul(governor.integralError);
        const d_term = governor.kd.mul(err.minus(governor.previousError));
        const controlSignal = p_term.plus(i_term).plus(d_term);

        // --- PERFORMANCE DELTA ---
        // Delta_Perf = ((Actual - Baseline) / Baseline) * 100
        let performanceDelta = new Decimal(0);
        const actualPower = new Decimal(physics.surgePressureBar); // Placeholder for actual power if not explicitly in state
        const baselinePower = hydraulic.baselineOutputMW || new Decimal(100);

        if (baselinePower.greaterThan(0)) {
            performanceDelta = actualPower.minus(baselinePower).div(baselinePower).mul(100);
        }

        // --- PEAK DISPLACEMENT ---
        let peakPoint = { x: 0, y: 0 };
        let maxD = new Decimal(0);
        history.forEach(p => {
            const dist = Decimal.sqrt(new Decimal(p.x).pow(2).plus(new Decimal(p.y).pow(2)));
            if (dist.greaterThan(maxD)) {
                maxD = dist;
                peakPoint = p;
            }
        });
        const peakAngle = Decimal.atan2(new Decimal(peakPoint.y).neg(), new Decimal(peakPoint.x)).mul(180).div(PI).plus(360).mod(360);

        return {
            thrust: {
                totalKN: deltaP_Bar.mul(1.5).mul(new Decimal(0.4).plus(new Decimal(state.hydraulic.flow > 40 ? 0.1 : 0))).toNumber(), // Simplified reactive model
                factor: new Decimal(0.94).minus(new Decimal(state.hydraulic.flow > 40 ? 0.05 : 0)).toNumber()
            },
            orbit: {
                eccentricity: eccentricity.toNumber(),
                isElliptical,
                isStructuralLoosenessConfirmed,
                peakAngle: peakAngle.toNumber(),
                centerMigration: centerMigration.toNumber(),
                migrationAngle: migrationAngle.toNumber(),
                currentCenter: { x: avgX.toNumber(), y: avgY.toNumber() },
                baselineCenter: baseline || null
            },
            waterHammer: {
                waveSpeed: waveSpeed.toNumber(),
                maxSurgeBar: deltaP_Bar.toNumber(),
                burstSafetyFactor: burstSafetyFactor.toNumber(),
                recommendation: iecRecommendation
            },
            governor: {
                error: err.toNumber(),
                controlSignal: controlSignal.toNumber()
            },
            performance: {
                delta: performanceDelta.toNumber(),
                hoopStress: physics.hoopStressMPa
            },
            vibration: {
                x: mechanical.vibrationX,
                y: mechanical.vibrationY,
                acousticNoise: metrics.cavitationIntensity
            }
        };
    }, [mechanical, hydraulic, physics, penstock, governor]);
};
