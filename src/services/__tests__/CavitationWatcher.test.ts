import { describe, it, expect } from 'vitest';
import { CavitationWatcher } from '../CavitationWatcher';

describe('CavitationWatcher', () => {
  it('reports SAFE when NPSH available exceeds required by margin', () => {
    const s = CavitationWatcher.analyze(220, 200, 100, 10, 1.013);
    expect(s.riskLevel).toBe('SAFE');
    expect(s.npshAvailable).toBeGreaterThan(s.npshRequired * 1.3);
  });

  it('reports INCEPTION when NPSH available is within 30% margin', () => {
    const s = CavitationWatcher.analyze(208, 200, 100, 60, 1.013);
    expect(s.riskLevel).toBe('INCEPTION');
  });

  it('reports FULL_CAVITATION when NPSH available is below required', () => {
    const s = CavitationWatcher.analyze(200, 199.9, 100, 40, 1.013);
    expect(s.riskLevel).toBe('FULL_CAVITATION');
  });

  it('handles zero/negative head safely', () => {
    const s = CavitationWatcher.analyze(200, 190, 0, 10, 1.013);
    expect(s.sigmaPlant).toBeGreaterThan(0);
  });

  it('clamps negative water temperature to 0°C', () => {
    const s = CavitationWatcher.analyze(200, 198, 100, -5, 1.013);
    expect(s.npshAvailable).toBeGreaterThan(0);
  });

  it('lower atmospheric pressure increases cavitation risk', () => {
    const hi = CavitationWatcher.analyze(210, 200, 100, 25, 1.013);
    const lo = CavitationWatcher.analyze(210, 200, 100, 25, 0.800);
    expect(lo.npshAvailable).toBeLessThan(hi.npshAvailable);
  });
});
