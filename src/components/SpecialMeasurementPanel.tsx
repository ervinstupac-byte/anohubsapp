// Special Measurement Panel - Laser Tracker Import
// Imports geometry data and compares with ideal blueprints

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import {
    SpecialMeasurementSyncService,
    GeometryComparison,
    EfficiencyGapAnalysis,
    FRANCIS_IDEAL_BLUEPRINT
} from '../services/SpecialMeasurementSyncService';
import { EnhancedAsset } from '../models/turbine/types';

interface SpecialMeasurementPanelProps {
    sessionId: string;
    asset: EnhancedAsset;
    onComplete: () => void;
}

export const SpecialMeasurementPanel: React.FC<SpecialMeasurementPanelProps> = ({
    sessionId,
    asset,
    onComplete
}) => {
    const [importFormat, setImportFormat] = useState<'CSV' | 'JSON' | 'FARO' | 'LEICA'>('CSV');
    const [comparison, setComparison] = useState<GeometryComparison | null>(null);
    const [efficiencyGap, setEfficiencyGap] = useState<EfficiencyGapAnalysis | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);

        // Import geometry data
        const measuredPoints = await SpecialMeasurementSyncService.importGeometryData(
            file.name,
            importFormat
        );

        // Compare with ideal blueprint
        const comparisonResult = SpecialMeasurementSyncService.compareWithBlueprint(
            measuredPoints,
            FRANCIS_IDEAL_BLUEPRINT // In production: Select based on asset.turbine_family
        );

        setComparison(comparisonResult);

        // Calculate efficiency gap
        const efficiencyAnalysis = SpecialMeasurementSyncService.calculateEfficiencyGap(
            comparisonResult,
            asset.turbine_family,
            asset.capacity,
            80 // $/MWh electricity price
        );

        setEfficiencyGap(efficiencyAnalysis);

        setIsProcessing(false);
        onComplete();
    };

    return (
        <GlassCard>
            <div className="mb-6">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">
                    <span className="text-white">Special</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 ml-2">
                        Measurements
                    </span>
                </h3>
                <p className="text-sm text-slate-400">
                    Import laser tracker geometry and compare with ideal blueprint
                </p>
            </div>

            {!comparison ? (
                <div className="space-y-4">
                    {/* Format Selector */}
                    <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                        <label className="block text-xs text-slate-400 uppercase font-bold mb-3">
                            Data Format
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {(['CSV', 'JSON', 'FARO', 'LEICA'] as const).map(format => (
                                <button
                                    key={format}
                                    onClick={() => setImportFormat(format)}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${importFormat === format
                                        ? 'bg-cyan-500/30 text-cyan-400 border-2 border-cyan-500'
                                        : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-700/50'
                                        }`}
                                >
                                    {format}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* File Upload */}
                    <label className="block cursor-pointer">
                        <input
                            type="file"
                            onChange={handleImport}
                            accept=".csv,.json,.txt"
                            className="hidden"
                            disabled={isProcessing}
                        />
                        <div className={`p-8 border-2 border-dashed rounded-lg transition-all ${isProcessing
                            ? 'border-cyan-500 bg-cyan-500/10 animate-pulse'
                            : 'border-slate-700 bg-slate-800/30 hover:border-cyan-500/50 hover:bg-slate-800/50'
                            }`}>
                            <div className="text-center">
                                <Upload className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                                <p className="text-sm font-bold text-white mb-2">
                                    {isProcessing ? 'Processing geometry data...' : 'Click to upload geometry file'}
                                </p>
                                <p className="text-xs text-slate-400">
                                    Supported: CSV, JSON, FARO (.fls), LEICA (.scan)
                                </p>
                            </div>
                        </div>
                    </label>

                    {/* Info Box */}
                    <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-lg">
                        <p className="text-sm text-cyan-300 font-bold mb-2">📏 What to measure:</p>
                        <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                            <li>Spiral case geometry points (100+ recommended)</li>
                            <li>Stay ring bolt hole positions</li>
                            <li>Runner inlet/outlet profiles</li>
                            <li>Draft tube centerline alignment</li>
                            <li>Generator air gap (if applicable)</li>
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Comparison Summary */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 text-center">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Total Points</p>
                            <p className="text-2xl font-black text-white">{comparison.totalPoints}</p>
                        </div>
                        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 text-center">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Within Tolerance</p>
                            <p className="text-2xl font-black text-emerald-400">
                                {comparison.pointsWithinTolerance}
                            </p>
                            <p className="text-xs text-slate-500">
                                {((comparison.pointsWithinTolerance / comparison.totalPoints) * 100).toFixed(0)}%
                            </p>
                        </div>
                        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 text-center">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Avg Deviation</p>
                            <p className={`text-2xl font-black ${comparison.averageDeviation > 2 ? 'text-red-400' :
                                comparison.averageDeviation > 1 ? 'text-amber-400' : 'text-emerald-400'
                                }`}>
                                {comparison.averageDeviation.toFixed(2)}mm
                            </p>
                        </div>
                    </div>

                    {/* Efficiency Impact */}
                    {efficiencyGap && (
                        <div className={`p-4 rounded-lg border-2 ${efficiencyGap.predictedEfficiencyLoss > 1
                            ? 'bg-red-950/20 border-red-500'
                            : efficiencyGap.predictedEfficiencyLoss > 0.5
                                ? 'bg-amber-950/20 border-amber-500'
                                : 'bg-emerald-950/20 border-emerald-500'
                            }`}>
                            <p className="text-sm font-bold text-white mb-3">💰 Efficiency Impact Analysis</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Calculated Efficiency Loss</p>
                                    <p className="text-3xl font-black text-white">
                                        {efficiencyGap.predictedEfficiencyLoss.toFixed(2)}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Lost Revenue (Annual)</p>
                                    <p className="text-3xl font-black text-red-400">
                                        ${(efficiencyGap.lostRevenueAnnual / 1000).toFixed(0)}k
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Reconstruction Cost</p>
                                    <p className="text-2xl font-black text-white">
                                        ${(efficiencyGap.reconstructionCost / 1000).toFixed(0)}k
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">ROI (10-year)</p>
                                    <p className="text-2xl font-black text-emerald-400">
                                        {efficiencyGap.roi.toFixed(0)}%
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Payback: {efficiencyGap.paybackMonths.toFixed(1)} months
                                    </p>
                                </div>
                            </div>

                            {efficiencyGap.predictedEfficiencyLoss > 1 && (
                                <div className="mt-4 p-3 bg-red-950/30 rounded">
                                    <p className="text-xs text-red-300 font-bold">
                                        ⚠️ RECOMMENDATION: Efficiency loss &gt; 1%. Geometry correction recommended.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Top Deviations */}
                    <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                        <p className="text-sm font-bold text-white mb-3">Top 5 Deviations</p>
                        <div className="space-y-2">
                            {comparison.deviations
                                .sort((a, b) => b.deviation - a.deviation)
                                .slice(0, 5)
                                .map((dev, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                                        <div className="flex items-center gap-2">
                                            {dev.withinTolerance ? (
                                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                            ) : (
                                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                            )}
                                            <span className="text-xs text-slate-300">{dev.point}</span>
                                        </div>
                                        <span className={`text-xs font-bold ${dev.withinTolerance ? 'text-emerald-400' : 'text-amber-400'
                                            }`}>
                                            {dev.deviation.toFixed(2)} mm
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Generate Report Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            if (efficiencyGap) {
                                const report = SpecialMeasurementSyncService.generateGeometryReport(
                                    comparison,
                                    efficiencyGap
                                );
                                console.log(report);
                                alert('Report generated! (Check console)');
                            }
                        }}
                        className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg font-bold text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/50 transition-all"
                    >
                        <FileText className="w-5 h-5" />
                        Generate Full Report
                    </motion.button>
                </div>
            )}
        </GlassCard>
    );
};
