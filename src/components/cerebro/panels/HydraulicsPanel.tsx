import React from 'react';
import { Activity, ArrowRight, TrendingDown, Shield } from 'lucide-react';
import { useProjectEngine } from '../../../contexts/ProjectContext';
import { useTelemetryStore } from '../../../features/telemetry/store/useTelemetryStore';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../../utils/i18nUtils';
import { GlassCard } from '../../../shared/components/ui/GlassCard';
import { PipeMaterial } from '../../../core/TechnicalSchema';

export const HydraulicsPanel: React.FC = () => {
    // 1. LEGACY (Writes & Config)
    const { technicalState, updatePenstockSpecs, dispatch } = useProjectEngine();

    // 2. NEW TELEMETRY (Read Live Physics)
    const { physics: livePhysics, hydraulic: liveHydraulic } = useTelemetryStore();

    const { t, i18n: { language } } = useTranslation();

    const { material, wallThickness } = technicalState.penstock; // Keep reading config from TechnicalState for Inputs

    // DATA BRIDGE: Live Physics or Fallback
    // Note: ProjectEngine splits surge vs hammer. PhysicsEngine has 'surgePressure'.
    // We map 'surgePressure' to the display value.
    const activeSurge = livePhysics?.surgePressure
        ? livePhysics.surgePressure.toNumber()
        : (technicalState.physics?.waterHammerPressureBar || 0);

    const activeHoopStress = livePhysics?.hoopStress
        ? livePhysics.hoopStress.toNumber()
        : (technicalState.physics?.hoopStressMPa || 0);

    const activeHeadLoss = livePhysics?.headLoss
        ? livePhysics.headLoss.toNumber()
        : (technicalState.physics?.headLoss || 0);

    const activeNetHead = livePhysics?.netHead
        ? livePhysics.netHead.toNumber()
        : (technicalState.physics?.netHead || 0);

    return (
        <div className="space-y-6">
            <GlassCard className="p-6 border-l-4 border-blue-500">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" /> {t('hpp.penstock', 'Penstock Hydro-Physics')}
                </h3>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                            <span>{t('physics.material', 'Material')}</span>
                            <span className="text-[#2dd4bf]">{material}</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['STEEL', 'GRP', 'PEHD', 'CONCRETE'] as const).map(m => (
                                <button
                                    key={m}
                                    onClick={() => updatePenstockSpecs({ material: m })}
                                    className={`px-2 py-2 rounded text-[10px] font-bold transition-all ${material === m
                                        ? 'bg-[#2dd4bf] text-black'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                            <span>{t('physics.wallThickness', 'Wall Thickness')}</span>
                            <span className="text-white font-mono">{formatNumber(wallThickness, language, 0)} mm</span>
                        </label>
                        <input
                            type="range"
                            min="5" max="50" step="1"
                            value={wallThickness}
                            onChange={(e) => updatePenstockSpecs({ wallThickness: parseInt(e.target.value) })}
                            className="w-full mt-2 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#2dd4bf]"
                        />
                    </div>
                </div>

                {/* Physics Impact Display */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-950/20 rounded border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingDown className="w-4 h-4 text-blue-500" />
                            <span className="text-[10px] text-blue-400 font-bold uppercase">{t('physics.waterHammer', 'Water Hammer')}</span>
                        </div>
                        <div className="text-2xl font-black text-white font-mono">
                            {formatNumber(activeSurge, language, 1)} <span className="text-sm text-slate-500">bar</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">Surge Pressure</div>
                    </div>

                    <div className={`p-3 rounded border ${activeHoopStress > 200 ? 'bg-red-950/20 border-red-500/20' : 'bg-emerald-950/20 border-emerald-500/20'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className={`w-4 h-4 ${activeHoopStress > 200 ? 'text-red-500' : 'text-emerald-500'}`} />
                            <span className={`text-[10px] font-bold uppercase ${activeHoopStress > 200 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {t('physics.hoopStress', 'Hoop Stress')}
                            </span>
                        </div>
                        <span className="text-xl font-mono text-white">{activeHoopStress.toFixed(1)} <span className="text-xs">MPa</span></span>
                        <div className="text-[10px] text-slate-500 mt-1">Material Load</div>
                    </div>

                    <div className="p-3 bg-slate-900 border border-white/5 rounded">
                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Head Loss (hf)</div>
                        <div className="text-xl font-black text-amber-500 font-mono">
                            {formatNumber(activeHeadLoss, language, 2)} <span className="text-xs text-slate-600">m</span>
                        </div>
                        <div className="text-[9px] text-slate-600 uppercase mt-1">Friction dissipation</div>
                    </div>

                    <div className="p-3 bg-slate-900 border border-white/5 rounded">
                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Net Head (Hn)</div>
                        <div className="text-xl font-black text-cyan-500 font-mono">
                            {formatNumber(activeNetHead, language, 2)} <span className="text-xs text-slate-600">m</span>
                        </div>
                        <div className="text-[9px] text-slate-600 uppercase mt-1">Effective energy</div>
                    </div>
                </div>

                {activeHoopStress > 200 && !technicalState.appliedMitigations.includes('STRUCTURAL_RISK') && (
                    <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-between group overflow-hidden relative">
                        <div className="relative z-10">
                            <h4 className="text-xs font-bold text-amber-500 uppercase flex items-center gap-2">
                                <Shield className="w-3 h-3" /> Recovery Mitigation Available
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                                Reduce load by 15% to stabilize casing hoop stress and extend fatigue life.
                            </p>
                        </div>
                        <button
                            onClick={() => dispatch({ type: 'APPLY_MITIGATION', payload: 'STRUCTURAL_RISK' })}
                            className="relative z-10 px-3 py-2 bg-amber-500 text-black text-[10px] font-black rounded hover:bg-amber-400 transition-all flex items-center gap-2"
                        >
                            APPLY RECOVERY <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};
