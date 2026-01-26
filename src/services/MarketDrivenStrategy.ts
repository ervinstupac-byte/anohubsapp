import PeltonPhysicsOptimizer, { PeltonInput } from './PeltonPhysicsOptimizer';

export type MarketOracle = { hourlyPricesEurPerMWh: number[] };

export type MarketDecision = {
  mode: 'ECO' | 'BALANCE' | 'PERFORMANCE';
  recommendedSequence?: { activeNozzles: number; expectedEfficiencyPct: number };
  expectedNetBenefitEurPerHour: number;
  notes?: string;
};

// Simple profit maximizer: benefit = (effGainPct/100) * plantCapacityMW * priceEurPerMWh
// cost = wearCostEurPerHour * wearFactor (proportional to additional bucketHours consumed per hour)
export function evaluateProfitability(
  oracle: MarketOracle,
  peltonSeq: { activeNozzles: number; expectedEfficiencyPct: number },
  baselineEffPct: number,
  plantCapacityMW: number,
  wearCostEurPerHour: number
): { netEurPerHour: number; grossEurPerHour: number; wearCost: number } {
  const currentPrice = oracle.hourlyPricesEurPerMWh[0] || 50; // immediate hour
  const effGainPct = Math.max(0, peltonSeq.expectedEfficiencyPct - baselineEffPct);
  const grossEur = (effGainPct / 100) * plantCapacityMW * currentPrice;
  // model wear cost: assume additional wear proportional to number of active jets (more jets -> more wear)
  const wearFactor = peltonSeq.activeNozzles * 0.02; // arbitrary: 0.02 hours-equivalent wear per hour per nozzle
  const wearCost = wearCostEurPerHour * wearFactor;
  const net = grossEur - wearCost;
  return { netEurPerHour: net, grossEurPerHour: grossEur, wearCost };
}

export function decideMode(
  oracle: MarketOracle,
  optimizerInput: PeltonInput,
  baselineEffPct: number,
  plantCapacityMW: number,
  wearCostEurPerHour: number
): MarketDecision {
  // get optimizer suggestion
  const seq = PeltonPhysicsOptimizer.optimizeNozzles(optimizerInput, { maxNozzles: Math.max(8, optimizerInput.activeNozzles + 4), minNozzles: 1 });

  const profit = evaluateProfitability(oracle, { activeNozzles: seq.activeNozzles, expectedEfficiencyPct: seq.expectedEfficiencyPct }, baselineEffPct, plantCapacityMW, wearCostEurPerHour);

  // Decision heuristic
  let mode: MarketDecision['mode'] = 'BALANCE';
  if (profit.netEurPerHour > 1000) mode = 'PERFORMANCE';
  else if (profit.netEurPerHour < 0) mode = 'ECO';

  return {
    mode,
    recommendedSequence: { activeNozzles: seq.activeNozzles, expectedEfficiencyPct: seq.expectedEfficiencyPct },
    expectedNetBenefitEurPerHour: profit.netEurPerHour,
    notes: `Gross ${profit.grossEurPerHour.toFixed(2)}€ / wear ${profit.wearCost.toFixed(2)}€ -> net ${profit.netEurPerHour.toFixed(2)}€/h`
  };
}

export default { evaluateProfitability, decideMode };
