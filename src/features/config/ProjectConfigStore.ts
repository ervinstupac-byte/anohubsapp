import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EventLogger } from '../../services/EventLogger';
import idAdapter from '../../utils/idAdapter';
import ProjectStateManager from '../../contexts/ProjectStateContext';

export type TurbineFamily = 'PELTON' | 'KAPLAN' | 'FRANCIS' | 'BANKI';

export type HillPoint = { head: number; flow: number; efficiency: number };

export type FamilyConfig = {
  family: TurbineFamily;
  variantId?: string;
  runnerDiameterD2?: number;
  ratedHeadHn?: number;
  ratedFlowQn?: number;
  generatorPoles?: number;
  ratedSpeedRPM?: number;
  // Family-specific
  pelton?: { nozzleCount?: number; nozzleClosingTimeSec?: number };
  kaplan?: { bladeCount?: number; wicketGateClosingTimeSec?: number };
  francis?: { wicketGateCount?: number; wicketGateClosingTimeSec?: number };
  // Efficiency chart
  hillChart?: HillPoint[];
};

export type Snapshot = {
  id: string;
  name: string;
  createdAt: number;
  configByFamily: Record<TurbineFamily, FamilyConfig>;
};

type ProjectConfigState = {
  configByFamily: Record<TurbineFamily, FamilyConfig>;
  variantConfigs: Record<string, FamilyConfig>;
  snapshots: Snapshot[];
  integrityCheck: () => void;
  setConfig: (family: TurbineFamily, updates: Partial<FamilyConfig>) => void;
  getConfig: (family: TurbineFamily) => FamilyConfig;
  setVariantConfig: (variantId: string, updates: Partial<FamilyConfig>) => void;
  getVariantConfig: (variantId: string) => FamilyConfig | undefined;
  setHillChart: (family: TurbineFamily, points: HillPoint[]) => void;
  validate: (family: TurbineFamily) => { ok: boolean; violations: string[] };
  saveSnapshot: (name: string) => Snapshot;
  loadSnapshot: (id: string) => void;
  listSnapshots: () => Snapshot[];
};

const DEFAULTS: Record<TurbineFamily, FamilyConfig> = {
  PELTON: { family: 'PELTON', pelton: { nozzleCount: 2, nozzleClosingTimeSec: 0.6 }, ratedHeadHn: 300, ratedFlowQn: 2.5 },
  KAPLAN: { family: 'KAPLAN', kaplan: { bladeCount: 4, wicketGateClosingTimeSec: 0.8 }, ratedHeadHn: 20, ratedFlowQn: 80 },
  FRANCIS: { family: 'FRANCIS', francis: { wicketGateCount: 16, wicketGateClosingTimeSec: 1.0 }, ratedHeadHn: 150, ratedFlowQn: 40 },
  BANKI: { family: 'BANKI', ratedHeadHn: 15, ratedFlowQn: 3.5 }
};

export const useProjectConfigStore = create<ProjectConfigState>()(
  persist(
    (set, get) => ({
      configByFamily: DEFAULTS,
      variantConfigs: {
        kaplan_vertical: { family: 'KAPLAN', variantId: 'kaplan_vertical', runnerDiameterD2: 4.2, ratedHeadHn: 25, ratedFlowQn: 90, ratedSpeedRPM: 300, kaplan: { bladeCount: 4, wicketGateClosingTimeSec: 0.8 } },
        kaplan_horizontal: { family: 'KAPLAN', variantId: 'kaplan_horizontal', runnerDiameterD2: 3.9, ratedHeadHn: 30, ratedFlowQn: 85, ratedSpeedRPM: 280, kaplan: { bladeCount: 4, wicketGateClosingTimeSec: 0.8 } },
        kaplan_pit: { family: 'KAPLAN', variantId: 'kaplan_pit', runnerDiameterD2: 3.6, ratedHeadHn: 18, ratedFlowQn: 70, ratedSpeedRPM: 260, kaplan: { bladeCount: 4, wicketGateClosingTimeSec: 0.9 } },
        kaplan_bulb: { family: 'KAPLAN', variantId: 'kaplan_bulb', runnerDiameterD2: 3.3, ratedHeadHn: 12, ratedFlowQn: 65, ratedSpeedRPM: 240, kaplan: { bladeCount: 4, wicketGateClosingTimeSec: 0.9 } },
        kaplan_s: { family: 'KAPLAN', variantId: 'kaplan_s', runnerDiameterD2: 4.0, ratedHeadHn: 22, ratedFlowQn: 60, ratedSpeedRPM: 300, kaplan: { bladeCount: 4, wicketGateClosingTimeSec: 0.8 } },
        kaplan_spiral: { family: 'KAPLAN', variantId: 'kaplan_spiral', runnerDiameterD2: 3.8, ratedHeadHn: 28, ratedFlowQn: 88, ratedSpeedRPM: 280, kaplan: { bladeCount: 4, wicketGateClosingTimeSec: 0.8 } },
        francis_vertical: { family: 'FRANCIS', variantId: 'francis_vertical', runnerDiameterD2: 2.2, ratedHeadHn: 150, ratedFlowQn: 40, ratedSpeedRPM: 500, francis: { wicketGateCount: 16, wicketGateClosingTimeSec: 1.0 } },
        francis_horizontal: { family: 'FRANCIS', variantId: 'francis_horizontal', runnerDiameterD2: 1.9, ratedHeadHn: 120, ratedFlowQn: 30, ratedSpeedRPM: 450, francis: { wicketGateCount: 12, wicketGateClosingTimeSec: 1.1 } },
        francis_slow_runner: { family: 'FRANCIS', variantId: 'francis_slow_runner', runnerDiameterD2: 2.5, ratedHeadHn: 180, ratedFlowQn: 50, ratedSpeedRPM: 400, francis: { wicketGateCount: 18, wicketGateClosingTimeSec: 1.2 } },
        francis_fast_runner: { family: 'FRANCIS', variantId: 'francis_fast_runner', runnerDiameterD2: 1.8, ratedHeadHn: 100, ratedFlowQn: 35, ratedSpeedRPM: 600, francis: { wicketGateCount: 14, wicketGateClosingTimeSec: 0.9 } },
        pelton_vertical: { family: 'PELTON', variantId: 'pelton_vertical', runnerDiameterD2: 1.2, ratedHeadHn: 350, ratedFlowQn: 3.2, ratedSpeedRPM: 800, pelton: { nozzleCount: 4, nozzleClosingTimeSec: 0.6 } },
        pelton_horizontal: { family: 'PELTON', variantId: 'pelton_horizontal', runnerDiameterD2: 1.0, ratedHeadHn: 280, ratedFlowQn: 2.2, ratedSpeedRPM: 900, pelton: { nozzleCount: 2, nozzleClosingTimeSec: 0.7 } },
        pelton_multi_jet: { family: 'PELTON', variantId: 'pelton_multi_jet', runnerDiameterD2: 1.4, ratedHeadHn: 420, ratedFlowQn: 3.8, ratedSpeedRPM: 700, pelton: { nozzleCount: 6, nozzleClosingTimeSec: 0.5 } },
        crossflow_standard: { family: 'BANKI', variantId: 'crossflow_standard', runnerDiameterD2: 1.6, ratedHeadHn: 15, ratedFlowQn: 3.5, ratedSpeedRPM: 300 }
      },
      integrityCheck: () => {
        const v = get().variantConfigs;
        const safe = (fam: TurbineFamily, variantId: string) => {
          const base = DEFAULTS[fam] || { family: fam };
          const vc = v[variantId] || { family: fam, variantId };
          const merged = {
            family: fam,
            variantId,
            runnerDiameterD2: vc.runnerDiameterD2 ?? 1.0,
            ratedHeadHn: vc.ratedHeadHn ?? base.ratedHeadHn ?? 10,
            ratedFlowQn: vc.ratedFlowQn ?? base.ratedFlowQn ?? 1,
            ratedSpeedRPM: vc.ratedSpeedRPM ?? 300,
            pelton: fam === 'PELTON' ? { nozzleCount: vc.pelton?.nozzleCount ?? 2, nozzleClosingTimeSec: vc.pelton?.nozzleClosingTimeSec ?? 0.6 } : undefined,
            kaplan: fam === 'KAPLAN' ? { bladeCount: vc.kaplan?.bladeCount ?? 4, wicketGateClosingTimeSec: vc.kaplan?.wicketGateClosingTimeSec ?? 0.8 } : undefined,
            francis: fam === 'FRANCIS' ? { wicketGateCount: vc.francis?.wicketGateCount ?? 16, wicketGateClosingTimeSec: vc.francis?.wicketGateClosingTimeSec ?? 1.0 } : undefined
          } as FamilyConfig;
          return merged;
        };
        const next: Record<string, FamilyConfig> = {};
        Object.entries(v).forEach(([id, cfg]) => {
          next[id] = safe(cfg.family, id);
        });
        set({ variantConfigs: next });
      },
      snapshots: [],
      setConfig: (family, updates) => {
        set((state) => {
          const prev = state.configByFamily[family] || { family };
          const next = { ...prev, ...updates, family } as FamilyConfig;
          const actor = (ProjectStateManager.getState()?.identity as any)?.assetName || 'Operator';
          Object.keys(updates).forEach((k) => {
            // emit per-field config change
            EventLogger.log('CONFIG_CHANGE', `${family}:${k}`, (prev as any)[k], (updates as any)[k]);
          });
          return { configByFamily: { ...state.configByFamily, [family]: next } };
        });
      },
      getConfig: (family) => get().configByFamily[family] || { family },
      setVariantConfig: (variantId, updates) => {
        set((state) => {
          const prev = state.variantConfigs[variantId] || { family: 'FRANCIS', variantId };
          const next = { ...prev, ...updates } as FamilyConfig;
          Object.keys(updates).forEach((k) => {
            EventLogger.log('CONFIG_CHANGE', `${variantId}:${k}`, (prev as any)[k], (updates as any)[k]);
          });
          return { variantConfigs: { ...state.variantConfigs, [variantId]: next } };
        });
      },
      getVariantConfig: (variantId) => get().variantConfigs[variantId],
      setHillChart: (family, points) => {
        set((state) => {
          const prev = state.configByFamily[family] || { family };
          const next = { ...prev, hillChart: points };
          EventLogger.log('CONFIG_CHANGE', `${family}:hillChart`, (prev as any).hillChart?.length || 0, points.length);
          return { configByFamily: { ...state.configByFamily, [family]: next } };
        });
      },
      validate: (family) => {
        const cfg = get().getConfig(family);
        const violations: string[] = [];
        // Family-specific constraints (simplified)
        if (family === 'KAPLAN') {
          if ((cfg.ratedHeadHn || 0) > 100) violations.push('Design Constraint Violation: Kaplan rated head exceeds practical limit');
        }
        if (family === 'PELTON') {
          const n = cfg.pelton?.nozzleCount || 0;
          if (n < 1 || n > 12) violations.push('Invalid nozzle count');
        }
        if (family === 'FRANCIS') {
          const wg = cfg.francis?.wicketGateCount || 0;
          if (wg < 6 || wg > 32) violations.push('Invalid wicket gate count');
        }
        const ok = violations.length === 0;
        return { ok, violations };
      },
      saveSnapshot: (name) => {
        const snap: Snapshot = {
          id: crypto.randomUUID(),
          name,
          createdAt: Date.now(),
          configByFamily: { ...get().configByFamily }
        };
        set((state) => ({ snapshots: [...state.snapshots, snap].slice(-20) }));
        EventLogger.log('SNAPSHOT_SAVE', name, null, snap.id);
        return snap;
      },
      loadSnapshot: (id) => {
        const snap = get().snapshots.find(s => s.id === id);
        if (!snap) return;
        set(() => ({ configByFamily: { ...snap.configByFamily } }));
        EventLogger.log('SNAPSHOT_LOAD', snap.name, null, id);
      },
      listSnapshots: () => get().snapshots
    }),
    {
      name: 'project-config-store',
      partialize: (state) => ({
        configByFamily: state.configByFamily,
        variantConfigs: state.variantConfigs,
        snapshots: state.snapshots.slice(-10)
      })
    }
  )
);
