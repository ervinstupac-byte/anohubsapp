import React, { useState } from 'react';
import { Activity, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { useProjectEngine } from '../../../contexts/ProjectContext';
import { useTelemetryStore } from '../../../features/telemetry/store/useTelemetryStore';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../../utils/i18nUtils';
import { GlassCard } from '../../../shared/components/ui/GlassCard';

export const TurbinePanel: React.FC = () => {
    const { technicalState, dispatch } = useProjectEngine();
    const { physics: livePhysics } = useTelemetryStore();
    const { t, i18n: { language } } = useTranslation();

    const [material, setMaterial] = useState<string>('G-X5CrNi13-4 (Stainless)');
    const [gateSyncOffset, setGateSyncOffset] = useState<number>(0.05); // degrees
    const [cavitationIndex, setCavitationIndex] = useState<number>(1.2); // mm cavitation depth

    const head = technicalState.hydraulic.head || 100;
    const flow = technicalState.hydraulic.flow || 8.5;
    const eff = technicalState.hydraulic.efficiency || 91.5;
    
    // Specific water consumption calculation
    const density = 1000;
    const gravity = 9.81;
    const powerW = density * gravity * head * flow * (eff / 100);
    const powerKW = powerW / 1000;
    const swc = powerKW > 0 ? (flow * 3600) / powerKW : 0; // m^3 / kWh

    const specificSpeed = useMemo(() => {
        // Ns = n * sqrt(P) / (H^1.25)
        const speedRPM = 500;
        const powerMW = powerKW / 1000;
        if (head <= 0) return 0;
        return (speedRPM * Math.sqrt(powerMW)) / Math.pow(head, 1.25);
    }, [powerKW, head]);

    const isGateMisaligned = gateSyncOffset > 0.1;

    const handleRecalibrate = () => {
        setGateSyncOffset(0.0);
        alert('Guide vane angular alignment restored to mechanical zero (0.0° deviation).');
    };

    return (
        <div className="space-y-6">
            <GlassCard className="p-6 border-l-4 border-emerald-500">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Runner & Guide Vanes Diagnostics
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Metallurgy Config */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                            <span>Runner Metallurgy</span>
                            <span className="text-emerald-400 text-[10px]">{material}</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {['G-X5CrNi13-4 (Stainless)', 'Cast Steel', 'Bronze', 'Stellite Overlay'].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMaterial(m)}
                                    className={`px-2 py-2 rounded text-[9px] font-bold uppercase transition-all ${
                                        material === m
                                            ? 'bg-emerald-500 text-black'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                                >
                                    {m.split(' ')[0]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Guide Vane Sync Offset Slider */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-bold uppercase">Wicket Gate Sync Dev</span>
                            <span className={`font-mono font-bold ${isGateMisaligned ? 'text-red-400' : 'text-emerald-400'}`}>
                                {gateSyncOffset.toFixed(2)}°
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0.00"
                            max="1.50"
                            step="0.05"
                            value={gateSyncOffset}
                            onChange={(e) => setGateSyncOffset(parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-colors"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                            <span>Nominal: &lt; 0.10°</span>
                            <button
                                onClick={handleRecalibrate}
                                className="text-emerald-400 hover:underline flex items-center gap-1 uppercase text-[8px]"
                            >
                                <RefreshCw className="w-2.5 h-2.5" /> Recalibrate
                            </button>
                        </div>
                    </div>
                </div>

                {/* Specific Math Outputs */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Specific Speed (Ns)</span>
                        <div className="text-xl font-black text-white font-mono">
                            {formatNumber(specificSpeed, language, 0)}{' '}
                            <span className="text-xs text-slate-500">rpm-kW</span>
                        </div>
                        <span className="text-[9px] text-slate-600 block mt-1">
                            Geometric speed index
                        </span>
                    </div>

                    <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Specific Water Cons.</span>
                        <div className="text-xl font-black text-white font-mono">
                            {formatNumber(swc, language, 2)}{' '}
                            <span className="text-xs text-slate-500">m³/kWh</span>
                        </div>
                        <span className="text-[9px] text-slate-600 block mt-1">
                            Volume per generated unit
                        </span>
                    </div>
                </div>

                {isGateMisaligned && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-xs font-bold text-red-400 uppercase">Guide Vane Asymmetric Opening</h4>
                            <p className="text-[10px] text-slate-400 mt-1">
                                Opening deviation exceeds the 0.1° threshold. This induces asymmetric hydraulic pressure profiles, creating high cavitation intensity on blade trailing edges and severe steady bearing load.
                            </p>
                        </div>
                    </div>
                )}
            </GlassCard>

            {/* Cavitation Depth Monitor */}
            <GlassCard className="p-6">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-4">Cavitation Pit Erosion Depth</h4>
                <div className="flex items-end gap-2 mb-2">
                    <span className="text-2xl font-black text-white font-mono">{cavitationIndex.toFixed(1)}</span>
                    <span className="text-xs text-slate-500 mb-1">mm max pitting depth</span>
                </div>
                <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(cavitationIndex / 5) * 100}%` }} />
                </div>
                <p className="text-[9px] text-slate-500 mt-2">
                    Acceptable threshold: &lt; 2.0mm. Beyond 4.0mm, structural fatigue limits require grinding and weld overlays.
                </p>
            </GlassCard>
        </div>
    );
};

// Simple memo helper
import { useMemo } from 'react';
