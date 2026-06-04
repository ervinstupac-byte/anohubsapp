import React from 'react';
import { TRANSITIONS } from '../../design-tokens';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'cyan';
  showLabel?: boolean;
  className?: string;
  barClassName?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'default',
  showLabel = false,
  className = '',
  barClassName = '',
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  const variantClasses = {
    default: 'bg-cyan-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    cyan: 'bg-cyan-500',
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between mb-1 text-xs text-slate-400 font-mono">
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${variantClasses[variant]} ${TRANSITIONS.slow} ${barClassName}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
