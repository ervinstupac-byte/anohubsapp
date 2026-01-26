import React from 'react';
import { AlertCircle, CheckCircle, HelpCircle, Activity } from 'lucide-react';

interface SensorHealthProps {
    suspectSensors: {
        id: string;
        name: string;
        value: number;
        roc: number; // Rate of change
        reason: string;
    }[];
    votingStatus: {
        system: string; // e.g. Thrust Bearing
        status: string; // 2oo3 OK
        sensors: boolean[]; // [true, true, true]
    };
    alarmStats: {
        totalActive: number;
        suppressed: number;
    };
}

export const SensorHealthDashboard: React.FC<SensorHealthProps> = ({ suspectSensors, votingStatus, alarmStats }) => {
    return (
        <div className="w-full bg-slate-950 p-6 text-white border-2 border-slate-800 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-900/30 rounded-full">
                    <Activity className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Signal Health & Plausibility</h2>
                    <p className="text-xs text-slate-400">Assuming sensors are flawed until proven otherwise</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">

                {/* 1. SUSPECT SENSORS */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-amber-400" />
                        Suspect Sensors ({suspectSensors.length})
                    </h3>

                    {suspectSensors.length === 0 ? (
                        <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded text-center text-emerald-400 text-sm">
                            ✅ All signals plausible.
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {suspectSensors.map(s => (
                                <div key={s.id} className="p-2 bg-slate-800 rounded border border-amber-500/30 flex justify-between items-center">
                                    <div>
                                        <div className="text-xs font-bold text-amber-300">{s.name}</div>
                                        <div className="text-[10px] text-slate-400">{s.reason}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-mono text-white">{s.value.toFixed(2)}</div>
                                        <div className="text-[9px] text-amber-500">RoC: {s.roc.toFixed(1)}/s</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. REDUNDANCY VOTING */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Trip Voting ({votingStatus.system})
                    </h3>

                    <div className="space-y-4">
                        <div className="flex justify-center gap-4">
                            {votingStatus.sensors.map((healthy, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${healthy ? 'bg-emerald-500/20 border-emerald-500' : 'bg-red-500/20 border-red-500'}`}>
                                        <span className="text-xs font-bold">{idx + 1}</span>
                                    </div>
                                    <span className="text-[9px] text-slate-500">S{idx + 1}</span>
                                </div>
                            ))}
                        </div>

                        <div className="p-2 bg-slate-800 rounded text-center">
                            <span className={`text-sm font-bold ${votingStatus.status.includes('1oo1') ? 'text-red-400' : 'text-emerald-400'}`}>
                                {votingStatus.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. ALARM FILTER */}
                <div className="col-span-2 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-400" />
                        Alarm Storm Protection
                    </h3>
                    <div className="flex items-center gap-8">
                        <div>
                            <div className="text-2xl font-bold font-mono text-white">{alarmStats.totalActive}</div>
                            <div className="text-xs text-slate-400">Total Active</div>
                        </div>
                        <div className="h-8 w-px bg-slate-700" />
                        <div>
                            <div className="text-2xl font-bold font-mono text-blue-400">{alarmStats.suppressed}</div>
                            <div className="text-xs text-slate-400">Suppressed (Children)</div>
                        </div>
                        <div className="h-8 w-px bg-slate-700" />
                        <div className="flex-1 text-xs text-slate-500 italic">
                            Filtering active. Consequential alarms hidden to prioritize root cause.
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
