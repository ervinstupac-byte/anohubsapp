import React from 'react';
import { Bot, Map, Camera, AlertTriangle, Battery } from 'lucide-react';

interface SwarmData {
    fleet: {
        id: string;
        type: string;
        battery: number;
        status: string;
        location: string;
    }[];
    missions: {
        id: string;
        target: string;
        reason: string;
        progress: number;
    }[];
    anomalies: {
        count: number;
        lastType: string;
        severity: string;
    };
}

export const SwarmView: React.FC<{ data: SwarmData }> = ({ data }) => {
    return (
        <div className="w-full bg-slate-950 p-6 text-white border-2 border-slate-800 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-cyan-900/30 rounded-full">
                    <Bot className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Robotic Inspection Swarm</h2>
                    <p className="text-xs text-slate-400">Autonomous Fleet • NDT Analysis</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">

                {/* 1. FLEET STATUS */}
                <div className="col-span-2 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Map className="w-4 h-4 text-blue-400" />
                        Fleet Deployment
                    </h3>

                    <div className="grid grid-cols-3 gap-4">
                        {data.fleet.map(robot => (
                            <div key={robot.id} className="bg-slate-800 p-3 rounded border border-slate-600 relative overflow-hidden group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-xs font-bold text-white">{robot.id}</div>
                                    <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${robot.status === 'IN_MISSION' ? 'bg-emerald-500 text-black animate-pulse' : 'bg-slate-600 text-slate-300'}`}>
                                        {robot.status.replace('_', ' ')}
                                    </div>
                                </div>
                                <div className="text-[10px] text-slate-400 mb-2 truncate">{robot.type}</div>

                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                    <Battery className={`w-3 h-3 ${robot.battery < 20 ? 'text-red-400' : 'text-emerald-400'}`} />
                                    <span>{robot.battery}%</span>
                                    <span className="ml-auto text-slate-400">{robot.location}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Active Missions */}
                    <div className="mt-4 space-y-2">
                        {data.missions.map(m => (
                            <div key={m.id} className="flex items-center gap-4 bg-slate-800/50 p-2 rounded border border-slate-700">
                                <div className="p-2 bg-cyan-900/20 rounded">
                                    <Camera className="w-4 h-4 text-cyan-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-white">{m.target}</span>
                                        <span className="text-cyan-300">{m.progress}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-500" style={{ width: `${m.progress}%` }} />
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-1 italic">{m.reason}</div>
                                </div>
                            </div>
                        ))}
                        {data.missions.length === 0 && (
                            <div className="text-center text-xs text-slate-500 italic py-2">No active missions. Fleet standing by.</div>
                        )}
                    </div>
                </div>

                {/* 2. ANOMALY FEED */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        Live Findings
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded text-center">
                            <div className="text-xs text-slate-400 mb-1">Anomalies Detected</div>
                            <div className={`text-3xl font-bold font-mono ${data.anomalies.count > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
                                {data.anomalies.count}
                            </div>
                        </div>

                        {data.anomalies.lastType && (
                            <div className={`p-3 rounded border ${data.anomalies.severity === 'CRITICAL' ? 'bg-red-950/30 border-red-500' : 'bg-amber-950/30 border-amber-500'}`}>
                                <div className="text-xs font-bold mb-1">LAST DETECTED:</div>
                                <div className="text-sm font-mono text-white mb-2">{data.anomalies.lastType}</div>
                                <div className="text-[10px] opacity-70">
                                    Severity: {data.anomalies.severity}
                                </div>
                            </div>
                        )}

                        {!data.anomalies.lastType && (
                            <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded text-center">
                                <div className="text-xs text-emerald-400">Structure Healthy</div>
                                <div className="text-[10px] text-emerald-600 mt-1">No pending defects.</div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
