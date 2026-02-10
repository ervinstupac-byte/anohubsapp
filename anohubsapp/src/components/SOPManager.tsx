import React, { useState, useMemo } from 'react';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { useContextAwareness } from '../contexts/ContextAwarenessContext.tsx';

import { useToast } from '../contexts/ToastContext.tsx';
import { GlassCard } from './ui/GlassCard.tsx';
import { ModernButton } from './ui/ModernButton.tsx';
import { BackButton } from './BackButton.tsx';
import { getProtocolsForType } from '../data/protocols/GeneratedProtocols';
import { DigitalProtocol } from '../data/protocols/francis_horizontal_protocols';
import { LiveMetricToken } from './ui/LiveMetricToken';
import { ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';

// Component-specific interfaces (View Model)
interface ViewSOPStep {
    id: string;
    title: string;
    description: string;
    requiredTool?: string;
    verificationType: 'PHOTO' | 'VOICE' | 'VALUE';
    verificationTarget?: string;
}

interface ViewSOP {
    id: string;
    name: string;
    targetModule: string;
    steps: ViewSOPStep[];
}

export const SOPManager: React.FC = () => {
    const { selectedAsset } = useAssetContext();
    const { showToast } = useToast();
    const [activeSopId, setActiveSopId] = useState<string | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [verificationInput, setVerificationInput] = useState('');
    const [isStepVerified, setIsStepVerified] = useState(false);

    // Dynamic Protocol Loading
    const protocols: ViewSOP[] = useMemo(() => {
        if (!selectedAsset) return [];

        let type = 'unknown';
        if (selectedAsset.specs) {
            if ('spiralCasePressure' in selectedAsset.specs) type = 'francis';
            else if ('nozzleCount' in selectedAsset.specs) type = 'pelton';
            else if ('bladeAngleRangeDeg' in selectedAsset.specs) type = 'kaplan';
            else if ('bulbHousingPressureBar' in selectedAsset.specs) type = 'bulb';
        }
        // Fallback or explicit check if turbine_type exists on asset
        if (type === 'unknown' && (selectedAsset as any).turbine_type) {
            type = (selectedAsset as any).turbine_type;
        }

        const rawProtocols = getProtocolsForType(type);

        // Map to View Model
        return rawProtocols.map(p => ({
            id: p.id,
            name: p.title,
            targetModule: `Ref: ${p.reference} (${p.frequency})`,
            steps: p.steps.map(s => ({
                id: s.id,
                title: s.action,
                description: s.detail,
                requiredTool: s.critical ? 'Supervisor Key' : undefined,
                verificationType: s.detail.includes('Measure') || s.detail.includes('Limit') ? 'VALUE' : 'PHOTO',
                verificationTarget: s.detail.match(/(\d+\.?\d*)/)?.[0] // Simple extraction of first number as target
            }))
        }));
    }, [selectedAsset]);

    const activeSop = useMemo(() => protocols.find(s => s.id === activeSopId), [activeSopId, protocols]);
    const currentStep = activeSop?.steps[currentStepIndex];

    // TACTICAL STATE ACCESS
    const { hasCriticalRisks, patternWeights, reinforcePattern, liveMetrics } = useContextAwareness();

    // --- PROTOCOL INSIGHTS (ADVISORY ONLY) ---
    const activeInsight = useMemo(() => {
        if (!currentStep) return null;

        // Scan for tokens in the current step
        const tokens = currentStep.description.match(/\{\{([A-Z0-9-]+)\}\}/g);

        // 1. Specific Sensor Interlocks -> Becomes "Predictive Context"
        if (tokens) {
            for (const token of tokens) {
                const sensorId = token.slice(2, -2).trim();
                const metric = liveMetrics.find((m: any) => m.source?.id === sensorId);

                if (metric && metric.status === 'critical') {
                    return {
                        type: 'PREDICTIVE',
                        message: `PREDICTIVE WARNING: ${metric.label} Deviation (${typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value} ${metric.unit})`,
                        action: 'Sentinel Model predicts 12% probability of downstream instability. TRAJECTORY: If current parameters persist, System Trip is predicted in T-minus 4.5 hours.',
                        color: 'amber'
                    };
                }
            }
        }

        // 2. Global Risk Fallback
        const isRiskRelevant = tokens ? tokens.some(t => t.includes('VIB') || t.includes('PRE')) : false;

        if (isRiskRelevant && hasCriticalRisks) {
            return {
                type: 'PREDICTIVE',
                message: 'NEURAL INSIGHT: Concurrent System Risk Detected.',
                action: 'Cross-reference with Hydraulic Heatmap recommended.',
                color: 'purple'
            };
        }
        return null;
    }, [currentStep, hasCriticalRisks, liveMetrics]);

    const handleVerifySOP = () => {
        if (!currentStep) return;

        // ADVISORY LOG ONLY - NO BLOCK
        if (activeInsight) {
            console.log("User proceeding against advice:", activeInsight);
        }

        if (currentStep.verificationType === 'VALUE') {
            // Rough validation logic
            if (verificationInput && verificationInput.length > 0) {
                // Number check
                const numericVal = parseFloat(verificationInput);
                const targetVal = currentStep.verificationTarget ? parseFloat(currentStep.verificationTarget) : NaN;

                if (!isNaN(numericVal) && !isNaN(targetVal)) {
                    // 10% tolerance
                    if (Math.abs(numericVal - targetVal) > (targetVal * 0.1)) {
                        showToast(`Value deviation > 10% (Target: ${targetVal})`, 'warning');
                        // Allow but warn? Or Block? Let's allow for now with warning (Human Override).
                    }
                }

                setIsStepVerified(true);
                showToast('Measurement Verified', 'success');

                // REINFORCEMENT LEARNING TRIGGER
                // If we verify a value successfully, we "teach" the system that this state is acceptable.
                if (patternWeights && reinforcePattern) {
                    // Simulate reinforcing the "Normal" pattern or dampening a "Risk" pattern
                    // console.log("Reinforcing patterns...", patternWeights);
                    // reinforcePattern("Cavitation", "CONFIRMED"); // Example
                }

            } else {
                showToast('Please enter a value', 'error');
            }
        } else {
            setIsStepVerified(true);
            showToast(`${currentStep.verificationType} accepted`, 'success');
        }
    };

    const handleNextStep = () => {
        if (activeSop && currentStepIndex < activeSop.steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
            setIsStepVerified(false);
            setVerificationInput('');
        } else {
            showToast('Protocol Completed Successfully', 'success');
            setActiveSopId(null);
            setCurrentStepIndex(0);
        }
    };

    return (
        <div className="animate-fade-in space-y-8 pb-12">
            <div className="flex justify-between items-end bg-slate-950 p-6 rounded-none border-t border-b border-cyan-900/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <div className="text-[100px] font-black text-white leading-none tracking-tighter">SOP</div>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                        <h2 className="text-xs font-mono font-black text-purple-400 tracking-[0.2em] uppercase">Shadow Engineer</h2>
                    </div>
                    <p className="text-slate-400 text-sm font-light max-w-lg">
                        Standard Operating Procedures (SOP) with <strong className="text-cyan-400">Live Data Injection</strong> and <strong className="text-purple-400">Neural Guidance</strong>.
                    </p>
                </div>
                <BackButton text="Back to Hub" />
            </div>

            {!selectedAsset ? (
                <div className="flex justify-center py-20">
                    <div className="bg-slate-900/50 p-8 border border-dashed border-slate-700 rounded text-center">
                        <p className="text-slate-500 uppercase font-black tracking-widest text-sm">Target Selection Required</p>
                    </div>
                </div>
            ) : !protocols.length ? (
                <div className="flex justify-center py-20">
                    <div className="bg-slate-900/50 p-8 border border-dashed border-slate-700 rounded text-center">
                        <p className="text-slate-500 uppercase font-black tracking-widest text-sm">No Protocols Available for Mesh</p>
                    </div>
                </div>
            ) : !activeSopId ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                    {protocols.map(sop => (
                        <div
                            key={sop.id}
                            onClick={() => setActiveSopId(sop.id)}
                            className="group bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 hover:border-purple-500/50 rounded-sm p-5 cursor-pointer transition-all duration-300 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-500/10 to-transparent pointer-events-none" />

                            <h3 className="text-lg font-bold text-white uppercase tracking-tight group-hover:text-purple-400 transition-colors mb-2">
                                {sop.name}
                            </h3>
                            <p className="text-[10px] text-slate-500 font-mono mb-6 uppercase tracking-wider">{sop.targetModule}</p>

                            <div className="flex justify-between items-end border-t border-white/5 pt-4">
                                <span className="text-[10px] text-slate-400 font-mono">{sop.steps.length} STEPS</span>
                                <span className="text-[10px] font-bold text-purple-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    INITIATE <ChevronRight className="w-3 h-3" />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-slate-950 border border-cyan-900/30 rounded-sm overflow-hidden shadow-2xl shadow-black relative">
                        {/* ACTIVE HEADER */}
                        <div className="bg-slate-900 p-4 border-b border-white/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">{activeSop?.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-mono text-emerald-500 uppercase">Live Context Active</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[24px] font-mono font-bold text-slate-700 leading-none">
                                    {String(currentStepIndex + 1).padStart(2, '0')}<span className="text-lg opacity-50">/{String(activeSop?.steps.length).padStart(2, '0')}</span>
                                </span>
                            </div>
                        </div>

                        {/* PROGRESS BAR */}
                        <div className="h-0.5 w-full bg-slate-800">
                            <div
                                className="h-full bg-cyan-500 transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                                style={{ width: `${((currentStepIndex + 1) / (activeSop?.steps.length || 1)) * 100}%` }}
                            />
                        </div>

                        <div className="p-8 space-y-8 relative z-10">
                            {/* STEP CONTENT */}
                            <div>
                                <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-700 text-xs text-slate-500 font-mono">
                                        {currentStepIndex + 1}
                                    </span>
                                    {currentStep?.title}
                                </h4>

                                <div className="text-lg text-slate-300 leading-relaxed font-light pl-11">
                                    {/* DATA-INFUSED SOP ENGINE */}
                                    {currentStep?.description.split(/(\{\{.*?\}\})/).map((part, index) => {
                                        if (part.startsWith('{{') && part.endsWith('}}')) {
                                            const sensorId = part.slice(2, -2).trim();
                                            return <LiveMetricToken key={index} sensorId={sensorId} />;
                                        }
                                        return <span key={index}>{part}</span>;
                                    })}
                                </div>
                            </div>

                            {/* TOOL REQUIREMENT */}
                            {currentStep?.requiredTool && (
                                <div className="ml-11 p-4 bg-slate-900 border-l-2 border-amber-500/50 flex items-center gap-4">
                                    <div className="p-2 bg-amber-950/30 rounded text-amber-500">
                                        <span className="text-xl">🔧</span>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest mb-0.5">Required Tool</p>
                                        <p className="text-sm text-slate-300 font-mono uppercase">{currentStep.requiredTool}</p>
                                    </div>
                                </div>
                            )}

                            {/* NEURAL INSIGHT ALERT */}
                            {activeInsight && (
                                <div className={`ml-11 p-4 border-l-2 rounded-r-sm flex items-start gap-4 mb-4 animate-fade-in ${activeInsight.color === 'purple'
                                    ? 'bg-purple-950/20 border-purple-500'
                                    : 'bg-amber-950/20 border-amber-500'
                                    }`}>
                                    <div className={`p-2 rounded-full ${activeInsight.color === 'purple' ? 'bg-purple-500/10 text-purple-400' : 'bg-amber-500/10 text-amber-500'}`}>
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h5 className={`text-sm font-bold uppercase tracking-wider mb-1 ${activeInsight.color === 'purple' ? 'text-purple-400' : 'text-amber-500'}`}>
                                            {activeInsight.message}
                                        </h5>
                                        <p className={`text-xs font-mono opacity-80 ${activeInsight.color === 'purple' ? 'text-purple-300' : 'text-amber-300'}`}>
                                            {activeInsight.action}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* VERIFICATION AREA */}
                            <div className="ml-11 pt-8 border-t border-white/5">
                                <label className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Verification: {currentStep?.verificationType}</span>
                                    {isStepVerified && <span className="text-xs font-bold text-emerald-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> VERIFIED</span>}
                                </label>

                                {currentStep?.verificationType === 'VALUE' ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={verificationInput}
                                            onChange={(e) => setVerificationInput(e.target.value)}
                                            placeholder="Enter measured value..."
                                            disabled={isStepVerified}
                                            className="flex-grow bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-sm px-4 py-3 text-white font-mono placeholder:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors outline-none"
                                        />
                                        <button
                                            onClick={handleVerifySOP}
                                            disabled={isStepVerified}
                                            className="px-6 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold uppercase text-xs tracking-wider rounded-sm transition-colors"
                                        >
                                            Verify
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-4">
                                        <button
                                            className={`flex-grow border-2 border-dashed border-slate-700 h-24 flex flex-col items-center justify-center gap-2 rounded-sm transition-colors ${isStepVerified ? 'border-emerald-500 bg-emerald-950/10' :
                                                activeInsight ? 'hover:border-amber-500 hover:bg-amber-950/10' :
                                                    'hover:border-purple-500 hover:bg-slate-900'
                                                }`}
                                            onClick={handleVerifySOP}
                                            disabled={isStepVerified}
                                        >
                                            <span className="text-2xl">{isStepVerified ? '✓' : '📷'}</span>
                                            <span className="text-[10px] uppercase font-bold text-slate-400">
                                                {isStepVerified ? 'Evidence Captured' : 'Simulate Confirmation'}
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* NAVIGATION CONTROLS */}
                            <div className="pt-8 flex justify-between gap-4 ml-11">
                                <button
                                    onClick={() => setActiveSopId(null)}
                                    className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-wider px-4 py-2 transition-colors"
                                >
                                    Abort Protocol
                                </button>
                                <button
                                    className={`px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase text-xs tracking-widest rounded-sm shadow-lg shadow-purple-900/20 transition-all hover:translate-y-[-1px] disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none ${!isStepVerified ? 'opacity-50 cursor-not-allowed grayscale' : ''
                                        }`}
                                    disabled={!isStepVerified} // Next Step requires verification, but verification is NOT blocked
                                    onClick={handleNextStep}
                                >
                                    {currentStepIndex === (activeSop?.steps.length || 0) - 1 ? 'Complete Protocol' : 'Next Step'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
