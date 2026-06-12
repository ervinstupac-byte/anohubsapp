import React, { useState, useMemo } from 'react';
import { Activity, ShieldAlert, Settings, ShieldCheck, HelpCircle } from 'lucide-react';
import { useProjectEngine } from '../../../contexts/ProjectContext';
import { useTelemetryStore } from '../../../features/telemetry/store/useTelemetryStore';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../../utils/i18nUtils';
import { GlassCard } from '../../../shared/components/ui/GlassCard';

export const ValvesPanel: React.FC = () => {
    const { technicalState, updatePenstockSpecs } = useProjectEngine();
    const { physics: livePhysics } = useTelemetryStore();
    const { t, i18n: { language } } = useTranslation();

    const [closeTime, setCloseTime] = useState<number>(8.5); // seconds
    const [bypassOpen, setBypassOpen] = useState<boolean>(false);
    const [oilPress, setOilPress] = useState<number>(142); // bar
    const [sealTightness, setSealTightness] = useState<number>(98.5); // %
    const [nitrogenLevel, setNitrogenLevel] = useState<number>(92.0); // %

    // Calculate transient wave parameters using actual penstock specs
    const L = technicalState.penstock.length || 150; // m
    const d = technicalState.penstock.diameter || 1.2; // m
    const flow = technicalState.hydraulic.flow || 8.5; // m^3/s
    const staticHead = technicalState.site.grossHead || 100; // m

    const area = Math.PI * Math.pow(d / 2, 2);
    const flowVelocity = flow / area; // m/s
    const waveVelocity = 1000; // typical wave speed in steel penstock, m/s
    const gravity = 9.81;

    // Critical closure time
    const tCritical = (2 * L) / waveVelocity; // s

    const calculations = useMemo(() => {
        const pSurgeInstant = (waveVelocity * flowVelocity) / gravity; // meters of head
        let pSurgeActual = 0;

        if (closeTime <= tCritical) {
            pSurgeActual = pSurgeInstant;
        } else {
            // Allievi formula for slow closure
            pSurgeActual = (2 * L * flowVelocity) / (gravity * closeTime);
        }

        const maxHead = staticHead + pSurgeActual;
        const totalPressureBar = maxHead / 10;
        const limitPressureBar = (staticHead * 1.5) / 10; // safety margin (1.5x static head)

        return {
            tCritical: parseFloat(tCritical.toFixed(3)),
            flowVelocity: parseFloat(flowVelocity.toFixed(2)),
            surgeHeadM: parseFloat(pSurgeActual.toFixed(2)),
            totalPressureBar: parseFloat(totalPressureBar.toFixed(2)),
            isCritical: totalPressureBar > limitPressureBar,
            limitPressureBar: parseFloat(limitPressureBar.toFixed(2))
        };
    }, [L, d, flow, staticHead, closeTime, tCritical, flowVelocity]);

    return (
        <div className="space-y-6">
            <GlassCard className="p-6 border-l-4 border-cyan-500">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-cyan-400" />
                    MIV & Bypass Control Node
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Closing Time Slider */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-bold uppercase">MIV Closure Time</span>
                            <span className="text-cyan-400 font-mono font-bold">{closeTime.toFixed(1)} s</span>
                        </div>
                        <input
                            type="range"
                            min="2.0"
                            max="45.0"
                            step="0.5"
                            value={closeTime}
                            onChange={(e) => setCloseTime(parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-colors"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                            <span>Critical: {calculations.tCritical} s</span>
                            <span>Slow: &gt; {calculations.tCritical} s</span>
                        </div>
                    </div>

                    {/* Interactive Valve Toggles */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setBypassOpen(!bypassOpen)}
                            className={`px-3 py-3 rounded-lg border text-xs font-bold uppercase transition-all flex flex-col items-center justify-center gap-1 ${
                                bypassOpen
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                        >
                            <span className="text-[10px] text-slate-500">Bypass Valve</span>
                            <span>{bypassOpen ? 'OPEN' : 'CLOSED'}</span>
                        </button>

                        <button
                            onClick={() => {
                                setNitrogenLevel(100);
                                alert('Nitrogen Accumulator recharged to 100% baseline.');
                            }}
                            className="px-3 py-3 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 text-xs font-bold uppercase transition-all flex flex-col items-center justify-center gap-1"
                        >
                            <span className="text-[10px] text-slate-500">N2 Reserve</span>
                            <span className="text-cyan-400">{nitrogenLevel.toFixed(0)}%</span>
                        </button>
                    </div>
                </div>

                {/* Hydraulic Transient Feedback */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Max Dynamic Head</span>
                        <div className="text-xl font-black text-white font-mono">
                            {formatNumber(calculations.surgeHeadM + staticHead, language, 1)}{' '}
                            <span className="text-xs text-slate-500">m</span>
                        </div>
                        <span className="text-[9px] text-slate-600 block mt-1">
                            Surge component: +{calculations.surgeHeadM} m
                        </span>
                    </div>

                    <div className={`p-4 rounded-xl border ${calculations.isCritical ? 'bg-red-950/20 border-red-500/30 text-red-400' : 'bg-slate-950/40 border-white/5 text-slate-300'}`}>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Total Transient Pressure</span>
                        <div className="text-xl font-black text-white font-mono">
                            {formatNumber(calculations.totalPressureBar, language, 1)}{' '}
                            <span className="text-xs text-slate-500">bar</span>
                        </div>
                        <span className="text-[9px] text-slate-500 block mt-1">
                            Limit target: {calculations.limitPressureBar} bar
                        </span>
                    </div>
                </div>

                {calculations.isCritical ? (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-xs font-bold text-red-400 uppercase">Transient Overpressure Risk</h4>
                            <p className="text-[10px] text-slate-400 mt-1">
                                Closing the MIV in {closeTime}s is too fast, creating water hammer pressures that exceed the penstock safety threshold. Increase closing time to at least {Math.ceil(calculations.tCritical * 5)}s.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-xs font-bold text-emerald-400 uppercase">Safe Transient Wave Envelope</h4>
                            <p className="text-[10px] text-slate-400 mt-1">
                                Closure sequence is fully damped. Transient energy is within nominal boundaries for the active penstock structure.
                            </p>
                        </div>
                    </div>
                )}
            </GlassCard>

            {/* MIV Physical Seal Leakage Audit */}
            <GlassCard className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Seal Tightness Analysis</h4>
                        <p className="text-[10px] text-slate-500 mt-1">Differential bypass leakage rate: {sealTightness}%</p>
                    </div>
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">NOMINAL</span>
                </div>
                <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${sealTightness}%` }} />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 mt-2 font-mono">
                    <span>Intolerable Bypass Limit: 95.0%</span>
                    <span>Current: {sealTightness}%</span>
                </div>
            </GlassCard>
        </div>
    );
};
