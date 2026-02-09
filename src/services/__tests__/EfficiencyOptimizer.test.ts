import { describe, it, expect } from 'vitest';
import { EfficiencyOptimizer } from '../EfficiencyOptimizer';

describe('EfficiencyOptimizer', () => {
  it('computes etaMax and deltaToOptimum at design point', () => {
    const res = EfficiencyOptimizer.compute(100, 20, 90);
    expect(res.etaMax).toBeGreaterThan(0.8);
    expect(res.deltaToOptimum).toBeTypeOf('number');
  });

  it('clamps for head below minimum grid', () => {
    const res = EfficiencyOptimizer.compute(10, 20, 85);
    expect(res.etaMax).toBeTypeOf('number');
  });

  it('clamps for flow above maximum grid', () => {
    const res = EfficiencyOptimizer.compute(300, 60, 80);
    expect(res.etaMax).toBeTypeOf('number');
  });

  it('deltaToOptimum is positive when observed below etaMax', () => {
    const res = EfficiencyOptimizer.compute(150, 40, 70);
    expect(res.deltaToOptimum).toBeGreaterThan(0);
  });

  it('deltaToOptimum is negative when observed above etaMax', () => {
    const res = EfficiencyOptimizer.compute(150, 40, 99);
    expect(res.deltaToOptimum).toBeLessThan(0);
  });

  it('handles observed efficiency given as decimal (0.9)', () => {
    const res = EfficiencyOptimizer.compute(100, 20, 0.9);
    expect(res.deltaToOptimum).toBeTypeOf('number');
  });

  it('provides smooth interpolation across grid boundaries', () => {
    const a = EfficiencyOptimizer.compute(100, 20, 85).etaMax;
    const b = EfficiencyOptimizer.compute(105, 22, 85).etaMax;
    const c = EfficiencyOptimizer.compute(110, 24, 85).etaMax;
    expect(b).toBeGreaterThan(0);
    expect(c).toBeGreaterThan(0);
    expect(Math.abs(b - a)).toBeLessThanOrEqual(0.2);
    expect(Math.abs(c - b)).toBeLessThanOrEqual(0.2);
  });

  it('deltaToOptimum equals ~0 when observed matches etaMax (same units)', () => {
    const optim = EfficiencyOptimizer.compute(150, 40, 0).etaMax;
    const res = EfficiencyOptimizer.compute(150, 40, optim);
    expect(Math.abs(res.deltaToOptimum)).toBeLessThan(1e-6);
  });

  it('etaMax increases with head up to a point', () => {
    const low = EfficiencyOptimizer.compute(80, 30, 85).etaMax;
    const mid = EfficiencyOptimizer.compute(120, 30, 85).etaMax;
    expect(mid).toBeGreaterThanOrEqual(low);
  });

  it('etaMax responds reasonably to flow changes', () => {
    const a = EfficiencyOptimizer.compute(150, 20, 85).etaMax;
    const b = EfficiencyOptimizer.compute(150, 50, 85).etaMax;
    expect(Math.abs(a - b)).toBeLessThanOrEqual(3.0);
  });
});
