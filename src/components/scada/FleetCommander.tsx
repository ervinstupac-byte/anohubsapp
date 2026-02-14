import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFleetIntelligence, PlantStatus, HiveEvent } from '../../hooks/useFleetIntelligence';
import { Activity, Zap, Share2, Globe, AlertTriangle, ArrowRight } from 'lucide-react';
import { Sparkline } from '../ui/Sparkline';

const FleetMap = ({ plants, events }: { plants: PlantStatus[], events: HiveEvent[] }) => {
    return (
        <div className="relative w-full h-[400px] bg-slate-950/50 rounded-xl overflow-hidden border border-white/5 shadow-inner">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

            {/* Schematic Map Lines (Simplified Bosnia Topology) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <path d="M 20% 30% Q 50% 50% 80% 35%" stroke="white" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                <path d="M 50% 50% L 50% 80%" stroke="white" strokeWidth="2" fill="none" strokeDasharray="5,5" />
            </svg>

            {/* HIVE PULSE LINES (Active Transfer Animation) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {events.filter(e => Date.now() - e.timestamp < 2000).map(e => {
                    const source = plants.find(p => p.id === e.sourcePlant);
                    const target = plants.find(p => p.id === e.targetPlant);
                    if (!source || !target) return null;
                    return (
                        <line
                            key={e.id}
                            x1={`${source.location.x}%`} y1={`${source.location.y}%`}
                            x2={`${target.location.x}%`} y2={`${target.location.y}%`}
                            stroke="#8b5cf6"
                            strokeWidth="3"
                            strokeLinecap="round"
                        >
                            <animate attributeName="stroke-dasharray" from="0, 1000" to="1000, 0" dur="1s" fill="freeze" />
                            <animate attributeName="opacity" values="1;0" dur="2s" fill="freeze" />
                        </line>
                    );
                })}
            </svg>

            {/* Plant Nodes */}
            {plants.map(plant => (
                <div
                    key={plant.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                    style={{ left: `${plant.location.x}%`, top: `${plant.location.y}%` }}
                >
                    {/* Ripple Effect if Active Event */}
                    {events.some(e => (e.sourcePlant === plant.id || e.targetPlant === plant.id) && Date.now() - e.timestamp < 2000) && (
                        <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping"></div>
                    )}

                    <div className={`w-4 h-4 rounded-full border-2 ${plant.healthScore < 90 ? 'bg-amber-500 border-amber-300' : 'bg-cyan-500 border-cyan-300'} shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all group-hover:scale-125`}></div>

                    {/* Tooltip Label */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-white/10 px-2 py-1 rounded text-center min-w-[120px] opacity-100 transition-opacity z-10">
                        <div className="text-[10px] font-bold text-white uppercase tracking-wider">{plant.name}</div>
                        <div className="text-[9px] font-mono text-cyan-400">Eff: {plant.efficiency.toFixed(1)}% | RI: {plant.healthScore}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const FleetCommander = () => {
    const { t } = useTranslation();
    const { plants, fleetRI, hiveEvents } = useFleetIntelligence();

    return (
        <div className="h-full flex flex-col bg-slate-950 text-white overflow-hidden p-6 space-y-6">

            {/* HERADER */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <Globe className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                            Fleet Commander
                        </h1>
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                            The Hive Mind • Artificial Intelligence Network
                        </p>
                    </div>
                </div>

                {/* Global Stats */}
                <div className="flex gap-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-black">Fleet Reliability</div>
                        <div className="text-3xl font-mono font-bold text-cyan-400">{fleetRI}<span className="text-sm text-slate-600">/100</span></div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-black">Active Knowledge Nodes</div>
                        <div className="text-3xl font-mono font-bold text-purple-400">{plants.length}</div>
                    </div>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">

                {/* LEFT: MAP & BENCHMARKS */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* MAP */}
                    <div className="bg-slate-900/40 rounded-xl p-1 border border-white/5 backdrop-blur-sm relative">
                        <div className="absolute top-4 left-4 z-10 px-2 py-1 bg-black/60 rounded border border-white/10 text-[9px] font-mono text-purple-300">
                            LIVE SYNC ACTIVE
                        </div>
                        <FleetMap plants={plants} events={hiveEvents} />
                    </div>

                    {/* BENCHMARKING TABLE */}
                    <div className="flex-1 bg-slate-900/40 rounded-xl p-6 border border-white/5 overflow-hidden">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-cyan-400" /> Real-Time Efficiency Benchmarking
                        </h3>
                        <div className="space-y-4">
                            {plants.map(plant => (
                                <div key={plant.id} className="group">
                                    <div className="flex justify-between text-xs mb-1 font-mono">
                                        <span className="text-white font-bold">{plant.name}</span>
                                        <span className={plant.efficiency < 89 ? 'text-amber-400' : 'text-emerald-400'}>
                                            {plant.efficiency.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${plant.efficiency < 89 ? 'bg-amber-500' : 'bg-gradient-to-r from-cyan-600 to-cyan-400'}`}
                                            style={{ width: `${plant.efficiency}%` }}
                                        ></div>
                                    </div>
                                    <div className="mt-1 flex justify-between text-[9px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span>Load: {plant.load.toFixed(0)}%</span>
                                        <span>Type: {plant.description}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: HIVE LOG */}
                <div className="bg-slate-900/40 rounded-xl border border-white/5 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-white/5">
                        <h3 className="text-xs font-bold text-purple-300 uppercase tracking-widest flex items-center gap-2">
                            <Share2 className="w-4 h-4" /> Hive Consciousness Log
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {hiveEvents.map(event => (
                            <div key={event.id} className="bg-slate-950/50 p-3 rounded border border-white/5 animate-in slide-in-from-right-2">
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${event.type === 'WEIGHT_SYNC' ? 'bg-purple-500/20 text-purple-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                        {event.type.replace('_', ' ')}
                                    </span>
                                    <span className="text-[9px] text-slate-600 font-mono">{new Date(event.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div className="text-[10px] text-slate-300 font-mono leading-relaxed">
                                    {event.detail}
                                </div>
                                <div className="mt-2 flex items-center text-[9px] text-slate-500 gap-2">
                                    <span>{plants.find(p => p.id === event.sourcePlant)?.name.split(' ')[1]}</span>
                                    <ArrowRight className="w-2 h-2 text-slate-600" />
                                    <span className="text-slate-400">{plants.find(p => p.id === event.targetPlant)?.name.split(' ')[1]}</span>
                                </div>
                            </div>
                        ))}
                        {hiveEvents.length === 0 && (
                            <div className="text-center py-10 text-slate-600 text-xs italic">
                                Waiting for synaptic events...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
