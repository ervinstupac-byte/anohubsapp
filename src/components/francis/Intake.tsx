import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Waves, AlertTriangle, Droplets } from 'lucide-react';
import { ROUTES } from '../../routes/paths';

export const Intake: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Simulation States
    const [trashBuildUp, setTrashBuildUp] = useState(10); // 0-100%

    // Calculations
    // Delta P increases exponentially with trash build up
    // Let's say max Delta P at 100% clog is 4.0 meters
    const deltaP = 0.1 + (Math.pow(trashBuildUp / 100, 2) * 3.9);

    // Efficiency drops inversely
    const flowEfficiency = 100 - (trashBuildUp * 0.4);

    const isAlarm = deltaP > 2.0;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-mono p-4 md:p-8">
            <button onClick={() => navigate(`/francis/${ROUTES.FRANCIS.HUB}`)} className="flex items-center gap-2 mb-6 hover:text-cyan-400 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>{t('actions.back', 'Back to Hub')}</span>
            </button>

            <header className="mb-8 border-b border-slate-800 pb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-cyan-900/30 rounded-lg border border-cyan-500/30">
                        <Waves className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight">{t('francis.intake.title', 'Intake Management')}</h1>
                        <p className="text-slate-500 text-xs tracking-widest">{t('francis.intake.subtitle', 'Trash Rack & Sediment')}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Trash Rack Simulation */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3 mb-6">
                        <Filter className={`w-6 h-6 ${isAlarm ? 'text-red-500' : 'text-cyan-400'}`} />
                        <h3 className="font-bold text-white uppercase">{t('francis.intake.rack', 'Trash Rack (Ulazna Rešetka)')}</h3>
                    </div>

                    <div className="space-y-8">
                        {/* Control Slider */}
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Simulate Trash Build-up</label>
                                <span className="text-slate-200 font-bold">{trashBuildUp}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={trashBuildUp}
                                onChange={(e) => setTrashBuildUp(parseInt(e.target.value))}
                                className="w-full accent-cyan-500"
                            />
                        </div>

                        {/* Visualizer (Water Levels) */}
                        <div className="relative h-48 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex items-end justify-between px-10 pt-10">
                            {/* Upstream */}
                            <div className="w-24 relative z-10">
                                <div className="absolute bottom-0 w-full bg-cyan-600/60 border-t border-cyan-400 transition-all duration-300 flex items-center justify-center text-white font-bold text-xs" style={{ height: '80%' }}>
                                    Upstream
                                </div>
                            </div>

                            {/* Rack Grid Visual */}
                            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 bg-slate-800 border-x border-slate-600 z-20 flex flex-col justify-evenly items-center">
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className={`w-full h-1 ${trashBuildUp > i * 10 ? 'bg-amber-800' : 'bg-transparent'}`} />
                                ))}
                            </div>

                            {/* Downstream (Levels drop as Delta P increases) */}
                            <div className="w-24 relative z-10">
                                <div
                                    className="absolute bottom-0 w-full bg-cyan-700/60 border-t border-cyan-500 transition-all duration-300 flex items-center justify-center text-white font-bold text-xs"
                                    style={{ height: `${80 - (deltaP * 5)}%` }} // 1m Delta P = 5% visually
                                >
                                    Downstream
                                </div>
                            </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className={`p-4 rounded border ${isAlarm ? 'bg-red-950/20 border-red-500' : 'bg-slate-950 border-slate-800'}`}>
                                <div className="text-[10px] text-slate-500 uppercase mb-1">{t('francis.intake.deltaP', 'Delta P (Diff Pressure)')}</div>
                                <div className={`text-3xl font-black ${isAlarm ? 'text-red-500' : 'text-white'}`}>
                                    {deltaP.toFixed(2)} m
                                </div>
                                <div className="text-[9px] text-slate-600 mt-1">Alarm @ 2.00 m</div>
                            </div>
                            <div className="p-4 bg-slate-950 rounded border border-slate-800">
                                <div className="text-[10px] text-slate-500 uppercase mb-1">Flow Efficiency</div>
                                <div className="text-3xl font-black text-cyan-400">
                                    {flowEfficiency.toFixed(0)}%
                                </div>
                            </div>
                        </div>

                        {isAlarm && (
                            <div className="flex items-center gap-3 p-4 bg-red-950/40 border border-red-500/50 rounded-lg animate-pulse">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                                <div className="text-red-400 font-bold uppercase tracking-wider">
                                    CLEAN RACK IMMEDIATELY
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Sediment Monitor (Placeholder/Static for now) */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3 mb-6">
                        <Droplets className="w-6 h-6 text-amber-500" />
                        <h3 className="font-bold text-white uppercase">Sediment Load Monitor</h3>
                    </div>
                    <div className="p-4 bg-slate-950 rounded border border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-slate-400">Suspended Solids (PPM)</span>
                            <span className="text-xl font-mono text-amber-400">1,250 PPM</span>
                        </div>
                        <div className="h-40 bg-slate-900 rounded relative overflow-hidden">
                            {/* Simple particles vis */}
                            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-slide" />
                        </div>
                        <p className="text-xs text-slate-500 mt-3">
                            High sediment load detected. Turbine components (Runner/Guide Vanes) at increased erosion risk.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Intake;
