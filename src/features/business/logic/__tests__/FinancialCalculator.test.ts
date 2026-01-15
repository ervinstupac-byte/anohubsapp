import { describe, it, expect } from 'vitest';
import { calculateRevenueLoss } from '../FinancialCalculator';
import { FinancialInput } from '../../types';

describe('FinancialCalculator', () => {

    // 1. HAPPY PATH
    it('calculates correct revenue loss for normal operation', () => {
        const input: FinancialInput = {
            market: { energyPricePerMWh: 100.0, currency: 'EUR' },
            technical: {
                currentActivePowerMW: 8.0,
                designRatedPowerMW: 10.0,
                currentEfficiencyPercent: 80,
                isTurbineRunning: true
            }
        };

        const result = calculateRevenueLoss(input);

        // Expected: (10 - 8) * 100 = 200
        expect(result.revenueLossPerHour).toBe(200.00);
        expect(result.currentRevenuePerHour).toBe(800.00);
        expect(result.isCritical).toBe(true); // 200 > 50 (Critical Threshold)
    });

    // 2. EDGE CASE: STOPPED
    it('returns 0 loss when turbine is stopped', () => {
        const input: FinancialInput = {
            market: { energyPricePerMWh: 100.0, currency: 'EUR' },
            technical: {
                currentActivePowerMW: 0.0,
                designRatedPowerMW: 10.0,
                currentEfficiencyPercent: 0,
                isTurbineRunning: false // STOPPED
            }
        };

        const result = calculateRevenueLoss(input);

        expect(result.revenueLossPerHour).toBe(0);
        expect(result.isCritical).toBe(false);
    });

    // 3. STRESS CASE: INVALID INPUTS
    it('handles negative inputs gracefully by clamping to 0', () => {
        const input: FinancialInput = {
            market: { energyPricePerMWh: 100.0, currency: 'EUR' },
            technical: {
                currentActivePowerMW: -5.0, // Invalid negative
                designRatedPowerMW: 10.0,
                currentEfficiencyPercent: 0,
                isTurbineRunning: true
            }
        };

        const result = calculateRevenueLoss(input);

        // Treated as 0 MW. Loss = (10 - 0) * 100 = 1000.
        expect(result.currentRevenuePerHour).toBe(0);
        expect(result.revenueLossPerHour).toBe(1000.00);
    });

    // 4. OVER-PERFORMANCE
    it('returns 0 loss if actual exceeds design (no negative loss)', () => {
        const input: FinancialInput = {
            market: { energyPricePerMWh: 100.0, currency: 'EUR' },
            technical: {
                currentActivePowerMW: 12.0, // 120%
                designRatedPowerMW: 10.0,
                currentEfficiencyPercent: 120,
                isTurbineRunning: true
            }
        };

        const result = calculateRevenueLoss(input);

        expect(result.revenueLossPerHour).toBe(0);
        expect(result.efficiencyLossPercent).toBe(0);
    });
});
