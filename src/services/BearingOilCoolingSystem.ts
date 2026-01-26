export type BearingOilCoolingInput = {
  oilInC: number; // oil inlet temp (°C)
  oilOutC: number; // oil outlet temp (°C)
  waterInC: number; // cooling water inlet temp (°C)
  valvePositionPct: number; // 0-100 % valve opening
  currentWaterFlow_m3h?: number; // optional current flow
};

export type BearingOilCoolingResult = {
  oilViscosity_cP: number; // estimated oil viscosity
  targetViscosityRange_cP: [number, number];
  recommendedValvePositionPct: number;
  recommendedWaterFlow_m3h?: number;
  controlAction: 'increase_flow' | 'decrease_flow' | 'hold';
  notes?: string;
};

// Simple viscosity model (Vogel/Andrade-inspired simplification)
function estimateKinematicViscosity_cP(tempC: number) {
  // coefficients chosen for turbine bearing mineral oil family; not a lab-accurate model
  // viscosity (cP) = A * exp(B / (T + 273.15))
  const A = 0.02; // scale
  const B = 1200; // shape
  const tK = tempC + 273.15;
  const visc = A * Math.exp(B / tK) * 1000; // scale to cP-ish
  return Math.max(1, visc);
}

export function computeBearingOilCooling(input: BearingOilCoolingInput): BearingOilCoolingResult {
  const { oilInC, oilOutC, waterInC, valvePositionPct, currentWaterFlow_m3h } = input;

  // Golden viscosity range for thrust bearing (example): 60 - 120 cP
  const targetRange: [number, number] = [60, 120];

  // Estimate current oil viscosity using outlet temp (fluid after heat exchange)
  const oilVisc = estimateKinematicViscosity_cP(oilOutC);

  // Temperature delta sensitivity: approximate °C per % valve change
  const valveEffectPerPct = 0.06; // °C change in oil outlet per 1% valve change (empirical tuning)

  // If current flow provided, estimate required flow adjustment proportionally
  let recommendedFlow: number | undefined;
  let recommendedValve = valvePositionPct;
  let action: BearingOilCoolingResult['controlAction'] = 'hold';
  const midTarget = (targetRange[0] + targetRange[1]) / 2;

  if (oilVisc < targetRange[0]) {
    // Oil too thin: reduce water flow (close valve) to warm oil
    action = 'decrease_flow';
    const neededViscFactor = midTarget / oilVisc;
    // translate viscosity factor to delta temp required (approx via invert of estimateKinematicViscosity)
    const approxDt = Math.log(neededViscFactor) * 20; // heuristic mapping
    const deltaPct = Math.min(30, Math.max(-30, Math.round(-approxDt / valveEffectPerPct)));
    recommendedValve = Math.max(0, Math.min(100, valvePositionPct + deltaPct));
    if (currentWaterFlow_m3h) {
      recommendedFlow = Math.max(0.1, currentWaterFlow_m3h * (1 + deltaPct / 100));
    }
  } else if (oilVisc > targetRange[1]) {
    // Oil too viscous: increase water flow (open valve) to cool oil
    action = 'increase_flow';
    const neededViscFactor = midTarget / oilVisc;
    const approxDt = Math.log(neededViscFactor) * 20;
    const deltaPct = Math.min(40, Math.max(-40, Math.round(-approxDt / valveEffectPerPct)));
    recommendedValve = Math.max(0, Math.min(100, valvePositionPct + deltaPct));
    if (currentWaterFlow_m3h) {
      recommendedFlow = Math.max(0.1, currentWaterFlow_m3h * (1 + deltaPct / 100));
    }
  } else {
    action = 'hold';
    recommendedValve = valvePositionPct;
    recommendedFlow = currentWaterFlow_m3h;
  }

  const notes = `Oil outlet ${oilOutC}°C -> visc ${Math.round(oilVisc)} cP. Target ${targetRange[0]}-${targetRange[1]} cP.`;

  return {
    oilViscosity_cP: Math.round(oilVisc),
    targetViscosityRange_cP: targetRange,
    recommendedValvePositionPct: recommendedValve,
    recommendedWaterFlow_m3h: recommendedFlow,
    controlAction: action,
    notes
  };
}

export default { computeBearingOilCooling };
