import React, { useState, useEffect } from 'react';
import { useDiagnostic, IntuitionQuery } from '../contexts/DiagnosticContext.tsx';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { Brain, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface GuidedDiagnosisModalProps {
    query: IntuitionQuery;
}

export const GuidedDiagnosisModal: React.FC<GuidedDiagnosisModalProps> = ({ query }) => {
    const { submitQueryResponse, clearQuery } = useDiagnostic();
    const [timeRemaining, setTimeRemaining] = useState(30);
    const [showHint, setShowHint] = useState(false);

    // Countdown timer for urgency
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Show hint after 10 seconds
    useEffect(() => {
        const hintTimer = setTimeout(() => {
            setShowHint(true);
        }, 10000);
        return () => clearTimeout(hintTimer);
    }, []);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <GlassCard className="max-w-md w-full border-indigo-500/30 overflow-hidden relative shadow-[0_0_50px_rgba(79,70,229,0.2)]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-500 animate-pulse" />

                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                <Brain className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Intuition Engine</p>
                                <h3 className="text-white font-black uppercase text-sm">Guided Field Expert Query</h3>
                            </div>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                            timeRemaining > 15 ? 'bg-emerald-500/10 border-emerald-500/30' :
                            timeRemaining > 5 ? 'bg-amber-500/10 border-amber-500/30' :
                            'bg-red-500/10 border-red-500/30 animate-pulse'
                        }`}>
                            <Clock className={`w-3 h-3 ${
                                timeRemaining > 15 ? 'text-emerald-400' :
                                timeRemaining > 5 ? 'text-amber-400' :
                                'text-red-400'
                            }`} />
                            <span className={`text-[10px] font-mono font-bold ${
                                timeRemaining > 15 ? 'text-emerald-400' :
                                timeRemaining > 5 ? 'text-amber-400' :
                                'text-red-400'
                            }`}>
                                {timeRemaining}s
                            </span>
                        </div>
                    </div>

                    <p className="text-sm text-slate-300 mb-8 leading-relaxed italic border-l-2 border-indigo-500/50 pl-4 py-1">
                        "{query.query}"
                    </p>

                    <div className="space-y-3">
                        {query.options.map((opt, idx) => (
                            <button
                                key={opt.value}
                                onClick={() => submitQueryResponse(opt.value)}
                                className={`w-full p-4 rounded-2xl border transition-all text-left group relative overflow-hidden ${
                                    idx === 0 ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20' :
                                    idx === 1 ? 'bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20' :
                                    'bg-white/5 border-white/5 hover:bg-white/10 hover:border-indigo-500/30'
                                }`}
                            >
                                <div className="flex justify-between items-center relative z-10">
                                    <div className="flex items-center gap-2">
                                        {idx === 0 && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                                        {idx === 1 && <AlertTriangle className="w-4 h-4 text-cyan-400" />}
                                        <span className="text-xs font-bold text-white uppercase tracking-wider">{opt.label}</span>
                                    </div>
                                    <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {showHint && (
                        <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                            <p className="text-[10px] text-indigo-300 italic leading-relaxed">
                                💡 Hint: Consider the most likely cause based on the current system state and recent events.
                            </p>
                        </div>
                    )}

                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={clearQuery}
                            className="text-[10px] text-slate-500 font-black uppercase tracking-widest hover:text-white transition-colors"
                        >
                            Skip / Diagnostic Incomplete
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};
