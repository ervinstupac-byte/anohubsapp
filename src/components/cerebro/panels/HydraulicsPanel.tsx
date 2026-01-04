import React from 'react';
import { Activity, ArrowRight, TrendingDown, Shield } from 'lucide-react';
import { useProjectEngine } from '../../../contexts/ProjectContext';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../../utils/i18nUtils';
import { GlassCard } from '../../ui/GlassCard';
import { PipeMaterial } from '../../../models/TechnicalSchema';

export const HydraulicsPanel: React.FC = () => {
    const { technicalState, updatePenstockSpecs, dispatch } = useProjectEngine();
    const { t, i18n: { language } } = useTranslation();

    const { material, wallThickness } = technicalState.penstock;
    const { physics } = technicalState;

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
                            {formatNumber(technicalState.physics.waterHammerPressureBar, language, 1)} <span className="text-sm text-slate-500">bar</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">Surge Pressure</div>
                    </div>

                    <div className={`p-3 rounded border ${physics.hoopStressMPa > 200 ? 'bg-red-950/20 border-red-500/20' : 'bg-emerald-950/20 border-emerald-500/20'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className={`w-4 h-4 ${physics.hoopStressMPa > 200 ? 'text-red-500' : 'text-emerald-500'}`} />
                            <span className={`text-[10px] font-bold uppercase ${physics.hoopStressMPa > 200 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {t('physics.hoopStress', 'Hoop Stress')}
                            </span>
                        </div>
                        <span className="text-xl font-mono text-white">{physics.hoopStressMPa.toFixed(1)} <span className="text-xs">MPa</span></span>
                        <div className="text-[10px] text-slate-500 mt-1">Material Load</div>
                    </div>
                </div>

                {physics.hoopStressMPa > 200 && !technicalState.appliedMitigations.includes('STRUCTURAL_RISK') && (
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
