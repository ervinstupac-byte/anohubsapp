import Decimal from 'decimal.js';

/**
 * HYDRAULIC INTEGRITY SERVICE (NC-4.4)
 * Precision calculations for Head Loss and System Efficiency.
 * Implementation of Darcy-Weisbach and Colebrook-White.
 */
export class HydraulicIntegrity {

    private static GRAVITY = 9.80665;
    private static WATER_VISCOSITY_10C = 1.307e-6; // m2/s

    /**
     * DARCY-WEISBACH: Calculates Net Head (H_net)
     * Derived from standalone AuditEngine.py
     */
    static calculateNetHead(params: {
        grossHead: number,
        flow: number,
        pipeLength: number,
        diameter_mm: number,
        roughness_ks: number // mm
    }): { netHead: number, frictionLoss: number, localLosses: number, velocity: number } {
        const d_m = new Decimal(params.diameter_mm).div(1000);
        const area = d_m.div(2).pow(2).mul(Math.PI);
        const velocity = new Decimal(params.flow).div(area);

        // 1. Friction Factor (f) using Swamee-Jain approximation
        const epsilon = new Decimal(params.roughness_ks).div(1000).div(d_m);
        const re = velocity.mul(d_m).div(this.WATER_VISCOSITY_10C);

        let f: Decimal;
        if (re.lt(2000)) {
            f = new Decimal(64).div(re); // Laminar
        } else {
            // Swamee-Jain explicit formula
            const logTerm = Decimal.log10(
                epsilon.div(3.7).plus(new Decimal(5.74).div(re.pow(0.9)))
            );
            f = new Decimal(0.25).div(logTerm.pow(2));
        }

        // 2. Friction Loss (Hf = f * (L/D) * (v^2/2g))
        const hf = f.mul(new Decimal(params.pipeLength).div(d_m))
            .mul(velocity.pow(2).div(new Decimal(2).mul(this.GRAVITY)));

        // 3. Local Losses (Assumption: 10% of velocity head for minor fittings)
        const hl = new Decimal(0.1).mul(velocity.pow(2).div(new Decimal(2).mul(this.GRAVITY)));

        const netHead = new Decimal(params.grossHead).sub(hf).sub(hl);

        return {
            netHead: netHead.toNumber(),
            frictionLoss: hf.toNumber(),
            localLosses: hl.toNumber(),
            velocity: velocity.toNumber()
        };
    }

    /**
     * EVALUATOR: Bid Plausibility Check
     * Flags manufacturer efficiencies that violate physics limits.
     */
    static validateBidEfficiency(
        bidEff: number,
        turbineType: 'FRANCIS' | 'PELTON' | 'KAPLAN'
    ): { verdict: 'PLAUSIBLE' | 'MARKETING_LIE' | 'IMPOSSIBLE', limit: number } {
        const limits = {
            'FRANCIS': 96.5,
            'KAPLAN': 95.5,
            'PELTON': 92.5
        };

        const limit = limits[turbineType] || 94.0;

        if (bidEff > limit + 1.5) return { verdict: 'IMPOSSIBLE', limit };
        if (bidEff > limit) return { verdict: 'MARKETING_LIE', limit };
        return { verdict: 'PLAUSIBLE', limit };
    }
}
