import { describe, it, expect } from 'vitest';
import TurbineClassifier from '../TurbineClassifier';

describe('TurbineClassifier', () => {
  it('detects explicit turbine_type in config (kaplan)', () => {
    const asset: any = { turbine_config: { turbine_type: 'kaplan' } };
    const t = TurbineClassifier.detectType(asset, null);
    expect(t).toBe('VERTICAL_KAPLAN');
  });

  it('returns design constants for francis', () => {
    const c = TurbineClassifier.getDesignConstants('FRANCIS' as any);
    expect(c).toHaveProperty('n_q_range');
    expect(c).toHaveProperty('sigma_limit');
    expect(Array.isArray(c.n_q_range)).toBe(true);
  });
});
