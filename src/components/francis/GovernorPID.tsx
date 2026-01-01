import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Settings, ArrowLeft, AlertTriangle, Activity, Zap, ShieldAlert, Cpu, CheckCircle2, AlertOctagon } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';

export const GovernorPID: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f4f7f6] text-[#333] font-sans pb-12">
            {/* Header */}
            <header className="bg-white border-b-4 border-blue-900 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 shadow-md">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-black text-blue-900 tracking-tight uppercase flex items-center justify-center md:justify-start gap-3">
                            <Settings className="w-8 h-8 text-orange-500" />
                            {t('francis.governorPID.title')}
                        </h1>
                        <p className="text-blue-500 font-bold mt-1 uppercase text-xs tracking-wider">
                            {t('francis.governorPID.subtitle')}
                        </p>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white border-2 border-blue-500 text-blue-600 rounded-full font-bold hover:bg-blue-50 hover:shadow-lg transition group uppercase text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.governorPID.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-8 space-y-8">

                {/* Safety Module */}
                <div className="bg-red-50 border-l-8 border-red-500 p-6 rounded-r-xl shadow-sm">
                    <h3 className="text-red-700 font-bold text-lg uppercase flex items-center gap-2 mb-4">
                        <AlertOctagon className="w-6 h-6" />
                        {t('francis.governorPID.safetyTitle')}
                    </h3>
                    <p className="font-black text-red-600 mb-4 tracking-widest text-sm border-b border-red-200 pb-2">
                        {t('francis.governorPID.stop')}
                    </p>
                    <ul className="grid md:grid-cols-2 gap-4 text-sm">
                        {[
                            { title: 'sync', desc: 'syncDesc' },
                            { title: 'loadStab', desc: 'loadDesc' },
                            { title: 'estop', desc: 'estopDesc' },
                            { title: 'comm', desc: 'commDesc' }
                        ].map((item, idx) => (
                            <li key={idx} className="flex gap-2">
                                <span className="text-red-500">•</span>
                                <span>
                                    <strong className="text-red-800">{t(`francis.governorPID.${item.title}`)}</strong>{' '}
                                    <span className="text-red-700/80">{t(`francis.governorPID.${item.desc}`)}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* PID Basics */}
                <section>
                    <div className="bg-gradient-to-r from-blue-900 to-blue-600 text-white p-4 rounded-t-xl font-bold text-lg flex items-center gap-3">
                        <Cpu className="w-5 h-5" />
                        {t('francis.governorPID.basicsTitle')}
                    </div>
                    <div className="bg-white border border-blue-100 p-6 rounded-b-xl shadow-sm space-y-6">
                        <p className="text-slate-600 leading-relaxed italic border-l-4 border-blue-200 pl-4 py-2 bg-blue-50/50">
                            {t('francis.governorPID.govDesc')}
                        </p>

                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center shadow-inner">
                            <h4 className="text-orange-600 font-black uppercase text-sm mb-4 tracking-widest">{t('francis.governorPID.loopTitle')}</h4>
                            <div className="font-mono text-sm md:text-base space-y-2 text-slate-700">
                                <div className="p-2 bg-white rounded border border-orange-100 inline-block px-4">
                                    {t('francis.governorPID.errEq')}
                                </div>
                                <div className="text-orange-400 font-bold">⬇</div>
                                <div className="p-2 bg-white rounded border border-orange-100 inline-block px-4 font-bold text-blue-900">
                                    {t('francis.governorPID.outEq')}
                                </div>
                            </div>
                        </div>

                        {/* PID Cards */}
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { id: 'prop', bg: 'bg-blue-50', border: 'border-blue-200', icon: Activity, metric: 'gain' },
                                { id: 'int', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: Settings, metric: 'seconds' },
                                { id: 'diff', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: Zap, metric: 'seconds' }
                            ].map((ctrl) => (
                                <div key={ctrl.id} className={`${ctrl.bg} border-t-4 ${ctrl.border} p-5 shadow-sm hover:shadow-md transition`}>
                                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase text-sm">
                                        <ctrl.icon className="w-4 h-4 opacity-50" />
                                        {t(`francis.governorPID.${ctrl.id}Title`)}
                                    </h4>
                                    <div className="text-xs space-y-3 text-slate-600">
                                        <p>
                                            <strong>{t('francis.governorPID.whatDoes')}</strong> {t(`francis.governorPID.${ctrl.id}Desc`)}
                                        </p>
                                        <div className="bg-white p-2 rounded border border-slate-100/50">
                                            <p className="mb-1"><strong className="text-slate-900">High:</strong> {t(`francis.governorPID.high${ctrl.id.charAt(0).toUpperCase()}Desc`)}</p>
                                            <p><strong className="text-slate-900">Low:</strong> {t(`francis.governorPID.low${ctrl.id.charAt(0).toUpperCase()}Desc`)}</p>
                                        </div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                            {t('francis.governorPID.typRange')} <span className="text-slate-800">{t(`francis.governorPID.${ctrl.id}Range`)}</span>
                                        </p>
                                        <div className="pt-3 border-t border-slate-200 italic text-slate-500">
                                            <span className="text-yellow-500 not-italic">💡</span> {t(`francis.governorPID.${ctrl.id}Analogy`)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Deadband & Stability */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Dead Band */}
                    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-100 p-4 font-bold text-slate-700 border-b border-slate-200">
                            {t('francis.governorPID.deadbandTitle')}
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-600 mb-6">
                                <strong>{t('francis.governorPID.dbDef')}</strong> {t('francis.governorPID.dbDesc')}
                            </p>
                            <table className="w-full text-xs text-left mb-6">
                                <thead className="bg-slate-50 text-slate-500 uppercase font-bold">
                                    <tr>
                                        <th className="p-2">{t('francis.governorPID.param')}</th>
                                        <th className="p-2">{t('francis.governorPID.typVal')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr>
                                        <td className="p-2 font-bold text-blue-900">{t('francis.governorPID.dbParam')}</td>
                                        <td className="p-2 font-mono">±0.05 - 0.15 RPM</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-xs text-yellow-800">
                                <strong>{t('francis.governorPID.techNote')}</strong> {t('francis.governorPID.techNoteDesc')}
                            </div>
                        </div>
                    </section>

                    {/* Step Response */}
                    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-100 p-4 font-bold text-slate-700 border-b border-slate-200">
                            {t('francis.governorPID.stepRespTitle')}
                        </div>
                        <div className="p-6">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-blue-900 text-white uppercase font-bold">
                                    <tr>
                                        <th className="p-3">{t('francis.governorPID.metric')}</th>
                                        <th className="p-3 bg-blue-800">{t('francis.governorPID.targetVal')}</th>
                                        <th className="p-3">{t('francis.governorPID.interp')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[
                                        { id: 'overshoot', val: '< 5%', desc: 'overshootDesc' },
                                        { id: 'settleTime', val: '< 10s', desc: 'settleDesc' },
                                        { id: 'oscillations', val: '< 2', desc: 'oscDesc' }
                                    ].map((row, idx) => (
                                        <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                                            <td className="p-3 font-bold text-slate-700">{t(`francis.governorPID.${row.id}`)}</td>
                                            <td className="p-3 font-mono text-emerald-600 font-bold bg-slate-100">{row.val}</td>
                                            <td className="p-3 text-slate-500">{t(`francis.governorPID.${row.desc}`)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* Anti-Hunting */}
                <section className="bg-white border-l-4 border-orange-500 rounded-r-xl shadow-sm p-8">
                    <h3 className="text-orange-600 font-bold text-xl uppercase mb-6 flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6" />
                        {t('francis.governorPID.antiHuntTitle')}
                    </h3>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider border-b pb-2">
                                {t('francis.governorPID.rootCauses')}
                            </h4>
                            <ul className="space-y-4 text-sm">
                                {[1, 2, 3, 4].map((num) => (
                                    <li key={num} className="bg-slate-50 p-3 rounded border border-slate-100">
                                        <strong className="block text-slate-900 mb-1">{t(`francis.governorPID.cause${num}`)}</strong>
                                        <div className="text-slate-500 text-xs pl-2 border-l-2 border-orange-200">
                                            <strong>Sol:</strong> {t(`francis.governorPID.${num === 1 ? 'mechSol' : num === 2 ? 'solI' : num === 3 ? 'solD' : 'solDb'}`)}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider border-b pb-2">
                                {t('francis.governorPID.tuningFlow')}
                            </h4>
                            <div className="relative border-l-2 border-blue-200 ml-3 space-y-6 pb-2">
                                {[
                                    { title: 'startConservative', detail: 'consVals', color: 'bg-blue-500' },
                                    { title: 'perfTest', detail: 'applyLoad', color: 'bg-blue-500' },
                                    { title: 'adjP', detail: 'pLogic', color: 'bg-indigo-500' },
                                    { title: 'adjI', detail: 'iLogic', color: 'bg-indigo-500' },
                                    { title: 'adjD', detail: 'dLogic', color: 'bg-indigo-500' },
                                    { title: 'doc', detail: 'recordFinal', color: 'bg-emerald-500' }
                                ].map((step, idx) => (
                                    <div key={idx} className="pl-6 relative">
                                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full ${step.color} border-4 border-white shadow-sm`}></div>
                                        <h5 className="font-bold text-slate-800 text-xs uppercase">{t(`francis.governorPID.${step.title}`)}</h5>
                                        <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                                            {t(`francis.governorPID.${step.detail}`)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Checklist */}
                <div className="bg-slate-900 text-slate-400 p-6 rounded-xl flex flex-wrap gap-8 items-center justify-center text-xs">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="uppercase font-bold text-white">{t('francis.governorPID.checklist')}:</span>
                    </div>
                    {['software', 'monitor', 'docs', 'mechTools', 'safety'].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <span>{t(`francis.governorPID.${item}`)}</span>
                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
};
