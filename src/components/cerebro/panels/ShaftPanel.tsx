import React, { useState } from 'react';
import { Activity, ShieldAlert, Settings, TrendingUp, ShieldCheck } from 'lucide-react';
import { useProjectEngine } from '../../../contexts/ProjectContext';
import { useTelemetryStore } from '../../../features/telemetry/store/useTelemetryStore';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../../utils/i18nUtils';
import { GlassCard } from '../../../shared/components/ui/GlassCard';

export const ShaftPanel: React.FC = () => {
    const { technicalState, updateMechanicalDetails } = useProjectEngine();
    const { mechanical: liveMechanical } = useTelemetryStore();
    const { t, i18n: { language } } = useTranslation();

    const [jackingPumpActive, setJackingPumpActive] = useState<boolean>(false);
    const [oilCleanliness, setOilCleanliness] = useState<string>('ISO 16/14/11');
    const [babbittTemp, setBabbittTemp] = useState<number>(54.2); // °C

    const runout = liveMechanical?.vibration ?? technicalState.mechanical.vibrationX ?? 1.2;
    const radialLimit = technicalState.mechanical.shaftAlignmentLimit || 1.0;

    const isAlignmentCritical = runout > radialLimit * 0.8;

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        updateMechanicalDetails({
            vibrationX: val
        });
    };

    return (
        <div className="space-y-6">
            <GlassCard className="p-6 border-l-4 border-amber-500">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    Shaft Line & Babbitt Diagnostics
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Simulated Alignment Runout Slider */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-bold uppercase">Radial Run-out (TIR)</span>
                            <span className={`font-mono font-bold ${isAlignmentCritical ? 'text-red-400' : 'text-emerald-400'}`}>
                                {runout.toFixed(3)} mm
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0.05"
                            max="2.50"
                            step="0.05"
                            value={runout}
                            onChange={handleSliderChange}
                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-colors"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                            <span>Nominal: &lt; 0.10 mm</span>
                            <span>Limit: {radialLimit.toFixed(2)} mm</span>
                        </div>
                    </div>

                    {/* Jacking Pump Controls */}
                    <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Pre-Start Jacking Oil</span>
                        <button
                            onClick={() => setJackingPumpActive(!jackingPumpActive)}
                            className={`w-full py-3 px-4 rounded-lg border text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                                jackingPumpActive
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${jackingPumpActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                            {jackingPumpActive ? 'Jacking Pump Active (45 Bar)' : 'Engage Jacking Pump'}
                        </button>
                    </div>
                </div>

                {/* Shaft Indicators */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Babbitt Temperature</span>
                        <div className="text-xl font-black text-white font-mono">
                            {formatNumber(babbittTemp, language, 1)}{' '}
                            <span className="text-xs text-slate-500">°C</span>
                        </div>
                        <span className="text-[9px] text-slate-600 block mt-1">
                            Hydrodynamic sliding film temperature
                        </span>
                    </div>

                    <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Oil Cleanliness Index</span>
                        <div className="text-xl font-black text-emerald-400 font-mono">
                            {oilCleanliness}
                        </div>
                        <span className="text-[9px] text-slate-600 block mt-1">
                            ISO 4406 Solid Particle Standard
                        </span>
                    </div>
                </div>

                {isAlignmentCritical ? (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-xs font-bold text-red-400 uppercase">Excessive Radial Run-out</h4>
                            <p className="text-[10px] text-slate-400 mt-1">
                                High vibration levels detected. Alignment deviation exceeds 80% of radial bearing tolerances. Risk of Babbitt wiping. Laser realignment recommended at next scheduled shutdown.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-xs font-bold text-emerald-400 uppercase">Alignment Signature Nominal</h4>
                            <p className="text-[10px] text-slate-400 mt-1">
                                Shaft radial orbit shows low eccentricity. Oil film thickness is fully sufficient to prevent metal contact.
                            </p>
                        </div>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};
