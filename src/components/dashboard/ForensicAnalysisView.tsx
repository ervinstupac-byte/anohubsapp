import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Activity, Lightbulb, AlertTriangle,
    TrendingUp, Clock, Zap, FileText,
    BarChart3, Search, Eye
} from 'lucide-react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { SovereignViewShell } from './SovereignViewShell';
import { Sparkline } from '../ui/Sparkline';

export const ForensicAnalysisView: React.FC = () => {
    const { 
        rcaResults, 
        telemetryHistory, 
        diagnosis,
        mechanical,
        hydraulic,
        lastUpdate 
    } = useTelemetryStore();

    // Process RCA results for display
    const processedRCA = useMemo(() => {
        if (!rcaResults || rcaResults.length === 0) return [];
        
        return rcaResults.map((result: any) => ({
            id: result.id || `rca-${Date.now()}-${Math.random()}`,
            timestamp: result.timestamp || new Date().toISOString(),
            severity: result.severity || 'UNKNOWN',
            rootCause: result.rootCause || 'Unknown failure mode',
            contributingFactors: result.contributingFactors || [],
            recommendations: result.recommendations || [],
            confidence: result.confidence || 0
        }));
    }, [rcaResults]);

    // Death Spiral visualization from telemetry history
    const deathSpiralData = useMemo(() => {
        const vibrationHistory = telemetryHistory.vibrationX.slice(-30);
        const tempHistory = telemetryHistory.bearingTemp.slice(-30);
        
        return vibrationHistory.map((vib, idx) => ({
            time: idx,
            vibration: vib.value,
            temperature: tempHistory[idx]?.value || 0,
            risk: vib.value > 5 ? 'CRITICAL' : vib.value > 3 ? 'WARNING' : 'NOMINAL'
        }));
    }, [telemetryHistory.vibrationX, telemetryHistory.bearingTemp]);

    // Field tips based on current diagnosis
    const relevantTips = useMemo(() => {
        if (!diagnosis?.messages) return [];
        
        const codes = diagnosis.messages.map(m => m.code);
        const tips = [];
        
        if (codes.includes('STRUCTURAL_RISK_HIGH')) {
            tips.push({
                tip: 'Critical Hoop Stress: Safety factor below threshold. Immediate pressure reduction required.',
                action: 'Reduce operating pressure by 20% and schedule NDT inspection',
                severity: 'CRITICAL',
                threshold: 'Safety factor < 1.5',
                reference: 'ASME Section VIII'
            });
        }
        
        if (codes.includes('CAVITATION_DANGER')) {
            tips.push({
                tip: 'Cavitation detected in turbine runner zones. Efficiency loss imminent.',
                action: 'Reduce flow by 15% or increase head to avoid cavitation',
                severity: 'WARNING',
                threshold: 'Thoma number < 0.1',
                reference: 'IEC 60193'
            });
        }
        
        return tips;
    }, [diagnosis?.messages]);

    return (
        <SovereignViewShell
            config={{
                sector: 'Forensic Analysis',
                subtitle: 'Root Cause Analysis & Death Spiral Visualization',
                icon: Search,
                iconWrapClassName: 'bg-red-500/20 border-red-500/30',
                iconClassName: 'text-red-400',
                headerRight: (
                    <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
                        <span className="text-xs text-red-400 font-medium">
                            {processedRCA.length} RCA Results
                        </span>
                    </div>
                ),
                panels: [
                    {
                        key: 'rca-results',
                        title: 'Root Cause Analysis',
                        icon: FileText,
                        colSpan: 2,
                        content: (
                            <GlassCard className="p-4 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50">
                                <div className="space-y-3">
                                    {processedRCA.length === 0 ? (
                                        <div className="text-center text-slate-400 py-8">
                                            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                                            <p className="text-sm">No RCA data available</p>
                                            <p className="text-xs text-slate-500">
                                                Run diagnostics to generate Root Cause Analysis
                                            </p>
                                        </div>
                                    ) : (
                                        processedRCA.map((result, idx) => (
                                            <motion.div
                                                key={result.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1, duration: 0.3 }}
                                                className={`p-3 rounded-lg border ${
                                                    result.severity === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20' :
                                                    result.severity === 'WARNING' ? 'bg-yellow-500/10 border-yellow-500/20' :
                                                    'bg-green-500/10 border-green-500/20'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <AlertTriangle className={`w-4 h-4 ${
                                                            result.severity === 'CRITICAL' ? 'text-red-400' :
                                                            result.severity === 'WARNING' ? 'text-yellow-400' : 'text-green-400'
                                                        }`} />
                                                        <div>
                                                            <div className="font-medium text-white">
                                                                {result.rootCause}
                                                            </div>
                                                            <div className="text-xs text-slate-300 mt-1">
                                                                Confidence: {(result.confidence * 100).toFixed(0)}%
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {new Date(result.timestamp).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                                
                                                {result.contributingFactors && result.contributingFactors.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                                                        <div className="text-xs text-slate-400 mb-2">Contributing Factors</div>
                                                        <div className="space-y-1">
                                                            {result.contributingFactors.map((factor: string, factorIdx: number) => (
                                                                <div key={factorIdx} className="flex items-center gap-2 text-xs">
                                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                    <span className="text-slate-300">{factor}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {result.recommendations && result.recommendations.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                                                        <div className="text-xs text-slate-400 mb-2">Recommendations</div>
                                                        <div className="space-y-1">
                                                            {result.recommendations.map((rec: string, recIdx: number) => (
                                                                <div key={recIdx} className="flex items-start gap-2 text-xs">
                                                                    <Lightbulb className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                                                                    <span className="text-slate-300">{rec}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </GlassCard>
                        )
                    },
                    {
                        key: 'death-spiral',
                        title: 'Death Spiral Analysis',
                        icon: BarChart3,
                        colSpan: 1,
                        content: (
                            <GlassCard className="p-4 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50">
                                <div className="mb-3">
                                    <h4 className="text-lg font-semibold text-white mb-2">30-Point Death Spiral</h4>
                                    <div className="text-xs text-slate-400 mb-3">
                                        Shows vibration and temperature trends leading to failure
                                    </div>
                                </div>
                                
                                <div className="h-64">
                                    <Sparkline 
                                        data={deathSpiralData.map(d => d.vibration)}
                                        width={400}
                                        height={240}
                                    />
                                </div>
                                
                                <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span>Critical Risk</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                            <span>Warning Risk</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span>Nominal</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1 mt-4">
                                        <div className="font-medium text-slate-300">Current Status</div>
                                        <div className="text-slate-400">
                                            Vibration: {mechanical?.vibrationX?.toFixed(1) || '0.0'} mm/s
                                        </div>
                                        <div className="text-slate-400">
                                            Temperature: {mechanical?.bearingTemp || 0}°C
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        )
                    },
                    {
                        key: 'field-tips',
                        title: 'Architect Field Tips',
                        icon: Activity,
                        colSpan: 1,
                        content: (
                            <GlassCard className="p-4 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50">
                                <div className="space-y-3">
                                    {relevantTips.map((tip, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1, duration: 0.3 }}
                                            className={`p-3 rounded-lg border ${
                                                tip.severity === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20' :
                                                tip.severity === 'WARNING' ? 'bg-yellow-500/10 border-yellow-500/20' :
                                                    'bg-blue-500/10 border-blue-500/20'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Activity className={`w-4 h-4 mt-0.5 ${
                                                    tip.severity === 'CRITICAL' ? 'text-red-400' :
                                                    tip.severity === 'WARNING' ? 'text-yellow-400' : 'text-blue-400'
                                                }`} />
                                                <div>
                                                    <div className="font-medium text-white text-sm">{tip.tip}</div>
                                                    {tip.threshold && (
                                                        <div className="text-xs text-slate-300 mt-1">
                                                            Threshold: {tip.threshold}
                                                        </div>
                                                    )}
                                                    {tip.action && (
                                                        <div className="text-xs text-slate-300 mt-1">
                                                            Action: {tip.action}
                                                        </div>
                                                    )}
                                                    {tip.reference && (
                                                        <div className="text-xs text-slate-300 mt-1">
                                                            Ref: {tip.reference}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </GlassCard>
                        )
                    }
                ]
            }}
        />
    );
};
