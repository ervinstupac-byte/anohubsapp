import { describe, it, expect } from 'vitest';
import { SafetyInterlockEngine } from '../SafetyInterlockEngine';
import { useProjectConfigStore } from '../../features/config/ProjectConfigStore';

describe('SafetyInterlockEngine design constraints & water hammer', () => {
  it('trips when Kaplan head is impossible (>1000 m)', () => {
    const s = useProjectConfigStore.getState();
    s.setConfig('KAPLAN', { ratedHeadHn: 1001 });
    const res = SafetyInterlockEngine.checkProtections(80, 5, false, 3, { family: 'KAPLAN', telemetry: { wicketGatePct: 50, bladeAngleDeg: 12 } });
    expect(res.tripActive).toBe(true);
    expect(String(res.tripReason)).toMatch(/DESIGN CONSTRAINT/i);
  });

  it('blocks Pelton sequencing when ΔQ/Δt excessive', () => {
    const s = useProjectConfigStore.getState();
    s.setConfig('PELTON', { pelton: { nozzleClosingTimeSec: 0.5 } });
    const res = SafetyInterlockEngine.checkProtections(60, 5, false, 2, { family: 'PELTON', telemetry: { jetRateChange: 6.0 } });
    expect(res.actionRequired).toBe('BLOCK_START');
    expect(String(res.tripReason)).toMatch(/SEQUENCING/i);
  });
});
