import React from 'react';
import { useServiceMonitor } from '../../hooks/useServiceMonitor';
import { Activity, Server, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const TaskManager: React.FC = () => {
    const services = useServiceMonitor();

    // Calculate system stats
    const totalServices = services.length;
    const runningServices = services.filter(s => s.status === 'RUNNING').length;
    const errorServices = services.filter(s => s.status === 'ERROR' || s.status === 'DEGRADED').length;

    return (
        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs h-full flex flex-col">
            <h3 className="text-cyan-400 font-bold mb-4 flex items-center gap-2 uppercase tracking-wider">
                <Server className="w-4 h-4" /> System Processes
            </h3>

            {/* Header Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4 shrink-0">
                <div className="bg-slate-900 p-2 rounded border border-slate-800 text-center">
                    <span className="block text-slate-500 text-[10px]">TOTAL</span>
                    <span className="text-white font-bold">{totalServices}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800 text-center">
                    <span className="block text-slate-500 text-[10px]">RUNNING</span>
                    <span className="text-emerald-400 font-bold">{runningServices}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800 text-center">
                    <span className="block text-slate-500 text-[10px]">ISSUES</span>
                    <span className={`font-bold ${errorServices > 0 ? 'text-red-400 animate-pulse' : 'text-slate-600'}`}>
                        {errorServices}
                    </span>
                </div>
            </div>

            {/* Process List */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                {services.length === 0 && (
                    <div className="text-center text-slate-600 py-8 italic">No services registered.</div>
                )}
                
                {services.map(service => (
                    <div key={service.id} className="bg-slate-900/50 p-2 rounded border border-slate-800 hover:bg-slate-800 hover:border-slate-600 transition-colors group">
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                    service.status === 'RUNNING' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                    service.status === 'DEGRADED' ? 'bg-amber-500' : 'bg-red-500'
                                }`} />
                                <span className="font-bold text-slate-200">{service.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                                v{service.version}
                            </span>
                        </div>
                        
                        <p className="text-[10px] text-slate-400 mb-2 truncate">{service.description}</p>
                        
                        <div className="grid grid-cols-3 gap-1 text-[9px] text-slate-500">
                            <div className="bg-slate-950 px-1.5 py-1 rounded flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{(Date.now() - service.lastHeartbeat) < 1000 ? 'Live' : `${((Date.now() - service.lastHeartbeat)/1000).toFixed(0)}s ago`}</span>
                            </div>
                            {service.metrics?.cpuUsage !== undefined && (
                                <div className="bg-slate-950 px-1.5 py-1 rounded flex items-center gap-1">
                                    <Activity className="w-2.5 h-2.5" />
                                    <span>CPU: {service.metrics.cpuUsage.toFixed(1)}%</span>
                                </div>
                            )}
                            {service.metrics?.eventsProcessed !== undefined && (
                                <div className="bg-slate-950 px-1.5 py-1 rounded flex items-center gap-1">
                                    <CheckCircle className="w-2.5 h-2.5" />
                                    <span>Evt: {service.metrics.eventsProcessed}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-2 pt-2 border-t border-slate-800 text-[9px] text-slate-600 text-center">
                SYSTEM_PID: {Math.floor(Math.random() * 9000) + 1000}
            </div>
        </div>
    );
};
