import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplets, Activity, AlertTriangle, Waves, Power, Settings, ShieldCheck } from 'lucide-react';

const DrainagePumps: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [waterLevel, setWaterLevel] = useState(35); // Initial simulation level

    // Simulation logic involves just some visual effects or state if needed, 
    // but for now we focus on the static/interactive presentation of the SOP.

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">

                {/* Header */}
                <header className="border-b-4 border-blue-600 pb-6 bg-gradient-to-r from-slate-900 to-slate-900/50 p-6 rounded-lg shadow-lg shadow-blue-900/10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-600/10 rounded-full">
                            <Waves className="w-10 h-10 text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-blue-500 uppercase glitch-text">
                                {t('francis.drainagePumps.title')}
                            </h1>
                            <div className="flex gap-2 mt-2">
                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs font-bold rounded tracking-wider border border-blue-500/30">SUMP: {waterLevel}%</span>
                                <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs font-bold rounded tracking-wider border border-green-500/30">OWS: ACTIVE</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid lg:grid-cols-2 gap-8">

                    {/* Pump Logic */}
                    <section className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                        <h3 className="text-2xl font-bold text-blue-100 mb-6 flex items-center gap-3">
                            <Activity className="w-6 h-6 text-blue-400" />
                            {t('francis.drainagePumps.s1Title')}
                        </h3>

                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((level) => (
                                <div key={level} className={`p-4 rounded border flex justify-between items-center transition-all ${waterLevel > (level === 1 ? 0 : level === 2 ? 40 : level === 3 ? 70 : 90)
                                        ? 'bg-blue-900/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                        : 'bg-slate-950 border-slate-800 opacity-60'
                                    }`}>
                                    <div className="font-bold text-slate-300 text-sm">{t(`francis.drainagePumps.l${level}T`)}</div>
                                    <div className={`font-mono font-black text-sm ${level === 4 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                                        {t(`francis.drainagePumps.l${level}D`)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 bg-slate-950 p-4 rounded border border-slate-800 flex items-start gap-3">
                            <Settings className="w-5 h-5 text-slate-500 mt-1" />
                            <div>
                                <strong className="block text-slate-300 text-sm mb-1">{t('francis.drainagePumps.dutyTitle')}</strong>
                                <p className="text-xs text-slate-500 leading-relaxed">{t('francis.drainagePumps.dutyDesc')}</p>
                            </div>
                        </div>
                    </section>

                    {/* Maintenance & Warning */}
                    <div className="space-y-8">
                        <section className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                            <h3 className="text-2xl font-bold text-blue-100 mb-6 flex items-center gap-3">
                                <ShieldCheck className="w-6 h-6 text-green-400" />
                                {t('francis.drainagePumps.s2Title')}
                            </h3>

                            <div className="space-y-4">
                                <div className="group p-4 bg-slate-950 rounded border border-slate-800 hover:border-green-500/30 transition-colors">
                                    <h4 className="text-green-400 font-bold text-sm uppercase mb-2">{t('francis.drainagePumps.m1T')}</h4>
                                    <p className="text-slate-400 text-xs">{t('francis.drainagePumps.m1D')}</p>
                                </div>
                                <div className="group p-4 bg-slate-950 rounded border border-slate-800 hover:border-green-500/30 transition-colors">
                                    <h4 className="text-green-400 font-bold text-sm uppercase mb-2">{t('francis.drainagePumps.m2T')}</h4>
                                    <p className="text-slate-400 text-xs">{t('francis.drainagePumps.m2D')}</p>
                                </div>
                                <div className="group p-4 bg-slate-950 rounded border border-slate-800 hover:border-green-500/30 transition-colors">
                                    <h4 className="text-green-400 font-bold text-sm uppercase mb-2">{t('francis.drainagePumps.m3T')}</h4>
                                    <p className="text-slate-400 text-xs">{t('francis.drainagePumps.m3D')}</p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-amber-950/20 rounded-lg p-6 border border-amber-500/30">
                            <div className="flex items-center gap-3 mb-4 text-amber-500">
                                <AlertTriangle className="w-6 h-6" />
                                <h3 className="text-lg font-bold uppercase">{t('francis.drainagePumps.s3Title')}</h3>
                            </div>
                            <p className="text-amber-100/80 text-sm mb-4 leading-relaxed">
                                {t('francis.drainagePumps.s3Desc')}
                            </p>
                            <div className="bg-amber-900/30 p-2 rounded text-center border border-amber-500/20 text-amber-400 font-bold text-xs tracking-widest">
                                {t('francis.drainagePumps.owsSt')}
                            </div>
                        </section>
                    </div>

                </div>

                <div className="mt-8 pt-8 border-t border-slate-800 flex justify-between items-center">
                    <button
                        onClick={() => navigate('/francis')}
                        className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        {t('francis.drainagePumps.return')}
                    </button>

                    {/* Interactive Simulator Controls (Hidden feature for demo) */}
                    <div className="hidden md:flex items-center gap-4 bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Simulator:</span>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={waterLevel}
                            onChange={(e) => setWaterLevel(parseInt(e.target.value))}
                            className="w-32 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <span className="text-xs font-mono text-blue-400 w-8">{waterLevel}%</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DrainagePumps;
