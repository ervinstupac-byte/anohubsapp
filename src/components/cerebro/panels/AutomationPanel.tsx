import React, { useState } from 'react';
import { Activity, ShieldAlert, ShieldCheck, Cpu, Database } from 'lucide-react';
import { useProjectEngine } from '../../../contexts/ProjectContext';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../../utils/i18nUtils';
import { GlassCard } from '../../../shared/components/ui/GlassCard';

export const AutomationPanel: React.FC = () => {
    const { technicalState } = useProjectEngine();
    const { t, i18n: { language } } = useTranslation();

    const [latency, setLatency] = useState<number>(18); // ms
    const [overrideActive, setOverrideActive] = useState<boolean>(false);
    const [packetLoss, setPacketLoss] = useState<number>(0.0); // %

    const isLatencyHigh = latency > 100;

    return (
        <div className="space-y-6">
            <GlassCard className="p-6 border-l-4 border-cyan-500">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    Automation & PLC Control System
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Simulated Communication Latency Slider */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-bold uppercase">Controller Link Latency</span>
                            <span className={`font-mono font-bold ${isLatencyHigh ? 'text-red-400' : 'text-cyan-400'}`}>
                                {latency} ms
                            </span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="250"
                            step="1"
                            value={latency}
                            onChange={(e) => setLatency(parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-colors"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                            <span>Nominal: &lt; 20 ms</span>
                            <span>Timeout Threshold: 150 ms</span>
                        </div>
                    </div>

                    {/* Safety Override Key */}
                    <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Safety Interlocks Override</span>
                        <button
                            onClick={() => {
                                setOverrideActive(!overrideActive);
                                alert(
                                    overrideActive
                                        ? 'Safety Interlock Override Bypassed. Regular system safety constraints applied.'
                                        : 'WARNING: Safety Interlocks Bypassed! Maintain extreme care. All hardware interlocks disabled.'
                                );
                            }}
                            className={`w-full py-3 px-4 rounded-lg border text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                                overrideActive
                                    ? 'bg-red-500/10 border-red-500 text-red-400 animate-pulse'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${overrideActive ? 'bg-red-400 animate-ping' : 'bg-slate-600'}`} />
                            {overrideActive ? 'SAFETY BYPASS ACTIVE' : 'Engage Safety Override'}
                        </button>
                    </div>
                </div>

                {/* Automation Telemetry */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">PLC Processing Cycle</span>
                        <div className="text-xl font-black text-white font-mono">
                            {formatNumber(1.2, language, 1)}{' '}
                            <span className="text-xs text-slate-500">ms</span>
                        </div>
                        <span className="text-[9px] text-slate-600 block mt-1">
                            Realtime logic loop speed
                        </span>
                    </div>

                    <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Ethernet Packet Integrity</span>
                        <div className="text-xl font-black text-emerald-400 font-mono">
                            100.0%
                        </div>
                        <span className="text-[9px] text-slate-600 block mt-1">
                            Zero packet dropping detected
                        </span>
                    </div>
                </div>

                {isLatencyHigh ? (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-xs font-bold text-red-400 uppercase">Latency Warning / Jitter detected</h4>
                            <p className="text-[10px] text-slate-400 mt-1">
                                High ethernet latency could cause watchdog trips on governor or safety valves. Investigate switch load or network noise.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-xs font-bold text-emerald-400 uppercase">Automation bus nominal</h4>
                            <p className="text-[10px] text-slate-400 mt-1">
                                Communication channel shows clean waveforms. All safety watchdog timers are synchronized.
                            </p>
                        </div>
                    </div>
                )}
            </GlassCard>

            {/* Signal Flow Topology Card */}
            <GlassCard className="p-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Database className="w-8 h-8 text-cyan-400" />
                        <div>
                            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Signal Registry Status</h4>
                            <p className="text-[9px] text-slate-500 mt-1">Total mapped IO points: 84 active channels</p>
                        </div>
                    </div>
                    <span className="text-xs text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20 uppercase">
                        Active
                    </span>
                </div>
            </GlassCard>
        </div>
    );
};
