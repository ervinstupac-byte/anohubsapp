import { BaseEngine } from './BaseEngine';
import { RecommendationResult, TurbineSpecs, TurbineType } from './types';
import { Diagnostic, makeDiagnostic } from './schemas';
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
  checkJetAlignment(offsetMM: number): Diagnostic {
    const severity = Math.abs(offsetMM) > 1.0 ? 'CRITICAL' : 'INFO';
    return makeDiagnostic({
      code: 'JET_ALIGNMENT',
      severity,
      params: { offsetMM },
    });
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
  ): Diagnostic {
    if (!generatorTripped) {
      if (deflectorGapMM < 5) {
        return makeDiagnostic({
          code: 'DEFLECTOR_GAP_TOO_SMALL',
          severity: 'WARNING',
          params: { gapMM: deflectorGapMM },
        });
      }
      return makeDiagnostic({
        code: 'DEFLECTOR_OK',
        severity: 'INFO',
        params: { gapMM: deflectorGapMM },
      });
    }

    if (deflectorStatus !== 'ACTIVE') {
      return makeDiagnostic({ code: 'DEFLECTOR_INACTIVE_ON_TRIP', severity: 'CRITICAL' });
    }

    if (deflectorResponseTime > 1.0) {
      return makeDiagnostic({
        code: 'DEFLECTOR_SLOW_RESPONSE',
        severity: 'WARNING',
        params: { responseTime: deflectorResponseTime },
      });
    }

    return makeDiagnostic({
      code: 'DEFLECTOR_OK',
      severity: 'INFO',
      params: { responseTime: deflectorResponseTime },
    });
  }

  /**
   * MASTER SPEC: THE MECHANICAL PULSE
   * Monitors Run-out (Radial/Axial) and Shaft Bounce.
   */
  checkMechanicalHealth(
    runOutRadial: number,
    runOutAxial: number,
    shaftBounce: boolean
  ): Diagnostic {
    const triggers: string[] = [];
    if (runOutRadial > 0.15) triggers.push(`radial:${runOutRadial}`);
    if (runOutAxial > 0.2) triggers.push(`axial:${runOutAxial}`);
    if (shaftBounce) triggers.push('shaftBounce');

    if (triggers.length > 0) {
      return makeDiagnostic({
        code: 'MECHANICAL_PULSE_ISSUE',
        severity: 'WARNING',
        params: { detail: triggers.join(',') },
      });
    }
    return makeDiagnostic({ code: 'MECHANICAL_OK', severity: 'INFO' });
  }

  /**
   * MASTER SPEC: WINDAGE MONITOR
   * Checks if housing pressure indicates poor venting.
   */
  checkHousingAeration(pressureBar: number): Diagnostic {
    if (pressureBar > 1.0) {
      return makeDiagnostic({
        code: 'HOUSING_AERATION_HIGH',
        severity: 'CRITICAL',
        params: { pressureBar },
      });
    }
    return makeDiagnostic({
      code: 'HOUSING_AERATION_OK',
      severity: 'INFO',
      params: { pressureBar },
    });
  }

  /**
   * MASTER SPEC: MAGNETIC SYMMETRY
   * Checks alignment of Mechanical Center vs Magnetic Center.
   */
  checkMagneticCenter(mechanicalCenterZ: number, magneticCenterZ: number): Diagnostic {
    const delta = Math.abs(mechanicalCenterZ - magneticCenterZ);
    if (delta > 2.0) {
      return makeDiagnostic({
        code: 'MAGNETIC_IMBALANCE',
        severity: 'WARNING',
        params: { deltaMM: delta },
      });
    }
    return makeDiagnostic({ code: 'MAGNETIC_OK', severity: 'INFO', params: { deltaMM: delta } });
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
  ): Diagnostic {
    if (mainNeedleOpenPercent > 5.0) {
      if (brakeValveStatus === 'OPEN') {
        return makeDiagnostic({ code: 'BRAKE_INTERLOCK_VIOLATION', severity: 'CRITICAL' });
      }

      if (brakePressureBar > 0.5) {
        return makeDiagnostic({
          code: 'BRAKE_LEAK_DETECTED',
          severity: 'WARNING',
          params: { pressureBar: brakePressureBar },
        });
      }
    }

    return makeDiagnostic({ code: 'BRAKE_OPERATION_OK', severity: 'INFO' });
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
  ): Diagnostic {
    const gravityForceN = rotorWeightKg * 9.81; // Downward force
    const netForceN = gravityForceN - upliftForceNewtons; // Positive = Down, Negative = FLYING
    const upliftRatio = upliftForceNewtons / gravityForceN;

    if (!isAxialSecure && upliftRatio > 0.8) {
      return makeDiagnostic({
        code: 'AXIAL_LIFT_OFF',
        severity: 'WARNING',
        params: { upliftRatio },
      });
    }

    if (netForceN < 0) {
      return makeDiagnostic({
        code: 'AXIAL_NEGATIVE_FORCE',
        severity: 'CRITICAL',
        params: { netForceN },
      });
    }

    return makeDiagnostic({
      code: 'AXIAL_OK',
      severity: 'INFO',
      params: { netForceN, upliftRatio },
    });
  }

  /**
   * MASTER SPEC: THE JUMP ALARM
   * Detects if the shaft has physically lifted off the pads.
   */
  checkAxialJump(
    displacementZ_mm: number // Positive = Down/Normal, Negative = UP
  ): Diagnostic {
    if (displacementZ_mm < -0.5) {
      return makeDiagnostic({
        code: 'SHAFT_JUMP',
        severity: 'CRITICAL',
        params: { displacementZ_mm },
      });
    }
    return makeDiagnostic({
      code: 'SHAFT_GROUNDED',
      severity: 'INFO',
      params: { displacementZ_mm },
    });
  }

  generateSpecs(head: number, flow: number): TurbineSpecs {
    const specs: TurbineSpecs = {
      runnerType: 'Impulse',
      specificSpeed: 20, // Low specific speed
      type: 'pelton',
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
    if (efficiencyDeviation > 5)
      score -= 30; // >5% deviation
    else if (efficiencyDeviation > 2) score -= 15; // >2% deviation

    // Bonus if head and flow are within reasonable ranges
    if (typeof head === 'number' && head >= 100 && head <= 1000) score += 5;
    if (typeof flow === 'number' && flow > 0) score += 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
