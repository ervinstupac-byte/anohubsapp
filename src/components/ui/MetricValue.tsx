import React from 'react';

type SemanticStatus = 'nominal' | 'success' | 'warning' | 'danger' | 'info';

interface MetricValueProps {
    /** The numeric value to display */
    value: number | string | null | undefined;
    /** Unit to display after the value (e.g., 'MW', '°C', 'mm/s') */
    unit?: string;
    /** Currency symbol to display before the value (e.g., '$', '€') */
    currency?: string;
    /** Semantic status for coloring */
    status?: SemanticStatus;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Whether the system is still waiting for telemetry (shows pulsing dash) */
    isWaiting?: boolean;
    /** Optional custom className */
    className?: string;
    /** Number of decimal places (default: 2) */
    decimals?: number;
}

const statusColors: Record<SemanticStatus, string> = {
    nominal: 'text-white',
    success: 'status-success',
    warning: 'status-warning',
    danger: 'status-danger',
    info: 'status-info'
};

const sizeClasses: Record<string, { value: string; unit: string }> = {
    sm: { value: 'text-lg', unit: 'text-xs' },
    md: { value: 'text-2xl', unit: 'text-sm' },
    lg: { value: 'text-3xl', unit: 'text-base' },
    xl: { value: 'text-4xl', unit: 'text-lg' }
};

/**
 * Premium metric value display with unit, currency, status coloring,
 * and waiting state animation for missing telemetry.
 */
export const MetricValue: React.FC<MetricValueProps> = React.memo(({
    value,
    unit,
    currency,
    status = 'nominal',
    size = 'md',
    isWaiting = false,
    className = '',
    decimals = 2
}) => {
    const isInvalidValue = value === null || value === undefined ||
        (typeof value === 'number' && isNaN(value)) ||
        value === '';

    // Format the value
    const formattedValue = React.useMemo(() => {
        if (isInvalidValue) return '—';
        if (typeof value === 'number') {
            return value.toFixed(decimals);
        }
        return value;
    }, [value, isInvalidValue, decimals]);

    const sizeStyle = sizeClasses[size];

    // If waiting for telemetry, show pulsing dash
    if (isWaiting || isInvalidValue) {
        return (
            <span className={`inline-flex items-baseline ${className}`}>
                {currency && (
                    <span className={`metric-currency ${sizeStyle.value} text-slate-500`}>
                        {currency}
                    </span>
                )}
                <span className={`data-pending ${sizeStyle.value}`}>
                    —
                </span>
                {unit && (
                    <span className={`metric-unit ${sizeStyle.unit} text-slate-500`}>
                        {unit}
                    </span>
                )}
            </span>
        );
    }

    return (
        <span className={`inline-flex items-baseline ${className}`}>
            {currency && (
                <span className={`metric-currency ${sizeStyle.value} ${statusColors[status]}`}>
                    {currency}
                </span>
            )}
            <span className={`metric-value ${sizeStyle.value} ${statusColors[status]}`}>
                {formattedValue}
            </span>
            {unit && (
                <span className={`metric-unit ${sizeStyle.unit}`}>
                    {unit}
                </span>
            )}
        </span>
    );
});

MetricValue.displayName = 'MetricValue';
