import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { BackButton } from './BackButton.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { GlassCard } from './ui/GlassCard.tsx';
import { ModernButton } from './ui/ModernButton.tsx';

// Data moved inside component

// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const StandardOfExcellence: React.FC<{ onCommit?: () => void }> = ({ onCommit }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [activeId, setActiveId] = useState<string | null>('p1');
    const [signed, setSigned] = useState(false);

    // --- THE CONSTITUTION (Moved inside for translations) ---
    const PRINCIPLES = [
        // ... rest of the component ...
        {
            id: 'p1',
            title: t('standardOfExcellence.principles.p1.title'),
            icon: '📏',
            description: t('standardOfExcellence.principles.p1.desc'),
            quote: t('standardOfExcellence.principles.p1.quote')
        },
        {
            id: 'p2',
            title: t('standardOfExcellence.principles.p2.title'),
            icon: '🛑',
            description: t('standardOfExcellence.principles.p2.desc'),
            quote: t('standardOfExcellence.principles.p2.quote')
        },
        {
            id: 'p3',
            title: t('standardOfExcellence.principles.p3.title'),
            icon: '💾',
            description: t('standardOfExcellence.principles.p3.desc'),
            quote: t('standardOfExcellence.principles.p3.quote')
        },
        {
            id: 'p4',
            title: t('standardOfExcellence.principles.p4.title'),
            icon: '🔧',
            description: t('standardOfExcellence.principles.p4.desc'),
            quote: t('standardOfExcellence.principles.p4.quote')
        }
    ];

    const toggle = (id: string) => setActiveId(activeId === id ? null : id);

    const handleCommit = () => {
        setSigned(true);
        if (onCommit) onCommit();
        showToast(`${t('standardOfExcellence.oath.toast')} ${user?.email?.split('@')[0].toUpperCase()}`, 'success');
    };

    return (
        <div className="animate-fade-in pb-12 max-w-5xl mx-auto space-y-8">

            {/* HERO SECTION */}
            <div className="text-center space-y-6 pt-6 relative">
                <div className="flex justify-between items-center absolute top-0 w-full px-4">
                    <BackButton text={t('actions.back')} />
                </div>

                <div className="relative inline-block">
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full blur opacity-30 animate-pulse"></div>
                    <h2 className="relative text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-2">
                        {t('standardOfExcellence.title').split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">{t('standardOfExcellence.title').split(' ')[2]}</span>
                    </h2>
                </div>

                <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                    {t('standardOfExcellence.subtitle')} <br />
                    <Trans i18nKey="standardOfExcellence.subtitle2" components={{ span: <span className="text-white font-bold" /> }} />
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* LEFT: PRINCIPLES LIST */}
                <div className="lg:col-span-7 space-y-4">
                    {PRINCIPLES.map((p) => (
                        <div
                            key={p.id}
                            onClick={() => toggle(p.id)}
                            className={`
                                group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer
                                ${activeId === p.id
                                    ? 'bg-gradient-to-br from-amber-900/40 to-slate-900 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                                    : 'bg-slate-900/40 border-slate-700 hover:border-slate-500'}
                            `}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl filter drop-shadow-lg">{p.icon}</span>
                                        <h3 className={`text-xl font-bold tracking-tight ${activeId === p.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                            {p.title}
                                        </h3>
                                    </div>
                                    <span className={`text-2xl transition-transform duration-300 ${activeId === p.id ? 'rotate-180 text-amber-400' : 'text-slate-600'}`}>
                                        ↓
                                    </span>
                                </div>

                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeId === p.id ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                    <p className="text-slate-300 leading-relaxed text-sm border-l-2 border-amber-500/30 pl-4">
                                        {p.description}
                                    </p>
                                    <div className="mt-4 text-xs font-mono text-amber-400/80 italic">
                                        {p.quote}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* RIGHT: COMMITMENT CARD */}
                <div className="lg:col-span-5 sticky top-24">
                    <GlassCard className="text-center border-t-4 border-t-amber-500 bg-slate-900/80 backdrop-blur-xl">
                        <div className="mb-6">
                            <div className="w-20 h-20 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30 mb-4">
                                <span className="text-4xl">📜</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{t('standardOfExcellence.oath.title')}</h3>
                            <p className="text-sm text-slate-400">
                                {t('standardOfExcellence.oath.desc')}
                            </p>
                        </div>

                        <div className="bg-black/30 rounded-lg p-4 mb-6 text-left font-mono text-xs text-slate-500 space-y-2 border border-white/5">
                            <div className="flex justify-between">
                                <span>{t('standardOfExcellence.oath.identity')}</span>
                                <span className="text-white">{user?.email || 'GUEST_USER'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>{t('standardOfExcellence.oath.date')}</span>
                                <span className="text-white">{new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>{t('standardOfExcellence.oath.status')}</span>
                                <span className={signed ? "text-emerald-400 font-bold" : "text-amber-500 font-bold"}>
                                    {signed ? t('standardOfExcellence.oath.ratified') : t('standardOfExcellence.oath.pending')}
                                </span>
                            </div>
                        </div>

                        <ModernButton
                            onClick={handleCommit}
                            disabled={signed}
                            variant={signed ? "secondary" : "primary"}
                            fullWidth
                            className={signed ? "border-emerald-500 text-emerald-400" : "bg-gradient-to-r from-amber-600 to-yellow-600 border-none text-black font-black hover:opacity-90"}
                            icon={signed ? <span>✓</span> : <span>✒️</span>}
                        >
                            {signed ? t('standardOfExcellence.oath.btnActive') : t('standardOfExcellence.oath.btnCommit')}
                        </ModernButton>

                        {signed && (
                            <p className="mt-4 text-[10px] text-slate-600 uppercase tracking-widest animate-pulse">
                                {t('standardOfExcellence.oath.sync')}
                            </p>
                        )}
                    </GlassCard>

                    {/* DECORATIVE ELEMENT */}
                    <div className="mt-8 p-6 rounded-2xl border border-dashed border-slate-800 text-center opacity-50 hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-2">{t('standardOfExcellence.poweredBy')}</p>
                        <h4 className="text-xl font-black text-slate-700 tracking-tighter">AnoHUB <span className="text-slate-600">OS</span></h4>
                    </div>
                </div>
            </div>
        </div>
    );
};
// Uklonjen dupli eksport na dnu fajla.