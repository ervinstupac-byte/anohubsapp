import React, { useMemo } from 'react';
import { GlassCard } from './ui/GlassCard.tsx';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';
import { useAssetContext } from '../contexts/AssetContext.tsx';

export const SealingIntegrity: React.FC = () => {
    const { telemetry } = useTelemetry();
    const { selectedAsset } = useAssetContext();

    const assetTele = selectedAsset ? telemetry[selectedAsset.id] : null;

    const integrityStatus = useMemo(() => {
        if (!assetTele) return { isAlert: false, message: '', deviation: 0 };

        // Requirement: Increase of 20% at the same water level (reservoirLevel)
        // Baseline Frequency (Simulated): For example, 1 cycle per 10m of head
        const baselineFrequency = assetTele.reservoirLevel * 0.1;
        const currentFrequency = assetTele.drainagePumpFrequency;

        const deviation = ((currentFrequency - baselineFrequency) / baselineFrequency) * 100;
        const isAlert = deviation > 20;

        return {
            isAlert,
            message: isAlert ? 'Odstupanje na glavnoj zaptivci vratila. Provjeriti protok rashladne vode kroz zaptivku.' : 'Shaft Seal integrity within nominal parameters.',
            deviation: deviation.toFixed(1),
            baseline: baselineFrequency.toFixed(1),
            current: currentFrequency.toFixed(1)
        };
    }, [assetTele]);

    if (!selectedAsset) return null;

    return (
        <GlassCard title="Shaft Seal Integrity (Zaptivka Vratila)" className={integrityStatus.isAlert ? 'border-l-4 border-l-red-500 bg-red-950/20' : 'border-l-4 border-l-cyan-500'}>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-black">Drainage Pump Status</p>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${assetTele?.drainagePumpActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                            <span className="text-xs font-bold text-white uppercase">{assetTele?.drainagePumpActive ? 'RUNNING' : 'IDLE'}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase font-black">Upper Water Level</p>
                        <p className="text-lg font-mono font-black text-white">{assetTele?.reservoirLevel.toFixed(1)}m</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/5">
                    <div>
                        <p className="text-[9px] text-slate-500 uppercase font-black">Current Frequency</p>
                        <p className="text-xl font-mono font-black text-white">{integrityStatus.current} <span className="text-[10px] text-slate-400">cyc/d</span></p>
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-500 uppercase font-black">Baseline (Expected)</p>
                        <p className="text-xl font-mono font-black text-slate-400">{integrityStatus.baseline} <span className="text-[10px] text-slate-500">cyc/d</span></p>
                    </div>
                </div>

                {integrityStatus.isAlert ? (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                        <div className="flex gap-3">
                            <span className="text-xl animate-bounce">⚠️</span>
                            <div>
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">DEVIATION DETECTED (+{integrityStatus.deviation}%)</p>
                                <p className="text-xs text-white leading-relaxed font-bold">
                                    {integrityStatus.message}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 p-2 px-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                        <span className="text-emerald-500 text-xs">✓</span>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{integrityStatus.message}</p>
                    </div>
                )}

                <div className="mt-2 text-[8px] text-slate-500 italic uppercase">
                    Monitoring drainage pump activation patterns relative to reservoir head.
                </div>
            </div>
        </GlassCard>
    );
};
