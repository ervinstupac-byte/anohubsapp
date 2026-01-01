import React from 'react';
import { TruthDelta } from '../../utils/TruthDeltaEngine';

interface HeatmapLegendProps {
    deltaMap?: {
        runner: TruthDelta;
        crown: TruthDelta;
        band: TruthDelta;
        noseCone: TruthDelta;
    };
}

export const HeatmapLegend: React.FC<HeatmapLegendProps> = ({ deltaMap }) => {
    if (!deltaMap) return null;

    const components = [
        { key: 'runner', label: 'Runner Blades' },
        { key: 'crown', label: 'Crown Hub' },
        { key: 'band', label: 'Band Ring' },
        { key: 'noseCone', label: 'Nose Cone' }
    ];

    return (
        <div className="bg-slate-950/90 backdrop-blur-sm border border-cyan-900/30 rounded-sm p-4 text-xs font-mono">
            <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                Truth Heatmap
            </h3>

            <div className="space-y-2">
                {components.map(({ key, label }) => {
                    const delta = deltaMap[key as keyof typeof deltaMap];
                    return (
                        <div key={key} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-sm border border-white/20"
                                    style={{ backgroundColor: delta.color }}
                                />
                                <span className="text-slate-300 text-[10px]">{label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-bold ${delta.agreement === 'sync_healthy' ? 'text-cyan-400' :
                                    delta.agreement === 'sync_fault' ? 'text-red-400' :
                                        delta.agreement === 'conflict' ? 'text-amber-400' :
                                            'text-slate-500'
                                    }`}>
                                    {delta.confidence}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500" />
                    <span className="text-[9px] text-slate-400">Sync: Healthy</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[9px] text-slate-400">Sync: Fault</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-[9px] text-slate-400">Conflict: False +</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-[9px] text-slate-400">Conflict: False -</span>
                </div>
            </div>

            {/* Share Context QR Button */}
            <button className="mt-4 w-full py-2 bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-500/30 rounded-sm text-[9px] font-bold text-cyan-400 uppercase tracking-widest transition-all">
                📱 Share Context QR
            </button>
        </div>
    );
};
