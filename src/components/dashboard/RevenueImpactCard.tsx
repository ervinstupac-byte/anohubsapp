import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingDown, TrendingUp, AlertCircle, Activity } from 'lucide-react';
import { useFinancialInsights } from '../../features/business/hooks/useFinancialInsights';
import { MetricValue } from '../ui/MetricValue';
import { InfoTooltip } from '../ui/InfoTooltip';
import { CardSkeleton } from '../../shared/components/ui/Skeleton';

/**
 * REVENUE IMPACT CARD
 * Visualizes real-time financial efficiency loss.
 * Design: High-contrast Alert/Success states with SCADA-compliant display.
 */
export const RevenueImpactCard: React.FC<{ className?: string }> = React.memo(({ className = '' }) => {
    const { t } = useTranslation();
    const data = useFinancialInsights();

    // DEFENSIVE UI: Determine Status
    const loss = data?.revenueLossPerHour ?? 0;
    const isCritical = data?.isCritical ?? false;
    const isOptimal = loss <= 0;
    const hasData = data?.currentRevenuePerHour !== undefined && data?.currentRevenuePerHour !== null;

    // Color Logic - SCADA Standard
    const variants = {
        critical: {
            bg: 'bg-status-error/10',
            border: 'border-status-error',
            text: 'text-status-error',
            icon: AlertCircle,
            status: 'danger' as const
        },
        optimal: {
            bg: 'bg-status-ok/10',
            border: 'border-status-ok',
            text: 'text-status-ok',
            icon: TrendingUp,
            status: 'success' as const
        },
        warning: {
            bg: 'bg-status-warning/10',
            border: 'border-status-warning',
            text: 'text-status-warning',
            icon: Activity,
            status: 'warning' as const
        }
    };

    const statusKey = isCritical ? 'critical' : isOptimal ? 'optimal' : 'warning';
    const style = variants[statusKey];
    const Icon = style.icon;

    // Loading State
    if (!data) {
        return <CardSkeleton className={className} />;
    }

    return (
        <div
            className={`relative overflow-hidden bg-scada-panel border rounded-sm shadow-scada-card ${style.border} ${className}`}
        >
            <div className="flex items-center justify-between p-4">
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
                    <p className="text-[9px] text-scada-text/70 uppercase font-mono mb-1">Efficiency Delta</p>
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

            {/* Micro-Interaction: Progress Bar (Static for SCADA) */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-scada-bg">
                <div
                    className={`h-full ${isOptimal ? 'bg-status-ok' : 'bg-status-error'}`}
                    style={{ width: `${Math.min(100, data.efficiencyLossPercent * 5)}%` }}
                />
            </div>
        </div>
    );
});

RevenueImpactCard.displayName = 'RevenueImpactCard';
