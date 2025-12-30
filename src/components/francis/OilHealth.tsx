import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Droplets, Activity, Search, Thermometer, ShieldAlert } from 'lucide-react';

const OilHealth: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30">
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">

                {/* Header */}
                <header className="border-b-4 border-amber-500 pb-6 bg-gradient-to-r from-slate-900 to-slate-900/50 p-6 rounded-lg shadow-lg shadow-amber-900/10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-amber-500/10 rounded-full">
                            <Droplets className="w-10 h-10 text-amber-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-amber-500 uppercase glitch-text">
                                {t('francis.oilHealth.title')}
                            </h1>
                            <h2 className="text-xl text-amber-200/80 font-light mt-1 border-l-2 border-amber-500/30 pl-3">
                                {t('francis.oilHealth.subtitle')}
                            </h2>
                        </div>
                    </div>
                    <p className="text-slate-400 max-w-3xl ml-16 leading-relaxed">
                        {t('francis.oilHealth.hdr_desc')}
                    </p>
                </header>

                {/* Safety Protocol */}
                <section className="bg-red-500/10 border-l-8 border-red-500 p-6 rounded-r-lg shadow-md animate-pulse-slow">
                    <div className="flex items-center gap-3 mb-4 text-red-500">
                        <AlertTriangle className="w-8 h-8" />
                        <h3 className="text-2xl font-bold uppercase">{t('francis.oilHealth.safety_title')}</h3>
                    </div>
                    <strong className="block text-red-400 text-lg mb-4 tracking-wide">{t('francis.oilHealth.stop_msg')}</strong>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3 bg-red-950/30 p-3 rounded border border-red-500/20">
                            <ShieldAlert className="w-5 h-5 text-red-400 mt-1 shrink-0" />
                            <span dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.safety_1') }} />
                        </li>
                        <li className="flex items-start gap-3 bg-red-950/30 p-3 rounded border border-red-500/20">
                            <Thermometer className="w-5 h-5 text-red-400 mt-1 shrink-0" />
                            <span dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.safety_2') }} />
                        </li>
                        <li className="flex items-start gap-3 bg-red-950/30 p-3 rounded border border-red-500/20">
                            <AlertTriangle className="w-5 h-5 text-red-400 mt-1 shrink-0" />
                            <span dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.safety_3') }} />
                        </li>
                    </ul>
                </section>

                {/* Foaming vs Aeration */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-amber-500/30 pb-2">
                        <Activity className="w-6 h-6 text-amber-400" />
                        <h3 className="text-2xl font-bold text-amber-100">{t('francis.oilHealth.foaming_title')}</h3>
                    </div>

                    <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
                        <h4 className="text-xl font-semibold text-amber-300 mb-2">{t('francis.oilHealth.foam_vs_air')}</h4>
                        <p className="text-slate-400 mb-6 italic">{t('francis.oilHealth.diff_states')}</p>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-amber-900/40 text-amber-100">
                                        <th className="p-4 border border-amber-500/20">{t('francis.oilHealth.char')}</th>
                                        <th className="p-4 border border-amber-500/20 text-amber-300">{t('francis.oilHealth.surf_foam')}</th>
                                        <th className="p-4 border border-amber-500/20 text-red-300">{t('francis.oilHealth.ent_air')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    <tr className="border-b border-slate-800 hover:bg-slate-800/50">
                                        <td className="p-4 border-r border-slate-800 font-medium text-slate-300" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.appear') }} />
                                        <td className="p-4 border-r border-slate-800" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.large_bubbles') }} />
                                        <td className="p-4 bg-red-900/10" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.milky_oil') }} />
                                    </tr>
                                    <tr className="border-b border-slate-800 hover:bg-slate-800/50">
                                        <td className="p-4 border-r border-slate-800 font-medium text-slate-300" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.location') }} />
                                        <td className="p-4 border-r border-slate-800">{t('francis.oilHealth.surf_only')}</td>
                                        <td className="p-4 bg-red-900/10">{t('francis.oilHealth.distrib')}</td>
                                    </tr>
                                    <tr className="border-b border-slate-800 hover:bg-slate-800/50">
                                        <td className="p-4 border-r border-slate-800 font-medium text-slate-300" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.prim_cause') }} />
                                        <td className="p-4 border-r border-slate-800" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.contam') }} />
                                        <td className="p-4 bg-red-900/10" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.low_lvl') }} />
                                    </tr>
                                    <tr className="border-b border-slate-800 hover:bg-slate-800/50">
                                        <td className="p-4 border-r border-slate-800 font-medium text-slate-300" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.sys_eff') }} />
                                        <td className="p-4 border-r border-slate-800" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.lvl_fluct') }} />
                                        <td className="p-4 bg-red-900/10" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.bulk_mod_eff') }} />
                                    </tr>
                                    <tr className="hover:bg-slate-800/50">
                                        <td className="p-4 border-r border-slate-800 font-medium text-slate-300" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.sever') }} />
                                        <td className="p-4 border-r border-slate-800 text-amber-400">{t('francis.oilHealth.mod')}</td>
                                        <td className="p-4 bg-red-900/10 text-red-500 font-bold" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.crit') }} />
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Bulk Modulus */}
                <section className="bg-amber-500/5 p-6 rounded-lg border border-amber-500/20">
                    <h3 className="text-xl font-bold text-amber-200 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        {t('francis.oilHealth.bulk_mod_title')}
                    </h3>
                    <p className="text-slate-300 mb-4 leading-relaxed">
                        <strong className="text-amber-400">{t('francis.oilHealth.what_is_bulk')}</strong>{' '}
                        {t('francis.oilHealth.bulk_desc')}
                    </p>

                    <div className="bg-slate-900 p-4 rounded border border-slate-700">
                        <strong className="block text-slate-200 mb-2">{t('francis.oilHealth.gov_impact')}</strong>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-green-400/90 text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.norm_oil') }} />
                            </li>
                            <li className="flex items-center gap-2 text-red-400/90 text-sm">
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                <span dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.aer_oil') }} />
                            </li>
                        </ul>
                    </div>

                    <div className="mt-4 flex items-start gap-3 bg-amber-900/20 p-4 rounded border border-amber-500/30">
                        <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                        <p className="text-amber-100 text-sm">
                            <strong className="text-amber-400 block mb-1">{t('francis.oilHealth.crit_eff')}</strong>
                            {t('francis.oilHealth.crit_eff_desc')}
                        </p>
                    </div>
                </section>

                {/* Symptom Mapping */}
                <section>
                    <div className="section-title text-2xl font-bold text-amber-100 mb-6 pb-2 border-b border-slate-700">
                        {t('francis.oilHealth.map_title')}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Foaming Diagnostic */}
                        <div className="bg-slate-900 p-5 rounded-lg border-l-4 border-amber-500 shadow-md">
                            <h3 className="text-xl font-bold text-amber-400 mb-2">{t('francis.oilHealth.foam_diag')}</h3>
                            <p className="text-slate-400 text-sm mb-4" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.foam_symp') }} />

                            <h4 className="text-amber-200 font-semibold mb-2 text-sm uppercase tracking-wider">{t('francis.oilHealth.main_causes')}</h4>
                            <ul className="space-y-4 text-sm">
                                <li className="bg-slate-950 p-3 rounded border border-slate-800">
                                    <strong className="block text-amber-300">{t('francis.oilHealth.water_contam')}</strong>
                                    <span className="text-slate-400 block mb-1">{t('francis.oilHealth.water_desc')}</span>
                                    <em className="text-xs text-slate-500 block border-t border-slate-800 pt-1 mt-1">{t('francis.oilHealth.water_test')}</em>
                                </li>
                                <li className="bg-slate-950 p-3 rounded border border-slate-800">
                                    <strong className="block text-amber-300">{t('francis.oilHealth.det_contam')}</strong>
                                    <span className="text-slate-400 block mb-1">{t('francis.oilHealth.det_desc')}</span>
                                    <em className="text-xs text-green-400/70 block border-t border-slate-800 pt-1 mt-1">{t('francis.oilHealth.det_act')}</em>
                                </li>
                            </ul>

                            <div className="mt-4 bg-amber-950/30 p-3 rounded border border-amber-500/20">
                                <h5 className="text-amber-500 font-bold text-xs uppercase mb-2">{t('francis.oilHealth.diag_proc')}</h5>
                                <ol className="list-decimal pl-4 space-y-1 text-xs text-amber-100/80">
                                    <li>{t('francis.oilHealth.proc_1')}</li>
                                    <li>{t('francis.oilHealth.proc_2')}</li>
                                </ol>
                            </div>
                        </div>

                        {/* Aeration Diagnostic */}
                        <div className="bg-slate-900 p-5 rounded-lg border-l-4 border-red-500 shadow-md">
                            <h3 className="text-xl font-bold text-red-400 mb-2">{t('francis.oilHealth.aer_diag')}</h3>
                            <p className="text-slate-400 text-sm mb-4" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.aer_symp') }} />

                            <h4 className="text-red-200 font-semibold mb-2 text-sm uppercase tracking-wider">{t('francis.oilHealth.aer_causes')}</h4>
                            <ul className="space-y-4 text-sm">
                                <li className="bg-slate-950 p-3 rounded border border-slate-800">
                                    <strong className="block text-red-300">{t('francis.oilHealth.low_oil')}</strong>
                                    <span className="text-slate-400 block mb-1">{t('francis.oilHealth.low_oil_desc')}</span>
                                    <em className="text-xs text-green-400/70 block border-t border-slate-800 pt-1 mt-1">{t('francis.oilHealth.low_oil_check')}</em>
                                </li>
                                <li className="bg-slate-950 p-3 rounded border border-slate-800">
                                    <strong className="block text-red-300">{t('francis.oilHealth.suct_leak')}</strong>
                                    <span className="text-slate-400 block mb-1">{t('francis.oilHealth.suct_leak_desc')}</span>
                                    <em className="text-xs text-slate-500 block border-t border-slate-800 pt-1 mt-1">{t('francis.oilHealth.suct_leak_test')}</em>
                                </li>
                            </ul>

                            <div className="mt-4 bg-red-950/30 p-3 rounded border border-red-500/20">
                                <h5 className="text-red-500 font-bold text-xs uppercase mb-2">{t('francis.oilHealth.aer_proc')}</h5>
                                <ol className="list-decimal pl-4 space-y-1 text-xs text-red-100/80">
                                    <li>{t('francis.oilHealth.aer_proc_1')}</li>
                                    <li>{t('francis.oilHealth.aer_proc_3')}</li>
                                    <li>{t('francis.oilHealth.aer_proc_4')}</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Visual Diagnostics */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-lg border border-slate-800">
                    <h3 className="text-2xl font-bold text-amber-100 mb-6 flex items-center gap-3">
                        <Search className="w-6 h-6 text-amber-400" />
                        {t('francis.oilHealth.vis_diag_title')}
                    </h3>

                    <div className="grid lg:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-green-400 font-bold mb-4 uppercase text-sm tracking-widest">{t('francis.oilHealth.norm_oil_st')}</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3 text-sm text-slate-300">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                                    <span dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.norm_1') }} />
                                </li>
                                <li className="flex gap-3 text-sm text-slate-300">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                                    <span dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.norm_2') }} />
                                </li>
                                <li className="flex gap-3 text-sm text-slate-300">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                                    <span dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.norm_3') }} />
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-red-400 font-bold mb-4 uppercase text-sm tracking-widest">{t('francis.oilHealth.abn_cond')}</h4>
                            <div className="space-y-2">
                                {[
                                    { k: 'milky', d: 'aer_diag_tab', a: 'aer_act', c: 'bg-white/10 text-white' },
                                    { k: 'large_bub', d: 'foam_diag_tab', a: 'foam_act', c: 'bg-amber-500/20 text-amber-200' },
                                    { k: 'dark', d: 'oxid_diag', a: 'oxid_act', c: 'bg-black/40 text-slate-400' },
                                    { k: 'metal', d: 'wear_diag', a: 'wear_act', c: 'bg-slate-700 text-slate-200' },
                                    { k: 'water_drop', d: 'free_water', a: 'water_act', c: 'bg-blue-500/20 text-blue-200' },
                                ].map((row, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row gap-2 sm:items-center text-xs p-2 rounded bg-slate-900 border border-slate-800">
                                        <div className={`px-2 py-1 rounded w-full sm:w-1/3 text-center font-bold ${row.c}`} dangerouslySetInnerHTML={{ __html: t(`francis.oilHealth.${row.k}`) }} />
                                        <div className="text-slate-400 w-full sm:w-1/3 text-center">{t(`francis.oilHealth.${row.d}`)}</div>
                                        <div className="text-amber-500 w-full sm:w-1/3 text-center font-mono">{t(`francis.oilHealth.${row.a}`)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Governor Drying */}
                <section className="bg-slate-900 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-bold text-amber-400 mb-2">{t('francis.oilHealth.leak_det_title')}</h3>
                    <p className="text-slate-400 italic mb-6 text-sm" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.leak_purpose') }} />

                    <div className="space-y-4">
                        <div className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-500 shrink-0">1</div>
                            <div>
                                <strong className="block text-slate-200" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.isol_sys') }} />
                                <span className="text-slate-400 text-sm">{t('francis.oilHealth.isol_desc')}</span>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-500 shrink-0">2</div>
                            <div>
                                <strong className="block text-slate-200" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.dry_test') }} />
                                <ul className="list-disc pl-4 text-sm text-slate-400 mt-1 space-y-1">
                                    <li>{t('francis.oilHealth.dry_1')}</li>
                                    <li>{t('francis.oilHealth.dry_2')}</li>
                                    <li>{t('francis.oilHealth.dry_3')}</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-500 shrink-0">3</div>
                            <div className="bg-amber-900/10 p-3 rounded w-full">
                                <strong className="block text-amber-500 mb-2" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.leak_class') }} />
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div className="bg-slate-950 p-2 rounded text-slate-300" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.pilot_leak') }} />
                                    <div className="bg-slate-950 p-2 rounded text-slate-300" dangerouslySetInnerHTML={{ __html: t('francis.oilHealth.main_leak') }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Maintenance Schedule */}
                <section className="border-t border-slate-800 pt-8">
                    <h3 className="text-lg font-bold text-slate-400 mb-4 uppercase tracking-widest">{t('francis.oilHealth.maint_sched')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                        {['daily', 'weekly', 'mth', 'quart', 'yr'].map((p) => (
                            <div key={p} className="bg-slate-900/50 p-3 rounded border border-slate-800 hover:border-amber-500/30 transition-colors">
                                <div dangerouslySetInnerHTML={{ __html: t(`francis.oilHealth.${p}_chk`) }} />
                            </div>
                        ))}
                    </div>
                </section>

                <button
                    onClick={() => navigate('/francis')}
                    className="mt-8 flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {t('francis.oilHealth.back_btn')}
                </button>
            </div>
        </div>
    );
};

export default OilHealth;
