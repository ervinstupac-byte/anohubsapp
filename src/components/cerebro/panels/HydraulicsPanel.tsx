import React from 'react';
import { Shield, Activity, TrendingUp } from 'lucide-react';
import { useProjectEngine } from '../../../contexts/ProjectContext';
import { GlassCard } from '../../ui/GlassCard';
import { PipeMaterial } from '../../../models/TechnicalSchema';

export const HydraulicsPanel: React.FC = () => {
    const { technicalState, updatePenstockSpecs } = useProjectEngine();
    const { penstock, physics } = technicalState;

    const materials: PipeMaterial[] = ['STEEL', 'GRP', 'PEHD', 'CONCRETE'];

    return (
        <div className="space-y-6 animate-fade-in">
            <GlassCard className="p-6 border-l-4 border-blue-500">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" /> Penstock Hydro-Physics
                </h3>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Material</label>
                        <select
                            value={penstock.material}
                            onChange={(e) => updatePenstockSpecs({ material: e.target.value as PipeMaterial })}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white font-mono text-sm"
                        >
                            {materials.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Wall Thickness (mm)</label>
                        <input
                            type="number"
                            value={penstock.wallThickness}
                            onChange={(e) => updatePenstockSpecs({ wallThickness: parseFloat(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white font-mono"
                        />
                    </div>
                </div>

                {/* Physics Impact Display */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-950/20 rounded border border-blue-500/20">
                        <span className="text-[10px] text-blue-400 font-bold uppercase block mb-1">Water Hammer</span>
                        <span className="text-xl font-mono text-white">{physics.waterHammerPressureBar.toFixed(1)} <span className="text-xs">bar</span></span>
                        <div className="text-[10px] text-slate-500 mt-1">Surge Pressure</div>
                    </div>
                    <div className={`p-3 rounded border ${physics.hoopStressMPa > 200 ? 'bg-red-950/20 border-red-500/20' : 'bg-emerald-950/20 border-emerald-500/20'}`}>
                        <span className={`text-[10px] font-bold uppercase block mb-1 ${physics.hoopStressMPa > 200 ? 'text-red-400' : 'text-emerald-400'}`}>Hoop Stress</span>
                        <span className="text-xl font-mono text-white">{physics.hoopStressMPa.toFixed(1)} <span className="text-xs">MPa</span></span>
                        <div className="text-[10px] text-slate-500 mt-1">Material Load</div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};
