/**
 * NegotiatorModule.ts
 * 
 * Smart Contract PPA (Power Purchase Agreement) Engine
 * Generates and offers dynamic energy contracts to off-takers
 * based on predicted hydrological excess
 */

export interface PPAOffer {
    offerId: string;
    timestamp: number;
    offerType: 'SPOT' | 'DAY_AHEAD' | 'WEEK_AHEAD' | 'BASELOAD';
    volume: number; // MWh
    price: number; // EUR/MWh
    deliveryStart: number; // timestamp
    deliveryEnd: number; // timestamp
    terms: {
        minTakeOrPay: number; // % (e.g., 80%)
        indexation: 'FIXED' | 'INDEXED';
        settlementPeriod: 'HOURLY' | 'DAILY' | 'MONTHLY';
    };
    status: 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
    counterparty?: string;
}

export interface HydrologicalExcess {
    predictedInflow: number; // m³/s
    baselineLoad: number; // MW (committed capacity)
    excessCapacity: number; // MW (available for offers)
    confidence: number; // 0-1
    duration: number; // hours
}

export class NegotiatorModule {
    private static offers: Map<string, PPAOffer> = new Map();
    private static readonly MARKUP_SPOT = 1.15; // 15% markup over spot
    private static readonly MARKUP_FORWARD = 1.08; // 8% markup for forward

    /**
     * Detect hydrological excess
     */
    public static detectHydrologicalExcess(
        predictedInflow: number,
        currentLoad: number,
        maxCapacity: number
    ): HydrologicalExcess | null {
        const baselineLoad = currentLoad;
        const potentialCapacity = Math.min(maxCapacity, predictedInflow * 0.9); // 90% conversion efficiency
        const excessCapacity = Math.max(0, potentialCapacity - baselineLoad);

        if (excessCapacity < 5) {
            return null; // Not enough excess to offer
        }

        return {
            predictedInflow,
            baselineLoad,
            excessCapacity,
            confidence: 0.85,
            duration: 4 // hours (mock)
        };
    }

    /**
     * Generate dynamic PPA offer
     */
    public static generateOffer(
        excess: HydrologicalExcess,
        marketPrice: number,
        offerType: PPAOffer['offerType'] = 'DAY_AHEAD'
    ): PPAOffer {
        const offerId = `PPA-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        // Calculate offer price
        const markup = offerType === 'SPOT' ? this.MARKUP_SPOT : this.MARKUP_FORWARD;
        const price = marketPrice * markup;

        // Calculate volume (MWh = MW × hours)
        const volume = excess.excessCapacity * excess.duration;

        // Delivery window
        const deliveryStart = Date.now() + (offerType === 'SPOT' ? 0 : 24 * 60 * 60 * 1000);
        const deliveryEnd = deliveryStart + excess.duration * 60 * 60 * 1000;

        const offer: PPAOffer = {
            offerId,
            timestamp: Date.now(),
            offerType,
            volume,
            price,
            deliveryStart,
            deliveryEnd,
            terms: {
                minTakeOrPay: 80, // 80% take-or-pay
                indexation: offerType === 'BASELOAD' ? 'INDEXED' : 'FIXED',
                settlementPeriod: offerType === 'SPOT' ? 'HOURLY' : 'DAILY'
            },
            status: 'OFFERED'
        };

        this.offers.set(offerId, offer);

        console.log('\n' + '═'.repeat(80));
        console.log('📋 PPA OFFER GENERATED');
        console.log('═'.repeat(80));
        console.log(`Offer ID: ${offerId}`);
        console.log(`Type: ${offerType}`);
        console.log(`Volume: ${volume.toFixed(0)} MWh`);
        console.log(`Price: €${price.toFixed(2)}/MWh`);
        console.log(`Delivery: ${new Date(deliveryStart).toISOString()} - ${new Date(deliveryEnd).toISOString()}`);
        console.log(`Total Value: €${(volume * price).toFixed(0)}`);
        console.log('═'.repeat(80) + '\n');

        return offer;
    }

    /**
     * Broadcast offer to off-takers
     */
    public static broadcastOffer(offer: PPAOffer, counterparties: string[]): void {
        console.log(`[Negotiator] Broadcasting offer ${offer.offerId} to ${counterparties.length} counterparties`);

        // In production: Send to actual off-takers via API
        // - Industrial consumers
        // - Energy traders
        // - Other utilities

        for (const counterparty of counterparties) {
            console.log(`  → ${counterparty}`);
        }
    }

    /**
     * Accept offer from counterparty
     */
    public static acceptOffer(
        offerId: string,
        counterparty: string
    ): { success: boolean; contract?: PPAOffer } {
        const offer = this.offers.get(offerId);

        if (!offer) {
            return { success: false };
        }

        if (offer.status !== 'OFFERED') {
            console.log(`[Negotiator] Offer ${offerId} no longer available (${offer.status})`);
            return { success: false };
        }

        offer.status = 'ACCEPTED';
        offer.counterparty = counterparty;

        console.log('\n' + '✅'.repeat(40));
        console.log(`PPA CONTRACT EXECUTED`);
        console.log('✅'.repeat(40));
        console.log(`Offer ID: ${offerId}`);
        console.log(`Counterparty: ${counterparty}`);
        console.log(`Volume: ${offer.volume.toFixed(0)} MWh`);
        console.log(`Revenue: €${(offer.volume * offer.price).toFixed(0)}`);
        console.log('✅'.repeat(40) + '\n');

        return { success: true, contract: offer };
    }

    /**
     * Optimize PPA strategy
     */
    public static optimizePPAStrategy(
        excessForecast: HydrologicalExcess[],
        priceForecast: { timestamp: number; price: number }[]
    ): {
        recommendedOffers: Array<{
            offerType: PPAOffer['offerType'];
            volume: number;
            price: number;
            expectedRevenue: number;
        }>;
        totalRevenue: number;
    } {
        const recommendedOffers: Array<{
            offerType: PPAOffer['offerType'];
            volume: number;
            price: number;
            expectedRevenue: number;
        }> = [];

        let totalRevenue = 0;

        // Strategy: Match excess capacity with price peaks
        for (let i = 0; i < excessForecast.length && i < priceForecast.length; i++) {
            const excess = excessForecast[i];
            const price = priceForecast[i].price;

            const volume = excess.excessCapacity * excess.duration;
            const offerPrice = price * this.MARKUP_FORWARD;
            const expectedRevenue = volume * offerPrice;

            recommendedOffers.push({
                offerType: price > 80 ? 'SPOT' : 'DAY_AHEAD',
                volume,
                price: offerPrice,
                expectedRevenue
            });

            totalRevenue += expectedRevenue;
        }

        return { recommendedOffers, totalRevenue };
    }

    /**
     * Get contract statistics
     */
    public static getStatistics(): {
        totalOffers: number;
        accepted: number;
        rejected: number;
        pending: number;
        totalRevenue: number;
    } {
        const offers = Array.from(this.offers.values());

        return {
            totalOffers: offers.length,
            accepted: offers.filter(o => o.status === 'ACCEPTED').length,
            rejected: offers.filter(o => o.status === 'REJECTED').length,
            pending: offers.filter(o => o.status === 'OFFERED').length,
            totalRevenue: offers
                .filter(o => o.status === 'ACCEPTED')
                .reduce((sum, o) => sum + o.volume * o.price, 0)
        };
    }

    /**
     * Export PPA portfolio
     */
    public static exportPortfolio(): string {
        const stats = this.getStatistics();
        const contracts = Array.from(this.offers.values()).filter(o => o.status === 'ACCEPTED');

        let report = '';
        report += '═'.repeat(80) + '\n';
        report += 'PPA CONTRACT PORTFOLIO\n';
        report += '═'.repeat(80) + '\n';
        report += `Generated: ${new Date().toISOString()}\n\n`;

        report += 'SUMMARY:\n';
        report += `  Total Offers: ${stats.totalOffers}\n`;
        report += `  Accepted: ${stats.accepted}\n`;
        report += `  Total Revenue: €${stats.totalRevenue.toLocaleString()}\n\n`;

        report += 'ACTIVE CONTRACTS:\n';
        for (const contract of contracts) {
            report += `  ${contract.offerId}\n`;
            report += `    Counterparty: ${contract.counterparty}\n`;
            report += `    Volume: ${contract.volume.toFixed(0)} MWh\n`;
            report += `    Price: €${contract.price.toFixed(2)}/MWh\n`;
            report += `    Revenue: €${(contract.volume * contract.price).toFixed(0)}\n`;
        }

        report += '═'.repeat(80) + '\n';

        return report;
    }
}
