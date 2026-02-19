import React, { useEffect, useState } from 'react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { AlertTriangle, BookOpen, Zap, X, TrendingUp, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * EDUCATIONAL DIAGNOSTIC MENTOR
 * 
 * Value Gate Pass:
 * - Decision: Whether to trip unit or throttle load
 * - Process: Root Cause Analysis (RCA) training automation
 * - Result: Prevent millions in damage via operator decision support
 * 
 * This overlay automatically appears when critical faults are detected.
 * It provides:
 * 1. Alert State (what is happening)
 * 2. The Physics (why it's happening mathematically)
 * 3. Operator Guidance (exact steps to mitigate)
 * 
 * NOW with MULTILINGUAL SUPPORT - Knowledge Localization Engine!
 */

interface FaultCondition {
    id: string;
    condition: (state: any) => boolean;
}

// Fault conditions (logic only - text comes from i18n)
const FAULT_CONDITIONS: FaultCondition[] = [
    {
        id: 'THERMAL_RUNAWAY',
        condition: (state) => state.mechanical.bearingTemp > 80,
    },
    {
        id: 'WATER_HAMMER',
        condition: (state) => state.physics.surgePressureBar > 60,
    },
    {
        id: 'CAVITATION_VIBRATION',
        condition: (state) => state.mechanical.vibration > 4.5 && state.physics.eccentricity > 0.3,
    },
    {
        id: 'SEDIMENT_SURGE',
        condition: (state) => state.hydraulic.sedimentPPM > 3000,
    },
    {
        id: 'LOAD_REJECTION',
        condition: (state) => state.shaft.rpm > 550 && state.electrical.setpoint < 10,
    },
];

export const ExpertDiagnosticOverlay: React.FC = () => {
    const { t } = useTranslation();
    const state = useTelemetryStore((s) => s);
    const [activeFault, setActiveFault] = useState<string | null>(null);
    const [isDismissed, setIsDismissed] = useState(false);

    // Evaluate fault conditions and activate first detected
    useEffect(() => {
        if (isDismissed) return; // Don't reactivate if manually dismissed

        const detected = FAULT_CONDITIONS.find((f) => f.condition(state));
        if (detected) {
            setActiveFault(detected.id);
        } else {
            // Auto-dismiss when fault clears
            setActiveFault(null);
            setIsDismissed(false);
        }
    }, [state, isDismissed]);

    // ESC key listener
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && activeFault) {
                setIsDismissed(true);
                setActiveFault(null);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [activeFault]);

    if (!activeFault) return null;

    // Get translations for active fault
    const faultKey = `rcaMentor.faults.${activeFault}`;
    const title = t(`${faultKey}.title`);
    const severity = t(`${faultKey}.severity`) as 'CRITICAL' | 'WARNING';
    const physics = t(`${faultKey}.physics`);
    const sopReference = t(`${faultKey}.sopReference`);
    const guidanceSteps = [
        t(`${faultKey}.guidance.step1`),
        t(`${faultKey}.guidance.step2`),
        t(`${faultKey}.guidance.step3`),
        t(`${faultKey}.guidance.step4`),
        t(`${faultKey}.guidance.step5`),
    ];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -100 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[95vw] max-w-4xl"
                style={{ fontFamily: '"Courier New", monospace' }}
            >
                {/* Main Overlay Container */}
                <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/80 rounded-lg shadow-2xl shadow-amber-500/20 overflow-hidden">
                    {/* Header */}
                    <div className={`px-6 py-3 ${severity === 'CRITICAL' ? 'bg-red-900/60' : 'bg-yellow-800/60'} border-b border-amber-500/50`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-6 h-6 text-amber-300 animate-pulse" />
                                <div>
                                    <div className="text-amber-200 text-xs font-semibold tracking-widest uppercase">
                                        {t('rcaMentor.badge')}
                                    </div>
                                    <div className="text-white text-lg font-bold">{title}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setIsDismissed(true);
                                    setActiveFault(null);
                                }}
                                className="text-amber-300 hover:text-white transition-colors p-1 hover:bg-slate-800/50 rounded"
                                aria-label="Dismiss"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="text-xs text-amber-200/70 mt-1">{t('rcaMentor.educationBadge')}</div>
                    </div>

                    {/* Content Body */}
                    <div className="p-6 space-y-4">
                        {/* Live Metrics Bar */}
                        <div className="grid grid-cols-3 gap-4 bg-slate-800/50 p-3 rounded border border-slate-700">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-cyan-400" />
                                <span className="text-slate-400 text-xs">{t('rcaMentor.liveMetrics.bearingTemp')}:</span>
                                <span className="text-cyan-300 font-mono text-sm">{state.mechanical.bearingTemp.toFixed(1)}°C</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-purple-400" />
                                <span className="text-slate-400 text-xs">{t('rcaMentor.liveMetrics.vibration')}:</span>
                                <span className="text-purple-300 font-mono text-sm">{state.mechanical.vibration.toFixed(2)} mm/s</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-400" />
                                <span className="text-slate-400 text-xs">{t('rcaMentor.liveMetrics.rpm')}:</span>
                                <span className="text-yellow-300 font-mono text-sm">{state.mechanical.rpm.toFixed(0)}</span>
                            </div>
                        </div>

                        {/* Physics Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="w-5 h-5 text-sky-400" />
                                <h3 className="text-sky-300 font-bold text-sm tracking-wider">{t('rcaMentor.physicsTitle')}</h3>
                            </div>
                            <div className="bg-slate-900/70 p-4 rounded border border-slate-700/50">
                                <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                                    {physics}
                                </div>
                            </div>
                        </div>

                        {/* Operator Guidance */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-5 h-5 text-yellow-400" />
                                <h3 className="text-yellow-300 font-bold text-sm tracking-wider">{t('rcaMentor.guidanceTitle')}</h3>
                            </div>
                            <div className="bg-amber-950/30 p-4 rounded border border-amber-700/50">
                                <ol className="space-y-2">
                                    {guidanceSteps.map((step, idx) => (
                                        <li key={idx} className={`text-amber-50 text-sm ${step.includes('IMMEDIATE') || step.includes('ODMAH') ? 'font-bold text-red-300' : ''}`}>
                                            {step}
                                        </li>
                                    ))}
                                </ol>
                                <div className="mt-3 text-xs text-amber-300/60 italic border-t border-amber-700/30 pt-2">
                                    📖 {sopReference}
                                </div>
                            </div>
                        </div>

                        {/* Dismissal Hint */}
                        <div className="text-center text-slate-500 text-xs mt-2">
                            {t('rcaMentor.dismissHint')}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
