import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle, Crosshair } from 'lucide-react';

interface HeritagePrecisionBannerProps {
    currentAlignment?: number; // mm/m
    className?: string;
    onClick?: () => void;
}

const GOLDEN_STANDARD = 0.05; // mm/m - The ethical limit

/**
 * HERITAGE PRECISION BANNER (NC-4.2)
 * 
 * The 0.05 mm/m standard is non-negotiable. This banner serves as a constant
 * reminder of the engineering precision that defines turbine longevity.
 * 
 * Visual states:
 * - NOMINAL: Green border, calm appearance
 * - DEGRADED: Amber warning, "Longevity Leak" indicator
 * - CRITICAL: Red alert, immediate action required
 */
export const HeritagePrecisionBanner: React.FC<HeritagePrecisionBannerProps> = ({
    currentAlignment = 0.02,
    className = '',
    onClick
}) => {
    const { t } = useTranslation();

    // Calculate precision status
    const isNominal = currentAlignment <= GOLDEN_STANDARD;
    const isCritical = currentAlignment > GOLDEN_STANDARD * 2; // > 0.10 mm/m
    const isDegraded = !isNominal && !isCritical;

    // Calculate longevity impact (cubic wear law)
    const longevityLeakPercent = isNominal
        ? 0
        : Math.min(100, Math.pow(currentAlignment / GOLDEN_STANDARD, 3) * 10);

    const statusColor = isCritical
        ? 'border-red-500/50 bg-red-950/20'
        : isDegraded
            ? 'border-amber-500/50 bg-amber-950/20'
            : 'border-cyan-500/30 bg-cyan-950/10';

    const accentColor = isCritical
        ? 'text-red-400'
        : isDegraded
            ? 'text-amber-400'
            : 'text-cyan-400';

    const StatusIcon = isCritical || isDegraded ? AlertTriangle : CheckCircle;

    return (
        <div
            onClick={onClick}
            className={`relative overflow-hidden rounded-2xl border-2 ${statusColor} ${className} ${onClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''}`}
        >
            {/* Blueprint Grid Background */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(34, 211, 238, 0.5) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(34, 211, 238, 0.5) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                }}
            />

            <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Left: Precision Standard */}
                <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-xl border ${isNominal ? 'border-cyan-500/30 bg-cyan-500/10' : 'border-amber-500/30 bg-amber-500/10'}`}>
                        <Crosshair className={`w-8 h-8 ${accentColor}`} />
                    </div>

                    <div>
                        <div className="flex items-baseline gap-3">
                            <span className={`text-4xl md:text-5xl font-black font-mono tracking-tighter ${accentColor}`}>
                                0.05
                            </span>
                            <span className="text-xl md:text-2xl font-bold text-slate-400 font-mono">
                                mm/m
                            </span>
                        </div>
                        <p className="text-xs md:text-sm text-slate-500 font-medium mt-1 uppercase tracking-wider">
                            {t('heritage.goldenStandard', 'Golden Standard of Alignment')}
                        </p>
                    </div>
                </div>

                {/* Center: Current State */}
                <div className="flex flex-col items-center text-center px-6 border-x border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">
                        {t('heritage.currentReading', 'Current Reading')}
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-3xl md:text-4xl font-black font-mono ${accentColor}`}>
                            {currentAlignment.toFixed(3)}
                        </span>
                        <span className="text-sm text-slate-500 font-mono">mm/m</span>
                    </div>
                    <div className={`mt-2 flex items-center gap-2 px-3 py-1 rounded-full ${isNominal ? 'bg-cyan-500/10' : 'bg-amber-500/10'}`}>
                        <StatusIcon className={`w-3 h-3 ${accentColor}`} />
                        <span className={`text-[10px] font-black uppercase tracking-wider ${accentColor}`}>
                            {isNominal ? t('heritage.nominal', 'NOMINAL') : t('heritage.deviation', 'DEVIATION')}
                        </span>
                    </div>
                </div>

                {/* Right: Longevity Impact */}
                <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-2">
                        {t('heritage.longevityImpact', 'Longevity Impact')}
                    </span>

                    {isNominal ? (
                        <div className="flex items-center gap-2 justify-end">
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                            <span className="text-lg font-black text-emerald-400 uppercase">
                                {t('heritage.protected', 'Protected')}
                            </span>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-baseline gap-1 justify-end">
                                <span className={`text-2xl md:text-3xl font-black font-mono ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
                                    -{longevityLeakPercent.toFixed(1)}%
                                </span>
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
                                {t('heritage.longevityLeak', 'Longevity Leak')}
                            </span>
                        </div>
                    )}

                    {/* Precision Bar */}
                    <div className="mt-3 w-40 h-2 bg-slate-800 rounded-full overflow-hidden ml-auto">
                        <div
                            className={`h-full transition-all duration-500 ${isNominal ? 'bg-cyan-500' : isDegraded ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                            style={{ width: `${Math.min(100, (GOLDEN_STANDARD / Math.max(currentAlignment, 0.001)) * 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom: Engineering Ethic Statement */}
            <div className="border-t border-white/5 px-6 py-3 bg-black/20">
                <p className="text-[10px] md:text-xs text-slate-500 font-mono text-center italic">
                    "{t('heritage.ethicStatement', 'Anything beyond 0.05 mm/m is not an error — it is an ethical deviation from engineering excellence.')}"
                </p>
            </div>
        </div>
    );
};
