import React, { useState, useMemo } from 'react';
import { TurbineRunner3D } from './three/TurbineRunner3D';
import { HeatmapLegend } from './ui/HeatmapLegend';
import { TruthDeltaEngine } from '../utils/TruthDeltaEngine';
import { useContextAwareness } from '../contexts/ContextAwarenessContext';

export const TruthHeatmapDemo: React.FC = () => {
    const [heatmapMode, setHeatmapMode] = useState(false);
    const { diagnostics, activeLogs } = useContextAwareness();

    // Calculate truth delta map
    const deltaMap = useMemo(() => {
        return TruthDeltaEngine.calculateDeltaMap(diagnostics, activeLogs);
    }, [diagnostics, activeLogs]);

    return (
        <div className="relative w-full h-screen bg-slate-950">
            {/* Header */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-widest">
                        Truth <span className="text-cyan-400">Heatmap</span>
                    </h1>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                        AI vs. Human Agreement Visualization
                    </p>
                </div>

                {/* Toggle Button */}
                <button
                    onClick={() => setHeatmapMode(!heatmapMode)}
                    className={`px-6 py-3 rounded-sm font-mono text-xs font-bold uppercase tracking-wider transition-all ${heatmapMode
                        ? 'bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                >
                    {heatmapMode ? '● Heatmap Active' : 'Activate Heatmap'}
                </button>
            </div>

            {/* 3D Turbine */}
            <TurbineRunner3D
                rpm={300}
                deltaMap={deltaMap}
                heatmapMode={heatmapMode}
            />

            {/* Legend (only show in heatmap mode) */}
            {heatmapMode && <HeatmapLegend deltaMap={deltaMap} />}

            {/* Stats Panel */}
            <div className="absolute top-4 right-4 bg-slate-950/90 backdrop-blur-sm border border-cyan-900/30 rounded-sm p-4 text-xs font-mono max-w-xs">
                <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-3">
                    System Status
                </h3>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-slate-400">Diagnostics:</span>
                        <span className="text-white font-bold">{diagnostics.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Human Logs:</span>
                        <span className="text-white font-bold">{activeLogs.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Mode:</span>
                        <span className={`font-bold ${heatmapMode ? 'text-cyan-400' : 'text-slate-500'}`}>
                            {heatmapMode ? 'HEATMAP' : 'NORMAL'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
