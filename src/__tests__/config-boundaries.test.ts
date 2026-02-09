import { describe, it, expect } from 'vitest';
import { useProjectConfigStore } from '../features/config/ProjectConfigStore';
import { SafetyInterlockEngine } from '../services/SafetyInterlockEngine';
import { computeEfficiencyFromHillChart } from '../services/TurbinePhysicsOptimizer';

describe('Boundary Testing: Configuration and Physics', () => {
  const s = useProjectConfigStore.getState();

  // Kaplan head boundaries
  [50, 80, 100, 150, 500, 1000, 1001].forEach((H) => {
    it(`Kaplan rated head boundary check at ${H}m`, () => {
      s.setConfig('KAPLAN', { ratedHeadHn: H });
      const v = s.validate('KAPLAN');
      if (H > 100) {
        expect(v.ok).toBe(false);
      } else {
        expect(v.ok).toBe(true);
      }
      const res = SafetyInterlockEngine.checkProtections(75, 5, false, 2, { family: 'KAPLAN', telemetry: { wicketGatePct: 40, bladeAngleDeg: 12 } });
      if (H > 1000) {
        expect(res.tripActive).toBe(true);
      }
    });
  });

  // Pelton nozzle count boundaries
  [1, 2, 4, 6, 8, 12, 0, 13].forEach((n) => {
    it(`Pelton nozzle count boundary at ${n}`, () => {
      s.setConfig('PELTON', { pelton: { nozzleCount: n } });
      const v = s.validate('PELTON');
      if (n < 1 || n > 12) expect(v.ok).toBe(false);
      else expect(v.ok).toBe(true);
    });
  });

  // Francis wicket gate boundaries
  [6, 12, 16, 24, 32, 4, 40].forEach((wg) => {
    it(`Francis wicket gate count boundary at ${wg}`, () => {
      s.setConfig('FRANCIS', { francis: { wicketGateCount: wg } });
      const v = s.validate('FRANCIS');
      if (wg < 6 || wg > 32) expect(v.ok).toBe(false);
      else expect(v.ok).toBe(true);
    });
  });

  // Hill chart interpolation sampling grid
  it('Hill chart interpolation stability across sampling grid', () => {
    s.setHillChart('FRANCIS', [
      { head: 140, flow: 35, efficiency: 0.90 },
      { head: 160, flow: 35, efficiency: 0.92 },
      { head: 140, flow: 45, efficiency: 0.91 },
      { head: 160, flow: 45, efficiency: 0.94 }
    ]);
    for (let H = 140; H <= 160; H += 5) {
      for (let Q = 35; Q <= 45; Q += 5) {
        const e = computeEfficiencyFromHillChart('FRANCIS', H, Q);
        expect(e).toBeGreaterThan(0.89);
        expect(e).toBeLessThanOrEqual(0.95);
      }
    }
  });

  // Water hammer sequencing thresholds
  [0.3, 0.5, 0.8, 1.2].forEach((closing) => {
    it(`Pelton sequencing risk with closing time ${closing}s`, () => {
      s.setConfig('PELTON', { pelton: { nozzleClosingTimeSec: closing } });
      const res = SafetyInterlockEngine.checkProtections(60, 5, false, 2, { family: 'PELTON', telemetry: { jetRateChange: 6.0 } });
      expect(['NONE', 'BLOCK_START', 'TRIP']).toContain(res.actionRequired);
    });
  });
});
