import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    ShieldAlert,
    Droplets,
    Zap,
    Activity,
    ExternalLink,
    ChevronRight,
    Search,
    TrendingUp,
    ShieldCheck,
    Clock,
    ZapOff,
    Gem,
    Library
} from 'lucide-react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';

export const AIInsightsPanel: React.FC = () => {
    const { unifiedDiagnosis } = useTelemetryStore();
    const [focusedService, setFocusedService] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const noteRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        const handleFocus = (e: Event) => {
            const customEvent = e as CustomEvent;
            const service = customEvent.detail.service;
            setFocusedService(service);

            // Auto-scroll logic
            setTimeout(() => {
                if (noteRefs.current[service]) {
                    noteRefs.current[service]?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }, 100);

            // Clear highlight after delay
            setTimeout(() => setFocusedService(null), 3000);
        };

        window.addEventListener('focusServiceEvent', handleFocus);
        return () => window.removeEventListener('focusServiceEvent', handleFocus);
    }, []);

    if (!unifiedDiagnosis || unifiedDiagnosis.crossCorrelation.confidenceBoosts.length === 0) {
        return (
            <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-3">
                <Search className="w-8 h-8 text-slate-700" />
                <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">
                    No active synergetic risks detected
                </p>
                <div className="text-[9px] text-slate-600 font-mono px-4">
                    Brain is monitoring all subsystems. Cross-correlation results will appear here.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-[9px] text-slate-500 uppercase font-mono font-black tracking-widest flex items-center gap-2">
                    <Brain className="w-3 h-3 text-cyan-400" />
                    Master Intelligence Insights
                </h3>
                <span className="text-[8px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">
                    LIVE ANALYSIS
                </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
                <AnimatePresence mode="popLayout">
                    {unifiedDiagnosis.crossCorrelation.confidenceBoosts.map((boost, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-slate-900/60 border border-blue-500/30 hover:border-blue-500/60 rounded-lg p-3 transition-colors group cursor-pointer"
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30">
                                    {boost.finding.toLowerCase().includes('oil') ? (
                                        <Droplets className="w-4 h-4 text-blue-400" />
                                    ) : boost.finding.toLowerCase().includes('structural') || boost.finding.toLowerCase().includes('foundation') ? (
                                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                                    ) : (
                                        <Activity className="w-4 h-4 text-cyan-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-wider italic">
                                            {boost.finding}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] text-slate-500 font-mono">CONFIDENCE</span>
                                            <span className="text-[10px] text-emerald-400 font-mono font-black">{boost.boostedConfidence}%</span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-300 font-mono leading-relaxed mb-2">
                                        {boost.reason}
                                    </p>

                                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${boost.boostedConfidence}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* NC-4.10 CONVERGED INSIGHTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
                {/* Trend Projections */}
                {unifiedDiagnosis.trendProjections && (
                    <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                            <span className="text-[9px] text-slate-500 font-mono font-black uppercase tracking-widest">Trend Projections</span>
                        </div>
                        <div className="space-y-2">
                            {Object.entries(unifiedDiagnosis.trendProjections).map(([param, trend], i) => (
                                <div key={i} className="flex justify-between items-end border-b border-white/5 pb-1">
                                    <span className="text-[10px] text-slate-400 font-mono capitalize">{param}</span>
                                    <div className="text-right">
                                        <div className={`text-[10px] font-black font-mono ${trend.daysUntilCritical < 90 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                            {trend.daysUntilCritical} Days
                                        </div>
                                        <div className="text-[8px] text-slate-600 font-mono uppercase">{trend.projectedDate}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Operating Zone */}
                {unifiedDiagnosis.operatingZone && (
                    <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="w-3 h-3 text-cyan-400" />
                            <span className="text-[9px] text-slate-500 font-mono font-black uppercase tracking-widest">Performance Guard</span>
                        </div>
                        <div className={`text-xs font-black font-mono uppercase px-2 py-1 rounded mb-1 text-center ${unifiedDiagnosis.operatingZone.color === 'red' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {unifiedDiagnosis.operatingZone.zone}
                        </div>
                        {unifiedDiagnosis.operatingZone.alert && (
                            <div className="text-[9px] text-amber-500 font-mono italic leading-tight">
                                alert: {unifiedDiagnosis.operatingZone.alert}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Life Extension ROI */}
            {unifiedDiagnosis.lifeExtension && (
                <div className="bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Gem className="w-3 h-3 text-emerald-400" />
                            <span className="text-[9px] text-emerald-500 font-mono font-black uppercase tracking-widest">Life Extension Alpha</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-black font-mono">+{unifiedDiagnosis.lifeExtension.yearsAdded.toFixed(1)} Years</span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-mono mt-1">Cross-referenced stress margins and thermal optimization ROI.</p>
                </div>
            )}

            {/* expert service notes section */}
            {unifiedDiagnosis.serviceNotes && (
                <div className="pt-4 border-t border-slate-800 space-y-3">
                    <h4 className="text-[8px] text-slate-500 uppercase font-mono tracking-[0.2em] mb-2 flex justify-between items-center">
                        Technical Service Findings
                        <span className="text-[7px] text-slate-600 bg-slate-800 px-1 rounded">CEREBRO V4.9</span>
                    </h4>
                    <div
                        ref={scrollContainerRef}
                        className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar"
                    >
                        {unifiedDiagnosis.serviceNotes.length > 0 ? (
                            unifiedDiagnosis.serviceNotes.map((note, i) => (
                                <motion.div
                                    key={i}
                                    ref={el => noteRefs.current[note.service] = el}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                        scale: focusedService === note.service ? 1.02 : 1,
                                        boxShadow: focusedService === note.service ? '0 0 15px rgba(6, 182, 212, 0.4)' : 'none'
                                    }}
                                    transition={{
                                        duration: focusedService === note.service ? 0.3 : 0.2,
                                        repeat: focusedService === note.service ? 2 : 0,
                                        repeatType: "reverse"
                                    }}
                                    className={`p-2 rounded border relative overflow-hidden group/note transition-colors duration-500 ${focusedService === note.service
                                        ? 'border-cyan-500 bg-cyan-500/10'
                                        : note.severity === 'CRITICAL' ? 'bg-red-500/5 border-red-500/20' :
                                            note.severity === 'WARNING' ? 'bg-amber-500/5 border-amber-500/20' :
                                                'bg-blue-500/5 border-blue-500/20'
                                        }`}
                                >
                                    <div className={`absolute left-0 top-0 w-0.5 h-full ${note.severity === 'CRITICAL' ? 'bg-red-500' :
                                        note.severity === 'WARNING' ? 'bg-amber-500' :
                                            'bg-blue-500'
                                        }`} />
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{note.service}</span>
                                        <span className={`text-[7px] font-black font-mono px-1 rounded uppercase ${note.severity === 'CRITICAL' ? 'text-red-400 bg-red-400/10' :
                                            note.severity === 'WARNING' ? 'text-amber-400 bg-amber-400/10' :
                                                'text-blue-400 bg-blue-400/10'
                                            }`}>
                                            {note.severity}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-200 font-mono mb-1 leading-tight">{note.message}</p>

                                    {/* NC-5.4: ISO IMS Verified Branding */}
                                    {note.recommendation.includes('[PROTOCOL_IMS_VERIFIED]') && (
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded w-fit">
                                                <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                                                <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">ISO IMS Verified</span>
                                            </div>

                                            {note.sourceFiles && note.sourceFiles.length > 0 && (
                                                <div className="relative group/evidence">
                                                    <button
                                                        className="text-[7px] font-mono font-black text-slate-500 hover:text-cyan-400 uppercase flex items-center gap-1 transition-colors"
                                                    >
                                                        <Search className="w-2 h-2" />
                                                        View Source Evidence
                                                    </button>

                                                    {/* NC-5.5: Trust Architecture Tooltip (Justified Proof) */}
                                                    <div className="absolute bottom-full right-0 mb-2 w-72 bg-slate-900 border border-cyan-500/30 rounded-xl p-3 opacity-0 group-hover/evidence:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl backdrop-blur-md">
                                                        <p className="text-[8px] text-cyan-500 font-black uppercase mb-2 border-b border-cyan-500/20 pb-1 flex items-center gap-2">
                                                            <Library className="w-2.5 h-2.5" />
                                                            Knowledge Base Evidence
                                                        </p>
                                                        <div className="space-y-3">
                                                            {note.sourceFiles.map((source, fIdx) => (
                                                                <div key={fIdx} className="space-y-1">
                                                                    <div className="text-[8px] text-slate-300 font-mono flex items-center gap-1 font-bold">
                                                                        <div className="w-1 h-1 rounded-full bg-cyan-400" />
                                                                        {source.filename.split('/').pop()}
                                                                    </div>
                                                                    <p className="text-[8px] text-slate-500 font-mono leading-tight italic pl-2 border-l border-white/10">
                                                                        "{source.justification}"
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-start gap-1 group/rec">
                                        <ChevronRight className="w-2.5 h-2.5 text-cyan-500 mt-0.5" />
                                        <p className="text-[9px] text-cyan-400 font-mono italic flex-1">
                                            <span className="text-slate-500 not-italic uppercase text-[7px] font-bold mr-1">Rec:</span>
                                            {note.recommendation.replace('[PROTOCOL_IMS_VERIFIED]', '').trim()}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-4 border border-dashed border-slate-800 rounded">
                                <p className="text-[9px] text-slate-600 font-mono italic">No expert service warnings active.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <button className="w-full py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-cyan-500/30 rounded text-[9px] text-slate-400 hover:text-cyan-400 font-mono uppercase font-black transition-all flex items-center justify-center gap-2 group">
                Deep Dive Forensic Analysis
                <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
};
