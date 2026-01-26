import React from 'react';
import { Settings, AlertTriangle, Info, Zap, Activity } from 'lucide-react';
import { useProjectEngine, useCerebro } from '../../../contexts/ProjectContext';
import { useTelemetryStore } from '../../../features/telemetry/store/useTelemetryStore';
import { GlassCard } from '../../../shared/components/ui/GlassCard';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../../utils/i18nUtils';

export const MechanicalPanel: React.FC = () => {
    // 1. LEGACY ENGINE (Writes & Design State)
    const { technicalState, updateMechanicalDetails, dispatch } = useProjectEngine();

    // 2. NEW TELEMETRY STORE (Read Live Physics)
    const { mechanical: liveMechanical, physics: livePhysics, identity: liveIdentity } = useTelemetryStore();

    const { state: cerebroState } = useCerebro();
    const { t, i18n: { language } } = useTranslation();
    // Use fallback to technicalState only for writes/initial state, READS come from live store
    const { mechanical } = technicalState; // Needed for binding input fields for updates

    // DATA BRIDGE: Priority to Live Telemetry
    const activeBoltLoad = livePhysics?.boltLoadKN ? livePhysics.boltLoadKN.toNumber() : (technicalState.physics.boltLoadKN || 0);
    const activeBoltCapacity = livePhysics?.boltCapacityKN ? livePhysics.boltCapacityKN.toNumber() : (technicalState.physics.boltCapacityKN || 0);
    const activeSafetyFactor = livePhysics?.boltSafetyFactor ? livePhysics.boltSafetyFactor.toNumber() : (technicalState.physics.boltSafetyFactor || 0);
    const activeVibration = liveMechanical?.vibration ?? 0;
    const currentShaftAlignmentLimit = liveMechanical?.shaftAlignmentLimit || technicalState.mechanical.shaftAlignmentLimit || 1.0;

    // Get component health data from CEREBRO
    const componentHealth = (cerebroState.componentHealth as Record<string, any>)?.[String(liveIdentity?.assetId ?? '')] || {};

    const handleParamChange = (key: keyof typeof mechanical.boltSpecs, value: any) => {
        updateMechanicalDetails({
            boltSpecs: { ...mechanical.boltSpecs, [key]: value }
        });
    };

    const entries = Object.entries(componentHealth) as [string, any][];

    return (
        <div className="space-y-6 animate-fade-in">
            <GlassCard className="p-6 border-l-4 border-[#2dd4bf]">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#2dd4bf]" /> {t('hpp.mechanical', 'Mechanical Integrity')}
                </h3>

                <div className="grid grid-cols-2 gap-6">
                    {/* Bolt Grade Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t('glossary.bolt_grade', 'Bolt Grade')} (ISO)</label>
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
                        <label className="text-xs font-bold text-slate-500 uppercase">{t('physics.torque', 'Torque')} (Nm)</label>
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
                        <span className="text-xs text-slate-400 font-mono uppercase">{t('physics.boltLoad', 'Calculated Load')}</span>
                        <span className="text-sm text-white font-mono font-bold">{formatNumber(activeBoltLoad, language, 2)} kN</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-400 font-mono uppercase">{t('physics.boltCapacity', 'Bolt Capacity')}</span>
                        <span className="text-sm text-white font-mono font-bold">{formatNumber(activeBoltCapacity, language, 2)} kN</span>
                    </div>
                    <div className="h-px bg-white/10 my-2" />
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-mono uppercase">Safety Factor</span>
                        <span className={`text-lg font-black font-mono ${activeSafetyFactor < 1.5 ? 'text-red-500' : 'text-emerald-500'
                            }`}>
                            {formatNumber(activeSafetyFactor, language, 2)}x
                        </span>
                    </div>
                    {activeSafetyFactor < 1.5 && (
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
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">{t('physics.shaftAlignment', 'Shaft Alignment')}</h3>
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
                        style={{ width: `${(1.0 / (currentShaftAlignmentLimit)) * 50}%` }} // Simplified visual logic, assumes 1.0 is current mock or live value if missing
                    />
                    <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 left-[80%]" /> {/* Limit Marker */}
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>0 mm</span>
                    <span>Limit: {formatNumber(currentShaftAlignmentLimit, language, 3)} mm</span>
                </div>

                {activeVibration > 4.5 && !cerebroState.appliedMitigations.includes('VIBRATION_CRITICAL') && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between group overflow-hidden relative">
                        <div className="relative z-10">
                            <h4 className="text-xs font-bold text-red-500 uppercase flex items-center gap-2">
                                <Activity className="w-3 h-3 text-red-500" /> Vibration Mitigation Ready
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                                Apply restrictive operating zone to bypass resonance and preserve bearing life.
                            </p>
                        </div>
                        <button
                            onClick={() => dispatch({ type: 'APPLY_MITIGATION', payload: 'VIBRATION_CRITICAL' })}
                            className="relative z-10 px-3 py-2 bg-red-500 text-white text-[10px] font-black rounded hover:bg-red-400 transition-all flex items-center gap-2"
                        >
                            ENGAGE RECOVERY <Zap className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </GlassCard>

            {/* Component Health Status */}
            {Object.keys(componentHealth).length > 0 && (
                <GlassCard className="p-6 border-l-4 border-cyan-500">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" /> Component Health Monitor
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {entries.map(([compId, health]) => {
                            const statusColors: Record<string, string> = {
                                OPTIMAL: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
                                GOOD: 'bg-green-500/20 text-green-400 border-green-500/50',
                                WARNING: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
                                CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/50'
                            };

                            const statusIcons: Record<string, string> = {
                                OPTIMAL: '✓',
                                GOOD: '●',
                                WARNING: '⚠',
                                CRITICAL: '⚠'
                            };

                            return (
                                <motion.div
                                    key={compId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 bg-slate-950/50 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                                                {health.component.replace(/([A-Z])/g, ' $1').trim()}
                                            </h4>
                                            <p className="text-[10px] text-slate-500 mt-0.5">
                                                Last: {new Date(health.lastMeasured).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className={`px-2 py-1 rounded border text-xs font-bold flex items-center gap-1 ${statusColors[health.status]}`}>
                                            {statusIcons[health.status]} {health.score}%
                                        </div>
                                    </div>
                                    <div className="relative h-2 bg-slate-900 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${health.score}%` }}
                                            transition={{ duration: 0.8, delay: 0.2 }}
                                            className={`h-full rounded-full ${health.status === 'OPTIMAL' ? 'bg-emerald-500' :
                                                health.status === 'GOOD' ? 'bg-green-500' :
                                                    health.status === 'WARNING' ? 'bg-amber-500' : 'bg-red-500'
                                                }`}
                                        />
                                    </div>
                                    {health.status === 'CRITICAL' && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="mt-2 flex items-center gap-1 text-[10px] text-red-400"
                                        >
                                            <AlertTriangle className="w-3 h-3" />
                                            CRITICAL: Immediate attention required
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </GlassCard>
            )}
        </div>
    );
};
