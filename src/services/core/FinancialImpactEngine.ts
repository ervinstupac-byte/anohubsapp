import { TechnicalProjectState, PhysicsResult } from '../../core/TechnicalSchema';
import { ProfileLoader } from '../ProfileLoader';
import BaseGuardian from '../BaseGuardian';
import Decimal from 'decimal.js';

/**
 * FINANCIAL IMPACT ENGINE (NC-4.2)
 * Decoupled economic valuation of asset health and performance.
 * 
 * NC-2000 UPGRADE: Added NPV, IRR, and Simple Payback calculations
 * All financial calculations use Decimal.js for precision.
 */

// ============================================================================
// NPV CALCULATION TYPES
// ============================================================================

export interface CashFlow {
    year: number;
    amount: number;  // Positive for inflow, negative for outflow
}

export interface NPVCriteria {
    initialInvestment: number;
    annualCashFlows: number[];  // Year 1, Year 2, etc.
    discountRate: number;       // e.g., 0.08 for 8%
    salvageValue?: number;      // End of life value
}

export interface NPVResult {
    npv: number;
    totalPresentValue: number;
    initialInvestment: number;
    decision: 'ACCEPT' | 'REJECT';
    paybackYears: number;
    irr: number | null;
    roi: number;
    yearlyBreakdown: {
        year: number;
        cashFlow: number;
        presentValue: number;
        cumulativeNPV: number;
    }[];
}

export interface MaintenanceInvestmentAnalysis {
    maintenanceCost: number;
    avoidedFailureCost: number;
    extendedLifeYears: number;
    efficiencyGain: number;  // % improvement
    energyPricePerMWh: number;
    powerMW: number;
}

class FinancialImpactEngineClass extends BaseGuardian {

    // ============================================================================
    // NPV, IRR, AND PAYBACK CALCULATIONS (NC-2000)
    // ============================================================================

    /**
     * Calculate Net Present Value (NPV)
     * NPV = Σ(CashFlow_t / (1 + r)^t) - InitialInvestment
     * 
     * @param criteria - Investment criteria including cash flows and discount rate
     * @returns Complete NPV analysis with yearly breakdown
     */
    calculateNPV(criteria: NPVCriteria): NPVResult {
        const r = new Decimal(criteria.discountRate);
        const initialInv = new Decimal(criteria.initialInvestment);
        const salvage = new Decimal(criteria.salvageValue || 0);
        
        let totalPV = new Decimal(0);
        const yearlyBreakdown: NPVResult['yearlyBreakdown'] = [];
        
        // Calculate present value of each year's cash flow
        criteria.annualCashFlows.forEach((cashFlow, index) => {
            const year = index + 1;
            const cf = new Decimal(cashFlow);
            const discountFactor = new Decimal(1).plus(r).pow(year);
            const presentValue = cf.div(discountFactor);
            
            totalPV = totalPV.plus(presentValue);
            
            // Cumulative NPV up to this year
            const cumulativeNPV = totalPV.minus(initialInv).toNumber();
            
            yearlyBreakdown.push({
                year,
                cashFlow,
                presentValue: presentValue.toNumber(),
                cumulativeNPV
            });
        });
        
        // Add salvage value in final year if provided
        if (criteria.salvageValue && criteria.salvageValue > 0) {
            const finalYear = criteria.annualCashFlows.length;
            const salvagePV = salvage.div(new Decimal(1).plus(r).pow(finalYear));
            totalPV = totalPV.plus(salvagePV);
            
            // Update final year breakdown
            const finalYearData = yearlyBreakdown[finalYear - 1];
            if (finalYearData) {
                finalYearData.presentValue += salvagePV.toNumber();
                finalYearData.cumulativeNPV = totalPV.minus(initialInv).toNumber();
            }
        }
        
        const npv = totalPV.minus(initialInv);
        
        // Calculate simple payback period
        const paybackYears = this.calculateSimplePayback(
            criteria.initialInvestment,
            criteria.annualCashFlows
        );
        
        // Calculate IRR using approximation
        const irr = this.calculateIRR(criteria);
        
        // ROI = (Total Return - Investment) / Investment
        const totalReturn = criteria.annualCashFlows.reduce((a, b) => a + b, 0) + 
                           (criteria.salvageValue || 0);
        const roi = initialInv.greaterThan(0) 
            ? new Decimal(totalReturn).minus(initialInv).div(initialInv).mul(100).toNumber()
            : 0;
        
        return {
            npv: npv.toNumber(),
            totalPresentValue: totalPV.toNumber(),
            initialInvestment: criteria.initialInvestment,
            decision: npv.greaterThan(0) ? 'ACCEPT' : 'REJECT',
            paybackYears,
            irr,
            roi,
            yearlyBreakdown
        };
    }

    /**
     * Calculate Simple Payback Period
     * Years = InitialInvestment / AnnualCashFlow
     * For variable cash flows, finds when cumulative cash flow equals investment
     * 
     * @param initialInvestment - Upfront cost
     * @param annualCashFlows - Array of yearly cash inflows
     * @returns Years to recover investment (negative if never recovers)
     */
    calculateSimplePayback(initialInvestment: number, annualCashFlows: number[]): number {
        const inv = new Decimal(initialInvestment);
        let cumulativeCashFlow = new Decimal(0);
        
        for (let i = 0; i < annualCashFlows.length; i++) {
            cumulativeCashFlow = cumulativeCashFlow.plus(annualCashFlows[i]);
            
            if (cumulativeCashFlow.greaterThanOrEqualTo(inv)) {
                // Interpolate for partial year
                const prevCumulative = cumulativeCashFlow.minus(annualCashFlows[i]);
                const remaining = inv.minus(prevCumulative);
                const fraction = remaining.div(annualCashFlows[i]);
                return new Decimal(i).plus(fraction).toNumber();
            }
        }
        
        // Never pays back
        return -1;
    }

    /**
     * Calculate Internal Rate of Return (IRR) using Newton-Raphson approximation
     * Finds discount rate where NPV = 0
     * 
     * @param criteria - Investment criteria
     * @returns IRR as decimal (e.g., 0.12 for 12%) or null if cannot calculate
     */
    calculateIRR(criteria: NPVCriteria): number | null {
        const { initialInvestment, annualCashFlows, salvageValue = 0 } = criteria;
        
        // Add salvage to final cash flow
        const flows = [...annualCashFlows];
        if (salvageValue > 0 && flows.length > 0) {
            flows[flows.length - 1] += salvageValue;
        }
        
        // Newton-Raphson iteration to find IRR
        let rate = 0.1; // Initial guess: 10%
        const maxIterations = 100;
        const precision = 0.0001;
        
        for (let i = 0; i < maxIterations; i++) {
            const npv = this.calculateNPVAtRate(initialInvestment, flows, rate);
            const npvDerivative = this.calculateNPVDerivative(initialInvestment, flows, rate);
            
            if (Math.abs(npv) < precision) {
                return rate;
            }
            
            if (Math.abs(npvDerivative) < 0.0001) {
                return null; // Cannot converge
            }
            
            const newRate = rate - npv / npvDerivative;
            
            // Ensure rate stays reasonable (-1 < rate < 2)
            if (newRate <= -1 || newRate >= 2) {
                return null;
            }
            
            rate = newRate;
        }
        
        return rate;
    }

    /**
     * Calculate NPV at a specific discount rate (helper for IRR)
     */
    private calculateNPVAtRate(initialInvestment: number, cashFlows: number[], rate: number): number {
        let pv = new Decimal(0);
        const r = new Decimal(rate);
        
        cashFlows.forEach((cf, index) => {
            const year = index + 1;
            const presentValue = new Decimal(cf).div(new Decimal(1).plus(r).pow(year));
            pv = pv.plus(presentValue);
        });
        
        return pv.minus(initialInvestment).toNumber();
    }

    /**
     * Calculate derivative of NPV for Newton-Raphson (helper for IRR)
     */
    private calculateNPVDerivative(initialInvestment: number, cashFlows: number[], rate: number): number {
        let derivative = new Decimal(0);
        const r = new Decimal(rate);
        
        cashFlows.forEach((cf, index) => {
            const year = index + 1;
            // d/dr [CF / (1+r)^t] = -t * CF / (1+r)^(t+1)
            const term = new Decimal(-year).mul(cf).div(new Decimal(1).plus(r).pow(year + 1));
            derivative = derivative.plus(term);
        });
        
        return derivative.toNumber();
    }

    /**
     * Analyze maintenance investment using NPV methodology
     * Compares do-nothing vs maintenance scenarios
     * 
     * @param analysis - Maintenance investment parameters
     * @param discountRate - Discount rate for NPV calculation
     * @returns NPV comparison and recommendation
     */
    analyzeMaintenanceInvestment(
        analysis: MaintenanceInvestmentAnalysis,
        discountRate: number = 0.08,
        analysisYears: number = 10
    ): {
        maintenanceNPV: NPVResult;
        doNothingNPV: NPVResult;
        recommendation: 'MAINTENANCE' | 'DEFER';
        netBenefit: number;
        efficiencyValueOverLife: number;
    } {
        const powerMW = new Decimal(analysis.powerMW);
        const hoursPerYear = new Decimal(8760); // Full year operation
        const energyPrice = new Decimal(analysis.energyPricePerMWh);
        const efficiencyGain = new Decimal(analysis.efficiencyGain).div(100);
        
        // Calculate annual efficiency gain value
        const annualEfficiencyGainMW = powerMW.mul(efficiencyGain);
        const annualEfficiencyValue = annualEfficiencyGainMW.mul(hoursPerYear).mul(energyPrice);
        
        // Maintenance scenario cash flows
        const maintenanceFlows: number[] = [];
        for (let year = 1; year <= analysisYears; year++) {
            let cashFlow = annualEfficiencyValue.toNumber();
            
            // Add avoided failure cost (probability-weighted)
            const failureProbability = 0.1; // 10% chance of failure per year without maintenance
            cashFlow += analysis.avoidedFailureCost * failureProbability;
            
            // Year 0 is the maintenance cost
            if (year === 1) {
                cashFlow -= analysis.maintenanceCost;
            }
            
            maintenanceFlows.push(cashFlow);
        }
        
        // Add extended life value in final year
        const extendedLifeValue = analysis.extendedLifeYears * annualEfficiencyValue.toNumber();
        maintenanceFlows[maintenanceFlows.length - 1] += extendedLifeValue;
        
        const maintenanceNPV = this.calculateNPV({
            initialInvestment: 0, // Maintenance cost is in year 1 cash flow
            annualCashFlows: maintenanceFlows,
            discountRate
        });
        
        // Do-nothing scenario (only failure costs)
        const doNothingFlows: number[] = [];
        for (let year = 1; year <= analysisYears; year++) {
            const failureProbability = 0.1 * year; // Increasing probability
            const expectedFailureCost = analysis.avoidedFailureCost * Math.min(failureProbability, 0.5);
            doNothingFlows.push(-expectedFailureCost);
        }
        
        const doNothingNPV = this.calculateNPV({
            initialInvestment: 0,
            annualCashFlows: doNothingFlows,
            discountRate
        });
        
        const netBenefit = maintenanceNPV.npv - doNothingNPV.npv;
        
        return {
            maintenanceNPV,
            doNothingNPV,
            recommendation: netBenefit > 0 ? 'MAINTENANCE' : 'DEFER',
            netBenefit,
            efficiencyValueOverLife: annualEfficiencyValue.mul(analysisYears).toNumber()
        };
    }

    /**
     * Quick LCOE (Levelized Cost of Energy) calculation
     * LCOE = (Initial + Σ(O&M)) / Σ(Energy)
     */
    calculateLCOE(
        initialInvestment: number,
        annualOMCost: number,
        annualEnergyMWh: number,
        lifetimeYears: number,
        discountRate: number
    ): number {
        const initial = new Decimal(initialInvestment);
        const om = new Decimal(annualOMCost);
        const energy = new Decimal(annualEnergyMWh);
        const r = new Decimal(discountRate);
        
        // Present value of O&M costs
        let pvOM = new Decimal(0);
        for (let year = 1; year <= lifetimeYears; year++) {
            const pv = om.div(new Decimal(1).plus(r).pow(year));
            pvOM = pvOM.plus(pv);
        }
        
        // Present value of energy production
        let pvEnergy = new Decimal(0);
        for (let year = 1; year <= lifetimeYears; year++) {
            const pv = energy.div(new Decimal(1).plus(r).pow(year));
            pvEnergy = pvEnergy.plus(pv);
        }
        
        const totalCost = initial.plus(pvOM);
        return totalCost.div(pvEnergy).toNumber();
    }

    // ============================================================================
    // EXISTING CALCULATIONS (NC-4.2)
    // ============================================================================

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
    calculateNetProfit: financialImpactEngine.calculateNetProfit.bind(financialImpactEngine),
    // NC-2000: Export new financial calculation methods
    calculateNPV: financialImpactEngine.calculateNPV.bind(financialImpactEngine),
    calculateSimplePayback: financialImpactEngine.calculateSimplePayback.bind(financialImpactEngine),
    calculateIRR: financialImpactEngine.calculateIRR.bind(financialImpactEngine),
    analyzeMaintenanceInvestment: financialImpactEngine.analyzeMaintenanceInvestment.bind(financialImpactEngine),
    calculateLCOE: financialImpactEngine.calculateLCOE.bind(financialImpactEngine)
} as {
    calculateImpact: (state: TechnicalProjectState, physics: PhysicsResult, opts?: any) => any;
    calculateNetProfit: (energyRevenue: number, fcrRevenue: number, carbonRevenue: number, molecularDebt: number) => any;
    calculateNPV: (criteria: NPVCriteria) => NPVResult;
    calculateSimplePayback: (initialInvestment: number, annualCashFlows: number[]) => number;
    calculateIRR: (criteria: NPVCriteria) => number | null;
    analyzeMaintenanceInvestment: (analysis: MaintenanceInvestmentAnalysis, discountRate?: number, analysisYears?: number) => any;
    calculateLCOE: (initialInvestment: number, annualOMCost: number, annualEnergyMWh: number, lifetimeYears: number, discountRate: number) => number;
};

// Also export the class for type references if needed
export { FinancialImpactEngineClass };
export default financialImpactEngine;
