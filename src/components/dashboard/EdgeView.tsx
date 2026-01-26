import React from 'react';
import { Cpu, Share2, Network, Zap } from 'lucide-react';

interface EdgeData {
    node: {
        latencyMs: number;
        predictionsPerSec: number;
        status: string;
    };
    models: {
        name: string;
        version: number;
        accuracy: number;
        lastUpdate: string;
    }[];
    mesh: {
        mode: 'CENTRAL' | 'AUTONOMOUS_HIVE';
        peers: number;
        strength: number; // 0-100%
        leader: string;
    };
}

export const EdgeView: React.FC<{ data: EdgeData }> = ({ data }) => {
    return (
        <div className="w-full bg-slate-950 p-6 text-white border-2 border-slate-800 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-violet-900/30 rounded-full">
                    <Cpu className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Neural Edge Intelligence</h2>
                    <p className="text-xs text-slate-400">Distributed Inference • Federated Learning</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">

                {/* 1. EDGE NODE PERFORMANCE */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        Inference Engine
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded flex justify-between items-center">
                            <div>
                                <div className="text-xs text-slate-400">Avg Latency</div>
                                <div className={`text-2xl font-bold font-mono ${data.node.latencyMs < 5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {data.node.latencyMs.toFixed(3)}<span className="text-sm text-slate-500">ms</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-500">Thoughput</div>
                                <div className="text-lg font-bold text-white">{data.node.predictionsPerSec} /s</div>
                            </div>
                        </div>

                        <div className={`text-center py-2 text-xs font-bold border rounded ${data.node.status === 'ONLINE' ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' : 'bg-red-950/30 border-red-500 text-red-400'}`}>
                            NODE STATUS: {data.node.status}
                        </div>
                    </div>
                </div>

                {/* 2. FEDERATED MODELS */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-blue-400" />
                        Model Synchronization
                    </h3>

                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {data.models.map((m, idx) => (
                            <div key={idx} className="bg-slate-800 p-2 rounded border border-slate-700 flex justify-between items-center">
                                <div>
                                    <div className="text-[10px] font-bold text-white max-w-[100px] truncate">{m.name}</div>
                                    <div className="text-[9px] text-slate-500">v{m.version} • {m.lastUpdate}</div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-sm font-bold ${m.accuracy > 0.9 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {(m.accuracy * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. MESH RESILIENCE */}
                <div className={`bg-slate-900/50 p-4 rounded-lg border ${data.mesh.mode === 'AUTONOMOUS_HIVE' ? 'border-indigo-500 animate-pulse' : 'border-slate-700'}`}>
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Network className="w-4 h-4 text-indigo-400" />
                        Hive Connectivity
                    </h3>

                    <div className="space-y-4">
                        <div className="text-center">
                            <div className="text-xs text-slate-400 mb-1">Operating Mode</div>
                            <div className={`text-lg font-black tracking-wider ${data.mesh.mode === 'AUTONOMOUS_HIVE' ? 'text-indigo-400' : 'text-slate-200'}`}>
                                {data.mesh.mode.replace('_', ' ')}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-slate-800 p-2 rounded">
                                <div className="text-[10px] text-slate-400">Active Peers</div>
                                <div className="text-xl font-bold text-white">{data.mesh.peers}</div>
                            </div>
                            <div className="bg-slate-800 p-2 rounded">
                                <div className="text-[10px] text-slate-400">Current Leader</div>
                                <div className="text-xs font-bold text-indigo-300 truncate px-1">{data.mesh.leader}</div>
                            </div>
                        </div>

                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                            <div
                                className={`h-full ${data.mesh.strength > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                style={{ width: `${data.mesh.strength}%` }}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
