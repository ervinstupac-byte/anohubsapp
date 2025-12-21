import React from 'react';
import { Settings, AlertTriangle, Info, Zap } from 'lucide-react';
import { useProjectEngine } from '../../../contexts/ProjectContext';
import { GlassCard } from '../../ui/GlassCard';
import { motion } from 'framer-motion';

export const MechanicalPanel: React.FC = () => {
    const { technicalState, updateMechanicalDetails } = useProjectEngine();
    const { mechanical, physics } = technicalState;

    const handleParamChange = (key: keyof typeof mechanical.boltSpecs, value: any) => {
        updateMechanicalDetails({
            boltSpecs: { ...mechanical.boltSpecs, [key]: value }
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <GlassCard className="p-6 border-l-4 border-[#2dd4bf]">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#2dd4bf]" /> Bolt Configuration
                </h3>

                <div className="grid grid-cols-2 gap-6">
                    {/* Bolt Grade Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Bolt Grade (ISO)</label>
                        <div className="flex gap-2">
                            {['4.6', '5.6', '8.8', '10.9'].map((grade) => (
                                <button
                                    key={grade}
                                    onClick={() => handleParamChange('grade', grade)}
                                    className={`px-3 py-1 text-xs font-bold rounded border transition-all ${mechanical.boltSpecs.grade === grade
                                            ? 'bg-[#2dd4bf] text-black border-[#2dd4bf]'
                                            : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500'
                                        }`}
                                >
                                    {grade}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Torque Settings */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Torque (Nm)</label>
                        <input
                            type="number"
                            value={mechanical.boltSpecs.torque}
                            onChange={(e) => handleParamChange('torque', parseFloat(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white font-mono"
                        />
                    </div>
                </div>

                {/* Real-time Physics Feedback */}
                <div className="mt-6 p-4 rounded bg-black/20 border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-400 font-mono">CALCULATED LOAD PER BOLT</span>
                        <span className="text-sm text-white font-mono font-bold">{physics.boltLoadKN.toFixed(2)} kN</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-400 font-mono">BOLT CAPACITY</span>
                        <span className="text-sm text-white font-mono font-bold">{physics.boltCapacityKN.toFixed(2)} kN</span>
                    </div>
                    <div className="h-px bg-white/10 my-2" />
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-mono uppercase">Safety Factor</span>
                        <span className={`text-lg font-black font-mono ${physics.boltSafetyFactor < 1.5 ? 'text-red-500' : 'text-emerald-500'
                            }`}>
                            {physics.boltSafetyFactor.toFixed(2)}x
                        </span>
                    </div>
                    {physics.boltSafetyFactor < 1.5 && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="mt-2 flex items-center gap-2 text-xs text-red-400 bg-red-950/20 p-2 rounded"
                        >
                            <AlertTriangle className="w-3 h-3" />
                            CRITICAL: Upgrade bolts or reduce pressure!
                        </motion.div>
                    )}
                </div>
            </GlassCard>

            <GlassCard className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Shaft Alignment (Legacy)</h3>
                        <p className="text-xs text-slate-400 mb-4">
                            Max allowed radial runout based on bearing type <b>{mechanical.bearingType}</b>.
                        </p>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-amber-500" title="Legacy Story">
                        <span className="font-serif font-bold italic">H</span>
                    </button>
                </div>

                <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="absolute top-0 bottom-0 left-0 bg-emerald-500"
                        style={{ width: `${(mechanical.radialClearance / mechanical.shaftAlignmentLimit) * 50}%` }}
                    />
                    <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 left-[80%]" /> {/* Limit Marker */}
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>0 mm</span>
                    <span>Limit: {mechanical.shaftAlignmentLimit} mm</span>
                </div>
            </GlassCard>
        </div>
    );
};
