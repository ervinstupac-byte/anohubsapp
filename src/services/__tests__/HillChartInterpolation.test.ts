import { describe, it, expect } from 'vitest';
import { computeEfficiencyFromHillChart } from '../TurbinePhysicsOptimizer';
import { useProjectConfigStore } from '../../features/config/ProjectConfigStore';

describe('Hill-Chart interpolation', () => {
  it('interpolates efficiency between head/flow points', () => {
    const s = useProjectConfigStore.getState();
    s.setHillChart('FRANCIS', [
      { head: 140, flow: 35, efficiency: 0.90 },
      { head: 160, flow: 35, efficiency: 0.92 },
      { head: 140, flow: 45, efficiency: 0.91 },
      { head: 160, flow: 45, efficiency: 0.94 }
    ]);
    const e = computeEfficiencyFromHillChart('FRANCIS', 150, 40);
    expect(e).toBeGreaterThan(0.90);
    expect(e).toBeLessThanOrEqual(0.94);
  });

  it('returns default efficiency when chart missing', () => {
    const s = useProjectConfigStore.getState();
    s.setHillChart('KAPLAN', []);
    const e = computeEfficiencyFromHillChart('KAPLAN', 30, 60);
    expect(e).toBeCloseTo(0.9, 2);
  });
});
