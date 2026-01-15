import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssetContext } from '../../contexts/AssetContext.tsx';
// MIGRATED: From useProjectEngine to specialized stores
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { useDemoMode } from '../../stores/useAppStore';
import { useEngineeringMath } from '../../hooks/useEngineeringMath.ts';
import { Tooltip } from '../../shared/components/ui/Tooltip';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DigitalDisplay } from './DigitalDisplay.tsx';
import { Activity, ShieldCheck, ZapOff, Sparkles, ChevronRight } from 'lucide-react';

const TurbineUnit: React.FC<{
    id: string;
    name: string;
    status: 'running' | 'stopped';
    mw: number;
    eccentricity: number;
    vibration: number;
}> = React.memo(({ name, status, mw, eccentricity, vibration }) => {
    const { t } = useTranslation();
    // NC-4.2 Reactive Color Logic: Base color on physics metrics
    // Vibration > 0.05 or Eccentricity > 0.8 triggers Warning/Critical aesthetics
    const isVibrationCritical = vibration > 0.06;
    const isEccentricityWarning = eccentricity > 0.75;

    let unitColor = 'cyan';
    if (isVibrationCritical) unitColor = 'red';
    else if (isEccentricityWarning) unitColor = 'orange';

    const colorMap = {
        cyan: 'border-cyan-400 group-hover:border-cyan-300 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent shadow-[0_0_60px_rgba(6,182,212,0.2),inset_0_0_40px_rgba(6,182,212,0.1)]',
        orange: 'border-amber-400 group-hover:border-amber-300 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent shadow-[0_0_60px_rgba(245,158,11,0.2),inset_0_0_40px_rgba(245,158,11,0.1)]',
        red: 'border-red-400 group-hover:border-red-300 bg-gradient-to-br from-red-500/10 via-pink-500/5 to-transparent shadow-[0_0_60px_rgba(239,68,68,0.2),inset_0_0_40px_rgba(220,38,38,0.1)]'
    };

    return (
        <div className="relative group perspective-1000">
            <Tooltip content={`${name}: Eccentricity ${(eccentricity).toFixed(3)} | Vibration ${(vibration * 1000).toFixed(1)}μm`}>
                <motion.div
                    whileHover={{ rotateY: 10, scale: 1.05 }}
                    className={`
                        w-52 h-52 rounded-full border-[6px] flex items-center justify-center relative translate-y-10 transition-all duration-700 backdrop-blur-xl
                        ${status === 'running' ? colorMap[unitColor as keyof typeof colorMap] : 'border-white/5 bg-white/5 shadow-2xl'}
                    `}
                >
                    <div className="absolute inset-0 rounded-full noise-commander opacity-20"></div>
                    <div className={`w-40 h-40 rounded-full border-[3px] border-dashed ${status === 'running' ? 'border-cyan-400/30 animate-[spin_8s_linear_infinite]' : 'border-white/5'}`}></div>

                    <div className="absolute text-center z-10">
                        <DigitalDisplay
                            value={mw.toFixed(1)}
                            label={name}
                            unit="MW"
                            color={unitColor as any}
                            className="!bg-transparent !border-none !p-0 scale-110 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                        />
                    </div>

                    {status === 'running' && unitColor === 'cyan' && (
                        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none animate-pulse"></div>
                    )}
                </motion.div>
            </Tooltip>

            <div className="w-6 h-20 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 mx-auto relative -z-10 shadow-2xl border-x border-white/5" />

            <div className={`
                w-40 h-24 mx-auto rounded-b-2xl border-x-[1px] border-b-[1px] flex items-center justify-center overflow-hidden transition-all duration-700 backdrop-blur-xl relative
                ${status === 'running' ? 'border-white/10 bg-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]' : 'border-white/5 bg-white/5 shadow-xl'}
                ${isVibrationCritical ? 'border-red-500/50 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : ''}
            `}>
                <div className="absolute inset-0 noise-commander opacity-10"></div>
                {status === 'running' && !isVibrationCritical && (
                    <div className="w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.1)_50%,transparent_75%)] bg-[length:32px_32px] animate-[slide_1.5s_linear_infinite]"></div>
                )}
                {isVibrationCritical && (
                    <div className="text-[10px] font-black text-red-400 animate-pulse tracking-tight px-3 py-1.5 bg-red-950/60 rounded-lg border border-red-500/30 uppercase z-10 mx-4 text-center">
                        {t('neuralFlow.physicsBreach')}
                    </div>
                )}
            </div>
        </div>
    );
});

export const NeuralFlowMap: React.FC = React.memo(() => {
    const { t } = useTranslation();
    const { selectedAsset } = useAssetContext();

    // MIGRATED: From useProjectEngine to specialized stores
    const { hydraulic, physics } = useTelemetryStore();
    const demoMode = useDemoMode();
    const { orbit, vibration } = useEngineeringMath();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [diagnosticAlerts, setDiagnosticAlerts] = useState<any[]>([]);

    // Calculate MW output from physics (with null safety)
    const surgePressure = physics?.surgePressure?.toNumber?.() ?? 0;
    const mwOutput = surgePressure ? surgePressure * 2.5 : 45.0;

    // Risk score approximation (would come from diagnosis in production)
    const riskScore = physics?.hoopStress?.toNumber?.() ?? 0 > 140 ? 30 : 10;

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, [selectedAsset]);

    // DIAGNOSTIC INTEGRITY MONITOR
    useEffect(() => {
        if (!selectedAsset || isLoading) return;

        // Reactive Diagnostic Pipeline
        const flowRate = hydraulic?.flow ?? 0;
        const headPressure = hydraulic?.head ?? 0;

        // Simplified diagnostic check (replacing connectTwinToExpertEngine)
        const alerts: any[] = [];
        if (flowRate > 50) {
            alerts.push({ message: 'Flow rate exceeds operational threshold' });
        }
        if (headPressure > 200) {
            alerts.push({ message: 'Head pressure approaching critical limit' });
        }
        setDiagnosticAlerts(alerts);

    }, [selectedAsset, isLoading, hydraulic]);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950">
                <div className="w-full max-w-4xl space-y-8 animate-pulse">
                    <div className="h-12 w-48 bg-slate-900/50 rounded-lg"></div>
                    <div className="grid grid-cols-2 gap-12">
                        <div className="h-64 bg-slate-900/50 rounded-2xl"></div>
                        <div className="h-64 bg-slate-900/50 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!selectedAsset) {
        return (
            <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center p-8">
                <div className="absolute inset-0 opacity-10 noise-commander"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/5 via-transparent to-emerald-500/5"></div>

                <div className="relative z-10 max-w-2xl text-center space-y-12 animate-fade-in">
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                        <Sparkles className="w-4 h-4 animate-pulse" /> {t('neuralFlow.intelInit')}
                    </div>
                    <div>
                        <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white mb-6 uppercase">
                            Deploy Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500 drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                                {t('neuralFlow.diagnosticTwin')}
                            </span>
                        </h1>
                        <p className="text-xl text-slate-500 max-w-xl mx-auto font-medium leading-relaxed">
                            {t('neuralFlow.heroText')}
                        </p>
                    </div>

                    <button
                        className="group relative px-10 py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] transition-all active:scale-95 overflow-hidden"
                        onClick={() => window.dispatchEvent(new CustomEvent('openAssetWizard'))}
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative z-10">{t('neuralFlow.registerAsset')}</span>
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-white/5">
                        <div className="p-8 bg-white/5 glass-panel border border-white/10 rounded-2xl hover:border-cyan-500/40 transition-all text-center group relative overflow-hidden">
                            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <Activity className="w-8 h-8 text-cyan-400 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                            <h3 className="text-white font-black uppercase tracking-tight mb-2">{t('neuralFlow.flowTitle')}</h3>
                            <p className="text-xs text-slate-500 font-medium">{t('neuralFlow.flowDesc')}</p>
                        </div>
                        <div className="p-8 bg-white/5 glass-panel border border-white/10 rounded-2xl hover:border-emerald-500/40 transition-all text-center group relative overflow-hidden">
                            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                            <h3 className="text-white font-black uppercase tracking-tight mb-2">{t('neuralFlow.integrityTitle')}</h3>
                            <p className="text-xs text-slate-500 font-medium">{t('neuralFlow.integrityDesc')}</p>
                        </div>
                        <div className="p-8 bg-white/5 glass-panel border border-white/10 rounded-2xl hover:border-indigo-500/40 transition-all text-center group relative overflow-hidden">
                            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <ZapOff className="w-8 h-8 text-indigo-400 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(99,102,241,0.4)]" />
                            <h3 className="text-white font-black uppercase tracking-tight mb-2">{t('neuralFlow.latencyTitle')}</h3>
                            <p className="text-xs text-slate-500 font-medium">{t('neuralFlow.latencyDesc')}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>

            <div className="relative z-10 w-full max-w-6xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 md:p-16 rounded-[2.5rem] backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden">
                <div className="absolute inset-0 noise-commander opacity-20"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>

                <div className="absolute top-4 left-4 sm:top-8 sm:left-8 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 z-20">
                    <div className="text-[10px] font-black text-cyan-400 tracking-[0.4em] border border-cyan-500/30 px-5 py-2.5 bg-cyan-500/5 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.1)] uppercase">
                        {t('neuralFlow.coreTwin')}
                    </div>
                </div>

                <div className={`absolute top-4 right-4 sm:top-8 sm:right-8 text-[10px] font-mono px-5 py-2.5 rounded-full backdrop-blur-xl flex items-center gap-3 border transition-all z-20 ${diagnosticAlerts.length > 0
                    ? 'text-red-400 bg-red-500/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                    }`}>
                    <motion.div
                        animate={diagnosticAlerts.length > 0 ? { scale: [1, 1.2, 1], opacity: [1, 0.5, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 1 }}
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                    </motion.div>
                    <span className="font-black uppercase tracking-widest">
                        {diagnosticAlerts.length > 0 ? t('neuralFlow.diagnosticBreach') : t('neuralFlow.integrityVerified')}
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row justify-around items-center sm:items-end pt-16 sm:pt-20 pb-10 sm:pb-16 relative gap-16 sm:gap-8">
                    <TurbineUnit
                        id="t1"
                        name="UNIT_01"
                        status="running"
                        mw={mwOutput}
                        eccentricity={orbit.eccentricity}
                        vibration={vibration.x}
                    />

                    <div className="relative flex flex-col items-center justify-center sm:mx-4">
                        <div className="w-[2px] h-40 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent"></div>

                        {/* HEALTH DELTA INDICATOR (NC-4.2 FLEET INTEL) */}
                        {demoMode.active && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute bg-slate-900/80 backdrop-blur-xl border border-amber-500/50 rounded-xl p-4 shadow-[0_0_30px_rgba(245,158,11,0.2)] z-30 min-w-[200px]"
                            >
                                <div className="text-[10px] text-amber-400 font-black uppercase tracking-widest text-center mb-1">Fleet Health Delta</div>
                                <div className="text-4xl font-black text-white text-center tracking-tighter">
                                    Δ {Math.abs(85 - (riskScore > 0 ? 100 - riskScore : 85)).toFixed(0)}%
                                </div>
                                <div className="mt-2 text-[8px] text-slate-400 font-mono text-center uppercase">
                                    Simulation vs. Nominal Baseline
                                </div>
                            </motion.div>
                        )}

                        <div className="w-[2px] h-40 bg-gradient-to-t from-transparent via-cyan-500/20 to-transparent"></div>
                    </div>

                    <TurbineUnit
                        id="t2"
                        name="UNIT_02"
                        status="running"
                        mw={mwOutput * 0.98}
                        eccentricity={orbit.eccentricity * 0.15} // UNIT_02 staying nominal
                        vibration={vibration.y * 0.2}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12">
                <DigitalDisplay value={(hydraulic?.flow ?? 0).toFixed(1)} label="NOMINAL_FLOW" unit="m³/s" color="cyan" />
                <DigitalDisplay value={(hydraulic?.head ?? 0).toFixed(0)} label="GROSS_HEAD" unit="m" color="cyan" />
                <DigitalDisplay value={orbit.eccentricity.toFixed(3)} label="ECCENTRICITY" color={orbit.eccentricity > 0.8 ? 'red' : 'cyan'} />
                <DigitalDisplay value={(vibration.x * 1000).toFixed(1)} label="VIB_X_PEAK" unit="μm" color={vibration.x > 0.05 ? 'red' : 'cyan'} />
            </div>

            <AnimatePresence>
                {(orbit.eccentricity > 0.75 || vibration.x > 0.05) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: 20, height: 0 }}
                        className="mt-6 overflow-hidden"
                    >
                        <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl shadow-[0_20px_40px_rgba(6,182,212,0.1)] relative group">
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                        <Sparkles className="w-6 h-6 animate-pulse" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black uppercase text-sm tracking-widest">{t('neuralFlow.smartInsight')}</h4>
                                        <p className="text-xs text-slate-400 font-medium max-w-md">
                                            {orbit.eccentricity > 0.75
                                                ? t('neuralFlow.eccentricityInsight')
                                                : t('neuralFlow.vibrationInsight')}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/maintenance/shaft-alignment')}
                                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2 whitespace-nowrap"
                                >
                                    {t('neuralFlow.launchAlignmentWizard')}
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {diagnosticAlerts.length > 0 && (
                <div className="mt-6 p-5 bg-red-950/30 border border-red-500/30 rounded-2xl animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                        <ZapOff className="w-5 h-5 text-red-500" />
                        <h4 className="text-red-400 font-black uppercase text-sm tracking-widest text-white">{t('neuralFlow.detectionActive')}</h4>
                    </div>
                    <div className="space-y-1">
                        {diagnosticAlerts.map((alarm, idx) => (
                            <div key={idx} className="text-red-200 text-xs font-mono pl-8">
                                {`> ${alarm.message}`}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});
