import BaseGuardian from '../BaseGuardian';

describe('BaseGuardian.safeCorrelation', () => {
  class TestGuardian extends BaseGuardian {
    public getConfidenceScore(): number { return 0; }
    public exposeSafeCorrelation(a: number[], b: number[]) { return this.safeCorrelation(a,b); }
  }

  const t = new TestGuardian();

  test('returns NaN for too-short arrays', () => {
    expect(Number.isNaN(t.exposeSafeCorrelation([1], [2]))).toBe(true);
    expect(Number.isNaN(t.exposeSafeCorrelation([], []))).toBe(true);
  });

  test('returns ~1 for identical series', () => {
    const a = [1,2,3,4,5];
    const b = [2,4,6,8,10];
    const corr = t.exposeSafeCorrelation(a,b);
    expect(corr).toBeGreaterThan(0.99);
  });

  test('returns near 0 for independent series', () => {
    const a = [1,0,1,0,1,0,1,0];
    // pattern chosen to be uncorrelated with `a`
    const b = [0,0,1,1,0,0,1,1];
    const corr = t.exposeSafeCorrelation(a,b);
    expect(Math.abs(corr)).toBeLessThan(0.5);
  });
});
