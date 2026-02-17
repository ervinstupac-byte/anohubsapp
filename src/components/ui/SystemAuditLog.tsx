/**
 * SYSTEM AUDIT LOG
 * Terminal-style scrolling log for system status messages.
 * Part of NC-400: Professional Witness UI
 */

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, CheckCircle, AlertCircle, Zap, Database, Cpu } from 'lucide-react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { EVENTS } from '../../lib/events';
import { getAuditLogs } from '../../services/PersistenceService';
import { FullAuditLogModal } from '../modals/FullAuditLogModal';
import { Maximize2 } from 'lucide-react';

interface LogEntry {
    timestamp: Date;
    source: 'SYSTEM' | 'PLC' | 'RCA' | 'DNA' | 'FILTER';
    message: string;
    type: 'info' | 'success' | 'warning';
}

const sourceConfig = {
    SYSTEM: { color: 'text-slate-400', icon: Terminal },
    PLC: { color: 'text-cyan-400', icon: Cpu },
    RCA: { color: 'text-purple-400', icon: Zap },
    DNA: { color: 'text-emerald-400', icon: Database },
    FILTER: { color: 'text-amber-400', icon: AlertCircle }
};

export const SystemAuditLog: React.FC<{ maxEntries?: number; className?: string }> = ({
    maxEntries = 50,
    className = ''
}) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [showFullLog, setShowFullLog] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Subscribe to store changes
    const baselineState = useTelemetryStore(state => state.baselineState);
    const isFilteredMode = useTelemetryStore(state => state.isFilteredMode);
    const filterType = useTelemetryStore(state => state.filterType);
    const rcaResults = useTelemetryStore(state => state.rcaResults);
    const connectionStatus = useTelemetryStore(state => state.connectionStatus);

    // Add log entry helper
    const addLog = (source: LogEntry['source'], message: string, type: LogEntry['type'] = 'info') => {
        setLogs(prev => {
            const newEntry: LogEntry = { timestamp: new Date(), source, message, type };
            const updated = [...prev, newEntry].slice(-maxEntries);
            return updated;
        });
    };

    // Initial boot messages
    useEffect(() => {
        // Load historical logs
        getAuditLogs(maxEntries).then(records => {
            if (records.length > 0) {
                const historicalLogs: LogEntry[] = records.map(r => ({
                    timestamp: new Date(r.timestamp),
                    source: 'SYSTEM',
                    message: `${r.event_type}: ${r.reason}`,
                    type: r.active_protection && r.active_protection !== 'NONE' ? 'warning' : 'info'
                }));
                setLogs(prev => [...historicalLogs, ...prev]);
                addLog('SYSTEM', `Restored ${records.length} audit records from local black box`, 'success');
            }
        });

        addLog('SYSTEM', 'Monolit Kernel v300.0 initialized', 'success');
        addLog('SYSTEM', `Persistence layer loaded from localStorage`, 'info');

        const handleKernelLog = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail) {
                const { level, source, message } = customEvent.detail;
                // Map level to type
                const type = level === 'CRITICAL' || level === 'ERROR' ? 'warning' : level === 'SUCCESS' ? 'success' : 'info';
                // Map source to known sources or default to SYSTEM
                const validSource = Object.keys(sourceConfig).includes(source) ? source : 'SYSTEM';
                addLog(validSource as any, message, type);
            }
        };

        const handleSovereignLog = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail) {
                const r = customEvent.detail;
                addLog('SYSTEM', `${r.event_type}: ${r.reason}`, r.active_protection !== 'NONE' ? 'warning' : 'info');
            }
        };

        window.addEventListener(EVENTS.SYSTEM_KERNEL_LOG, handleKernelLog);
        window.addEventListener('SOVEREIGN_AUDIT_LOG', handleSovereignLog);

        if (baselineState) {
            addLog('DNA', `Turbine DNA verified - Commissioned ${new Date(baselineState.commissioningDate).toLocaleDateString()}`, 'success');
        } else {
            addLog('DNA', 'No baseline DNA found - Run Commissioning Wizard', 'warning');
        }

        addLog('FILTER', `Signal filter: ${isFilteredMode ? `${filterType} active` : 'Bypassed (Raw mode)'}`, 'info');
        addLog('RCA', 'Baseline comparison engine active', 'success');

        return () => {
            window.removeEventListener(EVENTS.SYSTEM_KERNEL_LOG, handleKernelLog);
            window.removeEventListener('SOVEREIGN_AUDIT_LOG', handleSovereignLog);
        };
    }, []);

    // React to filter changes
    useEffect(() => {
        if (logs.length > 0) {
            addLog('FILTER', `Filter mode changed: ${isFilteredMode ? filterType : 'RAW'}`, 'info');
        }
    }, [isFilteredMode, filterType]);

    // React to RCA results
    useEffect(() => {
        if (rcaResults.length > 0) {
            addLog('RCA', `${rcaResults.length} fault(s) detected - ${rcaResults[0].cause}`, 'warning');
        }
    }, [rcaResults]);

    // React to connection status
    useEffect(() => {
        if (connectionStatus === 'CONNECTED') {
            addLog('PLC', 'Gateway connection established', 'success');
        } else if (connectionStatus === 'DISCONNECTED') {
            addLog('PLC', 'Connection lost - Using cached values', 'warning');
        }
    }, [connectionStatus]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className={`bg-slate-950 border border-slate-800 rounded-none overflow-hidden ${className}`}>
            {/* Header */}
            <div className="px-3 py-2 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Terminal className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        System Audit Log
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setShowFullLog(true)}
                        className="text-slate-500 hover:text-cyan-400 transition-colors"
                        title="Expand Forensic View"
                    >
                        <Maximize2 className="w-3 h-3" />
                    </button>
                    <div className="w-1.5 h-1.5 rounded-none bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] text-slate-600 font-mono">
                        {logs.length} entries
                    </span>
                </div>
            </div>

            {/* Log Entries */}
            <div
                ref={scrollRef}
                className="h-32 overflow-y-auto font-mono text-[10px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
            >
                {logs.map((log, i) => {
                    const SourceIcon = sourceConfig[log.source].icon;
                    return (
                        <div
                            key={i}
                            className="px-3 py-1 hover:bg-slate-900/50 flex items-start gap-2 border-b border-slate-800/30"
                        >
                            <span className="text-slate-600 shrink-0">
                                {log.timestamp.toLocaleTimeString('en-US', { hour12: false })}
                            </span>
                            <span className={`shrink-0 ${sourceConfig[log.source].color}`}>
                                [{log.source}]
                            </span>
                            <span className={`${log.type === 'success' ? 'text-emerald-400' :
                                    log.type === 'warning' ? 'text-amber-400' :
                                        'text-slate-300'
                                }`}>
                                {log.message}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="px-3 py-1.5 bg-slate-900/30 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[8px] text-slate-600 uppercase tracking-widest">
                    Sovereign Systems // NC-400
                </span>
                <div className="flex items-center gap-3">
                    {['SYSTEM', 'PLC', 'RCA', 'DNA'].map(source => (
                        <div key={source} className="flex items-center gap-1">
                            <div className={`w-1 h-1 rounded-none ${sourceConfig[source as keyof typeof sourceConfig].color.replace('text-', 'bg-')}`} />
                            <span className="text-[8px] text-slate-600">{source}</span>
                        </div>
                    ))}
                </div>
            </div>

            <FullAuditLogModal isOpen={showFullLog} onClose={() => setShowFullLog(false)} />
        </div>
    );
};

export default SystemAuditLog;
