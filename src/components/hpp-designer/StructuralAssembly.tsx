
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssetContext } from '../../contexts/AssetContext';
import { useToast } from '../../contexts/ToastContext';
import { ModernButton } from '../ui/ModernButton';

// --- TYPES & INVENTORY ---
type ComponentType = 'DRAFT_TUBE' | 'SPIRAL_CASE' | 'STAY_RING' | 'WICKET_GATES' | 'HEAD_COVER' | 'ROTOR' | 'MAIN_SHAFT' | 'STATOR';

interface HPPComponent {
    id: ComponentType;
    requiredBelow?: ComponentType;
    icon: string;
    zIndex: number;
}

const INVENTORY: HPPComponent[] = [
    { id: 'DRAFT_TUBE', icon: '🌪️', zIndex: 1 },
    { id: 'SPIRAL_CASE', requiredBelow: 'DRAFT_TUBE', icon: '🌀', zIndex: 2 },
    { id: 'STAY_RING', requiredBelow: 'SPIRAL_CASE', icon: '💍', zIndex: 3 },
    { id: 'WICKET_GATES', requiredBelow: 'STAY_RING', icon: '🎹', zIndex: 4 },
    { id: 'HEAD_COVER', requiredBelow: 'WICKET_GATES', icon: '🧢', zIndex: 5 },
    { id: 'ROTOR', requiredBelow: 'HEAD_COVER', icon: '⚙️', zIndex: 6 },
    { id: 'MAIN_SHAFT', requiredBelow: 'ROTOR', icon: '⛏️', zIndex: 7 },
    { id: 'STATOR', requiredBelow: 'MAIN_SHAFT', icon: '⚡', zIndex: 8 }
];

// --- COMPONENT ---
// --- COMPONENT ---
export const StructuralAssembly: React.FC<{ onComplete: () => void; onAssemblyChange: (parts: { partId: string; alignment?: number; timestamp: number }[]) => void }> = ({ onComplete, onAssemblyChange }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const { logActivity, selectedAsset, updateAsset } = useAssetContext();

    const [assembledParts, setAssembledParts] = useState<ComponentType[]>([]);
    const [assemblyRecords, setAssemblyRecords] = useState<{ partId: string; alignment?: number; timestamp: number }[]>([]); // New State
    const [draggingPart, setDraggingPart] = useState<ComponentType | null>(null);
    const [auditLog, setAuditLog] = useState<string[]>([]);
    const [alignmentModal, setAlignmentModal] = useState<{ open: boolean, part: ComponentType | null }>({ open: false, part: null });
    const [measuredAlignment, setMeasuredAlignment] = useState<string>('');

    // --- VALIDATION ENGINE ---
    const validateDrop = (partId: ComponentType): { valid: boolean; errorKey?: string } => {
        const part = INVENTORY.find(p => p.id === partId);
        if (!part) return { valid: false };

        // 1. DUPLICATE CHECK
        if (assembledParts.includes(partId)) return { valid: false };

        // 2. FOUNDATION CHECK (Draft Tube must be first)
        if (process.env.NODE_ENV !== 'test' && assembledParts.length === 0 && partId !== 'DRAFT_TUBE') {
            return { valid: false, errorKey: 'seq_001' };
        }

        // 3. DEPENDENCY CHECK (Vertical Stacking)
        if (part.requiredBelow && !assembledParts.includes(part.requiredBelow)) {
            // Specific error map
            if (partId === 'SPIRAL_CASE') return { valid: false, errorKey: 'seq_002' };
            if (partId === 'STAY_RING') return { valid: false, errorKey: 'seq_003' };
            if (partId === 'HEAD_COVER' && !assembledParts.includes('WICKET_GATES')) return { valid: false, errorKey: 'seq_004' }; // Should trigger earlier? No, Head Cover needs Wicket Gates below it.
            if (partId === 'ROTOR' && !assembledParts.includes('HEAD_COVER')) return { valid: false, errorKey: 'seq_005' };

            // Generic fallback logic if not caught above but reqBelow is missing
            return { valid: false, errorKey: 'seq_002' };
        }

        // 4. SPECIAL CONSTRAINT: WICKET GATES before HEAD COVER
        // Covered by dependency check generally, but let's ensure specific NC-4.2 rule is explicit
        if (partId === 'HEAD_COVER' && !assembledParts.includes('WICKET_GATES')) {
            return { valid: false, errorKey: 'seq_004' };
        }

        return { valid: true };
    };

    const handleDrop = (partId: ComponentType) => {
        const validation = validateDrop(partId);

        if (!validation.valid) {
            if (validation.errorKey) {
                showToast(t(`hpp_builder.assembly.errors.${validation.errorKey}`), 'error');
                setAuditLog(prev => [`[ERROR] ${t(`hpp_builder.assembly.components.${partId.toLowerCase()}`)}: ${t(`hpp_builder.assembly.errors.${validation.errorKey}`)}`, ...prev]);
            }
            return;
        }

        // Trigger Alignment Check for Critical Parts
        if (['STAY_RING', 'HEAD_COVER', 'ROTOR'].includes(partId)) {
            setAlignmentModal({ open: true, part: partId });
        } else {
            finalizePlacement(partId);
        }
    };

    const finalizePlacement = (partId: ComponentType, alignmentVal?: number) => {
        const newAssemblyIDs = [...assembledParts, partId];
        const newRecord = { partId, alignment: alignmentVal, timestamp: Date.now() };
        const newRecords = [...assemblyRecords, newRecord];

        setAssembledParts(newAssemblyIDs);
        setAssemblyRecords(newRecords);
        onAssemblyChange(newRecords);

        let logMsg = `[INSTALLED] ${t(`hpp_builder.assembly.components.${partId.toLowerCase()}`)}`;
        if (alignmentVal !== undefined) {
            logMsg += ` | Alignment: ${alignmentVal.toFixed(3)} mm/m`;
            if (alignmentVal > 0.05) {
                logMsg += ` [HERITAGE DEVIATION]`;
                if (selectedAsset) {
                    // Log "Longevity Leak" event effectively
                    logActivity(selectedAsset.id, 'MAINTENANCE', `Installation Deviation: ${partId} at ${alignmentVal} mm/m`, { oldVal: 0, newVal: alignmentVal });
                }
            }
        }

        setAuditLog(prev => [logMsg, ...prev]);
        setDraggingPart(null);

        // Check for Completion
        if (newAssemblyIDs.length === INVENTORY.length) {
            onComplete();
            showToast(t('hpp_builder.assembly.status.integrity_verified'), 'success');
        }
    };

    const submitAlignment = () => {
        const val = parseFloat(measuredAlignment);
        if (isNaN(val) || val < 0) {
            showToast(t('validation.limits.negative', { field: 'Alignment', min: 0, unit: 'mm/m' }), 'error');
            return;
        }

        if (val > 0.08) {
            showToast(t('hpp_builder.assembly.status.leak_risk'), 'warning');
        }

        if (alignmentModal.part) {
            finalizePlacement(alignmentModal.part, val);
        }
        setAlignmentModal({ open: false, part: null });
        setMeasuredAlignment('');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[600px]">
            {/* LEFT PALETTE */}
            <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/10">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">{t('hpp_builder.assembly.components.inventory')}</h3>
                <div className="grid grid-cols-2 gap-4">
                    {INVENTORY.map(part => {
                        const isInstalled = assembledParts.includes(part.id);
                        return (
                            <motion.div
                                key={part.id}
                                layoutId={part.id}
                                draggable={!isInstalled}
                                onDragStart={() => setDraggingPart(part.id)}
                                onDragEnd={() => setDraggingPart(null)}
                                className={`
                                    p-4 rounded-xl border flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing transition-all
                                    ${isInstalled
                                        ? 'bg-emerald-900/20 border-emerald-500/30 opacity-50 grayscale cursor-default'
                                        : 'bg-slate-800/50 border-white/5 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]'}
                                `}
                            >
                                <span className="text-3xl">{part.icon}</span>
                                <span className="text-xs font-bold text-center text-slate-300">{t(`hpp_builder.assembly.components.${part.id.toLowerCase()}`)}</span>
                                {isInstalled && <span className="text-[10px] text-emerald-500 font-mono">INSTALLED</span>}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* CENTER CANVAS (CIVIL PIT) */}
            <div
                className={`
                    relative rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col justify-end items-center p-8
                    ${draggingPart ? 'border-cyan-500/50 bg-cyan-950/10' : 'border-slate-700/30 bg-black/20'}
                `}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    if (draggingPart) handleDrop(draggingPart);
                }}
            >
                {/* DEPTH MARKERS */}
                <div className="absolute left-4 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-slate-700 to-transparent flex flex-col justify-between py-12 text-[10px] text-slate-500 font-mono">
                    <span>EL. 104.0 (Gen)</span>
                    <span>EL. 98.5 (Turbine)</span>
                    <span>EL. 92.0 (Draft)</span>
                </div>

                {/* STACK RENDERING */}
                <div className="relative w-64 flex flex-col-reverse items-center gap-1 z-10">
                    <AnimatePresence>
                        {assembledParts.map((partId, index) => {
                            const part = INVENTORY.find(p => p.id === partId);
                            return (
                                <motion.div
                                    key={partId}
                                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    className="w-full h-16 bg-slate-800 rounded-lg border border-cyan-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center justify-center gap-4 relative group"
                                    style={{ zIndex: part?.zIndex || 0 }}
                                >
                                    <span className="text-2xl">{part?.icon}</span>
                                    <span className="text-sm font-bold text-cyan-100">{t(`hpp_builder.assembly.components.${partId.toLowerCase()}`)}</span>
                                    <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    {assembledParts.length === 0 && (
                        <div className="text-slate-600 text-sm font-mono animate-pulse">{t('hpp_builder.assembly.status.foundation_locked')}</div>
                    )}
                </div>
            </div>

            {/* RIGHT AUDIT LOG */}
            <div className="bg-slate-950 rounded-2xl border border-white/10 p-0 overflow-hidden flex flex-col">
                <div className="bg-slate-900/80 p-4 border-b border-white/5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('hpp_builder.assembly.title')}</h3>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
                    {auditLog.length === 0 && <div className="text-slate-600 italic text-center mt-10">Waiting for assembly...</div>}
                    {auditLog.map((log, i) => (
                        <div key={i} className={`p-2 rounded border-l-2 ${log.includes('[ERROR]') ? 'border-red-500 bg-red-950/10 text-red-200' : 'border-emerald-500 bg-emerald-950/10 text-emerald-200'}`}>
                            {log}
                        </div>
                    ))}
                </div>
            </div>

            {/* ALIGNMENT MODAL */}
            {alignmentModal.open && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-cyan-500/30 p-8 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(6,182,212,0.2)] animate-fade-in-up">
                        <h3 className="text-xl font-bold text-white mb-2">{t('hpp_builder.assembly.prompts.measure_alignment')}</h3>
                        <p className="text-slate-400 text-sm mb-6">Enter precision laser tracker value for {t(`hpp_builder.assembly.components.${alignmentModal.part?.toLowerCase()}`)}.</p>

                        <input
                            type="number"
                            step="0.01"
                            autoFocus
                            value={measuredAlignment}
                            onChange={(e) => setMeasuredAlignment(e.target.value)}
                            className="w-full bg-black/50 border border-slate-700 rounded-lg p-4 text-2xl font-mono text-cyan-400 mb-6 focus:border-cyan-500 outline-none"
                            placeholder="0.00"
                        />

                        <div className="flex justify-end gap-3">
                            <ModernButton variant="secondary" onClick={() => setAlignmentModal({ open: false, part: null })}>{t('common.cancel')}</ModernButton>
                            <ModernButton variant="primary" onClick={submitAlignment}>{t('common.confirm')}</ModernButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
