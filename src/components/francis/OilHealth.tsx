import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Droplets, Activity, Search, Thermometer, ShieldAlert, Waves, Microscope, ShieldCheck } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const OilHealth: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-amber-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-2xl transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-amber-600 rounded-3xl border border-white/10 shadow-lg relative group overflow-hidden">
                            <Droplets className="text-white w-8 h-8 relative z-10 group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-x-0 bottom-0 bg-amber-400/20 h-1/2 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-500 text-[10px] font-black border border-amber-900/50 uppercase tracking-widest">SOP-OIL-003</span>
                                <NeuralPulse color="amber" />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.oilHealth.title')}
                            </h1>
                            <p className="text-[10px] text-amber-500/70 font-black uppercase tracking-[0.2em] italic">
                                {t('francis.oilHealth.subtitle')}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-amber-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.oilHealth.back_btn')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-12">

                {/* 1. Global Descriptive Briefing */}
                <div className="p-10 bg-black/40 rounded-[3rem] border border-white/5 shadow-inner">
                    <p className="text-lg text-slate-300 font-bold italic leading-relaxed uppercase tracking-tighter border-l-4 border-amber-500 pl-8">
                        {t('francis.oilHealth.hdr_desc')}
                    </p>
                </div>

                {/* 2. Safety Protocol - Critical Layer */}
                <div className="bg-red-950/20 border-l-[16px] border-red-600 p-12 rounded-r-[4rem] border border-red-900/20 relative group overflow-hidden shadow-3xl">
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ShieldAlert className="w-64 h-64 text-red-600" />
                    </div>
                    <div className="flex items-start gap-10 relative z-10">
                        <div className="p-8 bg-red-600 rounded-[2.5rem] shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                            <AlertTriangle className="text-white w-16 h-16" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 italic">{t('francis.oilHealth.safety_title')}</h2>
                            <strong className="block text-red-400 text-xl mb-8 tracking-wide font-black uppercase italic shadow-red-900/20">{t('francis.oilHealth.stop_msg')}</strong>
                            <div className="grid md:grid-cols-3 gap-6">
                                {[1, 2, 3].map((num) => (
                                    <div key={num} className="p-6 bg-black/40 rounded-[2rem] border border-red-500/30 group/rule hover:bg-black/60 transition-all flex flex-col justify-between h-full">
                                        <p className="text-xs text-red-100 font-bold uppercase tracking-tight leading-relaxed italic" dangerouslySetInnerHTML={{ __html: t(`francis.oilHealth.safety_${num}`) }} />
                                        <div className="mt-6 flex justify-end">
                                            <ShieldCheck className="w-6 h-6 text-red-500/20 group-hover:text-red-500 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Foaming vs Aeration Intelligence */}
                <GlassCard title={t('francis.oilHealth.foaming_title')} icon={<Waves className="text-amber-500" />}>
                    <div className="space-y-10">
                        <div className="p-8 bg-slate-900/60 rounded-[3rem] border border-white/5">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 italic italic">{t('francis.oilHealth.foam_vs_air')}</h3>
                            <p className="text-sm text-slate-500 font-bold italic mb-10 tracking-widest uppercase">{t('francis.oilHealth.diff_states')}</p>

                            <div className="overflow-hidden rounded-[2rem] border border-white/5 bg-black/40 shadow-2xl">
                                <table className="w-full text-left text-xs border-collapse font-sans font-black">
                                    <thead>
                                        <tr className="bg-amber-900/40 text-amber-500 uppercase italic tracking-widest">
                                            <th className="p-6 border-b border-white/5">{t('francis.oilHealth.char')}</th>
                                            <th className="p-6 border-b border-white/5 text-amber-400">{t('francis.oilHealth.surf_foam')}</th>
                                            <th className="p-6 border-b border-white/5 text-red-500">{t('francis.oilHealth.ent_air')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-slate-300">
                                        {[
                                            { key: 'appear', foam: 'large_bubbles', air: 'milky_oil' },
                                            { key: 'location', foam: 'surf_only', air: 'distrib' },
                                            { key: 'prim_cause', foam: 'contam', air: 'low_lvl' },
                                            { key: 'sys_eff', foam: 'lvl_fluct', air: 'bulk_mod_eff' }
                                        ].map((row, idx) => (
                                            <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                <td className="p-6 text-slate-500 uppercase tracking-tighter group-hover:text-amber-500 transition-colors italic" dangerouslySetInnerHTML={{ __html: t(`francis.oilHealth.${row.key}`) }} />
                                                <td className="p-6 uppercase italic tracking-tighter" dangerouslySetInnerHTML={{ __html: t(`francis.oilHealth.${row.foam}`) }} />
                                                <td className="p-6 text-red-400 uppercase italic tracking-tighter" dangerouslySetInnerHTML={{ __html: t(`francis.oilHealth.${row.air}`) }} />
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Bulk Modulus Deep Dive */}
                        <div className="bg-amber-950/10 p-12 rounded-[4rem] border border-amber-900/20 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Activity className="w-48 h-48 text-amber-600" />
                            </div>
                            <h3 className="text-2xl font-black text-amber-500 mb-6 flex items-center gap-4 uppercase italic tracking-tighter relative z-10">
                                <Activity className="w-8 h-8 animate-pulse" /> {t('francis.oilHealth.bulk_mod_title')}
                            </h3>
                            <p className="text-lg text-slate-200 font-bold italic leading-relaxed max-w-4xl mb-10 relative z-10 uppercase tracking-tighter">
                                <strong className="text-amber-500">{t('francis.oilHealth.what_is_bulk')}</strong> {t('francis.oilHealth.bulk_desc')}
                            </p>
                            <div className="grid md:grid-cols-2 gap-8 relative z-10">
                                <div className="p-8 bg-black/60 rounded-[2.5rem] border border-emerald-500/20 shadow-inner group/stat">
                                    <h4 className="text-emerald-500 text-[10px] font-black uppercase mb-4 tracking-[0.2em] italic">Standard Operational Physics</h4>
                                    <p className="text-sm text-slate-300 font-black uppercase italic" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.norm_oil') }} />
                                </div>
                                <div className="p-8 bg-black/60 rounded-[2.5rem] border border-red-500/20 shadow-inner group/stat">
                                    <h4 className="text-red-500 text-[10px] font-black uppercase mb-4 tracking-[0.2em] italic">De-aerated Hazard Logic</h4>
                                    <p className="text-sm text-red-200 font-black uppercase italic" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.aer_oil') }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* 4. Diagnostic Mapping HUB */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Foaming Diagnostic */}
                    <section className="bg-amber-950/20 border-l-[12px] border-amber-600 p-12 rounded-r-[3rem] border border-amber-900/20 relative group overflow-hidden">
                        <h3 className="text-amber-500 font-extrabold text-2xl uppercase tracking-tighter mb-4 italic">{t('francis.oilHealth.foam_diag')}</h3>
                        <p className="text-sm text-slate-300 font-bold mb-8 italic uppercase tracking-tighter border-l-2 border-amber-500/30 pl-4" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.foam_symp') }} />

                        <div className="space-y-6">
                            {[
                                { k: 'water_contam', d: 'water_desc', t: 'water_test' },
                                { k: 'det_contam', d: 'det_desc', t: 'det_act' }
                            ].map((cause, idx) => (
                                <div key={idx} className="p-8 bg-black/60 rounded-[2.5rem] border border-white/5 hover:border-amber-500/30 transition-all group/cause">
                                    <h4 className="text-amber-400 text-xs font-black uppercase mb-2 italic tracking-widest">{t(`francis.oilHealth.${cause.k}`)}</h4>
                                    <p className="text-sm text-slate-200 font-black italic mb-4 uppercase tracking-tighter">{t(`francis.oilHealth.${cause.d}`)}</p>
                                    <div className="text-[10px] text-emerald-400 bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/30 uppercase font-black italic">
                                        Action: {t(`francis.oilHealth.${cause.t}`)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Aeration Diagnostic */}
                    <section className="bg-red-950/10 border-l-[12px] border-red-600 p-12 rounded-r-[3rem] border border-red-900/20 relative group overflow-hidden">
                        <h3 className="text-red-500 font-extrabold text-2xl uppercase tracking-tighter mb-4 italic">{t('francis.oilHealth.aer_diag')}</h3>
                        <p className="text-sm text-slate-300 font-bold mb-8 italic uppercase tracking-tighter border-l-2 border-red-500/30 pl-4" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.aer_symp') }} />

                        <div className="space-y-6">
                            {[
                                { k: 'low_oil', d: 'low_oil_desc', t: 'low_oil_check' },
                                { k: 'suct_leak', d: 'suct_leak_desc', t: 'suct_leak_test' }
                            ].map((cause, idx) => (
                                <div key={idx} className="p-8 bg-black/60 rounded-[2.5rem] border border-white/5 hover:border-red-500/30 transition-all group/cause">
                                    <h4 className="text-red-400 text-xs font-black uppercase mb-2 italic tracking-widest">{t(`francis.oilHealth.${cause.k}`)}</h4>
                                    <p className="text-sm text-slate-200 font-black italic mb-4 uppercase tracking-tighter">{t(`francis.oilHealth.${cause.d}`)}</p>
                                    <div className="text-[10px] text-amber-500 bg-amber-950/20 p-3 rounded-xl border border-amber-900/30 uppercase font-black italic">
                                        Action: {t(`francis.oilHealth.${cause.t}`)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* 5. Visual Intelligence Matrix */}
                <GlassCard title={t('francis.oilHealth.vis_diag_title')} icon={<Search className="text-amber-500" />}>
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h4 className="text-emerald-500 font-black uppercase text-xs tracking-widest italic flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> {t('francis.oilHealth.norm_oil_st')}
                            </h4>
                            <div className="space-y-3">
                                {[1, 2, 3].map(n => (
                                    <div key={n} className="p-6 bg-black/40 rounded-[2rem] border border-emerald-500/20 flex gap-6 items-center italic">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                                        <span className="text-xs text-slate-300 font-black uppercase tracking-tight" dangerouslySetInnerHTML={{ __html: t(`francis.oilHealth.norm_${n}`) }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-red-500 font-black uppercase text-xs tracking-widest italic flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> {t('francis.oilHealth.abn_cond')}
                            </h4>
                            <div className="space-y-2">
                                {[
                                    { k: 'milky', d: 'aer_diag_tab', a: 'aer_act', color: 'text-white bg-slate-800' },
                                    { k: 'large_bub', d: 'foam_diag_tab', a: 'foam_act', color: 'text-amber-400 bg-amber-950/30' },
                                    { k: 'dark', d: 'oxid_diag', a: 'oxid_act', color: 'text-slate-500 bg-black/80' },
                                    { k: 'metal', d: 'wear_diag', a: 'wear_act', color: 'text-slate-200 bg-slate-700' },
                                    { k: 'water_drop', d: 'free_water', a: 'water_act', color: 'text-blue-400 bg-blue-950/30' }
                                ].map((row, i) => (
                                    <div key={i} className="flex flex-col md:flex-row gap-4 p-4 bg-black/40 rounded-2xl border border-white/5 items-center group/item hover:border-red-500/30 transition-all font-black uppercase text-[10px]">
                                        <div className={`px-4 py-2 rounded-xl w-full md:w-32 text-center shadow-lg italic ${row.color}`} dangerouslySetInnerHTML={{ __html: t(`francis.oilHealth.${row.k}`) }} />
                                        <div className="text-slate-500 flex-1 text-center italic">{t(`francis.oilHealth.${row.d}`)}</div>
                                        <div className="text-amber-500 w-full md:w-32 text-center group-hover:scale-110 transition-transform italic">{t(`francis.oilHealth.${row.a}`)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* 6. Maintenance & Leak Audit */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <section className="bg-slate-900/60 p-12 rounded-[4rem] border border-white/5 relative overflow-hidden group">
                        <h3 className="text-2xl font-black text-amber-500 mb-4 uppercase italic tracking-tighter">{t('francis.oilHealth.leak_det_title')}</h3>
                        <p className="text-sm text-slate-500 font-black italic mb-10 tracking-widest uppercase" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.leak_purpose') }} />

                        <div className="space-y-8">
                            {[
                                { id: 1, k: 'isol_sys', d: 'isol_desc' },
                                { id: 2, k: 'dry_test', bullets: [1, 2, 3] },
                                { id: 3, k: 'leak_class', sub: ['pilot_leak', 'main_leak'] }
                            ].map((step) => (
                                <div key={step.id} className="flex gap-8 items-start group/step">
                                    <div className="w-14 h-14 rounded-[1.5rem] bg-amber-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-amber-900/20 group-hover/step:scale-110 transition-transform">0{step.id}</div>
                                    <div className="flex-1">
                                        <strong className="block text-white text-base uppercase tracking-tighter mb-2 italic" dangerouslySetInnerHTML={{ __html: t(`francis.oilHealth.${step.k}`) }} />
                                        {step.d && <p className="text-sm text-slate-400 font-bold uppercase tracking-tight italic">{t(`francis.oilHealth.${step.d}`)}</p>}
                                        {step.bullets && (
                                            <ul className="space-y-2 mt-4">
                                                {step.bullets.map(b => (
                                                    <li key={b} className="flex gap-4 text-xs font-black text-slate-500 uppercase italic tracking-tight">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
                                                        {t(`francis.oilHealth.dry_${b}`)}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {step.sub && (
                                            <div className="grid grid-cols-2 gap-4 mt-6">
                                                {step.sub.map(s => (
                                                    <div key={s} className="p-6 bg-black/60 rounded-[2rem] border border-white/5 text-xs text-slate-400 font-bold uppercase tracking-tight bg-gradient-to-br from-amber-500/5 to-transparent italic" dangerouslySetInnerHTML={{ __html: t(`francis.oilHealth.${s}`) }} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="flex flex-col justify-between">
                        <div className="p-12 bg-black/40 rounded-[4rem] border border-white/5 shadow-inner">
                            <h3 className="text-xl font-black text-slate-400 mb-8 uppercase tracking-[0.3em] text-center italic">{t('francis.oilHealth.maint_sched')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                {['daily', 'weekly', 'mth', 'quart', 'yr'].map((p) => (
                                    <div key={p} className="p-6 bg-slate-900/60 rounded-[2rem] border border-white/5 hover:border-amber-500/30 transition-all flex justify-between items-center group/p">
                                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] group-hover/p:text-amber-500 transition-colors uppercase italic">{p} Frequency Audit</span>
                                        <div className="text-xs text-white font-black uppercase tracking-tight italic" dangerouslySetInnerHTML={{ __html: t(`francis.oilHealth.${p}_chk`) }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-12 text-center">
                            <button
                                onClick={() => navigate(FRANCIS_PATHS.HUB)}
                                className="flex items-center gap-3 px-10 py-4 bg-amber-600 text-white text-xs font-black uppercase tracking-[0.3em] rounded-full shadow-[0_0_50px_rgba(217,119,6,0.2)] hover:scale-105 transition-all mx-auto italic"
                            >
                                <ArrowLeft className="w-4 h-4" /> {t('francis.oilHealth.back_btn')}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OilHealth;
