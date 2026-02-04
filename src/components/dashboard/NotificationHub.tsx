import React, { useState, useEffect } from 'react';
import { AlertTriangle, Activity, Brain, X, ChevronRight } from 'lucide-react';
import { anomalyDetector, DetectedAnomaly } from '../../services/AnomalyDetector';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { ModernButton } from '../../shared/components/ui/ModernButton';

/**
 * Protocol NC-24: Neural Alert UI
 * Displays predictive maintenance anomalies with pulsing visual indicators.
 */
export const NotificationHub: React.FC = () => {
    const [anomalies, setAnomalies] = useState<DetectedAnomaly[]>([]);
    const [selectedAnomaly, setSelectedAnomaly] = useState<DetectedAnomaly | null>(null);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    // Demo: Simulate anomaly detection (in production, this would come from telemetry store)
    useEffect(() => {
        // Subscribe to anomaly events via a simple polling mechanism
        const checkForAnomalies = async () => {
            // In production: anomalyDetector.ingest(latestTelemetry)
            // For demo, we use a simulated anomaly if none exist
            if (anomalies.length === 0) {
                const demoAnomaly: DetectedAnomaly = {
                    id: 'DEMO-001',
                    type: 'SILENT_LOSS',
                    severity: 'MEDIUM',
                    probabilityScore: 87,
                    description: 'Efficiency dropped 2.3% while power remained stable. Possible trash rack obstruction.',
                    detectedAt: Date.now(),
                    telemetryWindowHash: 'a1b2c3d4e5f6789012345678901234567890abcd',
                    evidence: {
                        baseline: { efficiency: 92, powerMW: 10.5 },
                        current: { efficiency: 89.7, powerMW: 10.4 },
                        delta: { efficiency: -2.3, powerMW: -0.1 }
                    }
                };
                setAnomalies([demoAnomaly]);
            }
        };

        const interval = setInterval(checkForAnomalies, 5000);
        checkForAnomalies();
        return () => clearInterval(interval);
    }, []);

    const visibleAnomalies = anomalies.filter(a => !dismissed.has(a.id));
    const criticalCount = visibleAnomalies.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length;

    const handleDismiss = (id: string) => {
        setDismissed(prev => new Set([...prev, id]));
        if (selectedAnomaly?.id === id) setSelectedAnomaly(null);
    };

    const getSeverityColor = (severity: DetectedAnomaly['severity']) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-500/20 border-red-500/50 text-red-400';
            case 'HIGH': return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
            case 'MEDIUM': return 'bg-purple-500/20 border-purple-500/50 text-purple-400';
            default: return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
        }
    };

    const getTypeIcon = (type: DetectedAnomaly['type']) => {
        switch (type) {
            case 'CAVITATION': return <Activity className="w-4 h-4" />;
            case 'THERMAL_RUNAWAY': return <AlertTriangle className="w-4 h-4" />;
            default: return <Brain className="w-4 h-4" />;
        }
    };

    return (
        <>
            {/* Compact Alert Badge for Sidebar */}
            {visibleAnomalies.length > 0 && (
                <div className="relative">
                    <div
                        className={`
                            flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
                            border transition-all duration-300
                            ${criticalCount > 0
                                ? 'bg-amber-500/10 border-amber-500/30 animate-pulse-neural'
                                : 'bg-purple-500/10 border-purple-500/30 animate-pulse-neural-slow'
                            }
                        `}
                        onClick={() => setSelectedAnomaly(visibleAnomalies[0])}
                    >
                        <div className={`
                            w-2 h-2 rounded-full
                            ${criticalCount > 0 ? 'bg-amber-400' : 'bg-purple-400'}
                            animate-ping
                        `} />
                        <Brain className={`w-4 h-4 ${criticalCount > 0 ? 'text-amber-400' : 'text-purple-400'}`} />
                        <span className="text-xs font-mono font-bold text-white">
                            {visibleAnomalies.length} Neural {visibleAnomalies.length === 1 ? 'Alert' : 'Alerts'}
                        </span>
                        <ChevronRight className="w-3 h-3 text-slate-500 ml-auto" />
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedAnomaly && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <GlassCard className="w-full max-w-lg mx-4 p-0 overflow-hidden border-purple-500/30">
                        <div className="bg-slate-900/80 p-4 border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getSeverityColor(selectedAnomaly.severity)}`}>
                                    {getTypeIcon(selectedAnomaly.type)}
                                </div>
                                <div>
                                    <h3 className="text-sm font-mono font-black text-white uppercase">
                                        {selectedAnomaly.type.replace('_', ' ')}
                                    </h3>
                                    <div className="text-[10px] text-slate-400 font-mono">
                                        {new Date(selectedAnomaly.detectedAt).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedAnomaly(null)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Probability Score */}
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-amber-500/10 rounded-lg border border-purple-500/20">
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Confidence Score</div>
                                    <div className="text-3xl font-black font-mono text-white">{selectedAnomaly.probabilityScore}%</div>
                                </div>
                                <div className={`px-3 py-1 rounded text-xs font-bold font-mono ${getSeverityColor(selectedAnomaly.severity)}`}>
                                    {selectedAnomaly.severity}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="text-sm text-slate-300 leading-relaxed">
                                {selectedAnomaly.description}
                            </div>

                            {/* Evidence Delta */}
                            <div className="bg-slate-800/50 rounded-lg p-3 border border-white/5">
                                <div className="text-[10px] text-slate-400 uppercase font-mono font-bold mb-2">Evidence Delta</div>
                                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                    {Object.entries(selectedAnomaly.evidence.delta).map(([key, val]) => (
                                        <div key={key} className="flex justify-between">
                                            <span className="text-slate-400">{key}:</span>
                                            <span className={Number(val) < 0 ? 'text-red-400' : 'text-emerald-400'}>
                                                {Number(val) > 0 ? '+' : ''}{typeof val === 'number' ? val.toFixed(2) : val}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* SHA-256 Hash */}
                            <div className="text-[9px] text-slate-500 font-mono break-all">
                                SHA-256: {selectedAnomaly.telemetryWindowHash}
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/5 flex gap-2">
                            <ModernButton
                                variant="secondary"
                                className="flex-1 justify-center text-xs"
                                onClick={() => handleDismiss(selectedAnomaly.id)}
                            >
                                Acknowledge
                            </ModernButton>
                            <ModernButton
                                variant="primary"
                                className="flex-1 justify-center text-xs bg-purple-600 hover:bg-purple-500"
                                onClick={() => {
                                    // TODO: Link to ForensicReportService
                                    console.log('[NC-24] Generate Forensic Report for:', selectedAnomaly.id);
                                }}
                            >
                                Generate Forensic Report
                            </ModernButton>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* CSS for pulsing animations */}
            <style>{`
                @keyframes pulse-neural {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
                    50% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
                }
                @keyframes pulse-neural-slow {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.3); }
                    50% { box-shadow: 0 0 0 6px rgba(168, 85, 247, 0); }
                }
                .animate-pulse-neural { animation: pulse-neural 2s ease-in-out infinite; }
                .animate-pulse-neural-slow { animation: pulse-neural-slow 3s ease-in-out infinite; }
            `}</style>
        </>
    );
};
