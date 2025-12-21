import React, { useState, useMemo } from 'react';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { GlassCard } from './ui/GlassCard.tsx';
import { ModernButton } from './ui/ModernButton.tsx';
import { BackButton } from './BackButton.tsx';

interface SOPStep {
    id: string;
    title: string;
    description: string;
    requiredTool?: string;
    verificationType: 'PHOTO' | 'VOICE' | 'VALUE';
    verificationTarget?: string; // e.g., "0.05 mm"
}

interface SOP {
    id: string;
    name: string;
    targetModule: string;
    steps: SOPStep[];
}

const SOP_DATA: SOP[] = [
    {
        id: 'oil-change',
        name: 'Oil Change Protocol',
        targetModule: 'Hydraulic Maintenance',
        steps: [
            { id: 'drain', title: 'Drain Old Oil', description: 'Open the main drain valve and wait for complete drainage.', requiredTool: 'Wrench 24mm', verificationType: 'PHOTO' },
            { id: 'filter', title: 'Filter Inspection', description: 'Remove and inspect the hydraulic filter for metal shavings.', verificationType: 'PHOTO' },
            { id: 'refill', title: 'Refill Reservoir', description: 'Fill with Shell Tellus S2 V46 until level reaches 85%.', verificationType: 'VALUE', verificationTarget: '85' }
        ]
    },
    {
        id: 'shaft-alignment',
        name: 'Shaft Alignment Guide',
        targetModule: 'Shaft Alignment',
        steps: [
            { id: 'prep', title: 'Clean Coupling', description: 'Ensure both coupling faces are free of rust and debris.', verificationType: 'PHOTO' },
            { id: 'measure', title: 'Initial Measurement', description: 'Set laser fixings and rotate 180 degrees.', verificationType: 'VALUE', verificationTarget: '0.02' },
            { id: 'tighten', title: 'Final Fastening', description: 'Tighten bolts in star pattern.', requiredTool: 'Torque Wrench M36', verificationType: 'VOICE' }
        ]
    }
];

export const SOPManager: React.FC = () => {
    const { selectedAsset } = useAssetContext();
    const { showToast } = useToast();
    const [activeSopId, setActiveSopId] = useState<string | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [verificationInput, setVerificationInput] = useState('');
    const [isStepVerified, setIsStepVerified] = useState(false);

    const activeSop = useMemo(() => SOP_DATA.find(s => s.id === activeSopId), [activeSopId]);
    const currentStep = activeSop?.steps[currentStepIndex];

    const handleVerifySOP = () => {
        if (!currentStep) return;

        // Tool Lockdown Logic (Simulated)
        if (currentStep.requiredTool && currentStep.requiredTool.includes('36')) {
            // In a real app, we would cross-ref with active tools or scanner
            // Here we simulate tool mismatch check
        }

        if (currentStep.verificationType === 'VALUE') {
            if (verificationInput === currentStep.verificationTarget) {
                setIsStepVerified(true);
                showToast('Measurement Verified', 'success');
            } else {
                showToast('Measurement mismatch! Check specs.', 'error');
            }
        } else {
            // Simulated Photo/Voice success
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
            <div className="flex justify-between items-center bg-slate-900/40 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-1">Shadow <span className="text-purple-400">Engineer</span></h2>
                    <p className="text-slate-400 text-sm font-light italic">Standard Operating Procedures (SOP) with mandatory verification.</p>
                </div>
                <BackButton text="Back to Hub" />
            </div>

            {!selectedAsset ? (
                <GlassCard className="text-center py-20 text-slate-500 uppercase font-black tracking-widest">Select an Asset to Begin</GlassCard>
            ) : !activeSopId ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {SOP_DATA.map(sop => (
                        <GlassCard key={sop.id} title={sop.name} className="hover:border-purple-500/50 cursor-pointer transition-all" onClick={() => setActiveSopId(sop.id)}>
                            <p className="text-xs text-slate-400 mb-4">{sop.targetModule}</p>
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] text-slate-600 font-mono italic">{sop.steps.length} Steps</span>
                                <ModernButton variant="ghost" className="text-purple-400">Start Protocol</ModernButton>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            ) : (
                <div className="max-w-2xl mx-auto">
                    <GlassCard className="border-l-4 border-l-purple-500 overflow-hidden">
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-xl font-black text-white uppercase">{activeSop?.name}</h3>
                                <span className="text-[10px] bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full font-bold">Step {currentStepIndex + 1} of {activeSop?.steps.length}</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full">
                                <div
                                    className="h-full bg-purple-500 transition-all duration-500"
                                    style={{ width: `${((currentStepIndex + 1) / (activeSop?.steps.length || 1)) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-lg font-bold text-white mb-2">{currentStep?.title}</h4>
                                <p className="text-sm text-slate-400 leading-relaxed">{currentStep?.description}</p>
                            </div>

                            {currentStep?.requiredTool && (
                                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                                    <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest mb-1">Required Tool</p>
                                    <p className="text-sm text-white font-mono">{currentStep.requiredTool}</p>
                                </div>
                            )}

                            <div className="pt-6 border-t border-white/5">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-4">Verification Required: {currentStep?.verificationType}</label>

                                {currentStep?.verificationType === 'VALUE' ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={verificationInput}
                                            onChange={(e) => setVerificationInput(e.target.value)}
                                            placeholder="Enter measured value..."
                                            className="flex-grow bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-white font-mono"
                                        />
                                        <ModernButton onClick={handleVerifySOP} variant="primary">Verify</ModernButton>
                                    </div>
                                ) : (
                                    <div className="flex gap-4">
                                        <ModernButton
                                            variant="ghost"
                                            className="flex-grow border-dashed border-2 border-white/10 h-24 flex flex-col items-center justify-center gap-2 hover:border-purple-500/50"
                                            onClick={handleVerifySOP}
                                        >
                                            <span className="text-2xl">📷</span>
                                            <span className="text-[10px] uppercase font-bold">Simulate Confirmation</span>
                                        </ModernButton>
                                    </div>
                                )}
                            </div>

                            <div className="pt-8 flex justify-between gap-4">
                                <ModernButton variant="ghost" onClick={() => setActiveSopId(null)}>Abundance Protocol</ModernButton>
                                <ModernButton
                                    variant="primary"
                                    className="px-12 bg-purple-600 hover:bg-purple-700"
                                    disabled={!isStepVerified}
                                    onClick={handleNextStep}
                                >
                                    {currentStepIndex === (activeSop?.steps.length || 0) - 1 ? 'Finish' : 'Next Step'}
                                </ModernButton>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};
