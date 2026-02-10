import Decimal from 'decimal.js';

// --- CONSTANTS ---
export const G = new Decimal('9.80665'); // Standard gravity
export const WATER_DENSITY = new Decimal('1000'); // kg/m³

/**
 * Calculates theoretical power output (P = rho * g * H * Q * eta)
 */
export const calculatePowerMW = (head: number, flow: number, efficiency: number): number => {
    const rho = WATER_DENSITY;
    const g = G;
    const h = new Decimal(head);
    const q = new Decimal(flow);
    const eta = new Decimal(efficiency).div(100);

    // Power in Watts: P = rho * g * H * Q * eta
    const powerW = rho.mul(g).mul(h).mul(q).mul(eta);

    // Result in Megawatts
    return powerW.div(1_000_000).toDecimalPlaces(3).toNumber();
};

/**
 * Calculates annual energy production (E = P * hours * capacityFactor)
 */
export const calculateAnnualEnergyGWh = (powerMW: number, flowVariation: string): number => {
    const p = new Decimal(powerMW);
    const hours = new Decimal('8760');

    const capacityFactor = flowVariation === 'stable'
        ? new Decimal('0.85')
        : flowVariation === 'seasonal'
            ? new Decimal('0.60')
            : new Decimal('0.45');

    // Energy in GWh: (MW * hours * CF) / 1000
    return p.mul(hours).mul(capacityFactor).div(1000).toDecimalPlaces(2).toNumber();
};

/**
 * Calculates specific speed index (N_sq = (N * sqrt(Q)) / H^(3/4))
 * Simplified index using N=1000 for relative comparison.
 */
export const calculateSpecificSpeed = (head: number, flow: number): number => {
    const h = new Decimal(head);
    const q = new Decimal(flow);
    const n = new Decimal('1000');

    // N_sq = (N * Q^0.5) / H^0.75
    const sqrtQ = q.sqrt();
    const hPow75 = h.pow(0.75);

    return n.mul(sqrtQ).div(hPow75).toDecimalPlaces(0).toNumber();
};
