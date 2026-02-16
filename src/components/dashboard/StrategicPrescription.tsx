import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

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
        <div className="bg-scada-panel border border-scada-border rounded-sm p-5 shadow-scada-card relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xs font-mono font-black text-status-info uppercase tracking-[0.2em] flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Sovereign Strategist
                        </h2>
                        <div className="text-[10px] text-scada-muted font-mono mt-1">Economic-Technical Bridge Active</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] text-scada-muted uppercase font-mono font-bold">Profit/Health Ratio</div>
                        <div className={`text-2xl font-mono font-black ${profitHealthRatio > 1.5 ? 'text-status-ok' : 'text-status-warning'}`}>
                            {profitHealthRatio.toFixed(2)}x
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-scada-bg rounded-sm p-3 border border-scada-border">
                        <div className="flex items-center justify-between text-[10px] text-scada-muted font-mono uppercase mb-1">
                            <span>Net Profit Velocity</span>
                            <TrendingUp className="w-3 h-3 text-status-ok" />
                        </div>
                        <div className="text-xl font-mono font-black text-scada-text">
                            {netProfitRate.toFixed(2)} <span className="text-xs text-scada-muted">€/h</span>
                        </div>
                    </div>
                    <div className="bg-scada-bg rounded-sm p-3 border border-scada-border">
                        <div className="flex items-center justify-between text-[10px] text-scada-muted font-mono uppercase mb-1">
                            <span>Molecular Debt</span>
                            <TrendingDown className="w-3 h-3 text-status-error" />
                        </div>
                        <div className="text-xl font-mono font-black text-status-error">
                            -{molecularDebtRate.toFixed(2)} <span className="text-xs text-scada-muted">€/h</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-[10px] text-scada-muted font-mono font-black uppercase tracking-widest mb-2">Prescriptive Actions</h3>
                    <div>
                        {recommendations.length > 0 ? (
                            recommendations.map((rec, idx) => (
                                <div
                                    key={idx}
                                    className="bg-status-info/5 border border-status-info/20 rounded-sm p-3 relative group hover:bg-status-info/10 transition-colors mb-2 last:mb-0"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-sm font-bold text-status-info font-mono">{rec.action}</div>
                                            <div className="text-[10px] text-scada-muted mt-1">{rec.impact}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-black text-scada-text flex items-center justify-end gap-1">
                                                <DollarSign className="w-3 h-3" />
                                                +{rec.expectedSavings} €
                                            </div>
                                            <div className="text-[9px] text-status-info/70 font-mono mt-0.5">
                                                {(rec.confidence * 100).toFixed(0)}% Conf.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-info rounded-l-sm" />
                                </div>
                            ))
                        ) : (
                            <div className="text-xs text-scada-muted font-mono italic p-3 text-center border border-dashed border-scada-border rounded-sm">
                                No active optimization opportunities. System running at peak efficiency.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
