import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Brain } from 'lucide-react';
import ExpertFeedbackLoop from '../../services/ExpertFeedbackLoop';
import SensorIntegritySentinel from '../../services/SensorIntegritySentinel';

export const DiagnosticAlertsPanel: React.FC = () => {
    const { diagnosis } = useTelemetryStore();
    const [learningIndicators, setLearningIndicators] = useState<Record<string, { confidence: number; recentlyLearned: boolean }>>({});

    const feedbackLoop = new ExpertFeedbackLoop();

    // NC-1500: Check for Sentinel sensor drift
    const [sentinelWarnings, setSentinelWarnings] = useState<Array<{
        code: string;
        severity: string;
        message: string;
        color: string;
        bgColor: string;
        icon: typeof AlertTriangle;
        onClick?: () => void;
        onValidate?: () => void;
    }>>([]);

    useEffect(() => {
        // Check sensor integrity periodically
        const checkInterval = setInterval(() => {
            const snapshot = {
                timestamp: Date.now(),
                temperatureC: 75, // Would come from telemetry
                vibrationMmS: 2.5,
                loadMw: 4.5,
                flowM3s: 40
            };

            const result = SensorIntegritySentinel.correlate(snapshot);
            
            if (result.sensorAnomaly) {
                const warning = {
                    code: 'SENSOR_DRIFT',
                    severity: 'WARNING',
                    message: `Sentinel Alert: ${result.note} (${result.anomalousField})`,
                    color: 'text-orange-400',
                    bgColor: 'bg-orange-500/10 border-orange-500/20',
                    icon: AlertTriangle
                };
                setSentinelWarnings([warning]);
            } else {
                setSentinelWarnings([]);
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(checkInterval);
    }, []);

    const handleValidate = (warningCode: string) => {
        // Simulate operator validation - in real app this would open a confirmation dialog
        const isValidated = window.confirm(`Validate warning: ${warningCode}? This teaches the system to recognize similar patterns.`);
        
        if (isValidated) {
            // Update Bayesian priors for this warning type
            const newPrior = feedbackLoop.adjustPriors(
                warningCode,
                1, // One true positive
                1  // One total validation
            );
            console.log(`[ExpertFeedbackLoop] Updated prior for ${warningCode}: ${newPrior}`);
            
            // Mark as recently learned
            setLearningIndicators(prev => ({
                ...prev,
                [warningCode]: { confidence: newPrior * 100, recentlyLearned: true }
            }));
            
            // Reset the "recently learned" indicator after 5 seconds
            setTimeout(() => {
                setLearningIndicators(prev => ({
                    ...prev,
                    [warningCode]: { confidence: newPrior * 100, recentlyLearned: false }
                }));
            }, 5000);
        }
    };

    const topWarnings = React.useMemo(() => {
        const diagnosisWarnings = !diagnosis?.messages || diagnosis.messages.length === 0 ? [] :
            diagnosis.messages
                .filter(msg => msg.code !== 'NOMINAL')
                .slice(0, 3)
                .map(msg => ({
                    code: msg.code,
                    severity: diagnosis?.severity || 'NOMINAL',
                    message: msg.en,
                    color: diagnosis?.severity === 'CRITICAL' ? 'text-red-400' : 'text-yellow-400',
                    bgColor: diagnosis?.severity === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20',
                    icon: diagnosis?.severity === 'CRITICAL' ? AlertTriangle : AlertCircle,
                    onClick: () => {
                        window.location.hash = '/master#forensic';
                    },
                    onValidate: () => handleValidate(msg.code)
                }));
        
        // Combine with Sentinel warnings
        return [...sentinelWarnings, ...diagnosisWarnings];
    }, [diagnosis?.messages, diagnosis?.severity, sentinelWarnings]);

    if (topWarnings.length === 0) {
        return (
            <GlassCard className="p-4 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50">
                <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">System Health</h3>
                </div>
                <div className="text-center text-green-400 font-medium">
                    All Systems Nominal
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="p-4 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50">
            <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Diagnostic Alerts</h3>
                {diagnosis?.severity === 'CRITICAL' && (
                    <div className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full animate-pulse">
                        <span className="text-xs text-red-400 font-medium">CRITICAL</span>
                    </div>
                )}
            </div>
            
            <div className="space-y-2">
                {topWarnings.map((warning, idx) => {
                    const IconComponent = warning.icon;
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.3 }}
                            className={`text-xs ${warning.color} ${warning.bgColor} p-3 rounded-lg border`}
                        >
                            <div className="flex items-start gap-2">
                                <IconComponent className={`w-3 h-3 mt-0.5 flex-shrink-0 ${warning.severity === 'CRITICAL' ? 'animate-pulse' : ''}`} />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{warning.code}:</span>
                                        <span className="ml-1">{warning.message}</span>
                                    </div>
                                    {/* AI Confidence Badge */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                                            (learningIndicators[warning.code]?.confidence || 5) > 80 ? 'bg-green-500/20 text-green-400' :
                                            (learningIndicators[warning.code]?.confidence || 5) > 50 ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-slate-500/20 text-slate-400'
                                        }`}>
                                            <Brain className="w-3 h-3" />
                                            <span>AI Confidence: {(learningIndicators[warning.code]?.confidence || 5).toFixed(0)}%</span>
                                            {learningIndicators[warning.code]?.recentlyLearned && (
                                                <span className="text-green-400 font-bold ml-1">+</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                        <CheckCircle 
                                            className="w-3 h-3 text-green-400 cursor-pointer hover:text-green-300" 
                                            onClick={warning.onValidate}
                                        />
                                        <span className="text-xs text-slate-400">Validate</span>
                                    </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </GlassCard>
    );
};
