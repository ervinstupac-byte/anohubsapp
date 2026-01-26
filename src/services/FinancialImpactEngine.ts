import { TechnicalProjectState, PhysicsResult } from '../core/TechnicalSchema';
import { ProfileLoader } from './ProfileLoader';
import BaseGuardian from './BaseGuardian';

/**
 * FINANCIAL IMPACT ENGINE (NC-4.2)
 * Decoupled economic valuation of asset health and performance.
 */
class FinancialImpactEngineClass extends BaseGuardian {
    /**
     * calculateImpact now accepts an options param as the third argument.
     * The third argument may be a numeric pricePerMWhOverride or an object:
     * { pricePerMWh?: number; sigma?: number; inventoryValue?: number; discountRate?: number }
     */
    calculateImpact(state: TechnicalProjectState, physics: PhysicsResult, opts?: any) {
        // If caller did not provide a state, attempt to source canonical state from ProjectStateManager
        if (!state) {
            try {
                // dynamic require to avoid bundling in browser
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const req = (Function('return require'))();
                const mgr = req('../contexts/ProjectStateContext').ProjectStateManager;
                if (mgr && typeof mgr.getState === 'function') {
                    state = mgr.getState();
                }
            } catch (e) {
                // ignore and continue — calculation will likely be incomplete
            }
        }
        const profile = ProfileLoader.getProfile(state.identity.turbineType);
        const coefficients = profile?.math.coefficients;

        // Backwards-compatible: allow passing number as third arg
        let pricePerMWhOverride: number | undefined;
        let sigma: number | undefined;
        let inventoryValue: number | undefined;
        if (typeof opts === 'number') pricePerMWhOverride = opts;
        else if (typeof opts === 'object' && opts !== null) {
            pricePerMWhOverride = opts.pricePerMWh;
            sigma = typeof opts.sigma === 'number' ? opts.sigma : undefined;
            inventoryValue = typeof opts.inventoryValue === 'number' ? opts.inventoryValue : undefined;
        }

        const defaultPricePerMWh = coefficients?.revenuePerMWh || 85;
        const pricePerMWh = pricePerMWhOverride !== undefined ? pricePerMWhOverride : defaultPricePerMWh;

        const baselinePower = state.hydraulic.baselineOutputMW ? (typeof (state.hydraulic.baselineOutputMW as any).toNumber === 'function' ? (state.hydraulic.baselineOutputMW as any).toNumber() : Number(state.hydraulic.baselineOutputMW)) : (profile?.metadata.nominalPowerMW || 100);
        const currentPower = typeof (physics.powerMW as any)?.toNumber === 'function' ? (physics.powerMW as any).toNumber() : Number(physics.powerMW);

        // 1. Lost Revenue (compute hourly loss, annualized and 30-day projection)
        const powerLossMW = Math.max(0, baselinePower - currentPower);
        // pricePerMWh is EUR per MWh. MW * 1 hour -> MWh, so hourly loss in EUR is powerLossMW * pricePerMWh
        const hourlyLossEuro = powerLossMW * pricePerMWh;
        let lostRevenueEuro = hourlyLossEuro * 24 * 365; // Annualized impact
        const projection30DayEuro = hourlyLossEuro * 24 * 30; // 30-day projection

        // 2. Inefficiency Tax (first-order)
        const taxThreshold = coefficients?.inefficiencyTaxThreshold || 0.88;
        if ((state.hydraulic.efficiency ?? 0) < taxThreshold) {
            const effDelta = taxThreshold - (state.hydraulic.efficiency ?? 0);
            const flow = (state.hydraulic as any).flow ?? (state.hydraulic as any).flowRate ?? 0;
            const head = (state.hydraulic as any).head ?? (state.hydraulic as any).netHead ?? 0;
            const inefficiencyTax = flow * head * effDelta * (pricePerMWh / 1000) * 24 * 30; // Monthly tax estimate
            lostRevenueEuro += inefficiencyTax;
        }

        // 3. Potential Damage heuristics
        let potentialDamageEUR = 0;
        if ((state.physics as any).surgePressureBar > 100) potentialDamageEUR = 85000;
        else if ((state.physics as any).eccentricity > 0.8) potentialDamageEUR = 120000;
        else if ((state.hydraulic.efficiency ?? 0) < taxThreshold) potentialDamageEUR = 45000;

        // 4. Probabilistic Maintenance Model
        // Define representative components with base annual failure probabilities and base repair costs
        const components = [
            { key: 'bearing', baseProb: 0.02, baseCost: 45000 },
            { key: 'seal', baseProb: 0.04, baseCost: 8000 },
            { key: 'runner', baseProb: 0.005, baseCost: 120000 },
            { key: 'governor', baseProb: 0.01, baseCost: 15000 },
            { key: 'generator', baseProb: 0.008, baseCost: 60000 }
        ];

        // calibration multipliers
        const sigmaMultiplier = 1 + (typeof sigma === 'number' ? Math.min(5, sigma * 10) : 1); // higher sigma increases failure probability
        const riskMultiplier = 1 + ((state.riskScore || 0) / 100) * 0.5; // riskScore up to +50%

        // Age factor (hours since last overhaul / nominal life) - fallback to 1
        const ageFactor = (() => {
            const hours = state.selectedAsset?.totalOperatingHours || state.selectedAsset?.hoursSinceLastOverhaul || 0;
            const nominal = ((profile?.metadata as any)?.expectedOperatingHours) || (24 * 365 * 20); // default 20 years
            return 1 + Math.min(2, hours / nominal);
        })();

        // Estimate average spare-part multiplier from inventory (if provided)
        const inventoryMultiplier = inventoryValue && inventoryValue > 0 ? 1 - Math.min(0.5, inventoryValue / 1_000_000) : 1;

        let expectedMaintenanceCost = 0;
        for (const c of components) {
            const adjProb = c.baseProb * sigmaMultiplier * riskMultiplier * ageFactor;
            const avgRepairCost = c.baseCost * inventoryMultiplier; // better inventory reduces incremental repair spend
            expectedMaintenanceCost += adjProb * avgRepairCost;
        }

        // 5. Maintenance Savings (Preventative)
        const emergencyRepairCost = 120000;
        const preventativeActionCost = 15000;
        const detectionConfidence = state.riskScore > 0 ? 0.85 : 0.1;
        const maintenanceSavingsEuro = (emergencyRepairCost - preventativeActionCost) * detectionConfidence;

        // 6. Leakage Cost Yearly (unchanged semantics)
        const designFlow = state.site?.designFlow || 3.0;
        const designPower = state.site?.designPerformanceMW || 5.0;
        const designSWC = (designFlow * 3600) / (designPower * 1000);
        const actualSWC = (state.physics as any).specificWaterConsumption || 0;

        let leakageCostYearly = 0;
        if (actualSWC > designSWC) {
            const extraWaterPerKWh = actualSWC - designSWC;
            const annualKWh = currentPower * 1000 * 24 * 365;
            leakageCostYearly = extraWaterPerKWh * annualKWh * 0.05;
        }

        // 7. Life Extension Savings (coarse)
        const annualAssetValue = (profile?.metadata.nominalPowerMW || 100) * 1000 * 0.05 * 8760; // 5% of annual revenue as asset value depreciation
        const extendedLifeYears = state.structural.extendedLifeYears || 0;
        const lifeExtensionSavings = annualAssetValue * extendedLifeYears;

        // Compose outputs
        const maintenanceBufferEuro = Math.max(0, expectedMaintenanceCost * 1.2);

        return {
            // Revenue impacts
            hourlyLossEuro,
            projection30DayEuro,
            lostRevenueEuro,

            // Maintenance & risk
            maintenanceBufferEuro,
            expectedMaintenanceCost,
            potentialDamageEUR: state.demoMode.active ? potentialDamageEUR : 0,
            maintenanceSavingsEuro,
            leakageCostYearly,
            lifeExtensionSavings
        };
    }

    /**
     * CALCULATE NET PROFIT (SOVEREIGN FORMULA)
     * Profit_Net = (Rev_Energy + Rev_Carbon + Rev_FCR) - MolecularDebt
     */
    calculateNetProfit(
        energyRevenue: number,
        fcrRevenue: number,
        carbonRevenue: number,
        molecularDebt: number
    ) {
        const totalRevenue = energyRevenue + fcrRevenue + carbonRevenue;
        const netProfit = totalRevenue - molecularDebt;

        return {
            totalRevenue,
            netProfit,
            roi: molecularDebt > 0 ? (netProfit / molecularDebt) * 100 : 0
        };
    }

    /**
     * Get confidence score based on financial model accuracy and data completeness
     */
    public getConfidenceScore(state?: TechnicalProjectState, physics?: PhysicsResult): number {
        if (!state || !physics) return 50;
        
        // Check data completeness
        const hasPower = typeof physics.powerMW === 'number' || (physics.powerMW as any)?.toNumber;
        const hasEfficiency = typeof state.hydraulic.efficiency === 'number';
        const hasBaseline = typeof state.hydraulic.baselineOutputMW === 'number' || (state.hydraulic.baselineOutputMW as any)?.toNumber;
        
        let score = 60; // Base score
        if (hasPower) score += 15;
        if (hasEfficiency) score += 15;
        if (hasBaseline) score += 10;
        
        // Penalize if efficiency is very low (indicates data quality issues)
        if (hasEfficiency && state.hydraulic.efficiency < 50) score -= 20;
        
        return Math.max(0, Math.min(100, Math.round(score)));
    }
}

// Export singleton instance for backwards compatibility
const financialImpactEngine = new FinancialImpactEngineClass();

// Export as object for backwards compatibility (mimics the old object export)
export const FinancialImpactEngine = {
    calculateImpact: financialImpactEngine.calculateImpact.bind(financialImpactEngine),
    calculateNetProfit: financialImpactEngine.calculateNetProfit.bind(financialImpactEngine)
} as {
    calculateImpact: (state: TechnicalProjectState, physics: PhysicsResult, opts?: any) => any;
    calculateNetProfit: (energyRevenue: number, fcrRevenue: number, carbonRevenue: number, molecularDebt: number) => any;
};

// Also export the class for type references if needed
export { FinancialImpactEngineClass };
export default financialImpactEngine;
