import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, ChevronRight, ExternalLink } from 'lucide-react';
import { STATUS_COLORS, StatusType, TYPOGRAPHY, TYPOGRAPHY_COMPACT, GLASS, RADIUS, SPACING, SPACING_COMPACT } from '../../design-tokens';
import { StatusIndicator } from './StatusIndicator';
import { Sparkline } from '../../../components/ui/Sparkline';
import { InfoTooltip } from '../../../components/ui/InfoTooltip'; // NEW
import { useDensity } from '../../../stores/useAppStore';

// === TYPES ===
type CardVariant = 'stat' | 'instrument' | 'info' | 'tactical';

export interface CardAction {
    label: string;
    onClick: (e: React.MouseEvent) => void;
    icon?: React.ReactNode;
    variant?: 'default' | 'danger';
}

interface EngineeringCardProps {
    /** Variant determines the card's layout and styling */
    variant?: CardVariant;
    /** Card title (shown in header) */
    title: string;
    /** Optional subtitle or ISO reference */
    subtitle?: string;
    /** Main value for stat/instrument variants */
    value?: string | number;
    /** Unit for the value (e.g., "MW", "mm", "%") */
    unit?: string;
    /** Status determines border color and indicator */
    status?: StatusType;
    /** Icon shown in header */
    icon?: React.ReactNode;
    /** Trend data for sparkline visualization */
    trendData?: number[];
    /** Event markers for sparkline */
    eventMarkers?: { index: number; color?: string }[];
    /** Optional action element in header */
    headerAction?: React.ReactNode;
    /** Contextual menu actions */
    actionMenu?: CardAction[];
    /** Children for info/tactical variants */
    children?: React.ReactNode;
    /** Click handler */
    onClick?: () => void;
    /** Optional documentation key for InfoTooltip */
    docKey?: string; // NEW
    className?: string;
}

/**
 * EngineeringCard — Unified card component for engineering dashboards
 * Now supports Global Density and Contextual Actions (Phase 3/4)
 */
export const EngineeringCard = React.memo<EngineeringCardProps>(({
    variant = 'info',
    title,
    subtitle,
    value,
    unit,
    status = 'nominal',
    icon,
    trendData,
    eventMarkers,
    headerAction,
    actionMenu,
    children,
    onClick,
    docKey, // NEW
    className = ''
}) => {
    const { mode } = useDensity();
    const isCompact = mode === 'compact';
    const typo = isCompact ? TYPOGRAPHY_COMPACT : TYPOGRAPHY;
    const spacing = isCompact ? SPACING_COMPACT : SPACING;

    const colors = STATUS_COLORS[status];
    const isClickable = !!onClick;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Handle click outside for menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    // Action Menu Render Helper
    const renderActionMenu = () => {
        if (!actionMenu || actionMenu.length === 0) return null;

        return (
            <div className="relative ml-2" ref={menuRef}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsMenuOpen(!isMenuOpen);
                    }}
                    className={`p-1 rounded hover:bg-white/10 text-slate-500 hover:text-cyan-400 transition-colors ${isMenuOpen ? 'text-cyan-400 bg-white/5' : ''}`}
                >
                    <MoreVertical className="w-4 h-4" />
                </button>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 5 }}
                            transition={{ duration: 0.1 }}
                            className="absolute right-0 top-full mt-1 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden backdrop-blur-xl"
                        >
                            <div className="py-1">
                                {actionMenu.map((action, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            action.onClick(e);
                                            setIsMenuOpen(false);
                                        }}
                                        className={`
                                            w-full text-left px-4 py-2 text-xs font-mono font-bold flex items-center gap-2
                                            ${action.variant === 'danger' ? 'text-red-400 hover:bg-red-950/30' : 'text-slate-300 hover:bg-slate-800 hover:text-cyan-400'}
                                            transition-colors
                                        `}
                                    >
                                        {action.icon && <span className="opacity-70">{action.icon}</span>}
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    // Shared Header Wrapper
    const HeaderWrapper = ({ children }: { children: React.ReactNode }) => (
        <div className="flex justify-between items-start mb-2 relative z-10">
            {children}
            {renderActionMenu()}
        </div>
    );

    // === STAT VARIANT ===
    if (variant === 'stat') {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                onClick={onClick}
                className={`
                    ${GLASS.base} ${RADIUS.cardLg} ${spacing.cardPadding}
                    ${colors.border} border-l-4
                    ${isClickable ? 'cursor-pointer hover:border-opacity-80' : ''}
                    transition-all group relative overflow-visible
                    ${className}
                `}
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-colors pointer-events-none" />

                <HeaderWrapper>
                    <div className="flex items-center gap-2">
                        <span className={typo.labelMd + ' text-slate-500'}>{title}</span>
                        {docKey && <InfoTooltip docKey={docKey} className="text-slate-600 hover:text-cyan-400" />}
                        {icon && <span className="text-slate-400 group-hover:text-cyan-400 transition-colors">{icon}</span>}
                    </div>
                </HeaderWrapper>

                <div className="flex items-baseline gap-2 relative z-10">
                    <h3 className={`${typo.valueLg} ${colors.text}`}>
                        {value}
                    </h3>
                    {unit && <span className="text-xs font-bold text-slate-500">{unit}</span>}
                </div>

                {(subtitle || trendData) && (
                    <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 relative z-10">
                        {subtitle && <span className={typo.bodyXs}>{subtitle}</span>}
                        {trendData && trendData.length >= 2 && (
                            <Sparkline data={trendData} width={60} height={16} color={colors.hex} markers={eventMarkers} />
                        )}
                    </div>
                )}
            </motion.div>
        );
    }

    // === INSTRUMENT VARIANT ===
    if (variant === 'instrument') {
        return (
            <div
                onClick={onClick}
                className={`
                    relative ${RADIUS.card}
                    border-2 ${colors.border} ${colors.bg} ${colors.glow}
                    ${isClickable ? 'cursor-pointer hover:border-opacity-80' : ''}
                    transition-all
                    ${className}
                `}
            >
                {/* Decorative Screws - Scaled down in compact mode */}
                {!isCompact && (
                    <>
                        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-700 border border-slate-600" />
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-700 border border-slate-600" />
                        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-slate-700 border border-slate-600" />
                        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-slate-700 border border-slate-600" />
                    </>
                )}

                <div className="absolute top-2 right-2 z-20">
                    {/* Combined Status and Action Menu for Instrument */}
                    <div className="flex items-center gap-1">
                        {!isCompact && (
                            <div className="mr-2">
                                <StatusIndicator status={status} variant="led" size="xs" label={status === 'critical' ? 'ALERT' : status === 'warning' ? 'WARN' : 'OK'} />
                            </div>
                        )}
                        {renderActionMenu()}
                    </div>
                </div>

                <div className={`relative z-10 ${spacing.cardPadding}`}>
                    <div className="flex items-start justify-between mb-3 pr-8">
                        <div className="flex items-center gap-2">
                            {icon && (
                                <div className={`p-1.5 rounded border ${colors.border} ${colors.bg}`}>
                                    {icon}
                                </div>
                            )}
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <p className={typo.labelMd + ' text-slate-500'}>{title}</p>
                                    {docKey && <InfoTooltip docKey={docKey} />}
                                </div>
                                {subtitle && (
                                    <p className={typo.labelXs + ' text-cyan-500/70 mt-0.5'}>{subtitle}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/80 rounded-lg p-3 border border-white/5 mb-2">
                        <div className="flex items-baseline justify-between">
                            <span className={`${typo.valueXl} ${colors.text}`}>
                                {value}
                            </span>
                            {unit && (
                                <span className="text-xs text-slate-500 font-mono font-bold uppercase ml-2">
                                    {unit}
                                </span>
                            )}
                        </div>
                    </div>

                    {trendData && trendData.length >= 2 && (
                        <div className="flex items-center justify-between mb-1">
                            <span className={typo.labelXs + ' text-slate-600'}>24H TREND</span>
                            <Sparkline data={trendData} width={isCompact ? 60 : 80} height={isCompact ? 16 : 20} color={colors.hex} markers={eventMarkers} />
                        </div>
                    )}

                    {children}
                </div>

                {!isCompact && <div className="h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />}
            </div>
        );
    }

    // === INFO/TACTICAL VARIANT (Unified) ===
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            onClick={onClick}
            className={`
                ${GLASS.base} ${RADIUS.cardLg} ${spacing.cardPadding}
                ${status !== 'nominal' ? `border-l-4 ${colors.border}` : ''}
                hover:border-cyan-500/40 transition-all duration-500
                ${isClickable ? 'cursor-pointer' : ''}
                ${className}
            `}
        >
            {(title || headerAction || actionMenu) && (
                <div className="flex justify-between items-start mb-3 relative z-10">
                    <div className="flex items-center gap-3">
                        {icon && <div className="text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">{icon}</div>}
                        <div>
                            <h3 className={`${typo.valueMd} text-slate-100 tracking-tight`}>{title}</h3>
                            {subtitle && <p className={typo.labelSm + ' text-slate-400 mt-0.5'}>{subtitle}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        {headerAction}
                        {renderActionMenu()}
                    </div>
                </div>
            )}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
});

EngineeringCard.displayName = 'EngineeringCard';
