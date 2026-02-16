import { describe, it, expect } from 'vitest';
import { useTelemetryStore } from '../useTelemetryStore';

describe('useTelemetryStore', () => {
  it('pushAlarm appends and acknowledgeAllAlarms marks acknowledged', () => {
    const { pushAlarm, acknowledgeAllAlarms, activeAlarms } = useTelemetryStore.getState() as any;
    pushAlarm({ id: 'X1', severity: 'CRITICAL', message: 'Trip' });
    let list = useTelemetryStore.getState().activeAlarms;
    expect(list.length).toBeGreaterThan(0);
    expect(list[list.length - 1].acknowledged).toBe(false);
    acknowledgeAllAlarms();
    list = useTelemetryStore.getState().activeAlarms;
    expect(list[list.length - 1].acknowledged).toBe(true);
  });

  it('updateTelemetry records vibration history', async () => {
    const { updateTelemetry } = useTelemetryStore.getState() as any;
    updateTelemetry({ mechanical: { vibrationX: 3.1 } });
    // Wait for throttle interval (100ms) to pass
    await new Promise(resolve => setTimeout(resolve, 150));
    updateTelemetry({ mechanical: { vibrationX: 3.3 } });
    const { telemetryHistory } = useTelemetryStore.getState() as any;
    expect(telemetryHistory.vibrationX.length).toBeGreaterThanOrEqual(2);
  });

  it('updateTelemetry computes vibration forensics verdict', () => {
    const { updateTelemetry } = useTelemetryStore.getState() as any;
    updateTelemetry({ mechanical: { rpm: 600, vibration: 12, vibrationX: 12, vibrationY: 0 } });
    const { vibrationForensics } = useTelemetryStore.getState() as any;
    expect(vibrationForensics).toBeTruthy();
    expect(vibrationForensics.pattern).toBe('BEARING_WEAR');
    expect(vibrationForensics.severity).toBe('CRITICAL');
    expect(Array.isArray(vibrationForensics.recommendations)).toBe(true);
  });

  it('high vibration triggers RCA results', () => {
    const { updateTelemetry } = useTelemetryStore.getState() as any;
    updateTelemetry({ mechanical: { rpm: 600, vibrationX: 9.0 } });
    const { rcaResults } = useTelemetryStore.getState() as any;
    expect(Array.isArray(rcaResults)).toBe(true);
  });

  it('toggleFilteredMode flips isFilteredMode', () => {
    const before = useTelemetryStore.getState().isFilteredMode;
    useTelemetryStore.getState().toggleFilteredMode();
    const after = useTelemetryStore.getState().isFilteredMode;
    expect(after).toBe(!before);
  });

  it('setFilterType sets filter type', () => {
    useTelemetryStore.getState().setFilterType('EMA');
    expect(useTelemetryStore.getState().filterType).toBe('EMA');
  });

  it('hardResetIfSchemaMismatch returns boolean', () => {
    const res = useTelemetryStore.getState().hardResetIfSchemaMismatch();
    expect(typeof res).toBe('boolean');
  });
});
