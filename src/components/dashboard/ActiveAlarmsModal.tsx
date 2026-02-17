import React from 'react';
import { AlertTriangle, X, CheckCircle, ShieldAlert, Activity, ArrowLeft } from 'lucide-react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/90"
            />
            <div
                className="relative w-full max-w-2xl max-h-[80vh] flex flex-col bg-scada-panel border border-status-error/30 rounded-none shadow-none animate-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-scada-border bg-scada-bg">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-scada-panel rounded-none text-scada-muted hover:text-scada-text transition-colors lg:hidden border border-transparent hover:border-scada-border"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="p-2 bg-status-error/10 border border-status-error/20 rounded-none">
                            <ShieldAlert className="w-6 h-6 text-status-error animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-scada-text tracking-wide font-header uppercase">ACTIVE ALARMS</h2>
                            <p className="text-xs text-status-error font-mono uppercase tracking-widest font-bold">
                                {activeAlarms.length} SYSTEM ALERTS DETECTED
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-scada-panel rounded-none transition-colors border border-transparent hover:border-scada-border"
                    >
                        <X className="w-5 h-5 text-scada-muted hover:text-scada-text" />
                    </button>
                </div>

                {/* Alarm List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar bg-scada-bg">
                    {sortedAlarms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-scada-muted">
                            <CheckCircle className="w-12 h-12 mb-3 text-status-ok/50" />
                            <p className="text-sm font-medium font-mono uppercase">SYSTEM NOMINAL</p>
                            <p className="text-xs uppercase tracking-widest opacity-60 font-mono">No Active Alarms</p>
                        </div>
                    ) : (
                        sortedAlarms.map((alarm) => (
                            <div
                                key={alarm.id}
                                className={`p-4 rounded-none border flex items-start gap-4 group relative overflow-hidden transition-colors ${
                                    alarm.severity === 'CRITICAL' ? 'bg-status-error/10 border-status-error/50 hover:bg-status-error/15' :
                                    alarm.severity === 'WARNING' ? 'bg-status-warning/10 border-status-warning/50 hover:bg-status-warning/15' :
                                    'bg-status-info/10 border-status-info/50 hover:bg-status-info/15'
                                }`}
                            >
                                <div className={`mt-1 p-1.5 rounded-none border ${
                                    alarm.severity === 'CRITICAL' ? 'bg-status-error/20 text-status-error border-status-error/30' :
                                    alarm.severity === 'WARNING' ? 'bg-status-warning/20 text-status-warning border-status-warning/30' :
                                    'bg-status-info/20 text-status-info border-status-info/30'
                                }`}>
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                              
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-xs font-bold uppercase tracking-wider font-mono ${
                                            alarm.severity === 'CRITICAL' ? 'text-status-error' :
                                            alarm.severity === 'WARNING' ? 'text-status-warning' :
                                            'text-status-info'
                                        }`}>
                                            {alarm.severity} PRIORITY
                                        </span>
                                        <span className="text-[10px] text-scada-muted font-mono tabular-nums">
                                            {new Date(alarm.timestamp || Date.now()).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-medium text-scada-text mb-1 font-mono">{alarm.message}</h3>
                                </div>

                                <button
                                    onClick={() => acknowledgeAlarm?.(alarm.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 bg-scada-bg hover:bg-scada-panel border border-scada-border hover:border-scada-text rounded-none text-[10px] font-bold text-scada-text uppercase tracking-wider font-mono"
                                >
                                    ACK
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {activeAlarms.length > 0 && (
                    <div className="p-4 border-t border-scada-border bg-scada-panel">
                        <button
                            onClick={acknowledgeAllAlarms}
                            className="w-full py-3 bg-status-error/10 hover:bg-status-error/20 border border-status-error/30 rounded-none text-status-error font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all font-mono"
                        >
                            <Activity className="w-4 h-4" />
                            Acknowledge All Events
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
