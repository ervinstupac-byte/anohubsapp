import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ShieldAlert, Wrench, ArrowRight, Check } from 'lucide-react';
import { useSmartActions, SmartAction } from '../../hooks/useSmartActions';

export const SmartActionDeck: React.FC = () => {
    const actions = useSmartActions();

    if (actions.length === 0) {
        return (
            <div className="p-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 flex items-center justify-center gap-3">
                <Check className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-mono text-slate-500 uppercase">System Optimized. No Actions Required.</span>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
                {actions.map((action) => (
                    <ActionCard key={action.id} action={action} />
                ))}
            </AnimatePresence>
        </div>
    );
};

const ActionCard: React.FC<{ action: SmartAction }> = ({ action }) => {
    const typeConfig = {
        OPTIMIZATION: {
            icon: Zap,
            color: 'text-amber-400',
            bg: 'bg-amber-500',
            border: 'border-amber-500',
            gradient: 'from-amber-500/10 to-transparent'
        },
        SAFETY: {
            icon: ShieldAlert,
            color: 'text-red-400',
            bg: 'bg-red-500',
            border: 'border-red-500',
            gradient: 'from-red-500/10 to-transparent'
        },
        MAINTENANCE: {
            icon: Wrench,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500',
            border: 'border-cyan-500',
            gradient: 'from-cyan-500/10 to-transparent'
        }
    };

    const config = typeConfig[action.type];
    const Icon = config.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative overflow-hidden rounded-2xl border ${config.border} border-opacity-30 bg-slate-900 group`}
        >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-20 group-hover:opacity-30 transition-opacity`}></div>

            <div className="relative z-10 p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg ${config.bg} bg-opacity-10 border border-white/5`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-black/40 ${config.color}`}>
                        {action.type}
                    </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 leading-tight">{action.description}</h3>

                <div className="flex items-center gap-2 mb-6">
                    <div className="h-px flex-1 bg-white/10"></div>
                    <span className="text-xs font-mono text-slate-400 uppercase">Impact</span>
                    <span className={`text-xs font-bold ${config.color}`}>{action.impact}</span>
                </div>

                <button className={`
                    w-full py-3 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95
                    ${config.bg} bg-opacity-20 hover:bg-opacity-30 text-white border border-white/5
                `}>
                    Execute Action
                    <ArrowRight className="w-3 h-3" />
                </button>
            </div>
        </motion.div>
    );
};
