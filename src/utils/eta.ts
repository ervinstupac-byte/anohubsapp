// Compute hydraulic efficiency η = P / (ρ * g * Q * H)
export function computeEta(params: { powerMW?: number; powerW?: number; flow?: number; head?: number; rho?: number; g?: number }) {
  const rho = params.rho ?? 1000; // kg/m3
  const g = params.g ?? 9.80665; // m/s2

  // Prefer power in watts if provided, otherwise convert MW -> W
  let P_W = 0;
  if (typeof params.powerW === 'number' && isFinite(params.powerW)) P_W = params.powerW;
  else if (typeof params.powerMW === 'number' && isFinite(params.powerMW)) P_W = params.powerMW * 1e6;

  const Q = typeof params.flow === 'number' && isFinite(params.flow) ? params.flow : 0; // m3/s
  const H = typeof params.head === 'number' && isFinite(params.head) ? params.head : 0; // m

  if (P_W <= 0 || Q <= 0 || H <= 0) return { eta: null as number | null, valid: false };

  const denom = rho * g * Q * H;
  if (denom <= 0) return { eta: null as number | null, valid: false };

  const eta = P_W / denom;
  // sanitize bounds
  if (!isFinite(eta) || eta <= 0 || eta > 1.5) return { eta: null as number | null, valid: false };

  return { eta, valid: eta >= 0 && eta <= 1 };
}

export default computeEta;
