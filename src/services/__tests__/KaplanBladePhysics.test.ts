import { describe, it, expect } from 'vitest';
import KaplanBladePhysics from '../KaplanBladePhysics';

describe('KaplanBladePhysics', () => {
  it('returns modifier ~=1 for reference blade count', () => {
    const mod = KaplanBladePhysics.cavitationSensitivityModifier(4);
    expect(mod).toBeGreaterThan(0.9);
    expect(mod).toBeLessThan(1.1);
  });

  it('reduces sensitivity for higher blade count', () => {
    const mod4 = KaplanBladePhysics.cavitationSensitivityModifier(4);
    const mod8 = KaplanBladePhysics.cavitationSensitivityModifier(8);
    expect(mod8).toBeLessThan(mod4);
  });

  it('adjusted sigma limit decreases with higher blade count', () => {
    const base = 0.6;
    const adj4 = KaplanBladePhysics.adjustedSigmaLimit(base, 4);
    const adj8 = KaplanBladePhysics.adjustedSigmaLimit(base, 8);
    expect(adj8).toBeLessThan(adj4);
  });

  it('monitorHubInternals returns structure', () => {
    const sample = { crossheadBacklashMM: 0.12, trunnionFrictionNm: 5, oilInWaterPPM: 12 };
    const r = KaplanBladePhysics.monitorHubInternals(sample);
    expect(r).toHaveProperty('crossheadBacklashMM');
    expect(r).toHaveProperty('trunnionFrictionNm');
    expect(r).toHaveProperty('oilInWaterPPM');
  });
});
