import React, { useState, useEffect } from 'react';
import { ModernButton } from '../../shared/components/ui/ModernButton';
import { XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../services/supabaseClient';

interface VetoControlProps {
    actionPending: boolean;
    actionDescription: string;
    onVeto: (reason: string) => void;
    onApprove: () => void;
    countdownSeconds?: number;
    learnedInsight?: string; // New: NC-13.0
}

export const VetoControl: React.FC<VetoControlProps> = ({
    actionPending,
    actionDescription,
    onVeto,
    onApprove,
    countdownSeconds = 10,
    learnedInsight
}) => {
    const [timeLeft, setTimeLeft] = useState(countdownSeconds);
    const [vetoMode, setVetoMode] = useState(false);
    const [reason, setReason] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!actionPending || vetoMode) {
            setTimeLeft(countdownSeconds);
            return;
        }

        if (timeLeft <= 0) {
            onApprove();
            return;
        }

        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [actionPending, timeLeft, vetoMode, onApprove, countdownSeconds]);

    const handleVetoClick = () => {
        setVetoMode(true); // Stop timer
    };

    const submitVeto = async () => {
        setIsSaving(true);
        // Persist to DB directly here or delegate? Delegating via props is cleaner but user asked for "Integration: Ensure the Veto modal writes directly to this table".
        // Use props to notify parent, but write here or in service. Let's write here for "Direct" requirement.
        try {
            await supabase.from('operator_feedback').insert({
                action_id: `ACT-${Date.now()}`, // Simple ID generation
                reason: reason,
                context: { action: actionDescription }
            });
            onVeto(reason); // Notify parent to cancel logic
        } catch (e) {
            console.error('Failed to log veto', e);
            onVeto(reason); // Cancel anyway
        } finally {
            setIsSaving(false);
            setVetoMode(false);
            setReason('');
        }
    };

    if (!actionPending && !vetoMode) return null;

    return (
        <AnimatePresence>
            {!vetoMode ? (
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-amber-500 rounded-xl p-4 shadow-2xl z-50 flex items-center gap-6 min-w-[400px]"
                >
                    <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                            <circle cx="24" cy="24" r="20" className="stroke-slate-700 fill-none" strokeWidth="4" />
                            <circle
                                cx="24" cy="24" r="20"
                                className="stroke-amber-500 fill-none"
                                strokeWidth="4"
                                strokeDasharray={126}
                                strokeDashoffset={126 - (126 * timeLeft) / countdownSeconds}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 1s linear' }}
                            />
                        </svg>
                        <span className="absolute text-sm font-bold font-mono text-amber-500">{timeLeft}</span>
                    </div>

                    <div className="flex-1">
                        <div className="text-[10px] text-amber-500 font-mono font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            AI Action Proposed
                        </div>
                        <div className="text-sm font-mono text-white">{actionDescription}</div>
                        {learnedInsight && (
                            <div className="mt-2 text-[10px] text-emerald-400 font-mono flex items-center gap-2 bg-emerald-900/20 px-2 py-1 rounded border border-emerald-500/30">
                                <ShieldCheck className="w-3 h-3" />
                                {learnedInsight}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleVetoClick}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded font-mono uppercase text-xs tracking-wider shadow-[0_0_10px_rgba(220,38,38,0.5)] border border-red-500"
                        >
                            VETO
                        </button>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
                >
                    <div className="bg-slate-900 border border-red-500 rounded-xl p-6 w-full max-w-lg shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                        <div className="flex items-center gap-3 mb-4 text-red-500">
                            <XCircle className="w-6 h-6" />
                            <h2 className="text-xl font-bold font-mono uppercase tracking-widest">Veto Confirmation</h2>
                        </div>

                        <p className="text-sm text-slate-400 mb-4 font-mono">
                            You are overriding the Sovereign AI. Please provide a reason for the Active Learning Ledger.
                        </p>

                        <div className="space-y-2 mb-6">
                            {['Sensor Drift Suspected', 'Manual Inspection in Progress', 'Operational Safety Limit', 'External Grid Command'].map(suggestion => (
                                <button
                                    key={suggestion}
                                    onClick={() => setReason(suggestion)}
                                    className={`block w-full text-left px-3 py-2 rounded text-xs font-mono border ${reason === suggestion ? 'bg-red-900/30 border-red-500 text-white' : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                >
                                    {suggestion}
                                </button>
                            ))}
                            <textarea
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder="Or type custom reason..."
                                className="w-full bg-black/50 border border-slate-700 rounded p-3 text-sm text-white focus:border-red-500 outline-none min-h-[80px]"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <ModernButton variant="ghost" onClick={() => setVetoMode(false)}>Cancel</ModernButton>
                            <ModernButton
                                variant="primary"
                                onClick={submitVeto}
                                disabled={!reason.trim() || isSaving}
                                className="!bg-red-600 !border-red-500 !text-white flex items-center gap-2"
                            >
                                {isSaving ? 'Logging...' : 'Confirm VETO'} <ShieldCheck className="w-3 h-3" />
                            </ModernButton>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
