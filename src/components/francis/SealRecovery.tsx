import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LifeBuoy, ArrowLeft, Lock, Construction, Waves, ShieldAlert, Cpu, Timer } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const SealRecovery: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-amber-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-none transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-amber-600 rounded-none border border-white/10 shadow-none relative group overflow-hidden">
                            <LifeBuoy className="text-white w-8 h-8 relative z-10 group-hover:rotate-180 transition-transform duration-1000" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-none bg-amber-950 text-amber-500 text-[10px] font-black border border-amber-900/50 uppercase tracking-widest">SOP-REC-001</span>
                                <NeuralPulse color="amber" />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.recovery.title')}
                            </h1>
                            <p className="text-[10px] text-amber-500/70 font-black uppercase tracking-[0.2em] italic">
                                Maintenance & Critical Recovery Layer
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-amber-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.recovery.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8">
                <div className="bg-slate-900/40 backdrop-blur-xl border border-amber-500/20 rounded-none p-16 md:p-24 text-center relative overflow-hidden group min-h-[600px] flex flex-col items-center justify-center">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-amber-500/20" />
                        <Waves className="absolute -bottom-24 -right-24 w-96 h-96 text-amber-500 animate-pulse" />
                    </div>

                    <div className="relative z-10 mb-12">
                        <div data-hotspot-id="seal_package" className="w-32 h-32 bg-amber-600 rounded-none shadow-none flex items-center justify-center mb-8 mx-auto relative group-hover:scale-110 transition-transform duration-700">
                            <Construction className="text-white w-16 h-16 animate-pulse" />
                            <Lock className="absolute -bottom-4 -right-4 w-12 h-12 text-slate-950 bg-amber-400 p-2 rounded-none border-4 border-slate-950 shadow-none" />
                        </div>

                        <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase mb-4 italic transition-all group-hover:tracking-normal duration-700">
                            {t('francis.recovery.csTitle')}
                        </h2>
                        <div className="inline-block px-8 py-2 bg-amber-950/40 text-amber-500 text-sm font-black uppercase tracking-[0.4em] rounded-none border border-amber-500/30 italic">
                            {t('francis.recovery.csSubtitle')}
                        </div>
                    </div>

                    <div className="max-w-2xl relative z-10">
                        <p className="text-lg text-slate-400 font-bold italic leading-relaxed uppercase tracking-tight border-x-2 border-amber-500/20 px-12 mb-16">
                            {t('francis.recovery.csDesc')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl relative z-10">
                        {[
                            { icon: ShieldAlert, label: 'Safety Lock', status: 'Engaged' },
                            { icon: Timer, label: 'Next Cycle', status: 'T-Minus 48h' },
                            { icon: Cpu, label: 'Logic Core', status: 'Compiling...' }
                        ].map((stat, i) => (
                            <div key={i} className="p-8 bg-black/40 rounded-none border border-white/5 flex flex-col items-center hover:border-amber-500/30 transition-all group/stat">
                                <stat.icon className="w-8 h-8 text-slate-600 group-hover/stat:text-amber-500 transition-colors mb-4" />
                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 italic">{stat.label}</div>
                                <div className="text-sm text-white font-black italic uppercase">{stat.status}</div>
                            </div>
                        ))}
                    </div>

                    {/* Progress Indicator */}
                    <div className="mt-20 flex gap-4 relative z-10">
                        <div className="w-3 h-3 rounded-none bg-amber-500 animate-[ping_1.5s_infinite] shadow-[0_0_15px_rgba(217,119,6,0.6)]" />
                        <div className="w-3 h-3 rounded-none bg-amber-500/60 animate-[ping_1.5s_infinite_200ms]" />
                        <div className="w-3 h-3 rounded-none bg-amber-500/30 animate-[ping_1.5s_infinite_400ms]" />
                    </div>
                </div>
            </main>
        </div>
    );
};
