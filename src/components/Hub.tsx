import React, { Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuestionnaire } from '../contexts/QuestionnaireContext.tsx';
import { AlarmBar } from './diagnostic-twin/AlarmBar.tsx';
import { useDiagnostic } from '../contexts/DiagnosticContext.tsx';
// import { ExpertDiagnosticPanel } from './ExpertDiagnosticPanel.tsx'; // REMOVED: simulation feature
import { ModernButton } from './ui/ModernButton.tsx';

// --- PERFORMANCE: CODE SPLITTING ---
// We load heavy modules lazily to ensure a lightning-fast "Command Center" initial load.
const GlobalMap = lazy(() => import('./GlobalMap.tsx').then(m => ({ default: m.GlobalMap })));
const NeuralFlowMap = lazy(() => import('./diagnostic-twin/NeuralFlowMap.tsx').then(m => ({ default: m.NeuralFlowMap })));
const IncidentSimulator = lazy(() => import('./IncidentSimulator.tsx').then(m => ({ default: m.IncidentSimulator })));

export const Hub: React.FC = () => {
    const { answers } = useQuestionnaire();
    const location = useLocation();
    const showMap = location.pathname === '/map';
    const { activeDiagnoses } = useDiagnostic();
    const criticalDiagnosis = activeDiagnoses.find(d => d.diagnosis?.severity === 'CRITICAL');

    return (
        <div className="w-full h-full flex flex-col relative overflow-hidden bg-slate-950">
            {/* EMERGENCY SHUTDOWN HUD */}
            {criticalDiagnosis && (
                <div className="absolute top-0 left-0 w-full z-[150] animate-pulse bg-red-600/20 border-b border-red-500/50 backdrop-blur-xl p-4 flex flex-col items-center">
                    <div className="flex items-center gap-4 mb-3">
                        <span className="text-red-500 text-2xl animate-ping">⚠️</span>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">CRITICAL RISK DETECTED: {criticalDiagnosis.diagnosis?.diagnosis}</h2>
                    </div>
                    <div className="flex gap-4">
                        {[
                            '1. INITIATE EMERGENCY SHUTDOWN',
                            '2. ENGAGE MECHANICAL BRAKES',
                            '3. ISOLATE HYDRAULIC POWER UNIT'
                        ].map((step, i) => (
                            <div key={i} className="px-4 py-2 bg-black/60 border border-red-500/30 rounded-lg text-[10px] font-bold text-red-400 uppercase">
                                {step}
                            </div>
                        ))}
                    </div>
                    <ModernButton
                        variant="primary"
                        className="mt-4 bg-red-600 hover:bg-red-700 h-10 border-none shadow-[0_0_30px_rgba(220,38,38,0.4)]"
                        onClick={() => alert('EMERGENCY PROCEDURES INITIATED')}
                    >
                        EXECUTE TOTAL SHUTDOWN
                    </ModernButton>
                </div>
            )}

            {/* Simulation Overlay - Lazy Loaded */}
            <Suspense fallback={null}>
                <IncidentSimulator />
            </Suspense>

            {/* DIAGNOSTIC OVERLAY REMOVED - simulation feature */}

            {/* BOTTOM: Process Mimic / Map - Lazy Loaded */}
            <div className="flex-1 relative overflow-hidden">
                <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center bg-slate-950">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                            <p className="text-cyan-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">Initializing Neural Link...</p>
                        </div>
                    </div>
                }>
                    {showMap ? <GlobalMap /> : <NeuralFlowMap />}
                </Suspense>
            </div>

            {/* BOTTOM: Alarm Bar */}
            <AlarmBar answers={answers} />
        </div>
    );
};
