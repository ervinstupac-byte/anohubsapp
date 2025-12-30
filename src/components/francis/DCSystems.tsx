import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, BatteryCharging, AlertTriangle } from 'lucide-react';

export const DCSystems: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Simulate Battery voltages
    const [voltages, setVoltages] = useState([2.25, 2.24, 2.25, 2.18, 2.26, 2.25]);

    useEffect(() => {
        const interval = setInterval(() => {
            setVoltages(prev => prev.map(v => Number((v + (Math.random() * 0.02 - 0.01)).toFixed(2))));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#020617] text-[#cbd5e1] font-mono pb-12 overflow-x-hidden">
            {/* Header */}
            <header className="bg-gradient-to-br from-[#7f1d1d] to-[#0c0a09] border-b-2 border-red-500 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-600 rounded-lg border border-red-400/30">
                            <BatteryCharging className="text-white w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-red-900/30 text-red-400 text-[10px] font-bold border border-red-900 uppercase">SOP-ELEC-005</span>
                                <span className="text-[10px] text-stone-500 uppercase font-bold">REV 3.1</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">
                                {t('francis.dcSystems.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/francis-hub')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:border-slate-500 transition group"
                    >
                        <ArrowLeft className="w-3 h-3 text-red-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.dcSystems.return')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 gap-8">

                    {/* 1. 110V DC Bank */}
                    <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border-l-4 border-l-red-600 border border-red-500/20">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                                <Zap className="w-5 h-5 text-red-500" /> {t('francis.dcSystems.s1Title')}
                            </h2>
                            <div className="flex gap-3">
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-slate-500 uppercase font-black">{t('francis.dcSystems.vBus')}</span>
                                    <span className="text-xs font-black text-green-500 uppercase tracking-widest">122.4 VDC</span>
                                </div>
                                <div className="h-8 w-px bg-slate-800"></div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-slate-500 uppercase font-black">{t('francis.dcSystems.curr')}</span>
                                    <span className="text-xs font-black text-amber-500 uppercase tracking-widest">14.2 A</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-black/40 border border-slate-800 rounded-2xl mb-8">
                            <h3 className="text-slate-100 text-[10px] font-black uppercase mb-4 tracking-widest border-b border-slate-800 pb-2 flex justify-between items-center">
                                <span>{t('francis.dcSystems.batStat')}</span>
                                <div className="w-24 h-1 bg-slate-800 rounded overflow-hidden">
                                    <div className="h-full bg-red-500 animate-[charge_2s_infinite_ease-in-out]"></div>
                                </div>
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                {voltages.map((v, i) => (
                                    <div key={i} className={`p-3 rounded-lg border text-center ${v < 2.20 ? 'bg-amber-900/20 border-amber-500/40 text-amber-500' : 'bg-slate-900/80 border-slate-800 text-green-500'}`}>
                                        <div className="text-[8px] opacity-70 mb-1">C0{i + 1}</div>
                                        <div className="text-xs font-black">{v}V</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-red-950/20 border border-red-800/30 rounded-xl flex gap-4 items-center">
                            <AlertTriangle className="text-red-500 w-6 h-6 flex-shrink-0" />
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                {t('francis.dcSystems.critDc')}
                            </p>
                        </div>
                    </section>

                    {/* 2. 24V DC Logic */}
                    <section className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border-l-4 border-l-slate-700 border border-slate-700/50">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8">
                            {t('francis.dcSystems.s2Title')}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h4 className="text-slate-500 text-[10px] font-black uppercase mb-4 tracking-widest flex items-center gap-2">
                                    <span>{t('francis.dcSystems.upsRedund')}</span>
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-slate-900 border border-slate-800 rounded-lg">
                                        <span className="text-xs text-slate-400">{t('francis.dcSystems.psu1')}</span>
                                        <span className="text-[10px] font-black text-green-500 uppercase">ONLINE</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-slate-900 border border-slate-800 rounded-lg">
                                        <span className="text-xs text-slate-400">{t('francis.dcSystems.psu2')}</span>
                                        <span className="text-[10px] font-black text-slate-500 uppercase">STANDBY</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-slate-500 text-[10px] font-black uppercase mb-4 tracking-widest flex items-center gap-2">
                                    <span>{t('francis.dcSystems.distFault')}</span>
                                </h4>
                                <div className="p-5 bg-black/40 border border-slate-800 rounded-2xl h-full flex flex-col justify-center">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] text-slate-500 font-bold uppercase">{t('francis.dcSystems.earthFault')}</span>
                                        <span className="text-xs text-green-500 font-black">CLEAR</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded"></div>
                                    <p className="text-[9px] text-slate-500 mt-4 leading-relaxed">
                                        {t('francis.dcSystems.efDesc')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
};
