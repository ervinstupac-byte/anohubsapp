import React, { useMemo } from 'react';
import { GlassCard } from './ui/GlassCard.tsx';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';

export const StressCycleCounter: React.FC = () => {
    const { telemetry, resetFatigue } = useTelemetry();
    const { selectedAsset } = useAssetContext();
    const { showToast } = useToast();

    const assetTele = selectedAsset ? telemetry[selectedAsset.id] : null;

    const fatigueData = useMemo(() => {
        if (!assetTele) return null;

        const points = assetTele.fatiguePoints || 0;
        const threshold = 100;
        const percentage = Math.min((points / threshold) * 100, 100);

        return {
            points: points.toFixed(1),
            percentage,
            isCritical: points >= threshold
        };
    }, [assetTele]);

    if (!selectedAsset || !fatigueData) return null;

    return (
        <GlassCard
            title="Stress Cycle & Fatigue (Zamor Materijala)"
            className={fatigueData.isCritical ? 'border-l-4 border-l-red-500 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-l-4 border-l-purple-500'}
        >
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Accumulated Fatigue Points</p>
                        <p className={`text-3xl font-mono font-black ${fatigueData.isCritical ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
                            {fatigueData.points} <span className="text-xs text-slate-600">pts</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase font-black mb-1">NDT Limit</p>
                        <p className="text-sm font-mono font-bold text-slate-400">100.0 pts</p>
                    </div>
                </div>

                {/* Fatigue Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter">
                        <span className="text-slate-500">Structural integrity</span>
                        <span className={fatigueData.isCritical ? 'text-red-500' : 'text-slate-400'}>
                            {fatigueData.percentage.toFixed(1)}%
                        </span>
                    </div>
                    <div className="h-3 bg-slate-900 rounded-full overflow-hidden p-[2px] border border-white/5">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${fatigueData.percentage > 90 ? 'bg-red-500' :
                                fatigueData.percentage > 60 ? 'bg-amber-500' : 'bg-purple-500'
                                }`}
                            style={{ width: `${fatigueData.percentage}%` }}
                        />
                    </div>
                </div>

                {fatigueData.isCritical && (
                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl space-y-3 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl animate-bounce">🚨</span>
                            <div>
                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-none mb-1">MANDATORY EXAM REQUIRED</p>
                                <p className="text-xs font-bold text-white uppercase">NDT INSPECTION MANDATED (ULTRAZVUK / MAGNETOFLUKS)</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 italic bg-black/40 p-2 rounded border border-white/5">
                            Points exceeded safety threshold due to hydraulic shocks ({'>'}5 bar/s). Structural integrity cannot be guaranteed without non-destructive testing.
                        </p>
                        <button
                            onClick={() => {
                                showToast("NDT Protocol Initialized. Scheduling specialist...", "info");
                                resetFatigue(selectedAsset.id);
                            }}
                            className="w-full py-2 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black rounded-lg uppercase tracking-widest transition-all shadow-lg"
                        >
                            Log NDT Completion & Reset
                        </button>
                    </div>
                )}

                {!fatigueData.isCritical && (
                    <div className="bg-slate-900/40 border border-white/5 p-3 rounded-xl flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 text-lg">🛡️</div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase mb-0.5">Ano-Agent Assessment</p>
                            <p className="text-[10px] text-white font-bold leading-tight uppercase">
                                Cycle load within nominal range. {100 - parseFloat(fatigueData.points)} pts remaining until mandatory ultrasound.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </GlassCard>
    );
};
