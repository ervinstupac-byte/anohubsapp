import React from 'react';
import { motion } from 'framer-motion';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import ExpertFeedbackLoop from '../../services/ExpertFeedbackLoop';

export const DiagnosticAlertsPanel: React.FC = () => {
    const { diagnosis } = useTelemetryStore();

    const feedbackLoop = new ExpertFeedbackLoop();

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
        }
    };

    const topWarnings = React.useMemo(() => {
        if (!diagnosis?.messages || diagnosis.messages.length === 0) return [];
        
        return diagnosis.messages
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
                    // Navigate to forensic view when alert is clicked
                    window.location.hash = '/master#forensic';
                },
                onValidate: () => handleValidate(msg.code)
            }));
    }, [diagnosis?.messages, diagnosis?.severity]);

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
                                <div>
                                    <span className="font-medium">{warning.code}:</span>
                                    <span className="ml-1">{warning.message}</span>
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
