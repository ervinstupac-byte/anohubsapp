import { TechnicalProjectState, PhysicsResult, ENGINEERING_CONSTANTS } from '../../models/TechnicalSchema';
import Decimal from 'decimal.js';
import * as PhysicsLogic from './PhysicsCalculations.logic';
import masterKnowledge from '../../knowledge/MasterKnowledgeMap.json';
import { MarketPriceEngine } from '../../services/MarketPriceEngine';
import { ProfileLoader } from '../../services/ProfileLoader';
import { FinancialImpactEngine } from '../../services/FinancialImpactEngine';
import { SYSTEM_CONSTANTS } from '../../config/SystemConstants';
import { ASSET_THRESHOLDS } from '../../config/AssetThresholds';

// Configuration for HPP environment precision
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export type RiskStatus = 'NOMINAL' | 'WARNING' | 'CRITICAL';
export type LeakageStatus = 'NOMINAL' | 'DEGRADING' | 'CRITICAL';

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
        const baselinePower = hydraulic.baselineOutputMW || new Decimal(100); // Default placeholder

        // 1. Flow Velocity (v = Q / A)
        const velocity = PhysicsLogic.calculateFlowVelocity(flow, d);

        // 2. Wave Velocity & Surge (Joukowsky Equation)
        const pressureWaveVelocity = PhysicsLogic.calculateWaveVelocity(d, t, E);
        const surgePressurePa = PhysicsLogic.calculateSurgePressure(pressureWaveVelocity, velocity);

        // 3. Friction & Net Head (Swamee-Jain)
        const ROUGHNESS_MAP: Record<string, number> = {
            'STEEL': 0.045,
            'GRP': 0.01,
            'PEHD': 0.005,
            'CONCRETE': 1.5
        };
        const roughnessMM = new Decimal(ROUGHNESS_MAP[penstock.material] || 0.045);
        const Re = PhysicsLogic.calculateReynoldsNumber(velocity, d);
        const f = PhysicsLogic.calculateFrictionFactor(Re, roughnessMM, d);
        const headLoss = PhysicsLogic.calculateHeadLoss(f, new Decimal(penstock.length), d, velocity);
        const netHead = Decimal.max(0, head.sub(headLoss));

        // 4. Hoop Stress (Barlow's Formula) - Uses Total Pressure (Static + Surge)
        const hoopStress = PhysicsLogic.calculateHoopStress(head, surgePressurePa, d, t);

        // 5. Power Output (P = rho * g * H_net * Q * eta)
        const powerMW = PhysicsLogic.calculatePowerMW(netHead, flow, new Decimal(hydraulic.efficiency));

        // 5. Performance Delta (Delta_Perf = ((Actual - Baseline) / Baseline) * 100)
        const performanceDelta = powerMW.sub(baselinePower).div(baselinePower).mul(100);

        // 6. Orbit Eccentricity (e = sqrt(1 - (b^2 / a^2)))
        const vibX = new Decimal(mechanical.vibrationX || 0);
        const vibY = new Decimal(mechanical.vibrationY || 0);

        const eccentricity = PhysicsLogic.calculateEccentricity(vibX, vibY, turbineType || 'FRANCIS');

        // 7. Bolt Integrity (Axial Mechanical Safety)
        const BOLT_YIELD_MAP: Record<string, number> = {
            '4.6': 240, '5.6': 300, '8.8': 640, '10.9': 940, '12.9': 1080
        };
        const yieldMPa = new Decimal(BOLT_YIELD_MAP[mechanical.boltSpecs.grade] || 640);
        const boltD = new Decimal(mechanical.boltSpecs.diameter || 36); // Base M36
        const boltCount = mechanical.boltSpecs.count || 12;

        const rho = new Decimal(SYSTEM_CONSTANTS.PHYSICS.WATER.DENSITY);
        const gravity = new Decimal(SYSTEM_CONSTANTS.PHYSICS.GRAVITY);
        const staticPressurePa = rho.mul(gravity).mul(head);
        const totalPressurePa = staticPressurePa.plus(surgePressurePa);

        const runnerD = new Decimal(identity.machineConfig?.runnerDiameterMM || 1500);

        const boltLoadKN = PhysicsLogic.calculateBoltLoadKN(totalPressurePa, runnerD, boltCount);
        const boltCapacityKN = PhysicsLogic.calculateBoltCapacityKN(boltD, yieldMPa);
        const boltSafetyFactor = boltCapacityKN.div(boltLoadKN.gt(0) ? boltLoadKN : 1);
        let status: RiskStatus = 'NOMINAL';
        const hoopSF = new Decimal(penstock.materialYieldStrength).div(hoopStress.gt(0) ? hoopStress : 1);

        const powerKW = powerMW.mul(1000);
        const specificWaterConsumption = powerKW.isZero() ? new Decimal(0) : flow.mul(3600).div(powerKW);

        const designPower = new Decimal(state.site.designPerformanceMW || 5.0);
        const performanceGap = designPower.isZero() ? new Decimal(100) : powerMW.div(designPower).mul(100);

        // 9. Leakage Status Flag
        const designFlow = new Decimal(state.site.designFlow || 3.0);
        const designSWC = designFlow.mul(3600).div(designPower.mul(1000));
        let leakageStatus: LeakageStatus = 'NOMINAL';

        const axialThrustKN = PhysicsEngine.calculateAxialThrust(state);

        // --- DYNAMIC PLUGIN FORMULAS (NC-4.2) ---
        let volumetricLoss = new Decimal(0);
        const profile = ProfileLoader.getProfile(turbineType);
        if (profile?.math.formulas.calculateVolumetricLoss) {
            volumetricLoss = new Decimal(profile.math.formulas.calculateVolumetricLoss(state, profile.math.constants));
        }

        if (specificWaterConsumption.gt(designSWC.mul(SYSTEM_CONSTANTS.THRESHOLDS.LEAKAGE.CRITICAL_MULTIPLIER))) leakageStatus = 'CRITICAL';
        else if (specificWaterConsumption.gt(designSWC.mul(SYSTEM_CONSTANTS.THRESHOLDS.LEAKAGE.DEGRADING_MULTIPLIER))) leakageStatus = 'DEGRADING';

        if (hoopSF.lt(SYSTEM_CONSTANTS.THRESHOLDS.SAFETY_FACTOR.CRITICAL) || eccentricity.gt(SYSTEM_CONSTANTS.THRESHOLDS.ECCENTRICITY.CRITICAL) || axialThrustKN.gt(SYSTEM_CONSTANTS.THRESHOLDS.AXIAL_THRUST.CRITICAL_KN) || leakageStatus === 'CRITICAL') status = 'CRITICAL';
        else if (hoopSF.lt(SYSTEM_CONSTANTS.THRESHOLDS.SAFETY_FACTOR.WARNING) || eccentricity.gt(SYSTEM_CONSTANTS.THRESHOLDS.ECCENTRICITY.WARNING) || axialThrustKN.gt(SYSTEM_CONSTANTS.THRESHOLDS.AXIAL_THRUST.WARNING_KN) || leakageStatus === 'DEGRADING') status = 'WARNING';

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
            volumetricLoss,
            netHead,
            headLoss,
            boltLoadKN,
            boltCapacityKN,
            boltSafetyFactor
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

        const designPower = new Decimal(state.site.designPerformanceMW || 5.0);
        const designFlow = new Decimal(state.site.designFlow || 3.0);
        const designSWC = designFlow.mul(3600).div(designPower.mul(1000));
        let leakageStatus: LeakageStatus = 'NOMINAL';
        if (result.specificWaterConsumption.gt(designSWC.mul(SYSTEM_CONSTANTS.THRESHOLDS.LEAKAGE.CRITICAL_MULTIPLIER))) leakageStatus = 'CRITICAL';
        else if (result.specificWaterConsumption.gt(designSWC.mul(SYSTEM_CONSTANTS.THRESHOLDS.LEAKAGE.DEGRADING_MULTIPLIER))) leakageStatus = 'DEGRADING';

        const newState: TechnicalProjectState = {
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
                leakageStatus: leakageStatus,
                volumetricLoss: result.volumetricLoss ? result.volumetricLoss.toNumber() : 0,
                netHead: result.netHead ? result.netHead.toNumber() : 0,
                headLoss: result.headLoss ? result.headLoss.toNumber() : 0,
                boltLoadKN: result.boltLoadKN ? result.boltLoadKN.toNumber() : 0,
                boltCapacityKN: result.boltCapacityKN ? result.boltCapacityKN.toNumber() : 0,
                boltSafetyFactor: result.boltSafetyFactor ? result.boltSafetyFactor.toNumber() : 0
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
            structural: {
                ...newState.structural,
                ...structural
            },
            market,
            financials: FinancialImpactEngine.calculateImpact(newState, result)
        };

        return finalState;
    },

    calculateStructuralLife: (state: TechnicalProjectState, physics: PhysicsResult) => {
        let { wearIndex, fatigueCycles } = state.structural;

        // Grid Stress Factor (NC-4.2 Synthesis)
        const gridStressFactor = PhysicsEngine.calculateGridStress(state);

        // Fatigue Accumulator Logic
        if (state.demoMode.active) {
            let cycleIncrement = 0;
            if (state.demoMode.scenario === 'WATER_HAMMER') {
                cycleIncrement = ASSET_THRESHOLDS.structural.fatigue.water_hammer_cycle_increment;
                wearIndex += ASSET_THRESHOLDS.structural.fatigue.water_hammer_wear_multiplier * gridStressFactor;
            } else if (state.demoMode.scenario === 'GRID_LOSS') {
                cycleIncrement = ASSET_THRESHOLDS.structural.fatigue.grid_loss_cycle_increment;
                wearIndex += ASSET_THRESHOLDS.structural.fatigue.grid_loss_wear_multiplier * gridStressFactor;
            }
            fatigueCycles += cycleIncrement;
        }

        // 1. DYNAMIC RISK FACTOR (The 48% Rule)
        // High-precision forensic: Fatigue ~ (Intensity / 0.48)^3
        const goldenVib = SYSTEM_CONSTANTS.THRESHOLDS.VIBRATION_ISO_10816.GOOD_MAX; // Golden "Good" limit
        const intensity = state.mechanical.vibration / goldenVib;
        const drfRule = SYSTEM_CONSTANTS.DURABILITY.DRF_RULE_PERCENT;
        const drf = intensity > drfRule ? Math.pow(intensity / drfRule, 3) * (drfRule * 100) : intensity * (drfRule * 100);
        const normalizedDRF = Math.min(100, drf);

        // 2. LONGEVITY LEAK (Years lost of 50-year horizon)
        // If DRF is 100%, we are losing life at a rate that prevents a 50-year target.
        const idealYearlyWear = ASSET_THRESHOLDS.structural.life.yearly_wear_baseline_percent; // 2% per year for 50 years
        const actualYearlyWear = idealYearlyWear * (1 + (normalizedDRF / 100) * (ASSET_THRESHOLDS.structural.life.max_wear_multiplier - 1)); // Up to 5x faster wear
        const longevityLeak = (actualYearlyWear - idealYearlyWear); // Extra wear % per year

        // 3. HERITAGE TRIBOLOGY PENALTY (NC-4.2)
        // Exponential chemical erosion due to acid/water
        const fluid = state.identity.fluidIntelligence.oilSystem;
        const waterPenalty = (fluid.waterContentPPM || 0) > SYSTEM_CONSTANTS.DURABILITY.LIMITS.WATER_CONTENT_PPM ? SYSTEM_CONSTANTS.DURABILITY.PENALTIES.WATER_CONTENT_YEARS : 0; // 3.5 years lost
        const tanPenalty = (fluid.tan || 0) > SYSTEM_CONSTANTS.DURABILITY.LIMITS.TAN ? SYSTEM_CONSTANTS.DURABILITY.PENALTIES.TAN_YEARS : 0;               // 2.5 years lost
        const heritagePenaltyTotal = waterPenalty + tanPenalty;

        // Update Cumulative Wear
        wearIndex += (actualYearlyWear / (365 * 24)); // Fractional wear for this calculation tick

        const remainingLife = Math.max(0, 100 - wearIndex);

        return {
            wearIndex,
            remainingLife,
            fatigueCycles,
            drf: normalizedDRF,
            longevityLeak: ((longevityLeak * 50 / 2) + heritagePenaltyTotal).toFixed(1) // Total Years lost
        };
    },

    /**
     * GRID STABILITY STRESS ENGINE
     * Accelerates wear based on frequency deviation stabilization effort.
     */
    calculateGridStress: (state: TechnicalProjectState): number => {
        const freq = state.specializedState?.sensors?.gridFrequency || SYSTEM_CONSTANTS.PHYSICS.GRID.NOMINAL_FREQUENCY;
        return PhysicsLogic.calculateGridStressFactor(freq);
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
        if (velocityMMs < ASSET_THRESHOLDS.vibration.iso10816.good_max) return 'Good';
        if (velocityMMs < ASSET_THRESHOLDS.vibration.iso10816.satisfactory_max) return 'Satisfactory';
        if (velocityMMs < ASSET_THRESHOLDS.vibration.iso10816.unsatisfactory_max) return 'Unsatisfactory';
        return 'Unacceptable';
    },

    /**
     * Bearing Temperature Thresholds
     */
    getBearingTempVerdict: (tempC: number): 'Normal' | 'Warning' | 'Critical' => {
        if (tempC < ASSET_THRESHOLDS.bearing.temperature.normal_max) return 'Normal';
        if (tempC < ASSET_THRESHOLDS.bearing.temperature.warning_max) return 'Warning';
        return 'Critical';
    },

    /**
     * Insulation Resistance (Megger Standard: 1M Ohm per 1kV + 1)
     */
    getInsulationVerdict: (resistanceMOhm: number, ratedVoltageKV: number = 0.4): 'Healthy' | 'Degraded' | 'Critical' => {
        const goldenInsulation = ASSET_THRESHOLDS.insulation.megger.golden_standard_min;

        if (resistanceMOhm >= goldenInsulation) return 'Healthy';
        const minAcceptable = ratedVoltageKV + 1;
        if (resistanceMOhm > minAcceptable) return 'Degraded';
        return 'Critical';
    },

    /**
     * Axial Play (Standard for Francis < 5MW)
     */
    getAxialPlayVerdict: (playMM: number): 'Nominal' | 'Warning' | 'Critical' => {
        const standards = (masterKnowledge as any).standardThresholds;
        const maxAxial = standards.goldenStandards.axialPlay.max;

        if (playMM <= maxAxial * ASSET_THRESHOLDS.axial.play.nominal_max_factor) return 'Nominal';
        if (playMM < maxAxial * ASSET_THRESHOLDS.axial.play.warning_max_factor) return 'Warning';
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
        if (vibVerdict === 'Unacceptable') score = Math.max(score, ASSET_THRESHOLDS.maintenance.urgency.vibration_unacceptable_score);
        else if (vibVerdict === 'Unsatisfactory') score = Math.max(score, ASSET_THRESHOLDS.maintenance.urgency.vibration_unsatisfactory_score);
        else if (vibVerdict === 'Satisfactory') score = Math.max(score, ASSET_THRESHOLDS.maintenance.urgency.vibration_satisfactory_score);

        // Temperature Impact
        const tempVerdict = PhysicsEngine.getBearingTempVerdict(mech.bearingTemp);
        if (tempVerdict === 'Critical') score = Math.max(score, ASSET_THRESHOLDS.maintenance.urgency.temperature_critical_score);
        else if (tempVerdict === 'Warning') score = Math.max(score, ASSET_THRESHOLDS.maintenance.urgency.temperature_warning_score);

        // Insulation Impact
        const insVerdict = PhysicsEngine.getInsulationVerdict(mech.insulationResistance || 500);
        if (insVerdict === 'Critical') score = Math.max(score, ASSET_THRESHOLDS.maintenance.urgency.insulation_critical_score);
        else if (insVerdict === 'Degraded') score = Math.max(score, ASSET_THRESHOLDS.maintenance.urgency.insulation_degraded_score);

        // Operational History Stress
        const hours = state.identity.hoursSinceLastOverhaul || 0;
        if (hours > SYSTEM_CONSTANTS.DURABILITY.LIMITS.HOURS_OVERDUE_MAJOR) score = Math.max(score, ASSET_THRESHOLDS.maintenance.urgency.hours_major_overdue_score); // Major service past due
        else if (hours > SYSTEM_CONSTANTS.DURABILITY.LIMITS.HOURS_OVERDUE_MINOR) score = Math.max(score, ASSET_THRESHOLDS.maintenance.urgency.hours_minor_overdue_score);

        const starts = state.identity.startStopCount || 0;
        if (starts > SYSTEM_CONSTANTS.DURABILITY.LIMITS.START_STOP_HIGH_STRESS) score = Math.max(score, ASSET_THRESHOLDS.maintenance.urgency.start_stop_high_stress_score); // High cycling stress

        return score;
    },
};


