// Commissioning Wizard - Main Orchestrator Component
// Guides engineer through 5-step commissioning process

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, Play, Save, AlertCircle } from 'lucide-react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { BaselineFingerprintWizard } from './BaselineFingerprintWizard';
import { AlignmentWizard } from './AlignmentWizard';
import { HydroStaticTestMonitor } from './HydroStaticTestMonitor';
import { PeltonJetVisualizer } from './PeltonJetVisualizer';
import { SpecialMeasurementPanel } from './SpecialMeasurementPanel';
import { CommissioningService, CommissioningSession } from '../services/CommissioningService';
import { EnhancedAsset } from '../models/turbine/types';

interface CommissioningWizardProps {
    asset: EnhancedAsset;
    onComplete: (session: CommissioningSession) => void;
}

type CommissioningStep = 'BASELINE' | 'ALIGNMENT' | 'HYDRO_TEST' | 'JET_SYNC' | 'SPECIAL_MEASUREMENTS';

export const CommissioningWizard: React.FC<CommissioningWizardProps> = ({ asset, onComplete }) => {
    const [session, setSession] = useState<CommissioningSession | null>(null);
    const [currentStep, setCurrentStep] = useState<CommissioningStep>('BASELINE');
    const [completedSteps, setCompletedSteps] = useState<Set<CommissioningStep>>(new Set());

    const steps: Array<{
        id: CommissioningStep;
        label: string;
        description: string;
        required: boolean;
    }> = [
            {
                id: 'BASELINE',
                label: 'Baseline Fingerprinting',
                description: 'Record healthy state at 5 load levels',
                required: true
            },
            {
                id: 'ALIGNMENT',
                label: 'Shaft Alignment',
                description: '0.05 mm/m standard verification',
                required: true
            },
            {
                id: 'HYDRO_TEST',
                label: 'Hydro-Static Test',
                description: 'Pressure drop analysis',
                required: false
            },
            {
                id: 'JET_SYNC',
                label: 'Pelton Jet Sync',
                description: 'Multi-nozzle balance (Pelton only)',
                required: asset.turbine_family === 'PELTON'
            },
            {
                id: 'SPECIAL_MEASUREMENTS',
                label: 'Special Measurements',
                description: 'Laser tracker geometry import',
                required: false
            }
        ];

    const startCommissioning = async () => {
        const newSession = await CommissioningService.startCommissioning(
            Number(asset.id),
            asset.name,
            asset.turbine_family
        );
        setSession(newSession);
    };

    const completeStep = (step: CommissioningStep) => {
        setCompletedSteps(prev => new Set([...prev, step]));
    };

    const allRequiredComplete = steps
        .filter(s => s.required)
        .every(s => completedSteps.has(s.id));

    const handleFinish = async () => {
        if (!session) return;

        const completedSession = await CommissioningService.completeCommissioning(session.id);
        onComplete(completedSession);
    };

    if (!session) {
        return (
            <GlassCard className="max-w-4xl mx-auto text-center py-12">
                <div className="mb-6">
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
                        <span className="text-white">Commissioning</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 ml-2">
                            Mode
                        </span>
                    </h2>
                    <p className="text-sm text-slate-400">
                        Initial machine pairing and baseline recording for {asset.name}
                    </p>
                </div>

                <div className="mb-8 p-6 bg-cyan-950/20 border border-cyan-500/30 rounded-lg">
                    <p className="text-slate-300 mb-4">
                        This wizard will guide you through recording the "healthy state" of your turbine.
                        Required measurements:
                    </p>
                    <ul className="text-sm text-slate-400 space-y-1">
                        <li>✅ Baseline fingerprints at 0%, 25%, 50%, 75%, 100% load</li>
                        <li>✅ Shaft alignment verification (0.05 mm/m standard)</li>
                        {asset.turbine_family === 'PELTON' && <li>✅ Multi-nozzle jet balance</li>}
                        <li>📋 Optional: Hydro-static test, special measurements</li>
                    </ul>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startCommissioning}
                    className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-black uppercase text-white flex items-center gap-2 mx-auto hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                >
                    <Play className="w-5 h-5" />
                    Start Commissioning
                </motion.button>
            </GlassCard>
        );
    }

    return (
        <div className="space-y-6">
            {/* Progress Header */}
            <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-white">
                            Commissioning in Progress
                        </h3>
                        <p className="text-sm text-slate-400">Session: {session.id}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Progress</p>
                        <p className="text-3xl font-black text-cyan-400">
                            {completedSteps.size}/{steps.filter(s => s.required).length}
                        </p>
                    </div>
                </div>

                {/* Step Progress Bar */}
                <div className="grid grid-cols-5 gap-2">
                    {steps.map((step) => (
                        <StepIndicator
                            key={step.id}
                            label={step.label}
                            completed={completedSteps.has(step.id)}
                            active={currentStep === step.id}
                            required={step.required}
                            onClick={() => setCurrentStep(step.id)}
                        />
                    ))}
                </div>
            </GlassCard>

            {/* Step Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                >
                    {currentStep === 'BASELINE' && (
                        <BaselineFingerprintWizard
                            sessionId={session.id}
                            asset={asset}
                            onComplete={() => completeStep('BASELINE')}
                        />
                    )}

                    {currentStep === 'ALIGNMENT' && (
                        <AlignmentWizard
                            sessionId={session.id}
                            onComplete={() => completeStep('ALIGNMENT')}
                        />
                    )}

                    {currentStep === 'HYDRO_TEST' && (
                        <HydroStaticTestMonitor
                            sessionId={session.id}
                            onComplete={() => completeStep('HYDRO_TEST')}
                        />
                    )}

                    {currentStep === 'JET_SYNC' && asset.turbine_family === 'PELTON' && (
                        <PeltonJetVisualizer
                            sessionId={session.id}
                            onComplete={() => completeStep('JET_SYNC')}
                        />
                    )}

                    {currentStep === 'SPECIAL_MEASUREMENTS' && (
                        <SpecialMeasurementPanel
                            sessionId={session.id}
                            asset={asset}
                            onComplete={() => completeStep('SPECIAL_MEASUREMENTS')}
                        />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Finish Button */}
            {allRequiredComplete && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleFinish}
                        className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg font-black uppercase text-white flex items-center gap-2 hover:shadow-lg hover:shadow-emerald-500/50 transition-all"
                    >
                        <Save className="w-5 h-5" />
                        Complete Commissioning
                    </motion.button>
                </motion.div>
            )}
        </div>
    );
};

// ===== HELPER COMPONENTS =====

const StepIndicator: React.FC<{
    label: string;
    completed: boolean;
    active: boolean;
    required: boolean;
    onClick: () => void;
}> = ({ label, completed, active, required, onClick }) => {
    const Icon = completed ? CheckCircle : Circle;

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`p-3 rounded-lg border-2 transition-all ${active
                ? 'bg-cyan-500/20 border-cyan-500'
                : completed
                    ? 'bg-emerald-500/20 border-emerald-500'
                    : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                }`}
        >
            <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${completed ? 'text-emerald-400' : active ? 'text-cyan-400' : 'text-slate-500'
                    }`} />
                {required && !completed && (
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                )}
            </div>
            <p className={`text-xs font-bold ${active ? 'text-white' : completed ? 'text-emerald-300' : 'text-slate-400'
                }`}>
                {label}
            </p>
        </motion.button>
    );
};
