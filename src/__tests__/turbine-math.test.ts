/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { TurbineFactory } from '../lib/engines/TurbineFactory.ts';
import Decimal from 'decimal.js';

vi.unmock('decimal.js');


describe('Turbine Engineering Math Precision Audit', () => {

    it('should validate Francis Turbine (150m, 30m³/s) with extreme precision', () => {
        const engine = TurbineFactory.getEngine('francis');
        const head = 150;
        const flow = 30;
        const efficiency = engine.calculateEfficiency(head, flow);
        expect(efficiency).toBe(92);

        const powerMW = engine.calculatePower(head, flow, efficiency);

        // Baseline calculation using Decimal.js for identical precision
        const G = new Decimal('9.80665');
        const h = new Decimal(head);
        const q = new Decimal(flow);
        const eta = new Decimal(efficiency).div(100);
        const expectedPowerMW = new Decimal('1000').mul(G).mul(h).mul(q).mul(eta).div(1_000_000).toDecimalPlaces(3).toNumber();

        console.log(`[DEBUG] Francis: Actual=${powerMW}, Expected=${expectedPowerMW}, Diff=${Math.abs(powerMW - expectedPowerMW)}`);
        expect(powerMW).toBeCloseTo(expectedPowerMW, 3);
    });

    it('should validate Kaplan Turbine (25m, 100m³/s) with extreme precision', () => {
        const engine = TurbineFactory.getEngine('kaplan');
        const head = 25;
        const flow = 100;
        const efficiency = engine.calculateEfficiency(head, flow);
        expect(efficiency).toBe(93.5);

        const powerMW = engine.calculatePower(head, flow, efficiency);

        const G = new Decimal('9.80665');
        const h = new Decimal(head);
        const q = new Decimal(flow);
        const eta = new Decimal(efficiency).div(100);
        const expectedPowerMW = new Decimal('1000').mul(G).mul(h).mul(q).mul(eta).div(1_000_000).toDecimalPlaces(3).toNumber();

        expect(powerMW).toBeCloseTo(expectedPowerMW, 3);
    });

    it('should validate Pelton Turbine (600m, 5m³/s) with extreme precision', () => {
        const engine = TurbineFactory.getEngine('pelton');
        const head = 600;
        const flow = 5;
        const efficiency = engine.calculateEfficiency(head, flow);
        expect(efficiency).toBe(91.5);

        const powerMW = engine.calculatePower(head, flow, efficiency);

        const G = new Decimal('9.80665');
        const h = new Decimal(head);
        const q = new Decimal(flow);
        const eta = new Decimal(efficiency).div(100);
        const expectedPowerMW = new Decimal('1000').mul(G).mul(h).mul(q).mul(eta).div(1_000_000).toDecimalPlaces(3).toNumber();

        expect(powerMW).toBeCloseTo(expectedPowerMW, 3);
    });
});
