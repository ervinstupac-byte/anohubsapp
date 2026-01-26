import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RecommendedAction {
    action: string;
    impact: string;
    expectedSavings: number;
    confidence: number;
}

interface StrategicPrescriptionProps {
    netProfitRate: number; // EUR/h
    profitHealthRatio: number; // The Golden Ratio
    molecularDebtRate: number; // EUR/h (Wear)
    recommendations: RecommendedAction[];
}

export const StrategicPrescription: React.FC<StrategicPrescriptionProps> = ({
    netProfitRate,
    profitHealthRatio,
    molecularDebtRate,
    recommendations
}) => {
    return (
        <div className="bg-h-panel border border-h-border rounded-xl p-5 shadow-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <BrainCircuitIcon className="w-32 h-32 text-h-cyan" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xs font-mono font-black text-h-cyan uppercase tracking-[0.2em] flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Sovereign Strategist
                        </h2>
                        <div className="text-[10px] text-slate-500 font-mono mt-1">Economic-Technical Bridge Active</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] text-slate-500 uppercase font-mono font-bold">Profit/Health Ratio</div>
                        <div className={`text-2xl font-mono font-black ${profitHealthRatio > 1.5 ? 'text-h-green' : 'text-h-yellow'}`}>
                            {profitHealthRatio.toFixed(2)}x
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-900/40 rounded-lg p-3 border border-white/5">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono uppercase mb-1">
                            <span>Net Profit Velocity</span>
                            <TrendingUp className="w-3 h-3 text-h-green" />
                        </div>
                        <div className="text-xl font-mono font-black text-white">
                            {netProfitRate.toFixed(2)} <span className="text-xs text-slate-500">€/h</span>
                        </div>
                    </div>
                    <div className="bg-slate-900/40 rounded-lg p-3 border border-white/5">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono uppercase mb-1">
                            <span>Molecular Debt</span>
                            <TrendingDown className="w-3 h-3 text-red-400" />
                        </div>
                        <div className="text-xl font-mono font-black text-red-300">
                            -{molecularDebtRate.toFixed(2)} <span className="text-xs text-slate-500">€/h</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-[10px] text-slate-500 font-mono font-black uppercase tracking-widest mb-2">Prescriptive Actions</h3>
                    <AnimatePresence>
                        {recommendations.length > 0 ? (
                            recommendations.map((rec, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-h-cyan/5 border border-h-cyan/20 rounded-lg p-3 relative group hover:bg-h-cyan/10 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-sm font-bold text-h-cyan font-mono">{rec.action}</div>
                                            <div className="text-[10px] text-slate-400 mt-1">{rec.impact}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-black text-white flex items-center justify-end gap-1">
                                                <DollarSign className="w-3 h-3" />
                                                +{rec.expectedSavings} €
                                            </div>
                                            <div className="text-[9px] text-h-cyan/70 font-mono mt-0.5">
                                                {(rec.confidence * 100).toFixed(0)}% Conf.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-h-cyan rounded-l-lg" />
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-xs text-slate-500 font-mono italic p-3 text-center border border-dashed border-white/10 rounded">
                                No active optimization opportunities. System running at peak efficiency.
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const BrainCircuitIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M12 2a10 10 0 1 0 10 10M2 12h20M12 2v20" strokeOpacity="0.2" />
        <circle cx="12" cy="12" r="3" strokeWidth="2" />
        <path d="M12 9a3 3 0 0 1 3 3" />
    </svg>
);
