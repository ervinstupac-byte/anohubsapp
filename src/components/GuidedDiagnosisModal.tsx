import React, { useState } from 'react';
import { useDiagnostic, IntuitionQuery } from '../contexts/DiagnosticContext.tsx';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, SkipForward, CheckCircle2, History, RotateCcw } from 'lucide-react';
import { saveLog } from '../services/PersistenceService';

interface GuidedDiagnosisModalProps {
    query: IntuitionQuery;
}

export const GuidedDiagnosisModal: React.FC<GuidedDiagnosisModalProps> = ({ query }) => {
    const { submitQueryResponse, clearQuery } = useDiagnostic();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    // Simulated history for visual enhancement
    const historySteps = [
        { id: '1', label: 'Vibration Analysis', status: 'completed' },
        { id: '2', label: 'Thermal Check', status: 'completed' },
        { id: '3', label: 'Root Cause', status: 'current' }
    ];

    const handleOptionSelect = async (value: string) => {
        setSelectedOption(value);
        setIsSubmitting(true);
        
        // NC-25100: Log diagnosis step
        saveLog({
            event_type: 'DIAGNOSIS_STEP_SELECTED',
            reason: `User selected option: ${value}`,
            active_protection: 'NONE',
            details: {
                query: query.query,
                selection: value,
                timestamp: Date.now()
            }
        });

        // Simulate thinking time for better UX
        setTimeout(() => {
            submitQueryResponse(value);
            setIsSubmitting(false);
            setSelectedOption(null);
        }, 800);
    };

    return (
        <AnimatePresence mode="wait">
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-lg"
                >
                    <GlassCard className="w-full border-indigo-500/30 overflow-hidden relative shadow-none rounded-none">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-500 animate-pulse" />

                        {/* Session History Header */}
                        <div className="px-6 py-3 bg-indigo-950/30 border-b border-indigo-500/10 flex items-center gap-2 overflow-x-auto">
                            <History className="w-3 h-3 text-indigo-400 shrink-0" />
                            {historySteps.map((step, idx) => (
                                <React.Fragment key={step.id}>
                                    <span className={`text-[10px] font-mono whitespace-nowrap ${step.status === 'current' ? 'text-white font-bold' : 'text-slate-500'}`}>
                                        {step.label}
                                    </span>
                                    {idx < historySteps.length - 1 && <span className="text-slate-700 text-[10px]">/</span>}
                                </React.Fragment>
                            ))}
                        </div>

                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-none bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shrink-0 relative">
                                    <Brain className="w-6 h-6 text-indigo-400" />
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-none bg-slate-900 border border-slate-700 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-none bg-emerald-500 animate-pulse" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1">Intuition Engine v4.2</p>
                                    <h3 className="text-white font-bold text-lg leading-tight">Guided Field Diagnosis</h3>
                                </div>
                            </div>

                            <div className="mb-8">
                                <motion.div 
                                    key={query.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-lg text-slate-200 font-medium leading-relaxed border-l-4 border-indigo-500/50 pl-4 py-3 bg-slate-900 rounded-none"
                                >
                                    "{query.query}"
                                </motion.div>
                            </div>

                            <div className="space-y-3">
                                {query.options.map((opt, idx) => (
                                    <motion.button
                                        key={opt.value}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => handleOptionSelect(opt.value)}
                                        disabled={isSubmitting}
                                        className={`
                                            w-full p-4 rounded-none border transition-all text-left group relative overflow-hidden
                                            ${selectedOption === opt.value 
                                                ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-none' 
                                                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-indigo-500/30 text-slate-300 hover:text-white'}
                                            ${isSubmitting && selectedOption !== opt.value ? 'opacity-50 cursor-not-allowed' : ''}
                                        `}
                                    >
                                        <div className="flex justify-between items-center relative z-10">
                                            <span className="text-sm font-bold uppercase tracking-wider">{opt.label}</span>
                                            {selectedOption === opt.value ? (
                                                <div className="w-6 h-6 rounded-none bg-indigo-500 flex items-center justify-center">
                                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                                </div>
                                            ) : (
                                                <ArrowRight className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                            )}
                                        </div>
                                        {selectedOption === opt.value && (
                                            <motion.div
                                                layoutId="highlight"
                                                className="absolute inset-0 bg-indigo-500/10"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                            />
                                        )}
                                    </motion.button>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-between items-center pt-4 border-t border-white/5">
                                <button className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase hover:text-white transition-colors">
                                    <RotateCcw className="w-3 h-3" />
                                    Restart Sequence
                                </button>
                                <button
                                    onClick={clearQuery}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest hover:text-amber-400 transition-colors disabled:opacity-50"
                                >
                                    <SkipForward className="w-3 h-3" />
                                    Skip / Diagnostic Incomplete
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
