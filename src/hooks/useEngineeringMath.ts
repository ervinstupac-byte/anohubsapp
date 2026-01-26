import { useMemo } from 'react';
import Decimal from 'decimal.js';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { useAssetConfig } from '../contexts/AssetConfigContext';
import { DEFAULT_TECHNICAL_STATE } from '../core/TechnicalSchema';

/**
 * useEngineeringMath - The Neural Core's Math Engine
 * Centralized high-precision calculations for all CEREBRO components.
 * 
 * MIGRATION NOTE (Batch 2 Pattern):
 * Now uses specialized stores instead of monolithic ProjectContext:
 * - useTelemetryStore: Live sensor data (mechanical, hydraulic) + physics results
 * - useAssetConfig: Static asset configuration (identity, penstock specs)
 */
export const useEngineeringMath = () => {
    // NEW: Specialized stores for different concerns
    const telemetry = useTelemetryStore();
    const { config } = useAssetConfig();

    // Extract with null safety, falling back to defaults
    const mechanical = telemetry.mechanical ?? DEFAULT_TECHNICAL_STATE.mechanical;
    const hydraulic = telemetry.hydraulic ?? DEFAULT_TECHNICAL_STATE.hydraulic;
    const physics = telemetry.physics ?? {};
    const penstock = telemetry.penstock ?? DEFAULT_TECHNICAL_STATE.penstock;
    const governor = DEFAULT_TECHNICAL_STATE.governor; // Governor still from defaults for now
    const identity = telemetry.identity ?? DEFAULT_TECHNICAL_STATE.identity;

    return useMemo(() => {
        const PI = Decimal.acos(-1);
        const turbineType = identity?.turbineType || 'FRANCIS';

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
        // Enhanced: If eccentricity exceeds limit AND correlated acoustic signals are high
        const metrics = mechanical.acousticMetrics || {
            cavitationIntensity: 0,
            ultrasonicLeakIndex: 0,
            bearingGrindIndex: 0,
            acousticBaselineMatch: 1.0
        };

        // Contextual thresholding based on turbine type
        const eccentricityLimit = turbineType === 'PELTON' ? 0.82 : 0.78;
        const isStructuralLoosenessConfirmed = eccentricity.greaterThan(eccentricityLimit) &&
            (metrics.cavitationIntensity > 6 || metrics.bearingGrindIndex > 6);

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
        const K = new Decimal(2.15e9);
        const rho = new Decimal(1000);
        const E = new Decimal(penstock.materialModulus || 210).mul(1e9);
        const d_pipe = new Decimal(penstock.diameter || 1.0);
        const e_wall = new Decimal(penstock.wallThickness || 0.01);

        const waveSpeed = Decimal.sqrt(
            K.div(rho).div(new Decimal(1).plus(K.div(E).mul(d_pipe.div(e_wall))))
        );

        const area = PI.mul(d_pipe.div(2).pow(2));
        const velocity = new Decimal(hydraulic.flow).div(area);

        const deltaP_Pa = rho.mul(waveSpeed).mul(velocity);
        const deltaP_Bar = deltaP_Pa.div(100000);

        // --- BURST SAFETY FACTOR ---
        const yieldStrength = new Decimal(penstock.materialYieldStrength || 250);
        // physics.hoopStress is a Decimal from PhysicsResult; extract numeric value
        const hoopStressValue = physics.hoopStress?.toNumber?.() ?? 1;
        const hoopStressDecimal = new Decimal(hoopStressValue > 0 ? hoopStressValue : 1);
        const burstSafetyFactor = yieldStrength.div(hoopStressDecimal);

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
        let performanceDelta = new Decimal(0);
        // physics.surgePressure is a Decimal from PhysicsResult
        const actualPower = new Decimal(physics.surgePressure?.toNumber?.() ?? 0);
        const baselinePower = new Decimal(hydraulic.baselineOutputMW || 100);

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

        // --- THERMAL GROWTH COMPENSATION (NC-4.2) ---
        // Delta_L = alpha * L * Delta_T
        const alpha_steel = new Decimal(11.5e-6);
        const ambient = new Decimal(identity?.environmentalBaseline?.ambientTemperature || 22.5);
        const operatingTemp = new Decimal(60); // Target for compensation
        const shaftLengthProxy = new Decimal(identity?.machineConfig?.runnerDiameterMM || 1500).mul(1.5); // Estimate
        const thermalGrowthMM = alpha_steel.mul(shaftLengthProxy).mul(operatingTemp.minus(ambient));

        return {
            thrust: {
                totalKN: deltaP_Bar.mul(1.5).mul(new Decimal(0.4).plus(new Decimal(hydraulic.flow > 40 ? 0.1 : 0))).toNumber(),
                factor: new Decimal(0.94).minus(new Decimal(hydraulic.flow > 40 ? 0.05 : 0)).toNumber()
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
                hoopStress: hoopStressValue
            },
            vibration: {
                x: mechanical.vibrationX,
                y: mechanical.vibrationY,
                acousticNoise: metrics.cavitationIntensity
            },
            thermal: {
                growthMM: thermalGrowthMM.toNumber(),
                coefficient: alpha_steel.toNumber(),
                targetTemp: 60
            }
        };
    }, [mechanical, hydraulic, physics, penstock, governor, identity]);
};
