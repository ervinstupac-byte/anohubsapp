import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ExternalLink, FileText, Cpu, ShieldCheck } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { useCerebro } from '../../contexts/ProjectContext';
import { NeuralPulse } from '../ui/NeuralPulse';

export const SOPViewer: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { state } = useCerebro();

    const activeDoc = id || 'index';

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
            {/* Toolbar - Ultra Industrial */}
            <header className="bg-black/60 border-b-2 border-stone-800 px-8 py-6 z-50 backdrop-blur-xl flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-10">
                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest italic"
                    >
                        <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-1 transition" />
                        <span>{t('actions.back')}</span>
                    </button>

                    <div className="h-10 w-px bg-white/5" />

                    <div className="flex items-center gap-6">
                        <div className="p-3 bg-slate-800 rounded-2xl border border-white/5 relative group overflow-hidden">
                            <FileText className="text-white w-5 h-5 group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Digital Dossier</span>
                                <NeuralPulse color="slate" />
                            </div>
                            <h1 className="text-xl font-black text-white uppercase tracking-tighter italic">
                                {activeDoc.replace(/_/g, ' ')}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="hidden lg:flex items-center gap-3 px-6 py-2 bg-emerald-950/20 rounded-full border border-emerald-900/40">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic tracking-tighter">Identity Verified</span>
                    </div>

                    <a
                        href={`/francis-docs/${activeDoc}.html`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-cyan-900/20 italic"
                    >
                        <span>Open Raw Source</span>
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </header>

            {/* Content Core */}
            <div className="flex-grow bg-white relative group">
                <div className="absolute inset-0 bg-black/5 pointer-events-none group-hover:opacity-0 transition-opacity duration-1000" />
                <iframe
                    src={`/francis-docs/${activeDoc}.html`}
                    className="w-full h-full border-none shadow-inner"
                    title="SOP Viewer"
                />

                {/* Visual Overlay for Aesthetic depth */}
                <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
            </div>

            {/* Context Breadcrumb - Footer */}
            <footer className="bg-black/80 border-t border-white/5 px-8 py-3 flex justify-between items-center relative z-50">
                <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                    <Cpu className="w-4 h-4" />
                    <span>Neural Link: <span className="text-cyan-500">Active</span></span>
                    <span className="opacity-20 mx-2">|</span>
                    <span>Buffer: <span className="text-emerald-500">100%</span></span>
                </div>
                <div className="text-[10px] text-slate-600 font-black italic">
                    ANO-HUB SOP-V-2.5 &copy; 2026
                </div>
            </footer>
        </div>
    );
};
