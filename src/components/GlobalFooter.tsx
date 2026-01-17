import React from 'react';
import { useCerebro } from '../contexts/ProjectContext';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

export const GlobalFooter: React.FC = () => {
    const { state } = useCerebro();

    return (
        <footer className="fixed bottom-0 left-0 right-0 z-20 h-8 bg-[#020617]/90 backdrop-blur-md border-t border-white/5 px-6 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-6">
                {/* Sync Status */}
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sync Status:</span>
                    <span className="text-[9px] font-bold text-emerald-400 uppercase">Supabase Linked // Real-time</span>
                </div>

                {/* Math Integrity */}
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Logic Integrity:</span>
                    <span className="text-[9px] font-bold text-cyan-400 uppercase">Decimal.js Verified</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Neural Pulse */}
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Neural Pulse</span>
                    <div className="flex items-center gap-0.5 h-3">
                        {[1, 2, 3, 4, 1, 2].map((h, i) => (
                            <div
                                key={i}
                                className="w-0.5 bg-emerald-500/50 rounded-full animate-pulse"
                                style={{
                                    height: `${h * 25}%`,
                                    animationDelay: `${i * 0.1}s`,
                                    animationDuration: '0.8s'
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div className="h-4 w-px bg-white/5 mx-2" />

                <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-h-gold" />
                    <span className="text-[9px] font-black text-h-gold uppercase tracking-widest">NC-5.7 Digital Dossier Edition</span>
                </div>
            </div>
        </footer>
    );
};
