// Legacy Validation Modal - Pre-Task Warning System
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, X, Terminal, CheckSquare, Square, ArrowLeft } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { LegacyKnowledgeService } from '../services/LegacyKnowledgeService';
import { saveLog } from '../services/PersistenceService';

export interface LegacyValidationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProceed: () => void;
    turbineFamily: string;
    component: string;
    taskDescription: string;
}

export const LegacyValidationModal: React.FC<LegacyValidationModalProps> = ({
    isOpen,
    onClose,
    onProceed,
    turbineFamily,
    component,
    taskDescription
}) => {
    const [checklistStatus, setChecklistStatus] = useState<Map<number, boolean>>(new Map());
    const [canProceed, setCanProceed] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1); // Keyboard focus

    const validation = LegacyKnowledgeService.getValidationChecklist(turbineFamily, component);
    const relatedTips = LegacyKnowledgeService.getTipsForProcedure(component, turbineFamily);

    // NC-Upgrade: Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen || !validation) return;
            const maxIndex = validation.checklistBefore.length - 1;

            if (e.key === 'ArrowDown') {
                setFocusedIndex(prev => Math.min(prev + 1, maxIndex));
            } else if (e.key === 'ArrowUp') {
                setFocusedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === ' ') {
                e.preventDefault();
                if (focusedIndex >= 0) toggleChecklistItem(focusedIndex);
            } else if (e.key === 'Enter') {
                if (canProceed) handleProceed();
            } else if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, validation, focusedIndex, canProceed]);

    useEffect(() => {
        if (validation) {
            // Initialize checklist
            const newStatus = new Map();
            validation.checklistBefore.forEach((_, index) => {
                newStatus.set(index, false);
            });
            setChecklistStatus(newStatus);
            setCanProceed(false);
            setFocusedIndex(0); // Auto-focus first item
        }
    }, [validation]);

    const toggleChecklistItem = (index: number) => {
        const newStatus = new Map(checklistStatus);
        newStatus.set(index, !newStatus.get(index));
        setChecklistStatus(newStatus);
        setFocusedIndex(index); // Focus clicked item

        // Check if all items are checked
        const allChecked = Array.from(newStatus.values()).every(val => val);
        setCanProceed(allChecked);
    };

    const handleProceed = () => {
        if (canProceed) {
            // NC-25100: Log validation confirmation
            saveLog({
                event_type: 'LEGACY_VALIDATION_CONFIRMED',
                reason: `User validated ${turbineFamily} ${component} protocol`,
                active_protection: 'NONE',
                details: {
                    component,
                    turbineFamily,
                    taskDescription,
                    checklistCompleted: true
                }
            });
            onProceed();
        }
    };

    if (!validation && relatedTips.length === 0) {
        // No legacy knowledge for this task - proceed directly
        useEffect(() => {
            if (isOpen) {
                onProceed();
            }
        }, [isOpen]);
        return null;
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <GlassCard className="p-0 border-2 border-amber-500/50 bg-slate-950 overflow-hidden shadow-none rounded-none">
                            {/* Terminal Header */}
                            <div className="flex items-center justify-between p-4 bg-amber-500/10 border-b border-amber-500/30">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={onClose}
                                        className="p-1.5 hover:bg-amber-500/20 rounded-none text-amber-600 hover:text-amber-400 transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </button>
                                    <div className="p-2 bg-amber-500/20 rounded-none border border-amber-500/30">
                                        <Terminal className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-mono font-bold text-amber-400 uppercase tracking-widest">
                                            Legacy_Validation_Protocol_v3.2
                                        </h2>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-amber-500/20 rounded-none transition-colors text-amber-500/50 hover:text-amber-400"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Task Info Block */}
                                <div className="p-4 bg-slate-900/80 border border-slate-700 font-mono text-sm relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50" />
                                    <div className="grid grid-cols-[120px_1fr] gap-2">
                                        <span className="text-slate-500 uppercase">Target_Task:</span>
                                        <span className="text-white font-bold">{taskDescription}</span>

                                        <span className="text-slate-500 uppercase">Turbine_ID:</span>
                                        <span className="text-purple-400">{turbineFamily}</span>

                                        <span className="text-slate-500 uppercase">Component:</span>
                                        <span className="text-cyan-400">{component}</span>
                                    </div>
                                </div>

                                {validation && (
                                    <>
                                        {/* Validation Info */}
                                        <div className={`mb-6 p-4 rounded-none border-2 ${validation.riskLevel === 'HIGH' ? 'border-red-500 bg-red-950/20' :
                                            validation.riskLevel === 'MEDIUM' ? 'border-amber-500 bg-amber-950/20' :
                                                'border-blue-500 bg-blue-950/20'
                                            }`}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <AlertTriangle className={`w-5 h-5 ${validation.riskLevel === 'HIGH' ? 'text-red-400' :
                                                    validation.riskLevel === 'MEDIUM' ? 'text-amber-400' :
                                                        'text-blue-400'
                                                    }`} />
                                                <span className={`text-sm font-black uppercase ${validation.riskLevel === 'HIGH' ? 'text-red-400' :
                                                    validation.riskLevel === 'MEDIUM' ? 'text-amber-400' :
                                                        'text-blue-400'
                                                    }`}>
                                                    {validation.riskLevel} RISK - Legacy ID: {validation.caseId}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Pre-Task Checklist */}
                                        <div className="mb-6">
                                            <h3 className="text-sm font-mono font-bold text-emerald-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                                <span className="animate-pulse">_</span>
                                                Pre_Flight_Checklist:
                                            </h3>
                                            <div className="space-y-2">
                                                {validation.checklistBefore.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        onClick={() => toggleChecklistItem(index)}
                                                        className={`
                                                        group flex items-start gap-3 p-3 rounded-none cursor-pointer border transition-all font-mono text-xs relative
                                                        ${checklistStatus.get(index)
                                                                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                                                                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-800'}
                                                        ${focusedIndex === index ? 'ring-1 ring-amber-500/50 ring-inset bg-amber-500/5' : ''}
                                                    `}
                                                    >
                                                        {focusedIndex === index && (
                                                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500" />
                                                        )}
                                                        <div className={`mt-0.5 ${checklistStatus.get(index) ? 'text-emerald-500' : 'text-slate-600 group-hover:text-slate-400'}`}>
                                                            {checklistStatus.get(index) ? (
                                                                <CheckSquare className="w-4 h-4" />
                                                            ) : (
                                                                <Square className="w-4 h-4" />
                                                            )}
                                                        </div>
                                                        <span className="leading-relaxed pt-0.5">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Common Mistakes */}
                                        {validation.commonMistakes.length > 0 && (
                                            <div className="mb-6">
                                                <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2">
                                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                                    Uobičajene greške (NE PONAVLJAJ):
                                                </h3>
                                                <div className="space-y-2">
                                                    {validation.commonMistakes.map((mistake, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex gap-3 p-3 bg-red-950/20 border border-red-500/30 rounded-none"
                                                        >
                                                            <span className="text-red-400 font-bold">❌</span>
                                                            <p className="text-sm text-slate-300">{mistake}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Old School Tips */}
                                {relatedTips.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2">
                                            💡 Stara-škola savjeti:
                                        </h3>
                                        <div className="space-y-2">
                                            {relatedTips.map(tip => (
                                                <div
                                                    key={tip.id}
                                                    className={`p-3 rounded-none border ${tip.criticality === 'MUST_FOLLOW'
                                                        ? 'border-red-500 bg-red-950/20'
                                                        : 'border-purple-500 bg-purple-950/20'
                                                        }`}
                                                >
                                                    <p className={`text-xs font-bold uppercase mb-1 ${tip.criticality === 'MUST_FOLLOW' ? 'text-red-400' : 'text-purple-400'
                                                        }`}>
                                                        {tip.criticality.replace('_', ' ')}
                                                    </p>
                                                    <p className="text-sm text-white font-bold mb-1">{tip.tip}</p>
                                                    <p className="text-xs text-slate-400">{tip.rationale}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Progress Indicator */}
                                {validation && (
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-slate-400 uppercase font-bold">
                                                Checklist Progress
                                            </span>
                                            <span className="text-xs text-white font-bold">
                                                {Array.from(checklistStatus.values()).filter(v => v).length} / {checklistStatus.size}
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-800 rounded-none overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${(Array.from(checklistStatus.values()).filter(v => v).length / checklistStatus.size) * 100}%`
                                                }}
                                                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4 border-t border-slate-800">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={onClose}
                                        className="flex-1 px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-none text-slate-400 font-mono text-xs uppercase tracking-wider hover:bg-slate-800 hover:text-white transition-all"
                                    >
                                        [ ABORT_SEQUENCE ]
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: canProceed ? 1.02 : 1 }}
                                        whileTap={{ scale: canProceed ? 0.98 : 1 }}
                                        onClick={handleProceed}
                                        disabled={!canProceed && !!validation}
                                        className={`flex-1 px-6 py-3 rounded-none font-mono text-xs uppercase tracking-wider transition-all border ${canProceed || !validation
                                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 hover:bg-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                                            : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                                            }`}
                                    >
                                        {canProceed || !validation ? '[ EXECUTE_TASK ]' : '[ AWAITING_VALIDATION ]'}
                                    </motion.button>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
