import React, { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Activity } from 'lucide-react';
import { useTelemetryStore } from '../../../features/telemetry/store/useTelemetryStore';
import { EfficiencyOptimizer } from '../../../services/EfficiencyOptimizer';

type OptimizationHUDProps = {
  variant?: 'overlay' | 'inline';
  className?: string;
};

export const OptimizationHUD: React.FC<OptimizationHUDProps> = ({ variant = 'overlay', className }) => {
  const { hydraulic, physics } = useTelemetryStore(
    useShallow((state) => ({
      hydraulic: state.hydraulic,
      physics: state.physics,
    }))
  );

  const data = useMemo(() => {
    const netHead =
      typeof physics?.netHead === 'number'
        ? physics.netHead
        : (physics as any)?.netHead?.toNumber?.() ?? hydraulic.head ?? 0;
    const flow = hydraulic.flow ?? 0;
    const effRaw = hydraulic.efficiency ?? 0;
    const effPct = effRaw <= 1 ? effRaw * 100 : effRaw;
    const { etaMax, deltaToOptimum } = EfficiencyOptimizer.compute(netHead, flow, effPct);
    return {
      netHead,
      flow,
      eff: effPct,
      etaMax,
      delta: deltaToOptimum,
    };
  }, [hydraulic, physics]);

  const wrapperClass =
    variant === 'overlay'
      ? 'fixed bottom-6 right-6 z-[200]'
      : 'relative';

  const deltaClass =
    data.delta < -0.5
      ? 'text-red-400'
      : data.delta > 0.5
      ? 'text-emerald-400'
      : 'text-slate-300';

  return (
    <div
      className={`${wrapperClass} ${className || ''}`}
    >
      <div className="pointer-events-auto bg-black/60 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-xl">
        <div className="px-4 py-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <div className="text-xs font-bold uppercase text-slate-300">Optimization HUD</div>
        </div>
        <div className="grid grid-cols-3 gap-4 px-4 pb-4">
          <div className="text-center">
            <div className="text-[10px] uppercase text-slate-400 font-bold">η</div>
            <div className="text-2xl font-black text-white">{data.eff.toFixed(1)}%</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase text-slate-400 font-bold">η_max</div>
            <div className="text-2xl font-black text-emerald-400">{data.etaMax.toFixed(1)}%</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase text-slate-400 font-bold">Δ</div>
            <div className={`text-2xl font-black ${deltaClass}`}>{data.delta.toFixed(2)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
