/**
 * LogisticsResilienceManager.ts
 * 
 * Inventory Tracking & Criticality Analysis
 * Links physical stock to RUL (Remaining Useful Life) predictions.
 * Calculates "Criticality Index" to prioritize procurement.
 */

export interface SparePart {
    partId: string;
    name: string;
    currentStock: number;
    minStockLevel: number;
    leadTimeDays: number;
    isPrintable: boolean;
    costEur: number;
    rulHours?: number; // From NC-33 if applicable (lifetime of currently installed part)
    criticalityIndex: number; // 0-100
    status: 'HEALTHY' | 'LOW_STOCK' | 'CRITICAL_SHORTAGE';
}

export class LogisticsResilienceManager {

    /**
     * EVALUATE INVENTORY
     */
    public static evaluatePart(
        part: Omit<SparePart, 'criticalityIndex' | 'status'>,
        consumptionRatePerYear: number
    ): SparePart {

        // 1. Calculate Stock Coverage
        // Days of stock = (Stock / AnnualConsumption) * 365
        const dailyConsumption = consumptionRatePerYear / 365;
        const stockCoverageDays = part.currentStock / dailyConsumption;

        // 2. Determine Criticality Index
        // Risk = (LeadTime / StockCoverage) * ImportanceFactor
        // If LeadTime > StockCoverage, we are in trouble.

        let riskRatio = 0;
        if (stockCoverageDays > 0) {
            riskRatio = part.leadTimeDays / stockCoverageDays;
        } else {
            riskRatio = 999; // Infinite risk
        }

        // Normalize to 0-100 scale
        // Ratio 1.0 = Critical (Just enough stock for lead time)
        // Ratio > 1.0 = Shortage likely
        let criticality = riskRatio * 50;

        // Bonus risk if RUL is low (Installed part failing soon)
        if (part.rulHours && part.rulHours < (part.leadTimeDays * 24)) {
            criticality += 30; // High urgency
        }

        criticality = Math.min(100, criticality);

        // 3. Status
        let status: SparePart['status'] = 'HEALTHY';
        if (part.currentStock <= part.minStockLevel) status = 'LOW_STOCK';
        if (stockCoverageDays < part.leadTimeDays) status = 'CRITICAL_SHORTAGE';

        return {
            ...part,
            criticalityIndex: criticality,
            status
        };
    }
}
