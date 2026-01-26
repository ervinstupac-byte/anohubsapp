import React from 'react';
import { Network, TrendingUp, Brain, Zap } from 'lucide-react';

interface FleetAsset {
    assetId: string;
    name: string;
    status: 'OPERATIONAL' | 'HEALING' | 'OFFLINE';
    healthEffectiveness: number;
    currentLoad: number;
    maxCapacity: number;
}

interface FleetOverviewProps {
    assets: FleetAsset[];
    totalFleetROI?: number;
    collectiveKnowledgeIndex?: number;
}

export const FleetOverview: React.FC<FleetOverviewProps> = ({
    assets = [],
    totalFleetROI = 125480,
    collectiveKnowledgeIndex = 47
}) => {
    const operationalCount = assets.filter(a => a.status === 'OPERATIONAL').length;
    const healingCount = assets.filter(a => a.status === 'HEALING').length;
    const avgHeff = assets.length > 0
        ? assets.reduce((sum, a) => sum + a.healthEffectiveness, 0) / assets.length
        : 0;

    return (
        <div className="w-full space-y-4">
            {/* Header Stats */}
            <div className="grid grid-cols-3 gap-4">
                {/* Fleet ROI */}
                <div className="bg-gradient-to-br from-emerald-950/90 to-green-950/90 border-2 border-emerald-500/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-mono uppercase text-emerald-300">Fleet ROI</span>
                    </div>
                    <div className="text-3xl font-bold font-mono text-white">
                        €{totalFleetROI.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-400/70 font-mono mt-1">
                        Live Fleet Aggregate
                    </div>
                </div>

                {/* Collective Knowledge */}
                <div className="bg-gradient-to-br from-purple-950/90 to-indigo-950/90 border-2 border-purple-500/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-mono uppercase text-purple-300">Swarm IQ</span>
                    </div>
                    <div className="text-3xl font-bold font-mono text-white">
                        {collectiveKnowledgeIndex}
                    </div>
                    <div className="text-[10px] text-purple-400/70 font-mono mt-1">
                        Shared Learnings
                    </div>
                </div>

                {/* Fleet Health */}
                <div className="bg-gradient-to-br from-cyan-950/90 to-blue-950/90 border-2 border-cyan-500/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Network className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-mono uppercase text-cyan-300">Swarm Health</span>
                    </div>
                    <div className="text-3xl font-bold font-mono text-white">
                        {(avgHeff * 100).toFixed(0)}%
                    </div>
                    <div className="text-[10px] text-cyan-400/70 font-mono mt-1">
                        Avg H_eff Across Fleet
                    </div>
                </div>
            </div>

            {/* Swarm Health Map */}
            <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Network className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300">
                        Swarm Health Map
                    </span>
                    <div className="ml-auto text-xs font-mono text-slate-400">
                        {operationalCount} Operational · {healingCount} Healing
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    {assets.map((asset, idx) => (
                        <div
                            key={asset.assetId}
                            className={`
                                relative p-3 rounded border-2 transition-all
                                ${asset.status === 'OPERATIONAL'
                                    ? 'bg-emerald-950/50 border-emerald-500/50'
                                    : asset.status === 'HEALING'
                                        ? 'bg-amber-950/50 border-amber-500/50 animate-pulse'
                                        : 'bg-slate-800/50 border-slate-600'}
                            `}
                        >
                            <div className="text-xs font-mono font-bold text-white mb-1">
                                {asset.name || `Unit ${idx + 1}`}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                                {asset.currentLoad.toFixed(0)} / {asset.maxCapacity} MW
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-[10px] text-slate-500 font-mono">H_eff</span>
                                <span className={`text-xs font-bold font-mono ${asset.healthEffectiveness >= 0.85 ? 'text-emerald-400' : 'text-amber-400'
                                    }`}>
                                    {(asset.healthEffectiveness * 100).toFixed(0)}%
                                </span>
                            </div>

                            {asset.status === 'HEALING' && (
                                <Zap className="absolute top-2 right-2 w-3 h-3 text-amber-400 animate-pulse" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
