import { describe, it, expect } from 'vitest';
import { useProjectConfigStore } from '../ProjectConfigStore';

describe('ProjectConfigStore', () => {
  it('sets and validates Pelton nozzle count', () => {
    const s = useProjectConfigStore.getState();
    s.setConfig('PELTON', { pelton: { nozzleCount: 6 } });
    const cfg = s.getConfig('PELTON');
    expect(cfg.pelton?.nozzleCount).toBe(6);
    const v = s.validate('PELTON');
    expect(v.ok).toBe(true);
  });

  it('blocks invalid Pelton nozzle count', () => {
    const s = useProjectConfigStore.getState();
    s.setConfig('PELTON', { pelton: { nozzleCount: 0 } });
    const v = s.validate('PELTON');
    expect(v.ok).toBe(false);
    expect(v.violations.join(' ')).toMatch(/Invalid nozzle count/i);
  });

  it('records hill chart and snapshots', () => {
    const s = useProjectConfigStore.getState();
    s.setHillChart('FRANCIS', [
      { head: 140, flow: 35, efficiency: 0.91 },
      { head: 160, flow: 45, efficiency: 0.93 }
    ]);
    const snap = s.saveSnapshot('Baseline A');
    expect(snap.name).toBe('Baseline A');
    expect(s.listSnapshots().length).toBeGreaterThan(0);
    s.loadSnapshot(snap.id);
    const cfg = s.getConfig('FRANCIS');
    expect((cfg.hillChart || []).length).toBe(2);
  });

  it('flags Kaplan head > 100 as violation (store validate)', () => {
    const s = useProjectConfigStore.getState();
    s.setConfig('KAPLAN', { ratedHeadHn: 120 });
    const v = s.validate('KAPLAN');
    expect(v.ok).toBe(false);
    expect(v.violations.join(' ')).toMatch(/Kaplan rated head/i);
  });
});
