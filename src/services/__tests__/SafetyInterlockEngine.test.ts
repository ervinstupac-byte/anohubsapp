import { describe, it, expect } from 'vitest';
import { SafetyInterlockEngine } from '../SafetyInterlockEngine';

describe('SafetyInterlockEngine', () => {
  it('trips on E-STOP regardless of other inputs', () => {
    const s = SafetyInterlockEngine.checkProtections(50, 5, true, 0);
    expect(s.tripActive).toBe(true);
    expect(s.actionRequired).toBe('TRIP');
    expect(String(s.tripReason)).toContain('E-STOP');
  });

  it('trips on overspeed at 115% and above', () => {
    const s = SafetyInterlockEngine.checkProtections(115, 5, false, 0);
    expect(s.tripActive).toBe(true);
    expect(String(s.tripReason)).toContain('OVERSPEED');
  });

  it('does not trip below overspeed threshold', () => {
    const s = SafetyInterlockEngine.checkProtections(114.9, 5, false, 0);
    expect(s.tripActive).toBe(false);
  });

  it('trips on reverse power below -2.0 MW', () => {
    const s = SafetyInterlockEngine.checkProtections(80, -2.1, false, 0);
    expect(s.tripActive).toBe(true);
    expect(String(s.tripReason)).toContain('REVERSE POWER');
  });

  it('does not trip when active power is above -2.0 MW', () => {
    const s = SafetyInterlockEngine.checkProtections(80, -1.9, false, 0);
    expect(s.tripActive).toBe(false);
  });

  it('trips on high vibration above 8.0 mm/s', () => {
    const s = SafetyInterlockEngine.checkProtections(80, 5, false, 8.1);
    expect(s.tripActive).toBe(true);
    expect(String(s.tripReason)).toContain('VIBRATION');
  });

  it('does not trip when vibration below threshold', () => {
    const s = SafetyInterlockEngine.checkProtections(80, 5, false, 7.9);
    expect(s.tripActive).toBe(false);
  });

  it('prefers E-STOP over overspeed when both happen', () => {
    const s = SafetyInterlockEngine.checkProtections(130, 5, true, 10);
    expect(s.tripActive).toBe(true);
    expect(s.actionRequired).toBe('TRIP');
    expect(String(s.tripReason)).toContain('E-STOP');
  });

  it('returns NONE when all conditions are within safe limits', () => {
    const s = SafetyInterlockEngine.checkProtections(80, 5, false, 3.2);
    expect(s.tripActive).toBe(false);
    expect(s.actionRequired).toBe('NONE');
    expect(s.tripReason).toBeNull();
  });

  it('getStatus returns locked status metadata', () => {
    const info = SafetyInterlockEngine.getStatus();
    expect(info.status).toBe('LOCKED');
    expect(info.protectionsActive).toBeGreaterThan(0);
    expect(typeof info.lastCheck).toBe('number');
  });

  it('no trip when speed and vibration are nominal', () => {
    const s = SafetyInterlockEngine.checkProtections(60, 3, false, 2.0);
    expect(s.tripActive).toBe(false);
  });

  it('trip reason formats contain numeric details', () => {
    const s = SafetyInterlockEngine.checkProtections(120, 3, false, 2.0);
    expect(String(s.tripReason)).toMatch(/\d/);
  });

  it('reverse power trip includes MW value', () => {
    const s = SafetyInterlockEngine.checkProtections(80, -3.33, false, 2.0);
    expect(String(s.tripReason)).toContain('MW');
  });

  it('actionRequired is TRIP when tripActive', () => {
    const s = SafetyInterlockEngine.checkProtections(130, 5, false, 0);
    expect(s.tripActive).toBe(true);
    expect(s.actionRequired).toBe('TRIP');
  });

  it('no action required when safe', () => {
    const s = SafetyInterlockEngine.checkProtections(70, 0, false, 0.5);
    expect(s.actionRequired).toBe('NONE');
  });
});
