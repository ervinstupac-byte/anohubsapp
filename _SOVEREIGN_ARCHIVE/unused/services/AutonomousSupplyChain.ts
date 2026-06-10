/**
 * AUTONOMOUS SUPPLY CHAIN
 * The Auto-Order Logic 📦💳
 * Pre-orders parts when Life is low and Bank is high.
 */

export interface SupplyOrder {
    partId: string;
    partName: string;
    status: 'ORDERED' | 'PENDING_FUNDS' | 'NOT_NEEDED';
    cost: number;
    deliveryEta: string;
}

export class AutonomousSupplyChain {

    /**
     * CHECK SUPPLY NEEDS
     * Decides if we buy now.
     */
    checkSupplyNeeds(
        partId: string,
        partName: string,
        remainingLifePercent: number,
        bankBalanceEur: number
    ): SupplyOrder {
        const REPLACEMENT_THRESHOLD = 15; // Order when 15% life remains
        const PART_COST = 500000; // €500k for major part

        if (remainingLifePercent < REPLACEMENT_THRESHOLD) {
            if (bankBalanceEur > PART_COST * 2) { // Safety buffer
                return {
                    partId,
                    partName,
                    status: 'ORDERED',
                    cost: PART_COST,
                    deliveryEta: '6 Months (Auto-Scheduled)'
                };
            } else {
                return {
                    partId,
                    partName,
                    status: 'PENDING_FUNDS',
                    cost: PART_COST,
                    deliveryEta: 'N/A'
                };
            }
        }

        return {
            partId,
            partName,
            status: 'NOT_NEEDED',
            cost: 0,
            deliveryEta: 'N/A'
        };
    }
}
