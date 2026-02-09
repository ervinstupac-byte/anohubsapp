import { describe, it, expect } from 'vitest';
import { SafetyInterlockEngine } from '../SafetyInterlockEngine';

describe('Interlock Matrix', () => {
  it('Pelton nozzle sequencing blocks start on rapid jet change', () => {
    const s = SafetyInterlockEngine.checkProtections(0, 0, false, 0, {
      family: 'PELTON',
      telemetry: { jetRateChange: 6.5 }
    } as any);
    expect(s.actionRequired).toBe('BLOCK_START');
    expect(String(s.tripReason)).toContain('PELTON NOZZLE SEQUENCING');
  });

  it('Pelton extreme rapid change trips for water hammer risk', () => {
    const s = SafetyInterlockEngine.checkProtections(0, 0, false, 0, {
      family: 'PELTON',
      telemetry: { jetRateChange: 15.0 }
    } as any);
    expect(s.actionRequired).toBe('TRIP');
    expect(String(s.tripReason)).toContain('WATER HAMMER');
  });

  it('Kaplan off-cam trips when deviation exceeds 5 degrees', () => {
    const s = SafetyInterlockEngine.checkProtections(70, 10, false, 3.0, {
      family: 'KAPLAN',
      telemetry: { wicketGatePct: 60, bladeAngleDeg: 40, offCamDeviationDeg: 6.0 }
    } as any);
    expect(s.actionRequired).toBe('TRIP');
    expect(String(s.tripReason)).toContain('OFF-CAM');
  });

  it('Kaplan off-cam blocks start when deviation between 2 and 5 degrees', () => {
    const s = SafetyInterlockEngine.checkProtections(0, 0, false, 0, {
      family: 'KAPLAN',
      telemetry: { wicketGatePct: 50, bladeAngleDeg: 30, offCamDeviationDeg: 3.0 }
    } as any);
    expect(s.actionRequired).toBe('BLOCK_START');
  });
});
