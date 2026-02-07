/**
 * Hydraulic helpers shared across telemetry and physics code.
 */
export function calculateHydraulicEfficiency(P_kW: number, Q_m3s: number, H_m: number): number | null {
    const rho = 1000; // kg/m3
    const g = 9.81; // m/s2
    if (!isFinite(P_kW) || !isFinite(Q_m3s) || !isFinite(H_m)) return null;
    if (Q_m3s <= 0 || H_m <= 0) return null;
    const pTheoretical_kW = (rho * g * Q_m3s * H_m) / 1000; // kW
    if (pTheoretical_kW <= 0) return null;
    const eff = (P_kW / pTheoretical_kW) * 100;
    const bounded = Math.max(0, Math.min(98, parseFloat(eff.toFixed(1))));
    return bounded;
}

export default calculateHydraulicEfficiency;
