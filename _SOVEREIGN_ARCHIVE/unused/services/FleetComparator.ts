/**
 * FLEET COMPARATOR
 * The Benchmarking Scout 📊🏰
 * Ranks sites by Efficiency, Reliability, and Profit.
 */

export interface SiteStats {
    id: string;
    name: string;
    efficiencyScore: number; // 0-100
    reliabilityScore: number; // 0-100
    profitPerMw: number;
}

export interface FleetRanking {
    efficiencyKing: string;
    reliabilityKing: string;
    profitKing: string;
    details: SiteStats[];
}

export class FleetComparator {

    /**
     * COMPARE SITES
     * Ranks the fleet and awards crowns.
     */
    compareSites(sites: SiteStats[]): FleetRanking {
        const sortedEff = [...sites].sort((a, b) => b.efficiencyScore - a.efficiencyScore);
        const sortedRel = [...sites].sort((a, b) => b.reliabilityScore - a.reliabilityScore);
        const sortedProfit = [...sites].sort((a, b) => b.profitPerMw - a.profitPerMw);

        return {
            efficiencyKing: sortedEff[0].name,
            reliabilityKing: sortedRel[0].name,
            profitKing: sortedProfit[0].name,
            details: sites
        };
    }
}
