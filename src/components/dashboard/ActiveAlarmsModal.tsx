import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, CheckCircle, ShieldAlert, Activity, ArrowLeft } from 'lucide-react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { GlassCard } from '../../shared/components/ui/GlassCard';

interface ActiveAlarmsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ActiveAlarmsModal: React.FC<ActiveAlarmsModalProps> = ({ isOpen, onClose }) => {
    const { activeAlarms, acknowledgeAlarm, acknowledgeAllAlarms } = useTelemetryStore();

    // Sort alarms: Critical first, then High, then others. Newest first.
    const sortedAlarms = [...activeAlarms].sort((a, b) => {
        const priorityMap: Record<string, number> = { 'CRITICAL': 3, 'HIGH': 2, 'WARN': 1, 'INFO': 0 };
        const pA = priorityMap[a.severity] || 0;
        const pB = priorityMap[b.severity] || 0;
        if (pA !== pB) return pB - pA;
        return (b.timestamp || 0) - (a.timestamp || 0);
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl max-h-[80vh] flex flex-col"
                    >
                        <GlassCard className="flex flex-col h-full border-red-500/30 bg-slate-900/90 shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={onClose}
                                        className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors lg:hidden"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <div className="p-2 bg-red-500/20 rounded-lg">
                                        <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white tracking-wide">ACTIVE ALARMS</h2>
                                        <p className="text-xs text-red-400 font-mono uppercase tracking-widest">
                                            {activeAlarms.length} SYSTEM ALERTS DETECTED
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            {/* Alarm List */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                                {sortedAlarms.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                                        <CheckCircle className="w-12 h-12 mb-3 text-emerald-500/50" />
                                        <p className="text-sm font-medium">SYSTEM NOMINAL</p>
                                        <p className="text-xs uppercase tracking-widest opacity-60">No Active Alarms</p>
                                    </div>
                                ) : (
                                    sortedAlarms.map((alarm) => (
                                        <motion.div
                                            key={alarm.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`p-4 rounded-lg border flex items-start gap-4 group relative overflow-hidden ${
                                alarm.severity === 'CRITICAL' ? 'bg-red-950/40 border-red-500/50' :
                                alarm.severity === 'WARNING' ? 'bg-amber-950/40 border-amber-500/50' :
                                'bg-slate-800/40 border-slate-700'
                              }`}
                            >
                              <div className={`mt-1 p-1.5 rounded-full ${
                                alarm.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                                alarm.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                <AlertTriangle className="w-4 h-4" />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                  <span className={`text-xs font-bold uppercase tracking-wider ${
                                    alarm.severity === 'CRITICAL' ? 'text-red-400' :
                                    alarm.severity === 'WARNING' ? 'text-amber-400' :
                                    'text-blue-400'
                                  }`}>
                                    {alarm.severity} PRIORITY
                                  </span>
                                                    <span className="text-[10px] text-slate-500 font-mono">
                                                        {new Date(alarm.timestamp || Date.now()).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm font-medium text-white mb-1">{alarm.message}</h3>
                                            </div>

                                            <button
                                                onClick={() => acknowledgeAlarm?.(alarm.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] font-bold text-slate-300 uppercase tracking-wider"
                                            >
                                                ACK
                                            </button>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {activeAlarms.length > 0 && (
                                <div className="p-4 border-t border-white/10 bg-slate-900/50">
                                    <button
                                        onClick={acknowledgeAllAlarms}
                                        className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Activity className="w-4 h-4" />
                                        Acknowledge All Events
                                    </button>
                                </div>
                            )}
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
