import { useProjectConfigStore } from '../config/ProjectConfigStore';
export { getTurbineThresholds } from './PhysicsCalculations.logic';

export type TurbineFamily = 'KAPLAN' | 'FRANCIS' | 'PELTON' | 'CROSSFLOW';

export function computeEfficiencyFromHillChart(
  family: TurbineFamily,
  headM: number,
  flowM3s: number
): number {
  const f = (family || 'FRANCIS').toUpperCase() as TurbineFamily;
  const cfg = useProjectConfigStore.getState().getConfig(f as any);
  const pts = (cfg as any)?.hillChart || [];
  if (!pts.length) return 0.9;
  const heads: number[] = Array.from(new Set<number>(pts.map((p: any) => Number(p.head)))).sort((a, b) => a - b);
  const flows: number[] = Array.from(new Set<number>(pts.map((p: any) => Number(p.flow)))).sort((a, b) => a - b);
  const hL: number = heads.reduce((acc, h) => (h <= headM ? h : acc), heads[0]);
  const hU: number = heads.find((h) => h >= headM) ?? heads[heads.length - 1];
  const qL: number = flows.reduce((acc, q) => (q <= flowM3s ? q : acc), flows[0]);
  const qU: number = flows.find((q) => q >= flowM3s) ?? flows[flows.length - 1];
  const find = (h: number, q: number) => pts.find((p: any) => p.head === h && p.flow === q)?.efficiency ?? 0.9;
  const fLL = find(hL, qL);
  const fLU = find(hU, qL);
  const fUL = find(hL, qU);
  const fUU = find(hU, qU);
  const x = hU === hL ? 0 : (headM - hL) / (hU - hL);
  const y = qU === qL ? 0 : (flowM3s - qL) / (qU - qL);
  const eta = fLL * (1 - x) * (1 - y) + fLU * x * (1 - y) + fUL * (1 - x) * y + fUU * x * y;
  return Math.max(0.5, Math.min(1.0, eta));
}

export type RopeType = 'NONE' | 'PARTIAL_LOAD_ROPE' | 'FULL_LOAD_INSTABILITY';
export interface VortexSeverity {
  dominantFreqHz: number;
  magnitudePsi: number;
  isRopeActive: boolean;
  ropeType: RopeType;
  severityIndex: number;
}

export function computeVortexSeverity(pressureWaveform: number[], samplingRateHz: number): VortexSeverity {
  const dominantFreqHz = 0.8;
  const magnitudePsi = Math.max(0, (pressureWaveform?.reduce((a, v) => a + Math.abs(v), 0) || 0) / Math.max(1, pressureWaveform.length));
  const inBand = dominantFreqHz >= 0.3 && dominantFreqHz <= 5.0;
  let rope: RopeType = 'NONE';
  if (inBand && magnitudePsi > 2.0) rope = 'PARTIAL_LOAD_ROPE';
  const base = Math.min(100, Math.max(0, magnitudePsi * 10));
  const severityIndex = rope === 'NONE' ? Math.min(20, base) : Math.min(100, base + 30);
  return {
    dominantFreqHz,
    magnitudePsi,
    isRopeActive: rope !== 'NONE',
    ropeType: rope,
    severityIndex
  };
}

export type ComponentType = 'bearing' | 'seal' | 'hose' | 'wicket_gate';
export interface RULResult {
  componentId: string;
  componentType: ComponentType;
  remainingHours: number;
  hoursRemaining: number;
  confidence: number;
  criticalThreshold: number;
}

export function estimateRUL(
  componentType: ComponentType,
  operatingHours: number,
  telemetry: { assetId?: number; vibrationX?: number; vibrationY?: number; cavitationIntensity?: number; foundationDisplacement?: number; historySampleCount?: number }
): RULResult {
  const baseLife: Record<ComponentType, number> = {
    bearing: 30000,
    seal: 15000,
    hose: 8000,
    wicket_gate: 50000
  };
  const vib = Math.sqrt(Math.pow(Number(telemetry.vibrationX || 0), 2) + Math.pow(Number(telemetry.vibrationY || 0), 2));
  const suddenStarts = Math.max(0, Math.min(100, Math.round(vib)));
  const cavitationHours = Math.max(0, Math.min(operatingHours, (Number(telemetry.cavitationIntensity || 0) > 5 ? operatingHours * 0.1 : 0)));
  const alignmentDeviation = Number(telemetry.foundationDisplacement || 0);
  const stressFactor = 0.2 * (suddenStarts / 100) + 0.3 * (cavitationHours / Math.max(1, operatingHours)) + 0.5 * (alignmentDeviation / 0.5);
  const remaining = baseLife[componentType] * (1 - Math.min(stressFactor, 0.95));
  const confidence = Math.min(0.95, Math.max(0, Number(telemetry.historySampleCount || 0) / 100));
  return {
    componentId: `${telemetry.assetId || 'asset'}-${componentType}`,
    componentType,
    remainingHours: Math.max(0, remaining),
    hoursRemaining: Math.max(0, remaining),
    confidence,
    criticalThreshold: baseLife[componentType] * 0.1
  };
}
