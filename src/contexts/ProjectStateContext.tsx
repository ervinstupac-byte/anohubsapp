/**
 * ProjectStateContext.tsx
 *
 * NC-SOVEREIGN-LOOP: The Living Brain.
 *
 * This context consolidates:
 *   TelemetryContext (raw sensors) + AssetContext (asset metadata)
 *     → ProjectStateManager (canonical TechnicalProjectState)
 *       → PhysicsEngine (real-time physics recalculation)
 *         → Exposed via useProjectState() for the entire app
 *
 * Every 500ms (debounced), telemetry flows in, PhysicsEngine recalculates,
 * and the enriched state is broadcast to all subscribers.
 *
 * Consumers:
 *   - AIPredictionContext (reads physics state for failure prediction)
 *   - AlarmBridgeContext (reads telemetry for threshold evaluation)
 *   - ExecutiveDashboard (reads physics for KPI display)
 *   - NeuralFlowMap / Digital Twin (reads physics for visualization)
 *   - AssetPassportModal (reads physics for health score)
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useMemo,
  ReactNode,
} from 'react';
import { TechnicalProjectState } from '../core/TechnicalSchema';
import { PhysicsEngine } from '../core/PhysicsEngine';
import { useTelemetry } from './TelemetryContext';
import { useAssetContext } from './AssetContext';
import { ProjectStateManager } from '../core/ProjectStateManager';

export { ProjectStateManager };

// ─── Enriched context value ──────────────────────────────────────────────────
export interface ProjectStateContextValue {
  /** The canonical TechnicalProjectState — source of truth for all engineering data */
  state: TechnicalProjectState;

  /** Maintenance urgency level (1-5) calculated by PhysicsEngine */
  maintenanceUrgency: number;

  /** Overall risk status derived from physics */
  riskStatus: 'NOMINAL' | 'WARNING' | 'CRITICAL';

  /** Physics recalculation timestamp */
  lastRecalculation: string | null;

  /** Whether the brain is actively receiving telemetry */
  isReceivingTelemetry: boolean;
}

const ProjectStateContext = createContext<ProjectStateContextValue | undefined>(undefined);

export const ProjectStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const telemetryCtx = useTelemetry();
  const assetCtx = useAssetContext();
  const [state, setState] = useState<TechnicalProjectState>(ProjectStateManager.getState());

  // subscribe to manager changes
  useEffect(() => {
    const unsub = ProjectStateManager.subscribe(s => setState(s));
    return unsub;
  }, []);

  // NC-20301: Debounced telemetry sync (500ms) to prevent CPU thrashing
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        ProjectStateManager.updateFromTelemetry(telemetryCtx.telemetry, assetCtx.assets);
      } catch (e) {
        /* ignore */
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [telemetryCtx.telemetry, assetCtx.assets]);

  // Listen for work order completion events → trigger physics re-evaluation
  useEffect(() => {
    const handleWorkOrderComplete = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      console.log(
        '[Living Brain] Work order completed, re-evaluating physics for asset:',
        detail?.assetId
      );
      // Force a re-sync from current telemetry (asset may have changed post-repair)
      try {
        ProjectStateManager.updateFromTelemetry(telemetryCtx.telemetry, assetCtx.assets);
      } catch (e) {
        /* ignore */
      }
    };
    window.addEventListener('anohubs:work-order-complete', handleWorkOrderComplete);
    return () => window.removeEventListener('anohubs:work-order-complete', handleWorkOrderComplete);
  }, [telemetryCtx.telemetry, assetCtx.assets]);

  // Derived values — computed from current state, memoized
  const enrichedValue = useMemo<ProjectStateContextValue>(() => {
    let maintenanceUrgency = 1;
    let riskStatus: 'NOMINAL' | 'WARNING' | 'CRITICAL' = 'NOMINAL';

    try {
      maintenanceUrgency = PhysicsEngine.calculateMaintenanceUrgency(state);
    } catch {
      /* PhysicsEngine may fail on incomplete state */
    }

    // Derive risk status from the state's riskScore field (set by PhysicsEngine.recalculateProjectPhysics)
    const riskScore = state.riskScore ?? 0;
    if (riskScore >= 75) riskStatus = 'CRITICAL';
    else if (riskScore >= 25) riskStatus = 'WARNING';

    const hasTelemetry = Object.keys(telemetryCtx.telemetry).length > 0;

    return {
      state,
      maintenanceUrgency,
      riskStatus,
      lastRecalculation: state.lastRecalculation || null,
      isReceivingTelemetry: hasTelemetry,
    };
  }, [state, telemetryCtx.telemetry]);

  return (
    <ProjectStateContext.Provider value={enrichedValue}>{children}</ProjectStateContext.Provider>
  );
};

/**
 * Hook to consume the Living Brain.
 *
 * Returns the enriched project state including:
 * - state: The full TechnicalProjectState
 * - maintenanceUrgency: 1-5 scale
 * - riskStatus: 'NOMINAL' | 'WARNING' | 'CRITICAL'
 * - lastRecalculation: ISO timestamp
 * - isReceivingTelemetry: boolean
 *
 * For raw state only, use: const { state } = useProjectState();
 */
export const useProjectState = (): ProjectStateContextValue => {
  const ctx = useContext(ProjectStateContext);
  if (!ctx) throw new Error('useProjectState must be used inside ProjectStateProvider');
  return ctx;
};

export default ProjectStateManager;
