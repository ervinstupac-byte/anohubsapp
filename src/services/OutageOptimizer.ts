import { addHours, addDays } from 'date-fns';

export type PfailMap = Record<string, number>; // component -> P_fail (0-1)
export type PricePoint = { timestamp: number; priceEURperMWh: number };
export type BundleRecommendation = { components: string[]; reason: string };

export default class OutageOptimizer {
    /**
     * Find the 48-hour window in the next 30 days that maximizes combined score:
     * score = normRisk * (1 - normPrice). We normalize both risk and price to [0,1].
     */
    public static findOptimalOutageWindow(pfail: PfailMap, priceForecast: PricePoint[], now = Date.now()) {
        // Build hourly price array for next 30 days (720 hours)
        const horizonHours = 24 * 30;
        const horizonEnd = addHours(new Date(now), horizonHours).getTime();

        // Aggregate total risk (sum of Pfail) and track high-priority flags
        const totalRisk = Object.values(pfail).reduce((s, v) => s + (v || 0), 0);
        const maxRisk = Math.max(...Object.values(pfail).map(v => v || 0), 0.0001);

        // Normalize function helpers
        const normalize = (v: number, min: number, max: number) => {
            if (max - min === 0) return 0;
            return Math.min(1, Math.max(0, (v - min) / (max - min)));
        };

        // Map priceForecast into a lookup by hour timestamp (rounded to hour)
        const hourPrice: Record<number, number> = {};
        priceForecast.forEach(p => {
            const hr = Math.floor(p.timestamp / 1000 / 3600) * 3600 * 1000;
            hourPrice[hr] = p.priceEURperMWh;
        });

        // Determine price range across horizon
        const prices = Object.values(hourPrice).filter(x => typeof x === 'number');
        const minPrice = prices.length ? Math.min(...prices) : 0;
        const maxPrice = prices.length ? Math.max(...prices) : 1;

        // Build hourly entries for the horizon
        const hours: { ts: number; price: number }[] = [];
        for (let h = 0; h < horizonHours; h++) {
            const ts = addHours(new Date(now), h).getTime();
            const hrKey = Math.floor(ts / 1000 / 3600) * 3600 * 1000;
            hours.push({ ts, price: hourPrice[hrKey] ?? ((minPrice + maxPrice) / 2) });
        }

        // Sliding window of 48 hours (48 entries)
        let best: { start: number; end: number; score: number; avgPrice: number } | null = null;
        const windowSize = 48;
        for (let i = 0; i + windowSize <= hours.length; i++) {
            const window = hours.slice(i, i + windowSize);
            const avgPrice = window.reduce((s, w) => s + w.price, 0) / window.length;

            // For risk: we assume Pfail is constant over horizon; higher Pfail means more urgent.
            const riskScore = totalRisk; // raw; later normalized

            const normRisk = normalize(riskScore, 0, Object.keys(pfail).length * 1); // max possible sum = numComponents * 1
            const normPrice = normalize(avgPrice, minPrice, maxPrice);

            // Combined score: prefer windows with high risk and low price
            const score = normRisk * (1 - normPrice);

            if (!best || score > best.score) {
                best = { start: window[0].ts, end: window[window.length - 1].ts, score, avgPrice };
            }
        }

        // Bundling: if any component Pfail > 0.5 treat as high-priority and bundle medium ones (0.2-0.5)
        const highPriority = Object.keys(pfail).filter(k => (pfail[k] || 0) > 0.5);
        const mediumPriority = Object.keys(pfail).filter(k => (pfail[k] || 0) >= 0.2 && (pfail[k] || 0) <= 0.5);

        const bundles: BundleRecommendation[] = [];
        if (highPriority.length) {
            bundles.push({ components: highPriority.concat(mediumPriority), reason: 'High-priority failure(s) detected — bundle medium-priority maintenance.' });
        }

        return {
            optimalWindow: best,
            bundles,
            calculatedAt: now,
            horizonHours
        };
    }

    public static getConfidenceScore(..._args: any[]): number {
        // Outage optimization works on deterministic inputs; return conservative neutral score
        return 50;
    }
}
