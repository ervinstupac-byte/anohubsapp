import React, { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, AlertTriangle, Wrench, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Z_INDEX, SECTOR_GLOW } from '../../shared/design-tokens';
import { useAssetContext } from '../../contexts/AssetContext';
import docsData from '../../i18n/locales/docs.json';
import idAdapter from '../../utils/idAdapter';

interface TelemetryDrilldownModalProps {
    isOpen: boolean;
    onClose: () => void;
    metricKey: 'labyrinth' | 'babbitt' | 'shaftLift' | 'oilTan' | 'overhaul';
    metricLabel: string;
    currentValue: number;
    threshold: { warning?: number; critical: number };
    unit: string;
    status: 'nominal' | 'warning' | 'critical';
}

// Generate realistic 30-day trend data with noise
const generateTrendData = (
    baseValue: number,
    threshold: { warning?: number; critical: number },
    assetId: number, // Added for uniqueness per asset
    days: number = 30
): { day: number; value: number }[] => {
    const data: { day: number; value: number }[] = [];
    const criticalPoint = threshold.critical;
    const warningPoint = threshold.warning || criticalPoint * 0.85;

    // Use assetId to seed variation (simple hash)
    const seed = String(assetId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variance = (seed % 10) / 100; // 0-10% variance based on asset

    for (let i = 0; i < days; i++) {
        const progress = i / days;
        const trendBase = baseValue * (0.7 + 0.3 * progress);
        const noise = (Math.sin(i * 0.5 + seed) * 0.5 + Math.random() - 0.5) * trendBase * (0.05 + variance);

        let spike = 0;
        if (i > days * 0.7 && baseValue > warningPoint) {
            spike = Math.random() > 0.8 ? trendBase * 0.12 : 0;
        }

        data.push({
            day: i + 1,
            value: Math.max(0, trendBase + noise + spike)
        });
    }

    data[days - 1].value = baseValue;
    return data;
};

export const TelemetryDrilldownModal: React.FC<TelemetryDrilldownModalProps> = ({
    isOpen,
    onClose,
    metricKey,
    metricLabel,
    currentValue,
    threshold,
    unit,
    status
}) => {
    const { t } = useTranslation();
    const { selectedAsset } = useAssetContext();

    // SURGICAL FIX 3: Regenerate trend data when asset changes
    const trendData = useMemo(() => {
        if (!selectedAsset) return [];
        const numericId = idAdapter.toNumber(selectedAsset.id) || 0;
        return generateTrendData(currentValue, threshold, numericId);
    }, [currentValue, threshold, selectedAsset?.id]); // Asset ID in deps ensures regeneration

    // Track previous asset to detect switches
    const prevAssetRef = React.useRef<number | null>(null);
    useEffect(() => {
        const currentIdNum = selectedAsset ? idAdapter.toNumber(selectedAsset.id) : null;
        if (selectedAsset && prevAssetRef.current && currentIdNum !== null && prevAssetRef.current !== currentIdNum) {
            console.log(`[TelemetryDrilldown] Asset switched: ${prevAssetRef.current} → ${currentIdNum}`);
            // Data automatically regenerates via useMemo deps
        }
        prevAssetRef.current = currentIdNum;
    }, [selectedAsset]);

    const maintenanceAdvice = useMemo(() => {
        const maintenance = (docsData as any).maintenance || {};
        return maintenance[metricKey] || t('drilldown.noAdvice', 'No specific maintenance advice available.');
    }, [metricKey, t]);

    // SURGICAL FIX 1: Fixed Y-axis scaling for clear threshold visibility
    const graphWidth = 500;
    const graphHeight = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const plotWidth = graphWidth - padding.left - padding.right;
    const plotHeight = graphHeight - padding.top - padding.bottom;

    // Ensure critical threshold is always visible with 20% headroom
    const maxDataValue = Math.max(...trendData.map(d => d.value));
    const maxY = Math.max(threshold.critical * 1.2, maxDataValue * 1.1);
    const minY = 0;

    const scaleX = (day: number) => padding.left + ((day - 1) / 29) * plotWidth;
    const scaleY = (val: number) => graphHeight - padding.bottom - ((val - minY) / (maxY - minY)) * plotHeight;

    const linePath = trendData.map((d, i) =>
        `${i === 0 ? 'M' : 'L'} ${scaleX(d.day)} ${scaleY(d.value)}`
    ).join(' ');

    const criticalY = scaleY(threshold.critical);
    const warningY = threshold.warning ? scaleY(threshold.warning) : null;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`fixed inset-0 ${Z_INDEX.modal} flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm`}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className={`
                        w-full max-w-2xl bg-slate-950/95 backdrop-blur-xl rounded-2xl
                        border border-cyan-500/30 ${SECTOR_GLOW.mechanical}
                        overflow-hidden
                    `}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status === 'critical' ? 'bg-red-500/20' :
                                status === 'warning' ? 'bg-amber-500/20' : 'bg-cyan-500/20'
                                }`}>
                                <TrendingUp className={`w-5 h-5 ${status === 'critical' ? 'text-red-400' :
                                    status === 'warning' ? 'text-amber-400' : 'text-cyan-400'
                                    }`} />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-white uppercase tracking-wider">
                                    {metricLabel}
                                </h2>
                                <p className="text-[10px] text-slate-500 font-mono">
                                    {selectedAsset?.name || '—'} • 30-Day Trend
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Current Value Banner */}
                    <div className="px-6 pt-4">
                        <div className={`
                            flex items-center justify-between p-3 rounded-lg
                            ${status === 'critical' ? 'bg-red-500/10 border border-red-500/30' :
                                status === 'warning' ? 'bg-amber-500/10 border border-amber-500/30' :
                                    'bg-cyan-500/10 border border-cyan-500/30'}
                        `}>
                            <div className="flex items-center gap-2">
                                {status !== 'nominal' && <AlertTriangle className={`w-4 h-4 ${status === 'critical' ? 'text-red-400' : 'text-amber-400'
                                    }`} />}
                                <span className="text-[10px] font-bold uppercase text-slate-400">
                                    Current Reading
                                </span>
                            </div>
                            <span className={`text-xl font-mono font-black ${status === 'critical' ? 'text-red-400' :
                                status === 'warning' ? 'text-amber-400' : 'text-cyan-400'
                                }`}>
                                {currentValue.toFixed(2)} <span className="text-sm text-slate-500">{unit}</span>
                            </span>
                        </div>
                    </div>

                    {/* Trend Graph */}
                    <div className="p-6">
                        <svg width="100%" viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="overflow-visible">
                            {/* Grid lines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
                                <line
                                    key={i}
                                    x1={padding.left}
                                    y1={padding.top + frac * plotHeight}
                                    x2={graphWidth - padding.right}
                                    y2={padding.top + frac * plotHeight}
                                    stroke="rgba(255,255,255,0.05)"
                                    strokeDasharray="4 4"
                                />
                            ))}

                            {/* Critical threshold zone */}
                            <rect
                                x={padding.left}
                                y={padding.top}
                                width={plotWidth}
                                height={criticalY - padding.top}
                                fill="rgba(239,68,68,0.1)"
                            />
                            <line
                                x1={padding.left}
                                y1={criticalY}
                                x2={graphWidth - padding.right}
                                y2={criticalY}
                                stroke="#ef4444"
                                strokeWidth="2"
                                strokeDasharray="8 4"
                            />
                            <text x={graphWidth - padding.right - 60} y={criticalY - 5} fill="#ef4444" fontSize="10" fontWeight="bold">
                                CRITICAL: {threshold.critical.toFixed(2)}
                            </text>

                            {/* Warning threshold */}
                            {warningY && (
                                <>
                                    <rect
                                        x={padding.left}
                                        y={criticalY}
                                        width={plotWidth}
                                        height={warningY - criticalY}
                                        fill="rgba(245,158,11,0.05)"
                                    />
                                    <line
                                        x1={padding.left}
                                        y1={warningY}
                                        x2={graphWidth - padding.right}
                                        y2={warningY}
                                        stroke="#f59e0b"
                                        strokeWidth="1"
                                        strokeDasharray="4 4"
                                    />
                                    <text x={graphWidth - padding.right - 50} y={warningY - 5} fill="#f59e0b" fontSize="9">
                                        WARN: {threshold.warning?.toFixed(2)}
                                    </text>
                                </>
                            )}

                            {/* Data line */}
                            <path
                                d={linePath}
                                fill="none"
                                stroke="#22d3ee"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Data points */}
                            {trendData.filter((_, i) => i % 3 === 0 || i === 29).map((d) => (
                                <circle
                                    key={d.day}
                                    cx={scaleX(d.day)}
                                    cy={scaleY(d.value)}
                                    r="3"
                                    fill={d.value > threshold.critical ? '#ef4444' :
                                        threshold.warning && d.value > threshold.warning ? '#f59e0b' : '#22d3ee'}
                                    stroke="#0f172a"
                                    strokeWidth="1.5"
                                />
                            ))}

                            {/* Axes */}
                            <text x={padding.left} y={graphHeight - 5} fill="#64748b" fontSize="9">Day 1</text>
                            <text x={graphWidth / 2} y={graphHeight - 5} fill="#64748b" fontSize="9" textAnchor="middle">Day 15</text>
                            <text x={graphWidth - padding.right} y={graphHeight - 5} fill="#64748b" fontSize="9" textAnchor="end">Today</text>
                            <text x={10} y={graphHeight / 2} fill="#64748b" fontSize="9" transform={`rotate(-90, 10, ${graphHeight / 2})`} textAnchor="middle">
                                {unit}
                            </text>
                        </svg>
                    </div>

                    {/* Maintenance Suggestion */}
                    <div className="px-6 pb-6">
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <Wrench className="w-4 h-4 text-cyan-400" />
                                <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">
                                    Maintenance Suggestion
                                </span>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                {maintenanceAdvice}
                            </p>

                            {status !== 'nominal' && (
                                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                                    <Info className="w-3 h-3 text-amber-400" />
                                    <span className="text-[10px] text-amber-400 font-bold uppercase">
                                        Action Required: Review within 48 hours
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
