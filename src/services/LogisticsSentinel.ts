/**
 * LogisticsSentinel
 * Maps component wear levels to spare part recommendations and connects to OutageOptimizer.
 */
import OutageOptimizer, { PfailMap, PricePoint } from './OutageOptimizer';
import BaseGuardian from './BaseGuardian';

export type WearMap = Record<string, number>; // component -> wearPct (0-100)
export type SpareRecommendation = { component: string; recommendedSpare: string; qty: number; leadTimeDays: number };

export default class LogisticsSentinel extends BaseGuardian {
    private leadTimeDb: Record<string, number> = {
        'thrust-bearing': 14,
        'runner-bucket': 21,
        'nozzle-needle': 7,
        'transformer-winding': 30,
        'seal-kit': 5
    };

    mapWearToSpares(wear: WearMap): SpareRecommendation[] {
        const recs: SpareRecommendation[] = [];
        for (const k of Object.keys(wear)) {
            const w = wear[k] || 0;
            if (w >= 80) {
                // critical: ensure 2 spares
                recs.push({ component: k, recommendedSpare: `${k}-SPARE`, qty: 2, leadTimeDays: this.leadTimeDb[k] || 14 });
            } else if (w >= 50) {
                recs.push({ component: k, recommendedSpare: `${k}-SPARE`, qty: 1, leadTimeDays: this.leadTimeDb[k] || 14 });
            }
        }
        return recs;
    }

    /**
     * Convert wear map to PfailMap consumable by OutageOptimizer
     */
    toPfailMap(wear: WearMap): PfailMap {
        const pf: PfailMap = {};
        for (const k of Object.keys(wear)) {
            // simple mapping: wear% -> Pfail (0-1) non-linear
            const w = Math.min(100, Math.max(0, wear[k] || 0));
            pf[k] = Math.pow(w / 100, 2); // quadratic sensitivity
        }
        return pf;
    }

    recommendOutageBundle(wear: WearMap, priceForecast: PricePoint[]) {
        const pf = this.toPfailMap(wear);
        return OutageOptimizer.findOptimalOutageWindow(pf, priceForecast || []);
    }

    public getConfidenceScore(..._args: any[]): number {
        return this.corrToScore(0);
    }
}
