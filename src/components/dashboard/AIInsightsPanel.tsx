import React, { useState, useEffect, useRef } from 'react';
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
            <div className="bg-scada-panel border border-scada-border rounded-sm p-6 flex flex-col items-center justify-center text-center space-y-3">
                <Search className="w-8 h-8 text-scada-text/50" />
                <p className="text-scada-text/70 font-mono text-[10px] uppercase tracking-widest">
                    No active synergetic risks detected
                </p>
                <div className="text-[9px] text-scada-text/50 font-mono px-4">
                    Brain is monitoring all subsystems. Cross-correlation results will appear here.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] text-scada-text/70 uppercase font-mono font-black tracking-widest flex items-center gap-2">
                    <Brain className="w-3 h-3 text-status-info" />
                    Master Intelligence Insights
                </h3>
                <span className="text-[8px] bg-status-info/10 text-status-info px-2 py-0.5 rounded-sm border border-status-info/20 font-mono">
                    LIVE ANALYSIS
                </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {unifiedDiagnosis.crossCorrelation.confidenceBoosts.map((boost, idx) => (
                    <div
                        key={idx}
                        className="bg-scada-panel border border-scada-border hover:border-status-info/60 rounded-sm p-3 transition-colors group cursor-pointer shadow-scada-card"
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-sm bg-scada-bg border border-scada-border">
                                {boost.finding.toLowerCase().includes('oil') ? (
                                    <Droplets className="w-4 h-4 text-status-info" />
                                ) : boost.finding.toLowerCase().includes('structural') || boost.finding.toLowerCase().includes('foundation') ? (
                                    <ShieldAlert className="w-4 h-4 text-status-warning" />
                                ) : (
                                    <Activity className="w-4 h-4 text-status-info" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] text-status-info font-mono font-bold uppercase tracking-wider italic">
                                        {boost.finding}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] text-scada-text/70 font-mono">CONFIDENCE</span>
                                        <span className="text-[10px] text-status-ok font-mono font-black">{boost.boostedConfidence}%</span>
                                    </div>
                                </div>
                                <p className="text-[11px] text-scada-text/80 font-mono leading-relaxed mb-2">
                                    {boost.reason}
                                </p>

                                <div className="h-1 bg-scada-bg rounded-sm overflow-hidden">
                                    <div
                                        className="h-full bg-status-info"
                                        style={{ width: `${boost.boostedConfidence}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* NC-4.10 CONVERGED INSIGHTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
                {/* Trend Projections */}
                {unifiedDiagnosis.trendProjections && (
                    <div className="bg-scada-panel border border-scada-border rounded-sm p-3 shadow-scada-card">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-3 h-3 text-status-ok" />
                            <span className="text-[9px] text-scada-text/70 font-mono font-black uppercase tracking-widest">Trend Projections</span>
                        </div>
                        <div className="space-y-2">
                            {Object.entries(unifiedDiagnosis.trendProjections).map(([param, trend], i) => (
                                <div key={i} className="flex justify-between items-end border-b border-scada-border pb-1">
                                    <span className="text-[10px] text-scada-text/60 font-mono capitalize">{param}</span>
                                    <div className="text-right">
                                        <div className={`text-[10px] font-black font-mono ${trend.daysUntilCritical < 90 ? 'text-status-warning' : 'text-status-ok'}`}>
                                            {trend.daysUntilCritical} Days
                                        </div>
                                        <div className="text-[8px] text-scada-text/50 font-mono uppercase">{trend.projectedDate}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Operating Zone */}
                {unifiedDiagnosis.operatingZone && (
                    <div className="bg-scada-panel border border-scada-border rounded-sm p-3 shadow-scada-card">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="w-3 h-3 text-status-info" />
                            <span className="text-[9px] text-scada-text/70 font-mono font-black uppercase tracking-widest">Performance Guard</span>
                        </div>
                        <div className={`text-xs font-black font-mono uppercase px-2 py-1 rounded-sm mb-1 text-center ${unifiedDiagnosis.operatingZone.color === 'red' ? 'bg-status-error/10 text-status-error' : 'bg-status-ok/10 text-status-ok'}`}>
                            {unifiedDiagnosis.operatingZone.zone}
                        </div>
                        {unifiedDiagnosis.operatingZone.alert && (
                            <div className="text-[9px] text-status-warning font-mono italic leading-tight">
                                alert: {unifiedDiagnosis.operatingZone.alert}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Life Extension ROI */}
            {unifiedDiagnosis.lifeExtension && (
                <div className="bg-status-ok/5 border border-status-ok/20 rounded-sm p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Gem className="w-3 h-3 text-status-ok" />
                            <span className="text-[9px] text-status-ok font-mono font-black uppercase tracking-widest">Life Extension Alpha</span>
                        </div>
                        <span className="text-[10px] text-status-ok font-black font-mono">+{unifiedDiagnosis.lifeExtension.yearsAdded.toFixed(1)} Years</span>
                    </div>
                    <p className="text-[9px] text-scada-text/60 font-mono mt-1">Cross-referenced stress margins and thermal optimization ROI.</p>
                </div>
            )}

            {/* expert service notes section */}
            {unifiedDiagnosis.serviceNotes && (
                <div className="pt-4 border-t border-scada-border space-y-3">
                    <h4 className="text-[8px] text-scada-text/50 uppercase font-mono tracking-[0.2em] mb-2 flex justify-between items-center">
                        Technical Service Findings
                        <span className="text-[7px] text-scada-text/60 bg-scada-bg px-1 rounded-sm">CEREBRO V4.9</span>
                    </h4>
                    <div
                        ref={scrollContainerRef}
                        className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar"
                    >
                        {unifiedDiagnosis.serviceNotes.length > 0 ? (
                            unifiedDiagnosis.serviceNotes.map((note, i) => (
                                <div
                                    key={i}
                                    ref={el => noteRefs.current[note.service] = el}
                                    className={`p-2 rounded-sm border relative overflow-hidden group/note transition-colors duration-300 ${focusedService === note.service
                                        ? 'border-status-info bg-status-info/10'
                                        : note.severity === 'CRITICAL' ? 'bg-status-error/5 border-status-error/20' :
                                            note.severity === 'WARNING' ? 'bg-status-warning/5 border-status-warning/20' :
                                                'bg-status-info/5 border-status-info/20'
                                        }`}
                                >
                                    <div className={`absolute left-0 top-0 w-0.5 h-full ${note.severity === 'CRITICAL' ? 'bg-status-error' :
                                        note.severity === 'WARNING' ? 'bg-status-warning' :
                                            'bg-status-info'
                                        }`} />
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[9px] font-black text-scada-text/80 uppercase tracking-tighter">{note.service}</span>
                                        <span className={`text-[7px] font-black font-mono px-1 rounded-sm uppercase ${note.severity === 'CRITICAL' ? 'text-status-error bg-status-error/10' :
                                            note.severity === 'WARNING' ? 'text-status-warning bg-status-warning/10' :
                                                'text-status-info bg-status-info/10'
                                            }`}>
                                            {note.severity}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-scada-text/90 font-mono mb-1 leading-tight">{note.message}</p>

                                    {/* NC-5.4: ISO IMS Verified Branding */}
                                    {note.recommendation.includes('[PROTOCOL_IMS_VERIFIED]') && (
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-status-ok/10 border border-status-ok/30 rounded-sm w-fit">
                                                <ShieldCheck className="w-2.5 h-2.5 text-status-ok" />
                                                <span className="text-[7px] font-black text-status-ok uppercase tracking-widest">ISO IMS Verified</span>
                                            </div>

                                            {note.sourceFiles && note.sourceFiles.length > 0 && (
                                                <div className="relative group/evidence">
                                                    <button
                                                        className="text-[7px] font-mono font-black text-scada-text/60 hover:text-status-info uppercase flex items-center gap-1 transition-colors"
                                                    >
                                                        <Search className="w-2 h-2" />
                                                        View Source Evidence
                                                    </button>

                                                    {/* NC-9.0: Trust Architecture Tooltip (Justified Proof) */}
                                                    <div className="absolute bottom-full right-0 mb-2 w-72 bg-scada-panel border border-status-info/30 rounded-sm p-3 opacity-0 group-hover/evidence:opacity-100 pointer-events-none transition-opacity z-50 shadow-scada-card">
                                                        <p className="text-[8px] text-status-info font-black uppercase mb-2 border-b border-status-info/20 pb-1 flex items-center gap-2">
                                                            <Library className="w-2.5 h-2.5" />
                                                            Knowledge Base Evidence
                                                        </p>
                                                        <div className="space-y-3">
                                                            {note.sourceFiles.map((source, fIdx) => (
                                                                <div key={fIdx} className="space-y-1">
                                                                    <div className="text-[8px] text-scada-text/80 font-mono flex items-center gap-1 font-bold">
                                                                        <div className="w-1 h-1 rounded-full bg-status-info" />
                                                                        {source.filename.split('/').pop()}
                                                                    </div>
                                                                    <p className="text-[8px] text-scada-text/60 font-mono leading-tight italic pl-2 border-l border-scada-border">
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
                                        <ChevronRight className="w-2.5 h-2.5 text-status-info mt-0.5" />
                                        <p className="text-[9px] text-status-info font-mono italic flex-1">
                                            <span className="text-scada-text/60 not-italic uppercase text-[7px] font-bold mr-1">Rec:</span>
                                            {note.recommendation.replace('[PROTOCOL_IMS_VERIFIED]', '').trim()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 border border-dashed border-scada-border rounded-sm">
                                <p className="text-[9px] text-scada-text/60 font-mono italic">No expert service warnings active.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <button className="w-full py-2 bg-scada-bg hover:bg-scada-panel border border-scada-border hover:border-status-info/30 rounded-sm text-[9px] text-scada-text/70 hover:text-status-info font-mono uppercase font-black transition-all flex items-center justify-center gap-2 group">
                Deep Dive Forensic Analysis
                <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
};
