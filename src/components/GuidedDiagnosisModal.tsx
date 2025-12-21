import React from 'react';
import { useDiagnostic, IntuitionQuery } from '../contexts/DiagnosticContext.tsx';
import { GlassCard } from './ui/GlassCard.tsx';

interface GuidedDiagnosisModalProps {
    query: IntuitionQuery;
}

export const GuidedDiagnosisModal: React.FC<GuidedDiagnosisModalProps> = ({ query }) => {
    const { submitQueryResponse, clearQuery } = useDiagnostic();

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <GlassCard className="max-w-md w-full border-indigo-500/30 overflow-hidden relative shadow-[0_0_50px_rgba(79,70,229,0.2)]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-500 animate-pulse" />

                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                            <span className="text-xl">🧠</span>
                        </div>
                        <div>
                            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Intuition Engine</p>
                            <h3 className="text-white font-black uppercase text-sm">Guided Field Expert Query</h3>
                        </div>
                    </div>

                    <p className="text-sm text-slate-300 mb-8 leading-relaxed italic border-l-2 border-indigo-500/50 pl-4 py-1">
                        "{query.query}"
                    </p>

                    <div className="space-y-3">
                        {query.options.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => submitQueryResponse(opt.value)}
                                className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all text-left group"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-white uppercase tracking-wider">{opt.label}</span>
                                    <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </div>
                            </button>
                        ))}
                    </div>

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
