import { BaseEngine } from './BaseEngine';
import { RecommendationResult, TurbineSpecs, TurbineType } from './types';
import Decimal from 'decimal.js';
import { calculatePeltonEfficiency } from './TurbineMath';

/**
 * THE IMPULSE ENGINE (PELTON)
 * High-Head Specialist
 */
export class PeltonEngine extends BaseEngine {
    type = 'pelton';

    /**
     * WHISPER: JET VELOCITY
     * Calculates the speed of the water bullet hitting the buckets.
     * v = sqrt(2 * g * H)
     * Theoretical max speed. Real speed is slightly less (Cv ~ 0.97-0.99)
     */
    calculateJetVelocity(netHead: number): number {
        // v = sqrt(2 * g * H)
        const g = this.G;
        const h = new Decimal(netHead);

        // v = sqrt(2 * 9.81 * H)
        const v = g.mul(2).mul(h).sqrt();

        return v.toDecimalPlaces(2).toNumber();
    }

    /**
     * MASTER SPEC: JET PRECISION SUITE
     * Checks if the jet is perfectly aligned with the splitter.
     * Tolerance: < 1.0 mm (Master Level)
     */
    checkJetAlignment(offsetMM: number): { safe: boolean; message: string } {
        if (Math.abs(offsetMM) > 1.0) {
            return {
                safe: false,
                message: `🚨 BEARING STRESS ALERT! Jet offset ${offsetMM}mm (>1.0mm). Result: Uneven bucket loading & potential bearing damage.`
            };
        }
        return { safe: true, message: '✅ Jet Alignment Perfect. Buckets loaded evenly.' };
    }

    /**
     * SAFETY: DEFLECTOR LOGIC (UPDATED: 1-SECOND GUARDIAN)
     * Rule: If Generator Trips -> Deflector MUST Cut Jet in < 1.0 seconds.
     * Also checks for minimal gap to ensure no interference.
     */
    checkDeflectorSafety(
        generatorTripped: boolean,
        deflectorStatus: 'ACTIVE' | 'PASSIVE',
        deflectorResponseTime: number, // seconds
        deflectorGapMM: number
    ): { safe: boolean; message: string } {
        if (!generatorTripped) {
            // Even in standby, ensure gap is sufficient
            if (deflectorGapMM < 5) {
                return { safe: false, message: `⚠️ SAFETY RISK: Deflector Gap ${deflectorGapMM}mm too small! Risk of accidental jet cutting.` };
            }
            return { safe: true, message: 'Normal Operation. Deflector standing by.' };
        }

        // Generator TRIPPED!
        if (deflectorStatus !== 'ACTIVE') {
            return {
                safe: false,
                message: '🚨 DANGER! Generator Tripped but Deflector is PASSIVE! Overspeed imminent!'
            };
        }

        if (deflectorResponseTime > 1.0) { // MASTER SPEC: 1.0s limit
            return {
                safe: false,
                message: `⚠️ WARNING! Deflector too slow (${deflectorResponseTime}s). Must be < 1.0s (Master Spec).`
            };
        }

        return {
            safe: true,
            message: '✅ SAFE. Deflector cut the jet successfully (<1s).'
        };
    }

    /**
     * MASTER SPEC: THE MECHANICAL PULSE
     * Monitors Run-out (Radial/Axial) and Shaft Bounce.
     */
    checkMechanicalHealth(
        runOutRadial: number,
        runOutAxial: number,
        shaftBounce: boolean
    ): { healthy: boolean; message: string } {
        const triggers = [];
        if (runOutRadial > 0.15) triggers.push(`Radial Run-out ${runOutRadial}mm (>0.15)`);
        if (runOutAxial > 0.20) triggers.push(`Axial Run-out ${runOutAxial}mm (>0.20)`);
        if (shaftBounce) triggers.push('Shaft Bounce Detected (Orbit Instability)');

        if (triggers.length > 0) {
            return { healthy: false, message: `⚠️ MECHANICAL PULSE ISSUE: ${triggers.join(', ')}` };
        }
        return { healthy: true, message: '✅ Mechanical Pulse Steady. Shaft orbiting perfectly.' };
    }

    /**
     * MASTER SPEC: WINDAGE MONITOR
     * Checks if housing pressure indicates poor venting.
     */
    checkHousingAeration(pressureBar: number): { efficient: boolean; message: string } {
        // Atmospheric is ~0 bar gauge. If > 0.05 bar (50 mbar), we have backpressure.
        // > 1.0 bar means SERIOUS problem (drowning)
        if (pressureBar > 1.0) {
            return { efficient: false, message: `⚠️ WINDAGE LOSS: Housing Pressure ${pressureBar} bar. Runner is drowning in mist! Check Air Valve.` };
        }
        return { efficient: true, message: '✅ Housing Aeration Normal. Runner spinning in free air.' };
    }

    /**
     * MASTER SPEC: MAGNETIC SYMMETRY
     * Checks alignment of Mechanical Center vs Magnetic Center.
     */
    checkMagneticCenter(mechanicalCenterZ: number, magneticCenterZ: number): { optimized: boolean; message: string } {
        const delta = Math.abs(mechanicalCenterZ - magneticCenterZ);
        if (delta > 2.0) {
            return { optimized: false, message: `⚠️ MAGNETIC IMBALANCE: Delta ${delta}mm. Rotor is fighting the magnetic field! Thrust bearing load increased.` };
        }
        return { optimized: true, message: '✅ Magnetic Symmetry Locked. Rotor floating naturally.' };
    }

    /**
     * SAFETY: BRAKE NOZZLE INTERLOCK
     * The Brake Nozzle (or 'Jet Brake') fires a reverse jet to stop the runner.
     * Rule: It MUST NOT fire if the main jet is driving the runner (Needle > 5%).
     */
    checkBrakeNozzleSafety(
        mainNeedleOpenPercent: number,
        brakeValveStatus: 'OPEN' | 'CLOSED',
        brakePressureBar: number
    ): { safe: boolean; message: string } {
        // Interlock: If Main Needle > 5%, Brake MUST be CLOSED
        if (mainNeedleOpenPercent > 5.0) {
            if (brakeValveStatus === 'OPEN') {
                return {
                    safe: false,
                    message: '🚨 CRITICAL SAFETY INTERLOCK: Brake Valve OPEN while Main Needle > 5%! Risk of Bucket Destruction!'
                };
            }

            // Check for passing valve (Pressure > 0.5 bar when closed)
            if (brakePressureBar > 0.5) {
                return {
                    safe: false,
                    message: `⚠️ LEAK DETECTED: Brake Line Pressure ${brakePressureBar} bar. Valve passing? We are losing kW!`
                };
            }
        }

        return { safe: true, message: '✅ Brake Operation Safe.' };
    }

    calculateEfficiency(head: number, flow: number, bucketHours = 0): number {
        // Use dynamic TurbineMath model to compute Pelton efficiency
        try {
            // dynamic model expects head (m) and flow (m3/s) and bucketHours
            const eff = calculatePeltonEfficiency(bucketHours, head, flow);
            return eff;
        } catch (e) {
            return 91.5;
        }
    }

    getRecommendationScore(
        head: number,
        flow: number,
        variation: string,
        quality: string,
        t: any
    ): RecommendationResult {
        // Pelton loves High Head (>50m, ideally >200m) and variable flow
        const reasons: string[] = [];

        if (head < 50) return { score: 0, reasons: ['Head too low for Pelton'] };

        // Excellent for high head
        if (head > 200) {
            return { score: 100, reasons: ['Perfect for High Head'] };
        }

        return { score: 85, reasons: ['Good candidate'] };
    }

    getToleranceThresholds(): Record<string, number> {
        return {};
    }

    /**
     * MASTER SPEC: LIFT-OFF GUARD (Anti-Levitation)
     * Calculates if the hydraulic uplift forces are overcoming gravity.
     * Dangerous for "One-Way" (Gravity Bonded) thrust bearings.
     */
    calculateAxialBalance(
        rotorWeightKg: number,
        upliftForceNewtons: number,
        isAxialSecure: boolean // True = Double Acting (Safe), False = Gravity Only (Risk)
    ): { safe: boolean; netForceN: number; message: string } {
        const gravityForceN = rotorWeightKg * 9.81; // Downward force
        const netForceN = gravityForceN - upliftForceNewtons; // Positive = Down, Negative = FLYING

        // Risk Threshold for Gravity Bearings: Uplift > 80% of Weight
        const upliftRatio = upliftForceNewtons / gravityForceN;

        if (!isAxialSecure && upliftRatio > 0.8) {
            return {
                safe: false,
                netForceN,
                message: `⚠️ LIFT-OFF ALERT: Uplift is ${upliftRatio.toFixed(2)}x of Rotor Weight! Gravity Bond failing. Risk of flight!`
            };
        }

        if (netForceN < 0) {
            return {
                safe: false,
                netForceN,
                message: `🚨 CRITICAL: NEGATIVE AXIAL FORCE (${netForceN.toFixed(0)} N). SHAFT IS LEVITATING! Thrust bearing unloaded.`
            };
        }

        return { safe: true, netForceN, message: `✅ Axial Balance Secure. Gravity holding strong (${upliftRatio.toFixed(2)}x uplift).` };
    }

    /**
     * MASTER SPEC: THE JUMP ALARM
     * Detects if the shaft has physically lifted off the pads.
     */
    checkAxialJump(
        displacementZ_mm: number // Positive = Down/Normal, Negative = UP
    ): { grounded: boolean; message: string } {
        // If displacement is negative (UP) by more than 0.5mm, we have jumped.
        if (displacementZ_mm < -0.5) {
            return {
                grounded: false,
                message: `🚨 CRITICAL: SHAFT JUMP DETECTED (${displacementZ_mm}mm). Rotor has lifted off the thrust pads!`
            };
        }
        return { grounded: true, message: '✅ Rotor Grounded. Resting on thrust pads.' };
    }

    generateSpecs(head: number, flow: number): TurbineSpecs {
        const specs: TurbineSpecs = {
            runnerType: 'Impulse',
            specificSpeed: 20, // Low specific speed
            type: 'pelton'
        };
        return specs;
    }

    /**
     * Get confidence score based on efficiency deviation from design
     * Pelton efficiency should be stable around 90-91%
     */
    public getConfidenceScore(head?: number, flow?: number, efficiency?: number): number {
        if (typeof efficiency !== 'number') return 50;
        
        // Pelton efficiency is typically 90-91% at design point
        const designEfficiency = 91.5;
        const efficiencyDeviation = Math.abs(efficiency - designEfficiency);
        
        // High confidence when efficiency is close to design
        let score = 100;
        if (efficiencyDeviation > 5) score -= 30; // >5% deviation
        else if (efficiencyDeviation > 2) score -= 15; // >2% deviation
        
        // Bonus if head and flow are within reasonable ranges
        if (typeof head === 'number' && head >= 100 && head <= 1000) score += 5;
        if (typeof flow === 'number' && flow > 0) score += 5;
        
        return Math.max(0, Math.min(100, Math.round(score)));
    }
}
