import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Ruler, Scale, Zap, Book, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FRANCIS_PATHS } from '../../routes/paths';

export const Manifesto: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#001f3f] text-white font-mono p-4 md:p-8 relative overflow-hidden">
            {/* Grid Pattern Background - Blueprint Style */}
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }} />

            <div className="max-w-4xl mx-auto relative z-10 border-2 border-white/20 p-8 md:p-16 bg-[#001f3f]/90 backdrop-blur-md shadow-[0_0_100px_rgba(255,255,255,0.05)] rounded-none">

                {/* Decorative Blueprint Corner Lines */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/40" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/40" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/40" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/40" />

                {/* Header Section */}
                <div className="border-b-4 border-white pb-10 mb-12">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">{t('manifesto.classification')}</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">{t('manifesto.version')}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-none">{t('manifesto.title')}</h1>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-[2px] w-20 bg-cyan-400" />
                            <p className="text-lg md:text-xl italic font-bold tracking-[0.1em] uppercase text-cyan-400">{t('manifesto.subtitle')}</p>
                        </div>
                        <p className="text-slate-400 font-bold leading-tight">
                            {t('manifesto.quote')}
                        </p>
                    </div>
                </div>

                <div className="space-y-16">
                    {/* Section 1: The 0.05 mm/m Law */}
                    <div className="relative group">
                        <div className="absolute -left-4 top-0 w-1 h-full bg-white/10 group-hover:bg-cyan-500 transition-colors" />
                        <div className="flex items-center gap-6 mb-6">
                            <div className="p-3 bg-white/5 rounded-none border border-white/10">
                                <Ruler className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tight">{t('manifesto.section1.title')}</h2>
                        </div>
                        <div className="pl-6 md:pl-12">
                            <p className="text-lg leading-relaxed text-slate-200 indent-8 mb-4">
                                {t('manifesto.section1.content')}
                            </p>
                            <p className="text-sm italic opacity-60">{t('manifesto.section1.quote')}</p>
                        </div>
                    </div>

                    {/* Section 2: The 48% Dynamic Risk Rule */}
                    <div className="relative group">
                        <div className="absolute -left-4 top-0 w-1 h-full bg-white/10 group-hover:bg-amber-500 transition-colors" />
                        <div className="flex items-center gap-6 mb-6">
                            <div className="p-3 bg-white/5 rounded-none border border-white/10">
                                <Zap className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tight">{t('manifesto.section2.title')}</h2>
                        </div>
                        <div className="pl-6 md:pl-12">
                            <p className="text-lg leading-relaxed text-slate-200 indent-8 mb-4">
                                {t('manifesto.section2.content')}
                            </p>
                        </div>
                    </div>

                    {/* Section 3: The Ethical Obligation */}
                    <div className="relative group">
                        <div className="absolute -left-4 top-0 w-1 h-full bg-white/10 group-hover:bg-emerald-500 transition-colors" />
                        <div className="flex items-center gap-6 mb-6">
                            <div className="p-3 bg-white/5 rounded-none border border-white/10">
                                <ShieldCheck className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tight">{t('manifesto.section3.title')}</h2>
                        </div>
                        <div className="pl-6 md:pl-12">
                            <p className="text-lg leading-relaxed text-slate-200 indent-8 mb-4">
                                {t('manifesto.section3.content')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Technical Sidebar Inset */}
                <div className="mt-20 p-6 border border-white/20 bg-white/5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <div className="text-[9px] font-black uppercase text-white/40 mb-1">{t('manifesto.sidebar.standard')}</div>
                            <div className="text-xs font-black">{t('manifesto.sidebar.heritage')}</div>
                        </div>
                        <div>
                            <div className="text-[9px] font-black uppercase text-white/40 mb-1">{t('manifesto.sidebar.target')}</div>
                            <div className="text-xs font-black">{t('manifesto.sidebar.mtbf')}</div>
                        </div>
                        <div>
                            <div className="text-[9px] font-black uppercase text-white/40 mb-1">{t('manifesto.sidebar.protocol')}</div>
                            <div className="text-xs font-black">{t('manifesto.sidebar.precisionOnly')}</div>
                        </div>
                        <div>
                            <div className="text-[9px] font-black uppercase text-white/40 mb-1">{t('manifesto.sidebar.signature')}</div>
                            <div className="text-[10px] font-black italic text-cyan-500">{t('manifesto.sidebar.certified')}</div>
                        </div>
                    </div>
                </div>

                {/* Footer and Return */}
                <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/20 pt-10">
                    <div className="flex flex-col">
                        <div className="text-[10px] uppercase tracking-[0.3em] opacity-40">{t('manifesto.footer.approved')}</div>
                        <div className="text-[8px] uppercase tracking-[0.2em] opacity-30 mt-1 italic">{t('manifesto.footer.signed')}</div>
                    </div>
                    <button
                        onClick={() => navigate('/' + FRANCIS_PATHS.HUB)}
                        className="group flex items-center gap-4 px-10 py-4 border-2 border-white font-black uppercase tracking-widest text-sm hover:bg-white hover:text-[#001f3f] transition-all relative overflow-hidden"
                    >
                        <span className="relative z-10">{t('manifesto.return')}</span>
                        <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Background Decorative Blueprint Lines */}
            <div className="fixed bottom-10 right-10 opacity-20 pointer-events-none hidden md:block">
                <div className="text-[120px] font-black leading-none text-white/5">0.05</div>
            </div>
        </div>
    );
};
