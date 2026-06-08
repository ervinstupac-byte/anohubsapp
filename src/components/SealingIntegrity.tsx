import React, { useMemo, useState } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import idAdapter from '../utils/idAdapter';
import { Droplet, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';

export const SealingIntegrity: React.FC = () => {
    const { telemetry } = useTelemetry();
    const { selectedAsset } = useAssetContext();
    const [trendData, setTrendData] = useState<number[]>([]);

    const assetTele = selectedAsset ? telemetry[idAdapter.toStorage(selectedAsset.id)] : null;

    const integrityStatus = useMemo(() => {
        if (!assetTele) return { isAlert: false, message: '', deviation: 0 };
        
        // Simulate trend data collection
        setTrendData(prev => {
            const newTrend = [...prev, ((assetTele.drainagePumpFrequency - (assetTele.reservoirLevel * 0.1)) / (assetTele.reservoirLevel * 0.1)) * 100].slice(-10);
            return newTrend;
        });

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
                {/* Trend Visualization */}
                {trendData.length > 0 && (
                    <div className="p-3 bg-slate-900/50 rounded-xl border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-black text-slate-500 uppercase">Deviation Trend (Last 10 readings)</span>
                            <TrendingUp className={`w-3 h-3 ${trendData[trendData.length - 1] > 15 ? 'text-amber-400' : 'text-emerald-400'}`} />
                        </div>
                        <div className="flex items-end gap-1 h-8">
                            {trendData.map((val, idx) => (
                                <div
                                    key={idx}
                                    className={`flex-1 rounded-t ${val > 20 ? 'bg-red-500' : val > 15 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    style={{ height: `${Math.min(100, Math.abs(val))}%` }}
                                />
                            ))}
                        </div>
                    </div>
                )}
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
