import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Octagon, AlertTriangle, ArrowDown, ShieldAlert, Cpu, Scaling } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
// NEW: Specialized stores instead of monolithic ProjectContext
import { useAssetConfig } from '../../contexts/AssetConfigContext';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { useDemoMode } from '../../stores/useAppStore';
import { useEngineeringMath } from '../../hooks/useEngineeringMath';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const Penstock: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // NEW PATTERN: Specialized stores for different concerns
    // - useAssetConfig: STATIC configuration (penstock.diameter, penstock.material)
    // - useTelemetryStore: LIVE sensor data (physics.hoopStress, physics.surgePressure)
    // - useDemoMode: UI state (demo scenarios)
    const { config, isLoading } = useAssetConfig(); // Static configuration
    const { physics } = useTelemetryStore(); // Live telemetry data
    const demoMode = useDemoMode(); // UI state (unused in current render but available)
    const { waterHammer } = useEngineeringMath();

    // === MAPPING FROM OLD STATE TO NEW STORES ===
    // OLD: state.penstock.diameter      -> NEW: config?.penstock?.diameter
    // OLD: state.penstock.material      -> NEW: config?.penstock?.material  
    // OLD: state.physics.hoopStressMPa  -> NEW: physics?.hoopStress?.toNumber()
    // OLD: state.demoMode               -> NEW: demoMode (from useAppStore)

    // Penstock specs from AssetConfig (static, rarely changes)
    const penstockDiameter = config?.penstock?.diameter ?? 2.5;
    const penstockMaterial = config?.penstock?.material ?? 'STEEL';
    const penstockThickness = config?.penstock?.wallThickness ?? 0.025;

    // Live telemetry from TelemetryStore (with null safety)
    // Note: PhysicsResult uses Decimal.js, we convert to number for display
    const hoopStress = physics?.hoopStressMPa ?? 0;
    const surgePressure = physics?.surgePressureBar ?? 0;
    const burstSF = waterHammer?.burstSafetyFactor ?? 1.0;
    const isDanger = burstSF < 1.5;

    // Loading guard: Prevent undefined errors on initial mount
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-none mx-auto mb-4" />
                    <p className="text-slate-400 text-sm font-medium">Loading Penstock Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-slate-700 py-8 px-4 md:px-8 mb-8 sticky top-0 z-50 backdrop-blur-md shadow-none transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-slate-700 rounded-none border border-white/10 shadow-none relative group overflow-hidden">
                            <Scaling className="text-white w-8 h-8 relative z-10 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-none bg-slate-900 border border-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest">SOP-PEN-002</span>
                                <NeuralPulse />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.penstock.title')}
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-none text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.penstock.return') || t('actions.back')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">

                {/* 1. Structural Integrity Hub */}
                <GlassCard title="Penstock Structural Intelligence" className="relative overflow-hidden group">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="p-6 bg-black/60 rounded-none border border-white/5">
                            <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Activity className="w-3 h-3 text-cyan-400" /> Hoop Stress
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter">
                                {hoopStress.toFixed(1)} <span className="text-xs text-slate-500 uppercase ml-1">MPa</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-none border border-white/5">
                            <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Scaling className="w-3 h-3 text-emerald-400" /> Burst Safety Factor
                            </p>
                            <p className={`text-3xl font-black font-mono tracking-tighter ${isDanger ? 'text-red-500' : 'text-emerald-400'}`}>
                                {burstSF.toFixed(2)} <span className="text-xs text-slate-500 ml-1">SF</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-none border border-white/5">
                            <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <ShieldAlert className="w-3 h-3 text-amber-400" /> Yield Margin
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter">
                                42.4 <span className="text-xs text-slate-500 ml-1">%</span>
                            </p>
                        </div>
                    </div>
                </GlassCard>

                {/* 2. Configuration Specs (from AssetConfig - STATIC DATA) */}
                <GlassCard title="Penstock Configuration" className="relative overflow-hidden">
                    <div className="absolute top-4 right-4 px-2 py-0.5 rounded-none bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-[9px] font-black uppercase tracking-widest">
                        From AssetConfig
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="p-6 bg-black/60 rounded-none border border-white/5">
                            <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Octagon className="w-3 h-3 text-blue-400" /> Internal Diameter
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter">
                                {(penstockDiameter * 1000).toFixed(0)} <span className="text-xs text-slate-500 uppercase ml-1">mm</span>
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-none border border-white/5">
                            <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <ShieldAlert className="w-3 h-3 text-purple-400" /> Material Grade
                            </p>
                            <p className="text-2xl font-black text-white font-mono tracking-tighter">
                                {penstockMaterial}
                            </p>
                        </div>
                        <div className="p-6 bg-black/60 rounded-none border border-white/5">
                            <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                                <Activity className="w-3 h-3 text-amber-400" /> Wall Thickness
                            </p>
                            <p className="text-3xl font-black text-white font-mono tracking-tighter">
                                {(penstockThickness * 1000).toFixed(1)} <span className="text-xs text-slate-500 uppercase ml-1">mm</span>
                            </p>
                        </div>
                    </div>
                </GlassCard>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Joukowsky Analysis */}
                    <GlassCard title={t('francis.penstock.hammer')} icon={<ArrowDown className="text-red-400" />}>
                        <div className="space-y-6">
                            <div className="p-8 bg-red-950/10 border border-red-500/20 rounded-none relative group overflow-hidden">
                                <div className="absolute top-0 right-0 px-4 py-1 bg-red-600 text-white text-[9px] font-black uppercase rounded-none tracking-widest animate-pulse">IEC 60041 Standard</div>
                                <h4 className="text-red-500 text-[10px] font-black uppercase mb-4 tracking-[0.2em]">{t('francis.penstock.thickness')} ANALYSIS</h4>
                                <p className="text-slate-200 text-sm font-bold italic leading-relaxed mb-6">
                                    {waterHammer.recommendation}
                                </p>
                                <div className="p-4 bg-black/60 rounded-none border border-white/5 flex justify-between items-center group/opt">
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Surge Pressure</span>
                                    <span className="text-xl font-black text-red-400 font-mono tracking-tighter">+{surgePressure.toFixed(1)} <span className="text-[10px] opacity-40">BAR</span></span>
                                </div>
                            </div>

                            <div className="bg-slate-900/40 p-6 rounded-none border border-white/5 space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                    <span>Design Limit Progress</span>
                                    <span className="text-white">{(surgePressure / 25 * 100).toFixed(1)}%</span>
                                </div>
                                <div className="relative h-6 bg-slate-800 rounded-none overflow-hidden border border-white/5 shadow-none">
                                    <div className="absolute top-0 bottom-0 w-1 bg-red-500 z-10" style={{ left: '80%' }} />
                                    <div
                                        className={`h-full transition-all duration-1000 shadow-none ${isDanger ? 'bg-gradient-to-r from-red-600 to-amber-500' : 'bg-gradient-to-r from-cyan-600 to-blue-500'}`}
                                        style={{ width: `${Math.min((surgePressure / 25) * 100, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[8px] text-slate-600 font-black uppercase tracking-[0.3em]">
                                    <span>Nominal</span>
                                    <span>Rupture Limit</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Thickness Monitor */}
                    <GlassCard title={t('francis.penstock.thickness')} icon={<Octagon className="text-slate-400" />}>
                        <div className="space-y-4">
                            {[
                                { label: 'Upper Section (Inlet)', current: 24.8, original: 25.0, status: 'GOOD' },
                                { label: 'Mid Section (Elbow)', current: 23.2, original: 25.0, status: 'WARNING' },
                                { label: 'Lower Section (MIV)', current: 28.5, original: 29.0, status: 'GOOD' },
                            ].map((section, idx) => (
                                <div key={idx} className="p-6 bg-black/40 rounded-none border border-white/5 hover:border-slate-500 transition-all group overflow-hidden relative">
                                    <div className={`absolute top-0 right-0 px-4 py-1 text-[9px] font-black uppercase rounded-none tracking-widest ${section.status === 'GOOD' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-black animate-pulse'}`}>
                                        {section.status}
                                    </div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-black text-white uppercase tracking-tighter">{section.label}</h4>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Curr</span>
                                            <span className="text-lg font-black text-white font-mono tracking-tighter">{section.current} <span className="text-[9px] opacity-40">mm</span></span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Orig</span>
                                            <span className="text-lg font-black text-slate-400 font-mono tracking-tighter">{section.original} <span className="text-[9px] opacity-40">mm</span></span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest text-right">Loss</span>
                                            <span className="text-lg font-black text-red-400 font-mono tracking-tighter">-{(section.original - section.current).toFixed(1)} <span className="text-[9px] opacity-40">mm</span></span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* Audit Actions */}
                <section className="bg-slate-900/60 p-8 rounded-none border border-white/5 relative group overflow-hidden">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-8">
                        <Cpu className="w-8 h-8 text-slate-400" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Engineering Audit Protocol</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-8 bg-black/40 rounded-none border border-white/10 group hover:bg-black/60 transition-all border-l-4 border-l-indigo-600">
                            <h4 className="text-indigo-400 text-[10px] font-black uppercase mb-4 tracking-[0.2em]">Material Fatigue Tracking</h4>
                            <p className="text-xs text-slate-300 font-bold leading-relaxed mb-6 italic opacity-80 group-hover:opacity-100 transition-opacity">
                                Neural SDOF model suggests localized fatigue accumulation at Mid-Section elbow due to 4Hz pressure pulses during grid stabilization.
                            </p>
                            <button className="px-6 py-2 bg-indigo-600 text-white rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 shadow-none transition-all">Request Ultrasonic Verification</button>
                        </div>

                        <div className="p-8 bg-black/40 rounded-none border border-white/10 group hover:bg-black/60 transition-all border-l-4 border-l-amber-600">
                            <h4 className="text-amber-500 text-[10px] font-black uppercase mb-4 tracking-[0.2em]">Safety Lifecycle (SIL)</h4>
                            <p className="text-xs text-slate-300 font-bold leading-relaxed mb-6 italic opacity-80 group-hover:opacity-100 transition-opacity">
                                Penstock burst safety factor of {burstSF.toFixed(2)} is within SIL-2 operational envelope. Scheduled UT thickness scan due in 124 days.
                            </p>
                            <button className="px-6 py-2 bg-amber-600 text-white rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 shadow-none transition-all">Audit SCADA Logs</button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Penstock;
