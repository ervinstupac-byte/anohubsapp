import { describe, it, expect } from 'vitest';
import { FinancialImpactEngine } from '../core/FinancialImpactEngine';

// Minimal mock state and physics
const baseState: any = {
  identity: { turbineType: 'FRANCIS' },
  hydraulic: {
    baselineOutputMW: 5,
    efficiency: 0.88,
    flow: 30,
    head: 60
  },
  physics: {},
  site: {},
  demoMode: { active: false },
  riskScore: 20,
  structural: { extendedLifeYears: 0 },
  selectedAsset: { totalOperatingHours: 24 * 365 * 5 }
};

const basePhysics: any = {
  powerMW: 4.5,
  specificWaterConsumption: 0
};

describe('FinancialImpactEngine - probabilistic maintenance model', () => {
  it('expectedMaintenanceCost increases with sigma', () => {
    const low = FinancialImpactEngine.calculateImpact(baseState as any, basePhysics as any, { sigma: 0.01 });
    const high = FinancialImpactEngine.calculateImpact(baseState as any, basePhysics as any, { sigma: 0.2 });

    expect(low.expectedMaintenanceCost).toBeGreaterThanOrEqual(0);
    expect(high.expectedMaintenanceCost).toBeGreaterThanOrEqual(low.expectedMaintenanceCost);
    expect(high.expectedMaintenanceCost).toBeGreaterThan(low.expectedMaintenanceCost);
  });

  it('inventory value reduces expectedMaintenanceCost and shortens break-even', () => {
    const invLow = FinancialImpactEngine.calculateImpact(baseState as any, basePhysics as any, { sigma: 0.05, inventoryValue: 0 });
    const invHigh = FinancialImpactEngine.calculateImpact(baseState as any, basePhysics as any, { sigma: 0.05, inventoryValue: 500000 });

    expect(invHigh.expectedMaintenanceCost).toBeLessThanOrEqual(invLow.expectedMaintenanceCost);

    // Simulate a simplified breakeven calculation: investment / (annualNet * deltaFactor)
    const I_total = 150000; // sample investment
    const pricePerMWh = 85;
    const P_avg_MW = 5;
    const C_kWh = pricePerMWh / 1000;
    const currentEff = 0.88;
    const expectedEff = Math.min(0.99, currentEff + 0.08);
    const deltaEta = Math.max(0, expectedEff - currentEff);

    const annualKWh = P_avg_MW * 1000 * 24 * 365;
    const annualBenefit = annualKWh * C_kWh * deltaEta; // simplistic benefit from efficiency uplift

    // Annual net considering maintenance buffer effect (higher expectedMaintenanceCost reduces net)
    const annualNetLowInv = (P_avg_MW * 1000 * 24 * 365 * (pricePerMWh / 1000)) - (invLow.expectedMaintenanceCost || 0);
    const annualNetHighInv = (P_avg_MW * 1000 * 24 * 365 * (pricePerMWh / 1000)) - (invHigh.expectedMaintenanceCost || 0);

    const breakevenLowInv = I_total / Math.max(1, annualNetLowInv);
    const breakevenHighInv = I_total / Math.max(1, annualNetHighInv);

    expect(breakevenHighInv).toBeLessThanOrEqual(breakevenLowInv);
  });
});
