import React, { useEffect, useState } from 'react';
import { TrendingUp, Euro, Zap } from 'lucide-react';

interface ValueGuardTickerProps {
    currentROI?: number;
    dailyGain?: number;
    weeklyGain?: number;
}

export const ValueGuardTicker: React.FC<ValueGuardTickerProps> = ({
    currentROI = 45280,
    dailyGain = 6420,
    weeklyGain = 45280
}) => {
    const [displayValue, setDisplayValue] = useState(0);

    // Animate counter on mount
    useEffect(() => {
        let current = 0;
        const increment = currentROI / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= currentROI) {
                setDisplayValue(currentROI);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(current));
            }
        }, 20);
        return () => clearInterval(timer);
    }, [currentROI]);

    return (
        <div className="w-full bg-gradient-to-r from-emerald-950/90 to-green-950/90 border-2 border-emerald-500/50 rounded-lg p-4 relative overflow-hidden">
            {/* Animated background shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent animate-shimmer"
                style={{ animation: 'shimmer 3s infinite' }} />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <div className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-300">
                                Autonomous Value Generated
                            </div>
                            <div className="text-[10px] text-emerald-500/70 font-mono">
                                Since Sovereign Week Activation
                            </div>
                        </div>
                    </div>
                    <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
                </div>

                {/* Main ROI Display */}
                <div className="flex items-baseline gap-2 mb-4">
                    <Euro className="w-6 h-6 text-emerald-400 mt-1" />
                    <span className="text-5xl font-bold font-mono text-white tracking-tight">
                        {displayValue.toLocaleString()}
                    </span>
                    <span className="text-xl text-emerald-300 font-mono">.00</span>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/50 rounded p-2 border border-emerald-900/30">
                        <div className="text-[10px] text-emerald-400/70 font-mono uppercase mb-1">Today</div>
                        <div className="text-lg font-bold font-mono text-emerald-300">
                            €{dailyGain.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-slate-900/50 rounded p-2 border border-emerald-900/30">
                        <div className="text-[10px] text-emerald-400/70 font-mono uppercase mb-1">This Week</div>
                        <div className="text-lg font-bold font-mono text-emerald-300">
                            €{weeklyGain.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-emerald-900/50 flex items-center justify-between text-[10px] text-emerald-200/70 font-mono">
                    <span>Real-time ROI calculation</span>
                    <span className="flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        LIVE
                    </span>
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};
