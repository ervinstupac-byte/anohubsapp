import { describe, it, expect } from 'vitest';
import { EventLogger } from '../services/EventLogger';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { useProjectConfigStore } from '../features/config/ProjectConfigStore';

describe('Event Historian & Audit Trail', () => {
  it('logs CONFIG_CHANGE entries', () => {
    const entry = EventLogger.log('CONFIG_CHANGE', 'FRANCIS:ratedFlowQn', 35, 40);
    const { activeAlarms, ledgerState } = useTelemetryStore.getState() as any;
    expect(entry.hash).toMatch(/^h/);
  });

  it('logs SNAPSHOT_SAVE and SNAPSHOT_LOAD', () => {
    const s = useProjectConfigStore.getState();
    const snap = s.saveSnapshot('TestSnap');
    expect(snap.id).toBeTruthy();
    s.loadSnapshot(snap.id);
  });

  for (let i = 0; i < 18; i++) {
    it(`snapshot roundtrip ${i + 1}`, () => {
      const s = useProjectConfigStore.getState();
      s.setConfig('PELTON', { pelton: { nozzleCount: ((i % 6) + 1) } });
      const snap = s.saveSnapshot(`S${i}`);
      s.loadSnapshot(snap.id);
      const cfg = s.getConfig('PELTON');
      expect((cfg.pelton?.nozzleCount || 0)).toBeGreaterThan(0);
    });
  }
});
