export interface HillChartPoint {
    head: number;
    flow: number;
    eta: number; // efficiency %
}

export interface EfficiencyResult {
    etaMax: number;
    deltaToOptimum: number;
}

export class EfficiencyOptimizer {
    private static readonly HEAD_GRID: number[] = [10, 20, 30, 40, 50, 60, 70];
    private static readonly FLOW_GRID: number[] = [5, 10, 15, 20, 25, 30, 35];

    private static readonly ETA_GRID: number[][] = [
        [86.0, 88.5, 90.0, 91.0, 91.5, 91.0, 90.2], // H=10
        [87.0, 89.5, 91.2, 92.0, 92.3, 91.8, 90.8], // H=20
        [88.5, 90.5, 92.0, 93.0, 92.8, 92.0, 91.0], // H=30
        [89.0, 91.0, 92.8, 93.5, 93.2, 92.5, 91.5], // H=40
        [88.8, 91.2, 93.0, 93.8, 93.5, 92.8, 91.6], // H=50
        [88.0, 90.5, 92.5, 93.2, 93.0, 92.2, 91.0], // H=60
        [87.0, 89.8, 91.8, 92.5, 92.3, 91.5, 90.2], // H=70
    ];

    private static findBounds(val: number, grid: number[]): { i0: number; i1: number; t: number } {
        if (val <= grid[0]) return { i0: 0, i1: 0, t: 0 };
        if (val >= grid[grid.length - 1]) {
            const last = grid.length - 1;
            return { i0: last, i1: last, t: 0 };
        }
        for (let i = 0; i < grid.length - 1; i++) {
            const g0 = grid[i];
            const g1 = grid[i + 1];
            if (val >= g0 && val <= g1) {
                const t = (val - g0) / (g1 - g0);
                return { i0: i, i1: i + 1, t };
            }
        }
        // Fallback (should never hit)
        return { i0: 0, i1: 0, t: 0 };
    }

    private static bilinear(head: number, flow: number): number {
        const hb = this.findBounds(head, this.HEAD_GRID);
        const qb = this.findBounds(flow, this.FLOW_GRID);

        const e00 = this.ETA_GRID[hb.i0][qb.i0];
        const e01 = this.ETA_GRID[hb.i0][qb.i1];
        const e10 = this.ETA_GRID[hb.i1][qb.i0];
        const e11 = this.ETA_GRID[hb.i1][qb.i1];

        const e0 = e00 + (e01 - e00) * qb.t;
        const e1 = e10 + (e11 - e10) * qb.t;
        const e = e0 + (e1 - e0) * hb.t;
        return e;
    }

    public static compute(netHeadM: number, flowM3s: number, observedEfficiencyPct: number): EfficiencyResult {
        const etaMax = this.bilinear(netHeadM, flowM3s);
        const deltaToOptimum = (etaMax - (observedEfficiencyPct ?? 0));
        return { etaMax, deltaToOptimum };
    }
}
