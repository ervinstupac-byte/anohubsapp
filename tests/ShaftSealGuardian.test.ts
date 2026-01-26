import { describe, it, expect } from 'vitest';
import ShaftSealGuardian from '../src/services/ShaftSealGuardian';

describe('ShaftSealGuardian', () => {
    it('stays NO_ACTION for small variations', () => {
        const g = new ShaftSealGuardian({ windowSize: 10, prior: 0.01 });
        const now = new Date();
        const m1 = { timestamp: now.toISOString(), Q_seal: 100, P_seal: 5, T_seal: 30 };
        const m2 = { timestamp: new Date(now.getTime() + 60_000).toISOString(), Q_seal: 99.8, P_seal: 5, T_seal: 30.1 };
        const a1 = g.addMeasurement(m1 as any);
        const a2 = g.addMeasurement(m2 as any);
        expect(a2.action).toBeDefined();
        expect(a2.action).toBe('NO_ACTION');
    });

    it('escalates to probabilistic warning or hard trip on strong correlated anomaly', () => {
        const g = new ShaftSealGuardian({ windowSize: 8, prior: 0.01 });
        const base = Date.now();

        // create a sequence that rapidly increases temperature while flow drops
        const seq = [] as any[];
        for (let i = 0; i < 8; i++) {
            seq.push({
                timestamp: new Date(base + i * 60_000).toISOString(),
                Q_seal: 120 - i * 8, // flow dropping
                P_seal: 5,
                T_seal: 30 + i * 8, // temp rising
                leakagePitLevel: 10 + i * 2
            });
        }

        let last: any = null;
        for (const s of seq) {
            last = g.addMeasurement(s);
        }

        expect(['PROBABILISTIC_WARNING', 'HARD_TRIP']).toContain(last.action);
    });
});
