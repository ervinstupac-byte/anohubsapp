
import Decimal from 'decimal.js';

// --- CORE PHYSICS CONSTANTS ---
export const G = 9.80665; // Standard gravity (m/s²)
export const WATER_DENSITY = 1000; // Water density (kg/m³)

// --- TURBINE EFFICIENCY & PERFORMANCE ---

/**
 * Calculate Pelton turbine efficiency with bucket wear degradation
 * @param bucketHours Operating hours of buckets
 * @param head Gross head in meters
 * @param flow_m3s Flow rate in m³/s
 * @returns Efficiency percentage (40% to 91.5%)
 */
export function calculatePeltonEfficiency(
    bucketHours: number,
    head: number,
    flow_m3s: number
): number {
    const baseEff = 91.5; // Calibrated base efficiency at design point
    if (!bucketHours || bucketHours <= 0) return baseEff;

    // Friction loss model: linear increase with bucket wear, capped at 5%
    const psi = Math.min(0.05, Math.max(0, bucketHours * 0.00002));

    // Flow/Head sensitivity penalty for off-design operation
    const specificSpeedPenalty = (() => {
        if (flow_m3s <= 0) return 0;
        const qh = flow_m3s / Math.max(1, head);
        return Math.min(1.0, Math.max(0, (0.5 - qh) * 0.5));
    })();

    const eff = baseEff * (1 - psi) - specificSpeedPenalty;
    return Math.max(40, +eff.toFixed(3));
}

/**
 * Calculate theoretical turbine power output using hydro power formula
 * @param head Net head in meters
 * @param flow Flow rate in m³/s
 * @param efficiency Turbine efficiency (percentage, 0-100)
 * @returns Power output in megawatts (MW)
 */
export function calculatePowerMW(
    head: number,
    flow: number,
    efficiency: number
): number {
    const rho = WATER_DENSITY;
    const g = G;
    const h = new Decimal(head);
    const q = new Decimal(flow);
    const eta = new Decimal(efficiency).div(100);

    // Formula: P (W) = ρ × g × H × Q × η
    const powerW = new Decimal(rho).mul(g).mul(h).mul(q).mul(eta);

    // Convert to megawatts (1 MW = 1,000,000 W)
    return powerW.div(1_000_000).toDecimalPlaces(3).toNumber();
}

/**
 * Calculate annual energy production (AEP) based on power output and flow characteristics
 * @param powerMW Power output in MW
 * @param capacityFactor Capacity factor (0-1)
 * @returns Annual energy in gigawatt-hours (GWh)
 */
export function calculateAnnualEnergyGWh(
    powerMW: number,
    capacityFactor: number
): number {
    const p = new Decimal(powerMW);
    const hours = new Decimal('8760'); // Annual operating hours (365 × 24)

    // Formula: E (GWh) = (P × hours × capacityFactor) / 1000
    return p.mul(hours).mul(capacityFactor).div(1000).toDecimalPlaces(2).toNumber();
}

/**
 * Calculate turbine specific speed index (N_sq)
 * @param head Net head in meters
 * @param flow Flow rate in m³/s
 * @param rpm Rotational speed of turbine (default: 1000 for relative comparison)
 * @returns Specific speed index
 */
export function calculateSpecificSpeed(
    head: number,
    flow: number,
    rpm: number = 1000
): number {
    const h = new Decimal(head);
    const q = new Decimal(flow);
    const n = new Decimal(rpm);

    // Formula: N_sq = (N × √Q) / H^(0.75)
    const sqrtQ = q.sqrt();
    const hPow75 = h.pow(0.75);

    return n.mul(sqrtQ).div(hPow75).toDecimalPlaces(0).toNumber();
}

/**
 * Classify turbine type based on specific speed (N_sq)
 * @param specificSpeed N_sq value
 * @returns Turbine type classification
 */
export function classifyTurbineType(specificSpeed: number): { type: string; color: string } {
    if (specificSpeed < 50) return { type: 'Pelton', color: 'text-yellow-400' };
    if (specificSpeed <= 350) return { type: 'Francis', color: 'text-cyan-400' };
    return { type: 'Kaplan', color: 'text-emerald-400' };
}

