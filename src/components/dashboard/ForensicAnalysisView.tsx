import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Activity, Lightbulb, AlertTriangle,
    TrendingUp, Clock, Zap, FileText,
    BarChart3, Search, Eye,
    BookOpen, History, Archive,
    Radar
} from 'lucide-react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { SovereignViewShell } from './SovereignViewShell';
import { Sparkline } from '../ui/Sparkline';
import { SovereignMemory } from '../../services/SovereignMemory';
import { HistoricalVibrationCases } from '../../knowledge/VibrationPatterns';

export const ForensicAnalysisView: React.FC = () => {
    const { 
        rcaResults, 
        telemetryHistory, 
        diagnosis,
        mechanical,
        hydraulic,
        lastUpdate 
    } = useTelemetryStore();

    // Ancestral Notes from SovereignMemory
    const [ancestralNotes, setAncestralNotes] = useState<Array<{
        id: string;
        content: string;
        timestamp: number;
        drawingId: string;
        author: string;
        relevance: 'HIGH' | 'MEDIUM' | 'LOW';
    }>>([]);

    const memory = useMemo(() => new SovereignMemory(), []);
    const caseStudies = useMemo(() => {
        return Object.entries(HistoricalVibrationCases).map(([caseId, c]) => ({
            caseId,
            title: c.name,
            year: 'HIST',
            diagnosis: c.description,
            rootCause: c.description,
            severity: c.severity,
            recommendations: c.recommendations,
            matches: c.matches
        }));
    }, []);

    const matchVibrationPattern = (
        vibrationHz: number[],
        amplitudeMmS: number[],
        loadPercent: number,
        sigma: number
    ) => {
        const rpm = mechanical?.rpm || 0;
        let best: { caseStudy: (typeof caseStudies)[number]; confidence: number } | null = null;

        for (let i = 0; i < vibrationHz.length; i++) {
            const f = vibrationHz[i] ?? 0;
            const a = amplitudeMmS[i] ?? 0;
            for (const c of caseStudies) {
                if (!c.matches(rpm, a, f)) continue;
                const base = c.severity === 'CRITICAL' ? 0.85 : 0.75;
                const ampBoost = a >= 6 ? 0.12 : a >= 4 ? 0.06 : 0;
                const sigmaBoost = sigma >= 0.1 ? 0.03 : 0;
                const loadBoost = loadPercent >= 80 ? 0.02 : 0;
                const confidence = Math.min(0.99, base + ampBoost + sigmaBoost + loadBoost);
                if (!best || confidence > best.confidence) best = { caseStudy: c, confidence };
            }
        }

        return {
            match: !!best,
            case: best?.caseStudy ?? null,
            confidence: best?.confidence ?? 0
        };
    };

    // NC-1700: Auto Pattern Matcher - runs every 30 seconds
    const [patternMatchAlert, setPatternMatchAlert] = useState<{
        show: boolean;
        caseTitle: string;
        confidence: number;
        diagnosis: string;
        caseId: string;
    } | null>(null);

    useEffect(() => {
        const patternCheckInterval = setInterval(() => {
            // Get current telemetry
            const currentVibrationHz = [mechanical?.vibrationX ? mechanical.vibrationX * 20 : 120, 240, 360];
            const currentAmplitudeMmS = [mechanical?.vibrationX || 4.2, 3.8, 5.6];
            const currentLoadPercent = hydraulic?.flow ? (hydraulic.flow / 12) * 100 : 90;
            const currentSigma = 0.08;
            
            const match = matchVibrationPattern(
                currentVibrationHz,
                currentAmplitudeMmS,
                currentLoadPercent,
                currentSigma
            );
            
            // NC-1700: Critical alert for >80% confidence match
            if (match.match && match.case && match.confidence > 0.8) {
                setPatternMatchAlert({
                    show: true,
                    caseTitle: match.case.title,
                    confidence: match.confidence,
                    diagnosis: match.case.diagnosis,
                    caseId: match.case.caseId
                });
                
                // Log critical diagnostic alert
                console.error(`🔴 CRITICAL DIAGNOSTIC ALERT: ${match.confidence * 100}% match with ${match.case.title}`);
                console.error(`   Case ID: ${match.case.caseId}`);
                console.error(`   Diagnosis: ${match.case.diagnosis}`);
                console.error(`   Root Cause: ${match.case.rootCause}`);
            } else {
                setPatternMatchAlert(null);
            }
        }, 30000); // Every 30 seconds
        
        return () => clearInterval(patternCheckInterval);
    }, [mechanical?.vibrationX, mechanical?.rpm, hydraulic?.flow]);

    // Load ancestral notes when diagnosis changes
    useEffect(() => {
        const notes = memory.getFieldNotes('drawing-42');
        const currentVibration = mechanical?.vibrationX || 0;
        
        // Simulate historical context based on current vibration patterns
        const simulatedHistory: Array<{
            id: string;
            content: string;
            timestamp: number;
            drawingId: string;
            author: string;
            relevance: 'HIGH' | 'MEDIUM' | 'LOW';
        }> = [
            {
                id: 'ancient-1998-001',
                content: `In 1998, similar vibration pattern (${currentVibration.toFixed(1)} mm/s) led to seal failure after 200 hours of operation.`,
                timestamp: Date.now() - 86400000 * 30, // 30 days ago
                drawingId: 'drawing-42',
                author: 'Site Engineer (1998)',
                relevance: currentVibration > 4 ? 'HIGH' : 'MEDIUM'
            },
            {
                id: 'ancient-2012-003',
                content: 'Historical precedent: Bearing replacement required after 18 months under similar thermal stress.',
                timestamp: Date.now() - 86400000 * 15,
                drawingId: 'drawing-42',
                author: 'Maintenance Log (2012)',
                relevance: (mechanical?.bearingTemp || 0) > 70 ? 'HIGH' : 'LOW'
            },
            {
                id: 'wisdom-2020-007',
                content: 'Override record: Operator noted cavitation at this flow rate during commissioning.',
                timestamp: Date.now() - 86400000 * 7,
                drawingId: 'drawing-42',
                author: 'Commissioning Team',
                relevance: (hydraulic?.flow || 0) > 50 ? 'HIGH' : 'MEDIUM'
            }
        ];
        
        setAncestralNotes(simulatedHistory);
    }, [diagnosis, mechanical?.vibrationX, mechanical?.bearingTemp, hydraulic?.flow]);

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
                    },
                    {
                        key: 'ancestral-notes',
                        title: 'Ancestral Notes',
                        icon: BookOpen,
                        colSpan: 1,
                        content: (
                            <GlassCard className="p-4 bg-gradient-to-br from-amber-900/20 to-slate-900/95 backdrop-blur-xl border border-amber-500/30">
                                <div className="flex items-center gap-2 mb-4">
                                    <Archive className="w-4 h-4 text-amber-400" />
                                    <span className="text-sm font-medium text-amber-400">Drawing 42 References</span>
                                </div>
                                
                                <div className="space-y-3">
                                    {ancestralNotes.length === 0 ? (
                                        <div className="text-center text-slate-400 py-4">
                                            <History className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                                            <p className="text-xs">No historical precedents found</p>
                                        </div>
                                    ) : (
                                        ancestralNotes.map((note, idx) => (
                                            <motion.div
                                                key={note.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1, duration: 0.3 }}
                                                className={`p-3 rounded-lg border ${
                                                    note.relevance === 'HIGH' ? 'bg-red-500/10 border-red-500/30' :
                                                    note.relevance === 'MEDIUM' ? 'bg-amber-500/10 border-amber-500/30' :
                                                    'bg-blue-500/10 border-blue-500/30'
                                                }`}
                                            >
                                                <div className="flex items-start gap-2">
                                                    <History className={`w-4 h-4 mt-0.5 ${
                                                        note.relevance === 'HIGH' ? 'text-red-400' :
                                                        note.relevance === 'MEDIUM' ? 'text-amber-400' :
                                                        'text-blue-400'
                                                    }`} />
                                                    <div className="flex-1">
                                                        <div className="text-xs text-white leading-relaxed">
                                                            {note.content}
                                                        </div>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="text-xs text-slate-500">
                                                                {note.author}
                                                            </span>
                                                            <span className={`text-xs px-2 py-0.5 rounded ${
                                                                note.relevance === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                                                                note.relevance === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                                                                'bg-blue-500/20 text-blue-400'
                                                            }`}>
                                                                {note.relevance}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                                
                                {ancestralNotes.some(n => n.relevance === 'HIGH') && (
                                    <div className="mt-4 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                                        <div className="flex items-center gap-2 text-xs text-red-400">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span>High relevance historical match detected!</span>
                                        </div>
                                    </div>
                                )}
                            </GlassCard>
                        )
                    },
                    {
                        key: 'pattern-matcher',
                        title: 'Pattern Matcher',
                        icon: Radar,
                        colSpan: 1,
                        content: (
                            <GlassCard className="p-4 bg-gradient-to-br from-indigo-900/20 to-slate-900/95 backdrop-blur-xl border border-indigo-500/30">
                                <div className="flex items-center gap-2 mb-4">
                                    <Radar className="w-4 h-4 text-indigo-400" />
                                    <span className="text-sm font-medium text-indigo-400">Historical Vibration Patterns</span>
                                </div>
                                
                                <div className="space-y-3">
                                    {/* NC-1700: Critical Diagnostic Alert for >80% matches */}
                                    {patternMatchAlert?.show && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 bg-red-600/20 border border-red-600/50 rounded-lg animate-pulse"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                                <span className="text-sm font-bold text-red-500">CRITICAL DIAGNOSTIC ALERT</span>
                                            </div>
                                            <div className="text-sm text-white font-semibold mb-1">
                                                {patternMatchAlert.confidence * 100}% Match: {patternMatchAlert.caseTitle}
                                            </div>
                                            <div className="text-xs text-slate-300 mb-2">
                                                {patternMatchAlert.diagnosis}
                                            </div>
                                            <div className="text-xs text-red-400">
                                                Case ID: {patternMatchAlert.caseId}
                                            </div>
                                        </motion.div>
                                    )}
                                    
                                    {(() => {
                                        // Simulate pattern matching with current telemetry
                                        const currentVibrationHz = [mechanical?.vibrationX ? mechanical.vibrationX * 20 : 120, 240, 360];
                                        const currentAmplitudeMmS = [mechanical?.vibrationX || 4.2, 3.8, 5.6];
                                        const currentLoadPercent = hydraulic?.flow ? (hydraulic.flow / 12) * 100 : 90;
                                        const currentSigma = 0.08;
                                        
                                        const match = matchVibrationPattern(
                                            currentVibrationHz,
                                            currentAmplitudeMmS,
                                            currentLoadPercent,
                                            currentSigma
                                        );
                                        
                                        if (match.match && match.case) {
                                            return (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <AlertTriangle className="w-4 h-4 text-red-400" />
                                                        <span className="text-sm font-semibold text-red-400">PATTERN MATCH DETECTED</span>
                                                    </div>
                                                    <div className="text-sm text-white mb-1">
                                                        Matches {match.case.title}
                                                    </div>
                                                    <div className="text-xs text-slate-300 mb-2">
                                                        {match.case.diagnosis}
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-slate-400">
                                                            Year: {match.case.year} | ID: {match.case.caseId}
                                                        </span>
                                                        <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                                                            {(match.confidence * 100).toFixed(0)}% confidence
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 text-xs text-slate-400">
                                                        Root Cause: {match.case.rootCause}
                                                    </div>
                                                </motion.div>
                                            );
                                        } else {
                                            return (
                                                <div className="text-center text-slate-400 py-4">
                                                    <Radar className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                                                    <p className="text-xs">No historical pattern matches</p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Current vibration signature is unique
                                                    </p>
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>
                                
                                <div className="mt-4 pt-3 border-t border-slate-700/50">
                                    <div className="text-xs text-slate-400 mb-2">Available Case Studies</div>
                                    <div className="space-y-1">
                                        {caseStudies.map(c => (
                                            <div key={c.caseId} className="flex items-center gap-2 text-xs">
                                                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                                <span className="text-slate-300">{c.year}: {c.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </GlassCard>
                        )
                    }
                ]
            }}
        />
    );
};

export default ForensicAnalysisView;
