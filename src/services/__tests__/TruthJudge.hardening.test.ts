import { describe, it, expect } from 'vitest';
import { TruthJudge } from '../TruthJudge';

describe('TruthJudge hysteresis/backoff', () => {
  it('suppresses repeated USE_FALLBACK within cooldown and allows fallback after cooldown', () => {
    const tj = new TruthJudge();
    const sensorId = 'test-temp';

    // Initial healthy reading
    const t0 = 1000000;
    const ok = tj.validateSensor(sensorId, 20, 20, t0);
    expect(ok.action).toBe('TRUST_A');

    // First bad slew -> should trigger USE_FALLBACK
    const t1 = t0 + 1000; // +1s
    const v1 = tj.validateSensor(sensorId, 100, 20, t1);
    expect(v1.action).toBe('USE_FALLBACK');

    // Immediate second bad reading within cooldown -> should be suppressed (not USE_FALLBACK)
    const t2 = t1 + 100; // +0.1s
    const v2 = tj.validateSensor(sensorId, 105, 100, t2);
    expect(v2.action).not.toBe('USE_FALLBACK');

    // After cooldown passes, bad reading should again produce USE_FALLBACK
    const baseCooldownMs = 5000;
    // first fallback increments fallbackCount -> next cooldown is base * 2^1
    const t3 = t1 + (baseCooldownMs * 2) + 100; // beyond cooldown after first fallback
    // Use a large jump to ensure BAD_SLEW is detected after cooldown
    const v3 = tj.validateSensor(sensorId, 500, 105, t3);
    expect(v3.action).toBe('USE_FALLBACK');
  });
});
