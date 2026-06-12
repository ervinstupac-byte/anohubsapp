import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, ShieldCheck, Thermometer, Zap } from 'lucide-react';
import { useProjectEngine } from '../../../contexts/ProjectContext';
import { useTelemetryStore } from '../../../features/telemetry/store/useTelemetryStore';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../../utils/i18nUtils';
import { GlassCard } from '../../../shared/components/ui/GlassCard';

export const GeneratorPanel: React.FC = () => {
    const { technicalState, dispatch } = useProjectEngine();
    const { updateTelemetry } = useTelemetryStore();
    const { t, i18n: { language } } = useTranslation();

    const [heatersActive, setHeatersActive] = useState<boolean>(true);
    const [insulation, setInsulation] = useState<number>(1250); // MΩ
    const [partialDischarge, setPartialDischarge] = useState<number>(85); // pC (picoCoulombs)
    const [airGapEccentricity, setAirGapEccentricity] = useState<number>(4.2); // %

    // Simulation effect: if heaters are disabled, insulation resistance slowly degrades over time
    useEffect(() => {
        const interval = setInterval(() => {
            if (!heatersActive) {
                setInsulation(prev => Math.max(2.5, +(prev * 0.95).toFixed(1)));
            } else {
                setInsulation(prev => Math.min(2500, +(prev * 1.05 + 5).toFixed(1)));
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [heatersActive]);

    const isInsulationLow = insulation < 10.0;

    const handleCryoClean = () => {
        setInsulation(1800);
        setPartialDischarge(30);
        alert('Cryogenic CO2 dry ice stator cleaning executed. Surface contaminants purged, insulation resistance restored.');
    };

    return (
        <div className="space-y-6">
            <GlassCard className="p-6 border-l-4 border-cyan-500">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    Generator Winding & Insulation Diagnostics
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Simulated Insulation Slider */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-bold uppercase">Insulation Resistance</span>
                            <span className={`font-mono font-bold ${isInsulationLow ? 'text-red-400' : 'text-cyan-400'}`}>
                                {formatNumber(insulation, language, 1)} MΩ
                            </span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="2500"
                            step="10"
                            value={insulation}
                            onChange={(e) => setInsulation(parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-colors"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                            <span>Critical: &lt; 5.0 MΩ</span>
                            <span>Golden Std: &gt; 100 MΩ</span>
                        </div>
                    </div>

                    {/* Anti-Condensation Heaters */}
                    <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Anti-Condensation Heaters</span>
                        <button
                            onClick={() => setHeatersActive(!heatersActive)}
                            className={`w-full py-3 px-4 rounded-lg border text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                                heatersActive
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${heatersActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                            {heatersActive ? 'Wind Heaters ON (4 kW)' : 'Wind Heaters OFF'}
                        </button>
                    </div>
                </div>

                {/* Generator Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Partial Discharge</span>
                        <div className="text-xl font-black text-white font-mono">
                            {formatNumber(partialDischarge, language, 0)}{' '}
                            <span className="text-xs text-slate-500">pC</span>
                        </div>
                        <span className="text-[9px] text-slate-600 block mt-1">
                            Slot ionization activity
                        </span>
                    </div>

                    <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Stator Air Gap Eccentricity</span>
                        <div className="text-xl font-black text-white font-mono">
                            {formatNumber(airGapEccentricity, language, 1)}{' '}
                            <span className="text-xs text-slate-500">%</span>
                        </div>
                        <span className="text-[9px] text-slate-600 block mt-1">
                            Deviation from magnetic center
                        </span>
                    </div>
                </div>

                {isInsulationLow ? (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-xs font-bold text-red-400 uppercase">Critical Insulation Loss</h4>
                            <p className="text-[10px] text-slate-400 mt-1">
                                Winding insulation resistance has dropped below IEEE 43 safety thresholds. Winding surface is highly humidified or contaminated. Risk of major ground fault flashover. Do NOT energize unit.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-xs font-bold text-emerald-400 uppercase">Insulation Profile Healthy</h4>
                            <p className="text-[10px] text-slate-400 mt-1">
                                Megger value matches high-voltage baseline standards. Stator core anti-condensation cycle active.
                            </p>
                        </div>
                    </div>
                )}
            </GlassCard>

            {/* Maintenance Action Card */}
            <GlassCard className="p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Emergency CO2 Stator Restoration</h4>
                        <p className="text-[9px] text-slate-500 mt-1">Stator cryo-blast cleaning removes oil vapors and carbon dust instantly.</p>
                    </div>
                    <button
                        onClick={handleCryoClean}
                        className="px-3 py-2 bg-cyan-500 text-black text-[10px] font-black rounded hover:bg-cyan-400 transition-all uppercase flex items-center gap-1.5"
                    >
                        Execute Cryo-Blast
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};
