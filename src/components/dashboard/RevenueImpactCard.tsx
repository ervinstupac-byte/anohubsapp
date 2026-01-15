import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingDown, TrendingUp, AlertCircle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFinancialInsights } from '../../features/business/hooks/useFinancialInsights';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { MetricValue } from '../ui/MetricValue';
import { InfoTooltip } from '../ui/InfoTooltip';
import { CardSkeleton } from '../../shared/components/ui/Skeleton';

/**
 * REVENUE IMPACT CARD
 * Visualizes real-time financial efficiency loss.
 * Design: High-contrast Alert/Success states with premium MetricValue display.
 */
export const RevenueImpactCard: React.FC<{ className?: string }> = React.memo(({ className = '' }) => {
    const { t } = useTranslation();
    const data = useFinancialInsights();

    // DEFENSIVE UI: Determine Status
    const loss = data?.revenueLossPerHour ?? 0;
    const isCritical = data?.isCritical ?? false;
    const isOptimal = loss <= 0;
    const hasData = data?.currentRevenuePerHour !== undefined && data?.currentRevenuePerHour !== null;

    // Color Logic
    const variants = {
        critical: {
            bg: 'bg-red-500/10',
            border: 'border-red-500/30',
            text: 'text-red-400',
            icon: AlertCircle,
            glow: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]',
            status: 'danger' as const
        },
        optimal: {
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/30',
            text: 'text-emerald-400',
            icon: TrendingUp,
            glow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]',
            status: 'success' as const
        },
        warning: {
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/30',
            text: 'text-amber-400',
            icon: Activity,
            glow: 'shadow-[0_0_20px_rgba(245,158,11,0.1)]',
            status: 'warning' as const
        }
    };

    const statusKey = isCritical ? 'critical' : isOptimal ? 'optimal' : 'warning';
    const style = variants[statusKey];
    const Icon = style.icon;

    // Loading State with premium CardSkeleton
    if (!data) {
        return <CardSkeleton className={className} />;
    }

    return (
        <GlassCard
            className={`relative overflow-hidden ${style.border} ${style.bg} ${style.glow} ${className}`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${style.text}`} />
                        <span className={`text-[10px] uppercase font-black tracking-widest ${style.text}`}>
                            {isOptimal ? 'Revenue Optimized' : 'Revenue Leakage'}
                        </span>
                        <InfoTooltip
                            content={t('dashboard.revenue.tooltip', 'Financial impact calculated from operating efficiency vs optimal baseline')}
                            size={12}
                        />
                    </div>

                    <div className="flex items-baseline gap-2">
                        {isOptimal ? (
                            <span className={`text-3xl font-black font-mono tracking-tight ${style.text}`}>
                                OPTIMAL
                            </span>
                        ) : (
                            <MetricValue
                                value={hasData ? -loss : null}
                                currency="€"
                                unit="/hr"
                                size="lg"
                                status={style.status}
                                isWaiting={!hasData}
                                decimals={2}
                            />
                        )}
                    </div>
                </div>

                {/* Trend / Context Indicator */}
                <div className="text-right">
                    <p className="text-[9px] text-slate-500 uppercase font-mono mb-1">Efficiency Delta</p>
                    <div className="flex items-center justify-end gap-1">
                        <MetricValue
                            value={data.efficiencyLossPercent}
                            unit="%"
                            size="md"
                            status={style.status}
                            decimals={1}
                        />
                        <TrendingDown className={`w-3 h-3 ${isOptimal ? 'opacity-0' : style.text}`} />
                    </div>
                </div>
            </div>

            {/* Micro-Interaction: Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900/20">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, data.efficiencyLossPercent * 5)}%` }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className={`h-full ${isOptimal ? 'bg-emerald-500' : 'bg-red-500'}`}
                    style={{ willChange: 'width' }}
                />
            </div>
        </GlassCard>
    );
});

RevenueImpactCard.displayName = 'RevenueImpactCard';
