import { TechnicalProjectState, PhysicsResult } from '../models/TechnicalSchema';
import { ProfileLoader } from './ProfileLoader';

/**
 * FINANCIAL IMPACT ENGINE (NC-4.2)
 * Decoupled economic valuation of asset health and performance.
 */
export const FinancialImpactEngine = {
    calculateImpact: (state: TechnicalProjectState, physics: PhysicsResult) => {
        const profile = ProfileLoader.getProfile(state.identity.turbineType);
        const coefficients = profile?.math.coefficients;

        const pricePerMWh = coefficients?.revenuePerMWh || 85;
        const baselinePower = state.hydraulic.baselineOutputMW ? state.hydraulic.baselineOutputMW.toNumber() : (profile?.metadata.nominalPowerMW || 100);
        const currentPower = physics.powerMW.toNumber();

        // 1. Lost Revenue (MW loss * price * hours)
        const powerLossMW = Math.max(0, baselinePower - currentPower);
        let lostRevenueEuro = powerLossMW * pricePerMWh * 24 * 365; // Annualized impact

        // 2. Inefficiency Tax
        const taxThreshold = coefficients?.inefficiencyTaxThreshold || 0.88;
        if (state.hydraulic.efficiency < taxThreshold) {
            const effDelta = taxThreshold - state.hydraulic.efficiency;
            const inefficiencyTax = state.hydraulic.flow * state.hydraulic.head * effDelta * (pricePerMWh / 1000) * 24 * 30; // Monthly tax
            lostRevenueEuro += inefficiencyTax;
        }

        // 3. Potential Damage
        let potentialDamageEUR = 0;
        if (state.physics.surgePressureBar > 100) {
            potentialDamageEUR = 85000;
        } else if (state.physics.eccentricity > 0.8) {
            potentialDamageEUR = 120000;
        } else if (state.hydraulic.efficiency < taxThreshold) {
            potentialDamageEUR = 45000;
        }

        // 4. Maintenance Buffer
        const baseBuffer = coefficients?.maintenanceBaseCost || 150000;
        const maintenanceBufferEuro = Math.max(0, baseBuffer - (state.riskScore * 1250));

        // 5. Maintenance Savings (Preventative)
        const emergencyRepairCost = 120000;
        const preventativeActionCost = 15000;
        const savingsPotential = emergencyRepairCost - preventativeActionCost;
        const detectionConfidence = state.riskScore > 0 ? 0.85 : 0.1;
        const maintenanceSavingsEuro = savingsPotential * detectionConfidence;

        // 6. Leakage Cost Yearly
        const designFlow = state.site.designFlow || 3.0;
        const designPower = state.site.designPerformanceMW || 5.0;
        const designSWC = (designFlow * 3600) / (designPower * 1000);
        const actualSWC = state.physics.specificWaterConsumption || 0;

        let leakageCostYearly = 0;
        if (actualSWC > designSWC) {
            const extraWaterPerKWh = actualSWC - designSWC;
            const annualKWh = currentPower * 1000 * 24 * 365;
            leakageCostYearly = extraWaterPerKWh * annualKWh * 0.05;
        }

        // 7. Life Extension Savings (NC-4.2)
        // Approximate valuation of extending asset life by X years
        const annualAssetValue = (profile?.metadata.nominalPowerMW || 100) * 1000 * 0.05 * 8760; // 5% of annual revenue as asset value depreciation
        const extendedLifeYears = state.structural.extendedLifeYears || 0;
        const lifeExtensionSavings = annualAssetValue * extendedLifeYears;

        return {
            lostRevenueEuro,
            maintenanceBufferEuro,
            potentialDamageEUR: state.demoMode.active ? potentialDamageEUR : 0,
            maintenanceSavingsEuro,
            leakageCostYearly,
            lifeExtensionSavings // NEW: NC-4.2
        };
    }
};
