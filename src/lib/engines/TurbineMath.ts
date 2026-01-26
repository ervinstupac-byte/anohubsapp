/**
 * TurbineMath Dynamic Vector Model
 * - Provides dynamic efficiency calculation for Pelton accounting for friction losses (psi)
 */

export function calculatePeltonEfficiency(bucketHours: number, head: number, flow_m3s: number): number {
  // Base efficiency (calibrated) at design: 91.5%
  const baseEff = 91.5;
  // If no bucket wear supplied, return base efficiency to preserve legacy expectations
  if (!bucketHours || bucketHours <= 0) return baseEff;

  // Friction loss model: psi increases with bucket wear (hours)
  //  - capped at 5% (0.05) of efficiency loss
  const psi = Math.min(0.05, Math.max(0, bucketHours * 0.00002));

  // Flow/Head sensitivity (minor tuning): small penalty when operating off-design
  const specificSpeedPenalty = (() => {
    if (flow_m3s <= 0) return 0;
    const qh = flow_m3s / Math.max(1, head);
    return Math.min(1.0, Math.max(0, (0.5 - qh) * 0.5));
  })();

  const eff = baseEff * (1 - psi) - specificSpeedPenalty;
  return Math.max(40, +eff.toFixed(3));
}

export default { calculatePeltonEfficiency };
