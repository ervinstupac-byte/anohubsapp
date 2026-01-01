import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, LayoutDashboard, Megaphone, ZapOff, Hand, ChevronRight, AlertTriangle } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';

export const EmergencyProtocols: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const ProtocolCard = ({ id, color, children }: { id: string, color: string, children: React.ReactNode }) => (
        <section className={`bg-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border-l-8 ${color} border border-slate-700/50`}>
            {children}
        </section>
    );

    const ProtocolHeader = ({ id, title, colorInfo }: { id: string, title: string, colorInfo: string }) => (
        <div className="flex items-center gap-3 mb-6">
            <span className={`text-xs font-black ${colorInfo} text-white px-2 py-1 rounded`}>{id}</span>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">{title}</h2>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-mono pb-12">

            {/* Header */}
            <header className="bg-gradient-to-br from-[#7f1d1d] to-[#450a0a] border-b-2 border-red-500 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-red-600 rounded-lg animate-pulse">
                            <AlertOctagon className="text-white w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">
                                {t('francis.emergencyProtocols.title')}
                            </h1>
                            <p className="text-red-200 text-xs tracking-widest mt-1 font-bold uppercase">
                                {t('francis.emergencyProtocols.subtitle')}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        <button
                            onClick={() => navigate(FRANCIS_PATHS.HUB)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-xs font-bold text-slate-300 hover:text-white hover:border-slate-500 transition group"
                        >
                            <LayoutDashboard className="w-4 h-4 text-red-500" />
                            <span>{t('francis.emergencyProtocols.return')}</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8">

                {/* Emergency Notice */}
                <div className="bg-red-950/40 border-2 border-red-500 p-6 rounded-xl mb-12 flex gap-4 items-start animate-[pulse_2s_infinite]">
                    <Megaphone className="text-red-500 w-8 h-8 flex-shrink-0" />
                    <div>
                        <strong className="text-red-500 text-lg uppercase block mb-1">
                            {t('francis.emergencyProtocols.noticeHead')}
                        </strong>
                        <p className="text-red-100 text-sm leading-relaxed">
                            {t('francis.emergencyProtocols.noticeBody')}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-12">

                    {/* PROTOCOL 1 */}
                    <ProtocolCard id="P-01" color="border-l-red-600">
                        <ProtocolHeader id="P-01" title={t('francis.emergencyProtocols.p1.title')} colorInfo="bg-red-600" />

                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2 text-sm uppercase">
                                    <ZapOff className="w-4 h-4" /> {t('francis.emergencyProtocols.p1.scenario')}
                                </h3>
                                <p className="text-sm text-slate-400 mb-6">
                                    {t('francis.emergencyProtocols.p1.scenarioDesc')}
                                </p>

                                <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg mb-6">
                                    <h4 className="text-red-500 text-xs font-black uppercase mb-2">
                                        {t('francis.emergencyProtocols.p1.dangerHead')}
                                    </h4>
                                    <p className="text-sm text-red-100">
                                        {t('francis.emergencyProtocols.p1.dangerDesc')}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2 uppercase text-sm">
                                    {t('francis.emergencyProtocols.p1.autoResp')}
                                </h3>
                                <ol className="space-y-4 list-decimal ml-4 text-sm text-slate-300 marker:text-red-500 marker:font-bold">
                                    <li>{t('francis.emergencyProtocols.p1.auto1')}</li>
                                    <li>{t('francis.emergencyProtocols.p1.auto2')}</li>
                                    <li>{t('francis.emergencyProtocols.p1.auto3')}</li>
                                </ol>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-800">
                            <h3 className="text-amber-500 font-bold mb-4 flex items-center gap-2 uppercase text-sm">
                                <Hand className="w-5 h-5" /> {t('francis.emergencyProtocols.p1.manualHead')}
                            </h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-900 rounded border border-slate-800 text-xs text-slate-300 font-bold">
                                    {t('francis.emergencyProtocols.p1.man1')}
                                </div>
                                <div className="p-4 bg-slate-900 rounded border border-slate-800 text-xs text-slate-300">
                                    {t('francis.emergencyProtocols.p1.man2')}
                                </div>
                                <div className="p-4 bg-slate-900 rounded border border-slate-800 text-xs text-red-400 border-red-500/30 font-bold">
                                    {t('francis.emergencyProtocols.p1.man3')}
                                </div>
                            </div>
                        </div>
                    </ProtocolCard>

                    {/* PROTOCOL 2: SILT FLOOD */}
                    <ProtocolCard id="P-02" color="border-l-amber-600">
                        <ProtocolHeader id="P-02" title={t('francis.emergencyProtocols.p2.title')} colorInfo="bg-amber-600" />

                        <div className="bg-amber-900/10 border border-amber-500/20 p-6 rounded-xl mb-8">
                            <p className="text-sm text-amber-200">
                                {t('francis.emergencyProtocols.p2.desc')}
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="bg-amber-900/40 text-amber-500 uppercase font-black text-[10px] tracking-widest">
                                        <th className="p-4 border-b border-amber-500/30">{t('francis.emergencyProtocols.p2.thConc')}</th>
                                        <th className="p-4 border-b border-amber-500/30">{t('francis.emergencyProtocols.p2.thStatus')}</th>
                                        <th className="p-4 border-b border-amber-500/30">{t('francis.emergencyProtocols.p2.thAction')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-slate-800 bg-slate-900/20">
                                        <td className="p-4 font-bold">1000 - 3000 ppm</td>
                                        <td className="p-4 text-amber-400 font-bold">{t('francis.emergencyProtocols.p2.stWarn')}</td>
                                        <td className="p-4 text-slate-300">{t('francis.emergencyProtocols.p2.actWarn')}</td>
                                    </tr>
                                    <tr className="border-b border-slate-800 bg-slate-900/20">
                                        <td className="p-4 font-bold">3000 - 5000 ppm</td>
                                        <td className="p-4 text-orange-500 font-bold">{t('francis.emergencyProtocols.p2.stCrit')}</td>
                                        <td className="p-4 text-slate-300">{t('francis.emergencyProtocols.p2.actCrit')}</td>
                                    </tr>
                                    <tr className="bg-red-900/20 border-b border-red-900/50">
                                        <td className="p-4 font-bold text-red-500">{'>'} 5000 ppm</td>
                                        <td className="p-4 text-red-500 font-black animate-pulse">{t('francis.emergencyProtocols.p2.stEm')}</td>
                                        <td className="p-4 text-red-200 font-bold">{t('francis.emergencyProtocols.p2.actEm')}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </ProtocolCard>

                    {/* PROTOCOL 3: HPU LOSS */}
                    <ProtocolCard id="P-03" color="border-l-blue-600">
                        <ProtocolHeader id="P-03" title={t('francis.emergencyProtocols.p3.title')} colorInfo="bg-blue-600" />
                        <div className="grid md:grid-cols-2 gap-8">
                            {['type1', 'type2'].map((type, idx) => (
                                <div key={type} className={`bg-slate-900/50 p-6 rounded-xl border ${idx === 0 ? 'border-blue-900/30' : 'border-slate-800'}`}>
                                    <h3 className={`font-bold mb-4 uppercase text-xs tracking-tighter ${idx === 0 ? 'text-blue-400' : 'text-slate-400'}`}>
                                        {t(`francis.emergencyProtocols.p3.${type}`)}
                                    </h3>
                                    <ul className="space-y-3 text-xs text-slate-300">
                                        {[1, 2, 3].map(step => (
                                            <li key={step} className="flex items-start gap-2">
                                                <ChevronRight className={`w-4 h-4 ${idx === 0 ? 'text-blue-500' : 'text-slate-500'}`} />
                                                <span>{t(`francis.emergencyProtocols.p3.${idx === 0 ? 'a' : 'b'}${step}`)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </ProtocolCard>

                    {/* PROTOCOL 4 & 5 Compact Grid */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <ProtocolCard id="P-04" color="border-l-orange-600">
                            <ProtocolHeader id="P-04" title={t('francis.emergencyProtocols.p4.title')} colorInfo="bg-orange-600" />
                            <div className="space-y-4">
                                <div className="bg-orange-950/20 border border-orange-500/20 p-4 rounded-xl">
                                    <h3 className="text-amber-500 font-bold mb-1 uppercase text-xs">{t('francis.emergencyProtocols.p4.s1')}</h3>
                                    <p className="text-xs text-slate-400">{t('francis.emergencyProtocols.p4.s1Desc')}</p>
                                </div>
                                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                                    <h3 className="text-white font-black text-xs mb-1 uppercase text-red-400">{t('francis.emergencyProtocols.p4.s2')}</h3>
                                    <p className="text-[10px] text-slate-300">{t('francis.emergencyProtocols.p4.s2Desc')}</p>
                                </div>
                            </div>
                        </ProtocolCard>

                        <ProtocolCard id="P-05" color="border-l-purple-600">
                            <ProtocolHeader id="P-05" title={t('francis.emergencyProtocols.p5.title')} colorInfo="bg-purple-600" />
                            <div className="space-y-4">
                                <div className="bg-purple-950/10 border border-purple-500/20 p-4 rounded-xl">
                                    <h3 className="text-purple-400 font-bold mb-2 uppercase text-xs">
                                        {t('francis.emergencyProtocols.p5.seq')}
                                    </h3>
                                    <ul className="text-xs text-slate-400 space-y-1">
                                        <li>{t('francis.emergencyProtocols.p5.s1')}</li>
                                        <li>{t('francis.emergencyProtocols.p5.s2')}</li>
                                        <li>{t('francis.emergencyProtocols.p5.s3')}</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                                    <h3 className="text-red-500 font-black text-xs mb-1 uppercase">
                                        {t('francis.emergencyProtocols.p5.warnHead')}
                                    </h3>
                                    <p className="text-[10px] text-slate-300">
                                        {t('francis.emergencyProtocols.p5.warnBody')}
                                    </p>
                                </div>
                            </div>
                        </ProtocolCard>
                    </div>

                    {/* PROTOCOL 6 */}
                    <ProtocolCard id="P-06" color="border-l-cyan-600">
                        <ProtocolHeader id="P-06" title={t('francis.emergencyProtocols.p6.title')} colorInfo="bg-cyan-600" />
                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
                            <div>
                                <span className="text-[9px] text-slate-500 uppercase font-black">
                                    {t('francis.emergencyProtocols.p6.limit')}
                                </span>
                                <div className="text-3xl font-black text-red-500">
                                    98.2 Hz <span className="text-xs font-normal text-slate-500">(TRANSIENT)</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold text-amber-500 uppercase mb-1">
                                    {t('francis.emergencyProtocols.p6.resp')}
                                </div>
                                <p className="text-[9px] text-slate-500 max-w-[200px]">
                                    {t('francis.emergencyProtocols.p6.desc')}
                                </p>
                            </div>
                        </div>
                    </ProtocolCard>

                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-slate-800 text-center">
                    <p className="text-[10px] text-slate-600 font-mono tracking-widest uppercase mb-4">
                        {t('francis.emergencyProtocols.footer')}
                    </p>
                </div>
            </main>
        </div>
    );
};
