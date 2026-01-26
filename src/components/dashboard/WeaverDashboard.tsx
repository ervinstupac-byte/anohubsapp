import React from 'react';
import { Network, Battery, Zap, Users } from 'lucide-react';

interface WeaverDashboardProps {
    v2g: {
        vehicles: number;
        capacityMW: number;
        energyMWh: number;
        discharging: boolean;
    };
    demandResponse: {
        smartMeters: number;
        shedMW: number;
        affectedMeters: number;
    };
    swarm: {
        inverters: number;
        synchronized: number;
        capacityMW: number;
    };
}

export const WeaverDashboard: React.FC<WeaverDashboardProps> = ({ v2g, demandResponse, swarm }) => {
    return (
        <div className="w-full bg-slate-950 p-6">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Network className="w-6 h-6 text-purple-400" />
                The Weaver - Decentralized Grid Orchestration
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* V2G Fleet */}
                <div className="bg-slate-900 border border-cyan-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Battery className="w-5 h-5 text-cyan-400" />
                        <div className="text-lg font-bold text-cyan-300">Virtual Battery (V2G)</div>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Fleet Size</div>
                            <div className="text-3xl font-bold text-cyan-300">
                                {v2g.vehicles}
                            </div>
                            <div className="text-xs text-slate-500">vehicles</div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Available Capacity</div>
                            <div className="text-2xl font-bold text-emerald-400 font-mono">
                                {v2g.capacityMW.toFixed(1)} MW
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Energy Reserve</div>
                            <div className="text-xl font-bold text-purple-400 font-mono">
                                {v2g.energyMWh.toFixed(1)} MWh
                            </div>
                        </div>

                        <div className={`p-3 rounded text-center font-bold ${v2g.discharging ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-500'
                            }`}>
                            {v2g.discharging ? '⚡ DISCHARGING' : '⏸️ STANDBY'}
                        </div>
                    </div>
                </div>

                {/* Demand Response */}
                <div className="bg-slate-900 border border-amber-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-amber-400" />
                        <div className="text-lg font-bold text-amber-300">Demand Response</div>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Smart Meters</div>
                            <div className="text-3xl font-bold text-amber-300">
                                {demandResponse.smartMeters.toLocaleString()}
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Load Shed</div>
                            <div className="text-2xl font-bold text-red-400 font-mono">
                                {demandResponse.shedMW.toFixed(1)} MW
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Affected Meters</div>
                            <div className="text-xl font-bold text-slate-400">
                                {demandResponse.affectedMeters}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Solar Swarm */}
                <div className="bg-slate-900 border border-orange-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-orange-400" />
                        <div className="text-lg font-bold text-orange-300">Solar Swarm</div>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Inverters</div>
                            <div className="text-3xl font-bold text-orange-300">
                                {swarm.inverters}
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Synchronized</div>
                            <div className="text-2xl font-bold text-emerald-400">
                                {swarm.synchronized}/{swarm.inverters}
                            </div>
                            <div className="text-xs text-slate-500">
                                {((swarm.synchronized / swarm.inverters) * 100).toFixed(0)}%
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Total Capacity</div>
                            <div className="text-xl font-bold text-purple-400 font-mono">
                                {swarm.capacityMW.toFixed(1)} MW
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orchestration Status */}
                <div className="col-span-3 bg-slate-900 border border-purple-500 rounded-lg p-4">
                    <div className="text-lg font-bold text-purple-300 mb-4">🕸️ Decentralized Orchestration</div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-slate-400 mb-1">Virtual Storage</div>
                            <div className="text-xl font-bold text-cyan-400">
                                {(v2g.energyMWh + v2g.capacityMW * 0.5).toFixed(1)} MWh
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-slate-400 mb-1">Distributed Gen</div>
                            <div className="text-xl font-bold text-orange-400">
                                {swarm.capacityMW.toFixed(1)} MW
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-slate-400 mb-1">Flex Demand</div>
                            <div className="text-xl font-bold text-amber-400">
                                {demandResponse.shedMW.toFixed(1)} MW
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Philosophy */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-950 to-cyan-950 border border-purple-500 rounded-lg">
                <div className="text-sm font-bold text-purple-300">
                    🕸️ THE WEAVER: From centralized power plant to decentralized orchestrator. Every EV, every solar panel, every smart meter - woven into one resilient grid.
                </div>
            </div>
        </div>
    );
};
