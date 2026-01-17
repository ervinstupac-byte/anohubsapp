import React from 'react';
import { Play, ShieldCheck, Droplets, Zap, Activity } from 'lucide-react';
import { useTelemetryStore, DemoScenario } from '../../features/telemetry/store/useTelemetryStore';

export const ScenarioController: React.FC = () => {
    const { loadScenario } = useTelemetryStore();

    const scenarios: { id: DemoScenario; label: string; icon: any; color: string }[] = [
        { id: 'NOMINAL', label: 'Nominal Ops', icon: ShieldCheck, color: 'text-emerald-400' },
        { id: 'CAVITATION', label: 'Cavitation', icon: Droplets, color: 'text-blue-400' },
        { id: 'BEARING_HAZARD', label: 'Bearing Hazard', icon: Activity, color: 'text-amber-400' },
        { id: 'STRUCTURAL_ANOMALY', label: 'Structural', icon: Zap, color: 'text-red-400' },
    ];

    return (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
            <h4 className="text-[10px] text-slate-500 font-mono font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <Play className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                Scenario Simulation Mode
            </h4>
            <div className="grid grid-cols-2 gap-2">
                {scenarios.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => loadScenario(s.id)}
                        className="flex flex-col items-center gap-1.5 p-2 bg-slate-900/40 border border-slate-700/30 rounded hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all group text-center"
                    >
                        <s.icon className={`w-4 h-4 ${s.color} group-hover:scale-110 transition-transform`} />
                        <span className="text-[8px] text-slate-400 font-mono font-bold uppercase tracking-tight leading-tight">
                            {s.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};
