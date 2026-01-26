import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCerebro } from '../../contexts/ProjectContext';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { ModernButton } from '../../shared/components/ui/ModernButton';
import { Book, Save, Plus, Trash2, ShieldAlert } from 'lucide-react';

export const EngineeringWisdomVault: React.FC = () => {
    const { state, dispatch } = useCerebro();
    const [newRule, setNewRule] = useState('');

    const handleAddRule = () => {
        if (newRule.trim()) {
            dispatch({ type: 'ADD_MANUAL_RULE', payload: newRule });
            setNewRule('');
        }
    };

    return (
        <GlassCard
            variant="commander"
            title="Engineering Wisdom Vault"
            subtitle="Specialist Heuristic Injection"
            icon={<Book className="w-5 h-5 text-cyan-400" />}
            className="h-full"
        >
            <div className="space-y-6">
                <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                    <p className="text-[10px] text-cyan-400 font-mono leading-relaxed mb-4">
                        // SENIOR_ENGINEER_OVERRIDE: Manual rules take precedence in Sentinel AI logic traces.
                    </p>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newRule}
                            onChange={(e) => setNewRule(e.target.value)}
                            placeholder="Type manual heuristic rule..."
                            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:border-cyan-500/50 outline-none transition-all"
                        />
                        <button
                            onClick={handleAddRule}
                            className="p-2 bg-cyan-500 text-black rounded-lg hover:scale-105 active:scale-95 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    <AnimatePresence>
                        {state.manualRules.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 text-[10px] font-mono uppercase tracking-widest">
                                No manual rules injected
                            </div>
                        ) : (
                            state.manualRules.map((rule, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-start gap-3 group"
                                >
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                                    <p className="flex-1 text-[11px] text-slate-300 font-medium leading-relaxed">
                                        {rule}
                                    </p>
                                    <ShieldAlert className="w-3 h-3 text-cyan-500/50" />
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <div className="text-[9px] text-slate-500 font-mono">
                        SENTINEL_COUPLING_STATUS: <span className="text-emerald-400">ACTIVE</span>
                    </div>
                    <ModernButton variant="secondary" className="h-8 text-[9px] px-4">
                        <Save className="w-3 h-3 mr-2" /> Commit Vault
                    </ModernButton>
                </div>
            </div>
        </GlassCard>
    );
};
