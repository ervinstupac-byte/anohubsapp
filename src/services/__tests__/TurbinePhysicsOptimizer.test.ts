import { describe, it, expect } from 'vitest';
import { FrancisOptimizer } from '../TurbinePhysicsOptimizer';

describe('FrancisOptimizer', () => {
  it('detects vortex resonance within Rheingans range', () => {
    const res = FrancisOptimizer.detectVortexResonance({
      draftTubePressure: [],
      rotationalSpeed: 600, // RPM
      vortexFrequency: 2.1, // Hz (0.2*10 to 0.4*10 => 2-4 Hz)
      vortexAmplitude: 0.35
    });
    expect(res.vortexDetected).toBe(true);
    expect(res.suppressionRequired).toBe(true);
    expect(String(res.recommendation)).toContain('VORTEX_SUPPRESSION');
  });

  it('recommends monitoring for minor vortex amplitude', () => {
    const res = FrancisOptimizer.detectVortexResonance({
      draftTubePressure: [],
      rotationalSpeed: 600,
      vortexFrequency: 3.0,
      vortexAmplitude: 0.12
    });
    expect(res.vortexDetected).toBe(true);
    expect(res.suppressionRequired).toBe(false);
  });

  it('calculates air injection rate proportional to amplitude', () => {
    const q = FrancisOptimizer.calculateAirInjectionRate(0.25);
    expect(q).toBeGreaterThan(0);
    expect(q).toBeLessThanOrEqual(500);
  });
});
