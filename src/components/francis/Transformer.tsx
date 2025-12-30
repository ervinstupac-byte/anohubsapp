import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Thermometer, Fan, AlertTriangle, AlertOctagon, Activity } from 'lucide-react';
import { ROUTES } from '../../routes/paths';

export const Transformer: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Simulation Config
    const OIL_ALARM = 85;
    const OIL_TRIP = 95;
    const WINDING_ALARM = 95;
    const WINDING_TRIP = 105;

    // States
    const [oilTemp, setOilTemp] = useState(65);
    const [liWindingTemp, setLiWindingTemp] = useState(70);
    const [buchholzState, setBuchholzState] = useState<'NORMAL' | 'ALARM' | 'TRIP'>('NORMAL');
    const [fansRunning, setFansRunning] = useState(false);

    const getTempStatus = (val: number, alarm: number, trip: number) => {
        if (val >= trip) return 'TRIP';
        if (val >= alarm) return 'ALARM';
        return 'NORMAL';
    };

    const oilStatus = getTempStatus(oilTemp, OIL_ALARM, OIL_TRIP);
    const windingStatus = getTempStatus(liWindingTemp, WINDING_ALARM, WINDING_TRIP);

    const triggerBuchholz = (state: 'ALARM' | 'TRIP') => {
        setBuchholzState(state);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-mono p-4 md:p-8">
            <button onClick={() => navigate(`/francis/${ROUTES.FRANCIS.HUB}`)} className="flex items-center gap-2 mb-6 hover:text-cyan-400 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>{t('actions.back', 'Back to Hub')}</span>
            </button>

            <header className="mb-8 border-b border-slate-800 pb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-900/30 rounded-lg border border-indigo-500/30">
                        <Zap className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight">{t('francis.transformer.title', 'Transformer Integrity')}</h1>
                        <p className="text-slate-500 text-xs tracking-widest">{t('francis.transformer.subtitle', 'Thermal & Gas Protection')}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* 1. Thermal Monitoring */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Oil Temp */}
                        <div className={`p-6 rounded-xl border transition-all ${oilStatus === 'TRIP' ? 'bg-red-950/30 border-red-500' : oilStatus === 'ALARM' ? 'bg-yellow-950/30 border-yellow-500' : 'bg-slate-900/50 border-slate-700'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <Thermometer className={`w-6 h-6 ${oilStatus === 'NORMAL' ? 'text-cyan-400' : 'text-white'}`} />
                                    <h3 className="font-bold text-slate-300">Oil Temperature</h3>
                                </div>
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${oilStatus === 'NORMAL' ? 'bg-green-900/30 text-green-400' : 'bg-white/10 text-white'}`}>
                                    {oilStatus}
                                </span>
                            </div>
                            <div className="text-4xl font-black text-white mb-4 flex items-baseline gap-2">
                                {oilTemp}°C
                                <span className="text-xs text-slate-500 font-normal">Trip @ {OIL_TRIP}°C</span>
                            </div>
                            <input
                                type="range"
                                min="20"
                                max="110"
                                value={oilTemp}
                                onChange={(e) => setOilTemp(parseInt(e.target.value))}
                                className="w-full accent-cyan-500"
                            />
                        </div>

                        {/* Winding Temp */}
                        <div className={`p-6 rounded-xl border transition-all ${windingStatus === 'TRIP' ? 'bg-red-950/30 border-red-500' : windingStatus === 'ALARM' ? 'bg-yellow-950/30 border-yellow-500' : 'bg-slate-900/50 border-slate-700'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <Activity className={`w-6 h-6 ${windingStatus === 'NORMAL' ? 'text-cyan-400' : 'text-white'}`} />
                                    <h3 className="font-bold text-slate-300">Winding Temp</h3>
                                </div>
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${windingStatus === 'NORMAL' ? 'bg-green-900/30 text-green-400' : 'bg-white/10 text-white'}`}>
                                    {windingStatus}
                                </span>
                            </div>
                            <div className="text-4xl font-black text-white mb-4 flex items-baseline gap-2">
                                {liWindingTemp}°C
                                <span className="text-xs text-slate-500 font-normal">Trip @ {WINDING_TRIP}°C</span>
                            </div>
                            <input
                                type="range"
                                min="20"
                                max="120"
                                value={liWindingTemp}
                                onChange={(e) => setLiWindingTemp(parseInt(e.target.value))}
                                className="w-full accent-cyan-500"
                            />
                        </div>
                    </div>

                    {/* Cooling System */}
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${fansRunning ? 'bg-cyan-500/20 animate-pulse' : 'bg-slate-800'}`}>
                                <Fan className={`w-6 h-6 ${fansRunning ? 'text-cyan-400 animate-spin' : 'text-slate-600'}`} />
                            </div>
                            <div>
                                <div className="font-bold text-white">Cooling Fans</div>
                                <div className="text-xs text-slate-500">Auto-start at 75°C Oil Temp</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setFansRunning(!fansRunning)}
                            className={`px-4 py-2 text-xs font-bold rounded border ${fansRunning ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-800 border-slate-600 text-slate-400'}`}
                        >
                            {fansRunning ? 'RUNNING' : 'STOPPED'}
                        </button>
                    </div>
                </div>

                {/* 2. Buchholz Protection */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <AlertTriangle className="text-orange-500" />
                        Buchholz Relay
                    </h3>

                    <div className="space-y-4">
                        <div className={`p-4 rounded border transition-all ${buchholzState === 'NORMAL' ? 'bg-green-900/10 border-green-900/30' : 'opacity-50 border-slate-800'}`}>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-green-400">Normal Operation</span>
                                {buchholzState === 'NORMAL' && <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_currentColor]" />}
                            </div>
                        </div>

                        <div className={`p-4 rounded border transition-all ${buchholzState === 'ALARM' ? 'bg-yellow-900/20 border-yellow-500' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <span className={`text-sm font-bold ${buchholzState === 'ALARM' ? 'text-yellow-400' : 'text-slate-400'}`}>Gas Accumulation</span>
                                <button onClick={() => triggerBuchholz('ALARM')} className="text-[10px] px-2 py-1 bg-yellow-900/40 text-yellow-500 border border-yellow-700 rounded hover:bg-yellow-900/60">TEST ALARM</button>
                            </div>
                            {buchholzState === 'ALARM' && <p className="text-xs text-yellow-200/70">Warning: Slow gas buildup detected. Check oil level and gas composition.</p>}
                        </div>

                        <div className={`p-4 rounded border transition-all ${buchholzState === 'TRIP' ? 'bg-red-900/20 border-red-500 animate-pulse' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <span className={`text-sm font-bold ${buchholzState === 'TRIP' ? 'text-red-400' : 'text-slate-400'}`}>Oil Surge</span>
                                <button onClick={() => triggerBuchholz('TRIP')} className="text-[10px] px-2 py-1 bg-red-900/40 text-red-500 border border-red-700 rounded hover:bg-red-900/60">TEST TRIP</button>
                            </div>
                            {buchholzState === 'TRIP' && (
                                <div className="flex gap-2 items-center text-red-400 mt-2">
                                    <AlertOctagon className="w-4 h-4" />
                                    <span className="text-xs font-black">CRITICAL: IMMEDIATE TRANSFORMER ISOLATION TRIGGERED</span>
                                </div>
                            )}
                        </div>

                        {buchholzState !== 'NORMAL' && (
                            <button
                                onClick={() => setBuchholzState('NORMAL')}
                                className="w-full py-3 mt-4 text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600"
                            >
                                Reset Relay
                            </button>
                        )}

                        {/* Synapse Link */}
                        <button
                            onClick={() => navigate(`/${ROUTES.MAINTENANCE.ROOT}/${ROUTES.MAINTENANCE.LOGBOOK}`, {
                                state: { source: 'Transformer Buchholz', reason: buchholzState !== 'NORMAL' ? `Buchholz ${buchholzState}` : 'Routine Check' }
                            })}
                            className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded border border-slate-600 transition-colors"
                        >
                            <Activity className="w-4 h-4" />
                            {t('actions.logObservation', 'Log Observation')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transformer;
