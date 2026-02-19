import React, { useState, useEffect } from 'react';
import { Activity, Cpu, Database, Zap, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { SovereignKernel, EnrichedTelemetry, KernelExecutionTrace } from '../../services/SovereignKernel';

export const KernelMonitor: React.FC = () => {
    const [metrics, setMetrics] = useState<{
        lastTrace: KernelExecutionTrace | null;
        performance: { avgLatency: number; maxLatency: number; totalExecutions: number };
        lastEnrichedTelemetry: EnrichedTelemetry | null;
    }>({
        lastTrace: null,
        performance: { avgLatency: 0, maxLatency: 0, totalExecutions: 0 },
        lastEnrichedTelemetry: null
    });

    useEffect(() => {
        const unsubscribe = SovereignKernel.subscribe((enriched) => {
            setMetrics({
                lastTrace: SovereignKernel.getLastTrace(),
                performance: SovereignKernel.getPerformanceMetrics(),
                lastEnrichedTelemetry: enriched
            });
        });
        return () => { if(unsubscribe) unsubscribe(); };
    }, []);

    const { lastTrace, performance, lastEnrichedTelemetry } = metrics;

    if (!lastTrace) {
        return (
            <div className="p-4 bg-slate-900 rounded-lg border border-slate-700 text-slate-400 text-center text-xs font-mono">
                WAITING_FOR_KERNEL_INIT...
            </div>
        );
    }

    return (
        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs">
            <h3 className="text-cyan-400 font-bold mb-4 flex items-center gap-2 uppercase tracking-wider">
                <Cpu className="w-4 h-4" /> Sovereign Kernel Monitor
            </h3>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-slate-900 p-2 rounded border border-slate-800 text-center">
                    <span className="block text-slate-500 text-[10px]">AVG LATENCY</span>
                    <span className="text-emerald-400 font-bold">{performance.avgLatency.toFixed(2)}ms</span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800 text-center">
                    <span className="block text-slate-500 text-[10px]">MAX LATENCY</span>
                    <span className="text-amber-400 font-bold">{performance.maxLatency.toFixed(2)}ms</span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800 text-center">
                    <span className="block text-slate-500 text-[10px]">EXECUTIONS</span>
                    <span className="text-blue-400 font-bold">{performance.totalExecutions}</span>
                </div>
            </div>

            {/* Pipeline Visualization */}
            <div className="space-y-2 relative">
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-800" />
                
                {lastTrace.stages.map((stage, i) => (
                    <div key={i} className="relative pl-8 group">
                        <div className={`absolute left-[0.65rem] top-1.5 w-2 h-2 rounded-full border-2 border-slate-950 ${
                            stage.stage === 'HEAL' ? 'bg-emerald-500' : 
                            stage.stage === 'DIAGNOSE' ? 'bg-purple-500' : 
                            stage.stage === 'CORRELATE' ? 'bg-blue-500' : 'bg-slate-500'
                        }`} />
                        
                        <div className="bg-slate-900 p-2 rounded border border-slate-800 group-hover:border-cyan-500/30 transition-colors">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-slate-300">{stage.stage}</span>
                                <span className="text-[10px] text-slate-500">{stage.duration.toFixed(2)}ms</span>
                            </div>
                            
                            {/* Detailed Output Visualization */}
                            {stage.stage === 'CORRELATE' && (
                                <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                    <Activity className="w-3 h-3" />
                                    Synergy: {(stage.output as any).synergyDetected ? 'DETECTED' : 'NONE'}
                                    <span className="text-slate-600">|</span>
                                    R={(stage.output as any).vibTempR}
                                </div>
                            )}

                            {stage.stage === 'DIAGNOSE' && (
                                <div className="text-[10px] text-purple-300 flex items-center gap-2">
                                    <Database className="w-3 h-3" />
                                    {typeof stage.output === 'string' ? stage.output : JSON.stringify(stage.output).slice(0, 30)}
                                </div>
                            )}

                            {stage.stage === 'HEAL' && (
                                <div className="text-[10px] text-emerald-300 flex items-center gap-2">
                                    <ShieldCheck className="w-3 h-3" />
                                    Action: {JSON.stringify(stage.output)}
                                </div>
                            )}

                             {stage.stage === 'TRACK' && (
                                <div className="text-[10px] text-amber-300 flex items-center gap-2">
                                    <Zap className="w-3 h-3" />
                                    {JSON.stringify(stage.output)}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* System Status Footer */}
            <div className="mt-4 pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
                <span>KERNEL_V4.6.2</span>
                <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    OPERATIONAL
                </span>
            </div>
        </div>
    );
};
