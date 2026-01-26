// Compute a dynamic design efficiency baseline based on design flow and head.
// This is a simple parametric model used as a fallback until a detailed CFD/profile table is available.
export function designEfficiencyFor(Q: number, H: number) {
  // Basic model: efficiency decreases with very high flow or very low head beyond design.
  // Normalize inputs
  const q = Number(Q || 0);
  const h = Number(H || 0);

  // nominal operating point heuristics
  const qNom = 9.0; // design Q baseline
  const hNom = 64.5; // design H baseline

  // efficiency peak around nominal, penalty for deviation
  const qPenalty = Math.exp(-Math.pow((q - qNom) / (qNom * 0.3), 2));
  const hPenalty = Math.exp(-Math.pow((h - hNom) / (hNom * 0.2), 2));

  // base maximum achievable efficiency
  const etaMax = 0.95;

  // compute design efficiency
  const eta = etaMax * qPenalty * hPenalty;

  // clamp to reasonable bounds
  const clamped = Math.max(0.6, Math.min(0.99, eta));
  return clamped;
}

export default designEfficiencyFor;
