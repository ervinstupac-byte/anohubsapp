// Legacy Validation Modal - Pre-Task Warning System
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { LegacyKnowledgeService } from '../services/LegacyKnowledgeService';

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

    const validation = LegacyKnowledgeService.getValidationChecklist(turbineFamily, component);
    const relatedTips = LegacyKnowledgeService.getTipsForProcedure(component, turbineFamily);

    useEffect(() => {
        if (validation) {
            // Initialize checklist
            const newStatus = new Map();
            validation.checklistBefore.forEach((_, index) => {
                newStatus.set(index, false);
            });
            setChecklistStatus(newStatus);
            setCanProceed(false);
        }
    }, [validation]);

    const toggleChecklistItem = (index: number) => {
        const newStatus = new Map(checklistStatus);
        newStatus.set(index, !newStatus.get(index));
        setChecklistStatus(newStatus);

        // Check if all items are checked
        const allChecked = Array.from(newStatus.values()).every(val => val);
        setCanProceed(allChecked);
    };

    const handleProceed = () => {
        if (canProceed) {
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
                        <GlassCard className="p-6 border-2 border-amber-500 bg-amber-950/20">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-8 h-8 text-amber-400" />
                                    <div>
                                        <h2 className="text-2xl font-black text-white">Legacy Validation</h2>
                                        <p className="text-sm text-amber-300">
                                            Postoji zabilježen specifičan rizik za ovaj tip turbine
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Task Info */}
                            <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Zadatak</p>
                                <p className="text-sm text-white font-bold mb-2">{taskDescription}</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs text-slate-400">Turbina</p>
                                        <p className="text-sm text-purple-400 font-bold uppercase">{turbineFamily}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">Komponenta</p>
                                        <p className="text-sm text-cyan-400 font-bold">{component}</p>
                                    </div>
                                </div>
                            </div>

                            {validation && (
                                <>
                                    {/* Validation Info */}
                                    <div className={`mb-6 p-4 rounded-lg border-2 ${validation.riskLevel === 'HIGH' ? 'border-red-500 bg-red-950/20' :
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
                                        <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                                            Provjeri PRIJE početka:
                                        </h3>
                                        <div className="space-y-2">
                                            {validation.checklistBefore.map((item, index) => (
                                                <label
                                                    key={index}
                                                    className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${checklistStatus.get(index)
                                                        ? 'border-emerald-500 bg-emerald-950/20'
                                                        : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checklistStatus.get(index) || false}
                                                        onChange={() => toggleChecklistItem(index)}
                                                        className="mt-0.5 w-5 h-5 rounded border-slate-600"
                                                    />
                                                    <span className="text-sm text-slate-300">{item}</span>
                                                </label>
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
                                                        className="flex gap-3 p-3 bg-red-950/20 border border-red-500/30 rounded-lg"
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
                                                className={`p-3 rounded-lg border ${tip.criticality === 'MUST_FOLLOW'
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
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
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
                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 bg-slate-700 rounded-lg font-bold text-white hover:bg-slate-600 transition-colors"
                                >
                                    Odustani
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: canProceed ? 1.02 : 1 }}
                                    whileTap={{ scale: canProceed ? 0.98 : 1 }}
                                    onClick={handleProceed}
                                    disabled={!canProceed && !!validation}
                                    className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${canProceed || !validation
                                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-emerald-500/50'
                                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        }`}
                                >
                                    {canProceed || !validation ? 'Nastavi sa zadatkom ✓' : 'Potvrdi sve stavke'}
                                </motion.button>
                            </div>
                        </GlassCard>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
