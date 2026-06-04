import { PeltonTelemetry } from './schemas';

// Helper: clamp value to range
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

// Assumed full needle travel in mm when only mm is provided (fallback conversion)
// Updated to a realistic default for a 10MW multi-jet Pelton unit
const DEFAULT_NEEDLE_TRAVEL_MM = 200;

export type MappedPelton = {
  recommended: {
    vibration?: number;
    temperature?: number;
    efficiency?: number;
    output?: number;
    cavitationIntensity?: number;
  };
  pelton: {
    turbineId?: string;
    headM?: number;
    flowM3s?: number;
    jets?: number;
    nozzles: Array<{
      index: number;
      needlePct?: number; // 0-100%
      deflectorOpen?: boolean;
      deflectorGapMM?: number;
      jetPressureBar?: number;
    }>;
    generatorCooling?: {
      bearingTempC?: number;
      coolantFlowLps?: number;
      bearingCoolingPresent?: boolean;
    } | null;
  };
};

export function mapPeltonToTelemetry(p: PeltonTelemetry): MappedPelton {
  const pelton: MappedPelton['pelton'] = {
    turbineId: p.turbineId || undefined,
    headM: p.headM ?? undefined,
    flowM3s: p.flowM3s ?? undefined,
    jets: p.jets ?? (p.nozzles ? p.nozzles.length : undefined) ?? undefined,
    nozzles: [],
    generatorCooling: p.generatorCooling ? {
      bearingTempC: p.generatorCooling.bearingTempC,
      coolantFlowLps: p.generatorCooling.coolantFlowLps,
      bearingCoolingPresent: (p.generatorCooling as any).bearingCoolingPresent ?? undefined
    } : null
  };

  // Map nozzles
  const rawNozzles = (p as any).nozzles || (p as any).nozzle_states || [];
  for (let i = 0; i < rawNozzles.length; i++) {
    const n = rawNozzles[i] || {};
    // Prefer percent field when available, else convert mm->pct using default travel
    let needlePct: number | undefined = undefined;
    if (n.needlePositionPct !== undefined) needlePct = clamp(Number(n.needlePositionPct), 0, 100);
    else if (n.needle_position_pct !== undefined) needlePct = clamp(Number(n.needle_position_pct), 0, 100);
    else if (n.needlePositionMM !== undefined) needlePct = clamp((Number(n.needlePositionMM) / DEFAULT_NEEDLE_TRAVEL_MM) * 100, 0, 100);
    else if (n.needle_position_mm !== undefined) needlePct = clamp((Number(n.needle_position_mm) / DEFAULT_NEEDLE_TRAVEL_MM) * 100, 0, 100);

    const deflectorOpen = n.deflectorOpen ?? n.deflector_open ?? undefined;
    const deflectorGapMM = n.deflectorGapMM ?? n.deflector_gap_mm ?? undefined;

    // Simple hydraulic estimate: 1 m head ≈ 0.0980665 bar
    const head = pelton.headM ?? 0;
    const jetPressureBar = head ? clamp(head * 0.0980665, 0, 2000) : undefined;

    pelton.nozzles.push({
      index: n.index ?? n.nozzle_index ?? (i + 1),
      needlePct,
      deflectorOpen,
      deflectorGapMM,
      jetPressureBar
    });
  }

  // Recommended top-level telemetry derived from pelton specifics when available
  const recommended: MappedPelton['recommended'] = {};
  if (pelton.generatorCooling && pelton.generatorCooling.bearingTempC !== undefined) {
    recommended.temperature = clamp(pelton.generatorCooling.bearingTempC, -20, 200);
  }
  if (pelton.headM !== undefined && pelton.flowM3s !== undefined) {
    // crude output estimate (MW) = rho*g*Q*H / 1e6 * eta; assume eta~0.9
    const rho = 1000;
    const g = 9.81;
    const eta = 0.9;
    recommended.output = Number(((rho * g * (pelton.flowM3s) * (pelton.headM) * eta) / 1e6).toFixed(3));
  }

  return { recommended, pelton };
}

export default mapPeltonToTelemetry;
