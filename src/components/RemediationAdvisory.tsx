import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Activity, ArrowRight } from 'lucide-react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { RemediationPlan } from '../services/RemediationService';

interface RemediationAdvisoryProps {
    isOpen: boolean;
    plan: RemediationPlan | null;
    onExecute: () => void;
    onClose: () => void;
}

export const RemediationAdvisory: React.FC<RemediationAdvisoryProps> = ({ isOpen, plan, onExecute, onClose }) => {
    // State for Confirmation Modal
    const [showConfirm, setShowConfirm] = React.useState(false);
    const modalRef = React.useRef<HTMLDivElement>(null);

    // Focus Trap Logic
    React.useEffect(() => {
        if (!showConfirm) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowConfirm(false);
            if (e.key === 'Tab') {
                if (modalRef.current) {
                    const focusable = modalRef.current.querySelectorAll('button');
                    const first = focusable[0];
                    const last = focusable[focusable.length - 1];
                    if (e.shiftKey && document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    } else if (!e.shiftKey && document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        setTimeout(() => modalRef.current?.querySelector('button')?.focus(), 100);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showConfirm]);

    if (!plan) return null;

    const handleExecuteClick = () => setShowConfirm(true);

    const handleConfirm = async () => {
        // NC-21: Active Control Logic
        // 1. Audit Log
        const { AlertJournal } = await import('../services/AlertJournal');
        await AlertJournal.logAction('OP-01', plan.action, { timestamp: Date.now() });

        // 2. Ramp Down Simulation
        const { useTelemetryStore } = await import('../features/telemetry/store/useTelemetryStore');
        const store = useTelemetryStore.getState();

        // Ramp down Power and Flow by 20% over 2 seconds (Physics will follow Flow)
        const steps = 20; // Smoother animation
        const duration = 2000; // 2 seconds
        const interval = duration / steps; // 100ms
        const currentHydraulic = store.hydraulic;

        let step = 0;
        const rampTimer = setInterval(() => {
            step++;
            const factor = 1 - (0.2 * (step / steps)); // 1.0 -> 0.8 linear

            store.updateTelemetry({
                hydraulic: {
                    ...currentHydraulic,
                    flow: (currentHydraulic.flow || 0) * factor,
                    head: currentHydraulic.head
                }
                // Power is derived from Flow via PhysicsEngine in the store
            });

            if (step >= steps) {
                clearInterval(rampTimer);
                onExecute(); // Close advisory
                setShowConfirm(false);
            }
        }, interval);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-none">
                    {/* CONFIRMATION MODAL OVERLAY */}
                    {showConfirm && (
                        <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
                            <motion.div
                                ref={modalRef}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-slate-900 border-2 border-red-500 rounded-xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.3)] text-center"
                                role="alertdialog"
                                aria-modal="true"
                                aria-labelledby="modal-title"
                            >
                                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4 animate-bounce" />
                                <h2 id="modal-title" className="text-2xl font-black text-white uppercase mb-2">Confirm Control Action</h2>
                                <p className="text-slate-400 mb-6 font-mono text-sm leading-relaxed">
                                    You are about to initiate a Sovereign Control Adjustment.
                                    <br /><br />
                                    <strong>Action:</strong> {plan.action}<br />
                                    <strong>Impact:</strong> -20% Ramp Down (3s)<br />
                                    <strong>Protocol:</strong> NC-21-EXEC
                                </p>

                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={() => setShowConfirm(false)}
                                        className="px-6 py-3 rounded bg-slate-800 text-white font-bold hover:bg-slate-700 transition"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        className="px-6 py-3 rounded bg-red-600 text-white font-bold hover:bg-red-500 transition shadow-lg shadow-red-900/50"
                                    >
                                        CONFIRM EXECUTION
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="pointer-events-auto max-w-lg w-full"
                    >
                        <GlassCard className="border-l-4 border-amber-500 bg-slate-900/95 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                            {/* Animated Background Pulse */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />

                            <div className="p-6 relative z-10">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500 animate-pulse">
                                            <AlertTriangle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest">Action Recommended</h3>
                                            <p className="text-xs text-slate-400 font-mono">PROTOCOL NC-14 ACTIVATED</p>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                                        Monitor Only
                                    </button>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="p-4 bg-black/40 rounded border border-white/5">
                                        <div className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                                            {plan.action}
                                            <ArrowRight className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <p className="text-sm text-slate-400 leading-relaxed">
                                            {plan.reason}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span>Reference: {plan.dossierRef}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleExecuteClick}
                                    className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest text-sm rounded transition-all shadow-lg shadow-amber-900/40 flex items-center justify-center gap-2 group"
                                >
                                    <span>[ EXECUTE ADJUSTMENT ]</span>
                                    <Activity className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
