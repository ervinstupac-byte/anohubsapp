import React from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Server, Globe } from 'lucide-react';
import { useFleetIntelligence } from '../../hooks/useFleetIntelligence';

export const FleetOverview: React.FC = () => {
    const { plants } = useFleetIntelligence();

    const calculateDrift = (baseline: number, current: number) => {
        return ((baseline - current) / baseline) * 100;
    };

    return (
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6 pt-2">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Globe className="text-cyan-500" /> Global Fleet Command
                    </h2>
                    <p className="text-xs text-slate-500 font-mono mt-1">REAL-TIME ASSET SOVEREIGNTY MONITOR</p>
                </div>
                <div className="flex gap-4 text-xs font-mono">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-cyan-400">SYNCED</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plants.map((node) => {
                    const drift = calculateDrift(node.baselineEff, node.efficiency);
                    const isSevere = drift > 10;
                    const isWarning = drift > 5 && drift <= 10;

                    return (
                        <div key={node.id} className={`group relative bg-slate-900 border ${isSevere ? 'border-red-500/50' : isWarning ? 'border-amber-500/50' : 'border-slate-700'} p-4 rounded hover:bg-slate-800 transition-colors`}>
                            {/* Status Indicator */}
                            <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${isSevere ? 'bg-red-500 animate-ping' : isWarning ? 'bg-amber-500' : 'bg-green-500'}`} />

                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-white font-bold">{node.name}</h3>
                                    <span className="text-[10px] text-slate-500 font-mono tracking-wider">{node.id} // {node.type.toUpperCase()}</span>
                                </div>
                                <Server className={`w-5 h-5 ${isSevere ? 'text-red-500' : 'text-slate-600'}`} />
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Baseline (Commissioned)</span>
                                    <span className="text-cyan-300 font-mono">{node.baselineEff}%</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Current Efficiency</span>
                                    <span className={`font-mono ${isSevere ? 'text-red-400' : 'text-white'}`}>{node.efficiency.toFixed(1)}%</span>
                                </div>

                                {/* Drift Bar */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Genetic Drift</span>
                                        <span className={`text-xs font-bold ${isSevere ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-green-500'}`}>
                                            {drift > 0 ? '-' : '+'}{Math.abs(drift).toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${isSevere ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-green-500'}`}
                                            style={{ width: `${Math.min(Math.abs(drift) * 5, 100)}%` }} // Visual scaling
                                        />
                                    </div>

                                    {/* NC-200: ROI LOSS ENGINE */}
                                    {drift > 0 && (
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                                            <span className="text-[10px] text-slate-600 uppercase tracking-wider">Revenue Risk</span>
                                            <div className="flex items-center gap-1">
                                                <span className={`font-mono font-bold text-sm ${isSevere ? 'text-red-500' : 'text-amber-500'}`}>
                                                    -€{((drift / 100) * 100 * 24 * 50).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </span>
                                                <span className="text-[10px] text-slate-600">/day</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isSevere && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="mt-4 flex items-center gap-2 text-red-400 text-xs font-bold bg-red-950/30 p-2 rounded"
                                >
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>CRITICAL DRIFT DETECTED</span>
                                </motion.div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
