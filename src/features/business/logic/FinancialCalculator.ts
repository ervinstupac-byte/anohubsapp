import { FinancialInput, FinancialOutput, FINANCIAL_THRESHOLDS } from '../types';
import Decimal from 'decimal.js';

/**
 * Pure Business Logic: Revenue Loss Calculator
 * 
 * Rules:
 * 1. If turbine is stopped, Operational Loss is 0 (we are not burning water).
 * 2. Loss = (Potential - Actual).
 * 3. Cannot have negative loss (if Actual > Potential, Loss = 0).
 * 4. Inputs sanitized (no negative powers).
 */
export const calculateRevenueLoss = (input: FinancialInput): FinancialOutput => {
    const { market, technical } = input;

    // Safety Force: Non-negative inputs
    const safeCurrentMW = Math.max(0, technical.currentActivePowerMW);
    const safeDesignMW = Math.max(0, technical.designRatedPowerMW);
    const safePrice = Math.max(0, market.energyPricePerMWh);

    const timestamp = new Date().toISOString();

    // EDGE CASE 1: Turbine Stopped
    if (!technical.isTurbineRunning) {
        return {
            revenueLossPerHour: 0,
            currentRevenuePerHour: 0,
            potentialRevenuePerHour: safeDesignMW * safePrice, // Potential is strictly theoretical here
            efficiencyLossPercent: 0,
            isCritical: false,
            calculationTimestamp: timestamp
        };
    }

    // EDGE CASE 2: Invalid Design Power (Avoid Div/0)
    if (safeDesignMW === 0) {
        return {
            revenueLossPerHour: 0,
            currentRevenuePerHour: safeCurrentMW * safePrice,
            potentialRevenuePerHour: 0,
            efficiencyLossPercent: 0,
            isCritical: false,
            calculationTimestamp: timestamp
        };
    }

    // CORE CALCULATION
    // Use Decimal for precision in money (though number is usually fine for display, strict protocol suggests robustness)
    const priceD = new Decimal(safePrice);
    const designD = new Decimal(safeDesignMW);
    const currentD = new Decimal(safeCurrentMW);

    const potentialRev = designD.mul(priceD);
    const currentRev = currentD.mul(priceD);

    // Loss is gap. If current > design (overload), loss is 0.
    const lossD = potentialRev.minus(currentRev);
    const finalLoss = Decimal.max(0, lossD); // Clamp to 0

    // Efficiency Loss % = (Loss / Potential) * 100
    const effLossPct = potentialRev.gt(0)
        ? finalLoss.div(potentialRev).mul(100)
        : new Decimal(0);

    const lossVal = finalLoss.toNumber();

    return {
        revenueLossPerHour: Number(lossVal.toFixed(2)),
        currentRevenuePerHour: Number(currentRev.toNumber().toFixed(2)),
        potentialRevenuePerHour: Number(potentialRev.toNumber().toFixed(2)),
        efficiencyLossPercent: Number(effLossPct.toNumber().toFixed(1)),
        isCritical: lossVal > FINANCIAL_THRESHOLDS.CRITICAL_LOSS_EUR_HR,
        calculationTimestamp: timestamp
    };
};
