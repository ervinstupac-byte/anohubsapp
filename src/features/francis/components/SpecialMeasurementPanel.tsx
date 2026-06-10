import React, { useMemo, useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { GlassCard } from '../../../shared/components/ui/GlassCard';
import {
    SpecialMeasurementSyncService,
    GeometryComparison,
    EfficiencyGapAnalysis,
    FRANCIS_IDEAL_BLUEPRINT
} from '../../../services/SpecialMeasurementSyncService';
import {
    SpecialMeasurementsService,
    CorrelationResult
} from '../../../services/SpecialMeasurementsService';
import { EnhancedAsset } from '../../../models/turbine/types';

interface SpecialMeasurementPanelProps {
    sessionId: string;
    asset: EnhancedAsset;
    onComplete: () => void;
}

export const SpecialMeasurementPanel: React.FC<SpecialMeasurementPanelProps> = ({
    asset,
    onComplete
}) => {
    const [importFormat, setImportFormat] = useState<'CSV' | 'JSON' | 'FARO' | 'LEICA'>('CSV');
    const [comparison, setComparison] = useState<GeometryComparison | null>(null);
    const [efficiencyGap, setEfficiencyGap] = useState<EfficiencyGapAnalysis | null>(null);
    const [correlation, setCorrelation] = useState<CorrelationResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const bearingSpan = asset.turbine_config?.bearing_span ?? 2.2;
    const rotorDiameter = asset.turbine_config?.runner_diameter ?? 1.2;

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);

        try {
            const measuredPoints = await SpecialMeasurementSyncService.importGeometryData(
                file.name,
                importFormat
            );

            const comparisonResult = SpecialMeasurementSyncService.compareWithBlueprint(
                measuredPoints,
                FRANCIS_IDEAL_BLUEPRINT
            );
            setComparison(comparisonResult);

            const efficiencyAnalysis = SpecialMeasurementSyncService.calculateEfficiencyGap(
                comparisonResult,
                asset.turbine_family,
                asset.capacity,
                80
            );
            setEfficiencyGap(efficiencyAnalysis);

            const avgDeviation = comparisonResult.averageDeviation;
            const correlationResult = SpecialMeasurementsService.correlateSettlementWithEccentricity(
                {
                    timestamp: Date.now(),
                    assetId: asset.id,
                    shaftDeviation: avgDeviation,
                    foundationSettlement: avgDeviation * 0.4,
                    bearingElevations: measuredPoints.slice(0, 3).map((_, i) => avgDeviation * (i + 1) * 0.1),
                    alignmentPoints: measuredPoints.slice(0, 5).map(p => ({
                        name: p.name,
                        x: p.x,
                        y: p.y,
                        z: p.z
                    }))
                },
                {
                    timestamp: Date.now(),
                    assetId: asset.id,
                    airGapVariation: [0.8, 0.9, 1.0, 1.1, 1.0, 0.9, 0.8, 0.85],
                    eccentricity: avgDeviation * 0.16,
                    eccentricityAngle: 45
                },
                bearingSpan,
                rotorDiameter
            );
            setCorrelation(correlationResult);
            onComplete();
        } finally {
            setIsProcessing(false);
        }
    };

    const statusColor = useMemo(() => {
        if (!correlation) return 'text-slate-400';
        if (correlation.status === 'CRITICAL') return 'text-red-400';
        if (correlation.status === 'SIGNIFICANT_DEVIATION') return 'text-amber-400';
        return 'text-emerald-400';
    }, [correlation]);

    return (
        <GlassCard className="mt-4 border border-cyan-900/30">
            <div className="mb-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 mb-1">
                    Special Measurements
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                    Laser tracker import → blueprint compare → settlement correlation
                </p>
            </div>

            {!comparison ? (
                <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-1">
                        {(['CSV', 'JSON', 'FARO', 'LEICA'] as const).map(format => (
                            <button
                                key={format}
                                type="button"
                                onClick={() => setImportFormat(format)}
                                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${importFormat === format
                                    ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-500'
                                    : 'bg-slate-800/50 text-slate-400 border border-slate-700'
                                    }`}
                            >
                                {format}
                            </button>
                        ))}
                    </div>

                    <label className="block cursor-pointer">
                        <input
                            type="file"
                            onChange={handleImport}
                            accept=".csv,.json,.txt"
                            className="hidden"
                            disabled={isProcessing}
                        />
                        <div className={`p-4 border border-dashed rounded-lg text-center ${isProcessing
                            ? 'border-cyan-500 bg-cyan-500/10 animate-pulse'
                            : 'border-slate-700 bg-slate-800/30 hover:border-cyan-500/50'
                            }`}>
                            <Upload className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                            <p className="text-[10px] font-bold text-white">
                                {isProcessing ? 'Processing...' : 'Upload geometry file'}
                            </p>
                        </div>
                    </label>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-slate-800/30 rounded border border-slate-700/50">
                            <p className="text-[9px] text-slate-400 uppercase">Points</p>
                            <p className="text-sm font-black text-white">{comparison.totalPoints}</p>
                        </div>
                        <div className="p-2 bg-slate-800/30 rounded border border-slate-700/50">
                            <p className="text-[9px] text-slate-400 uppercase">In Tol.</p>
                            <p className="text-sm font-black text-emerald-400">{comparison.pointsWithinTolerance}</p>
                        </div>
                        <div className="p-2 bg-slate-800/30 rounded border border-slate-700/50">
                            <p className="text-[9px] text-slate-400 uppercase">Avg Dev.</p>
                            <p className="text-sm font-black text-amber-400">{comparison.averageDeviation.toFixed(2)}mm</p>
                        </div>
                    </div>

                    {efficiencyGap && (
                        <div className="p-3 bg-slate-900/50 rounded border border-slate-700/50 text-[10px] space-y-1">
                            <p className="text-slate-300">
                                Efficiency loss: <span className="font-bold text-white">{efficiencyGap.predictedEfficiencyLoss.toFixed(2)}%</span>
                            </p>
                            <p className="text-slate-300">
                                Annual revenue impact: <span className="font-bold text-red-400">${(efficiencyGap.lostRevenueAnnual / 1000).toFixed(0)}k</span>
                            </p>
                        </div>
                    )}

                    {correlation && (
                        <div className="p-3 bg-slate-900/50 rounded border border-slate-700/50">
                            <p className={`text-[10px] font-bold uppercase ${statusColor}`}>
                                Correlation: {correlation.status.replace(/_/g, ' ')}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">{correlation.recommendation}</p>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => {
                            if (efficiencyGap && comparison) {
                                SpecialMeasurementSyncService.generateGeometryReport(comparison, efficiencyGap);
                            }
                        }}
                        className="w-full px-3 py-2 bg-emerald-600/80 rounded text-[10px] font-bold text-white flex items-center justify-center gap-2"
                    >
                        <FileText className="w-4 h-4" />
                        Generate Report
                    </button>
                </div>
            )}
        </GlassCard>
    );
};
