
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Filter, Download, Terminal, ArrowLeft } from 'lucide-react';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { getAuditLogs, AuditLogRecord } from '../../services/PersistenceService';

interface FullAuditLogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const FullAuditLogModal: React.FC<FullAuditLogModalProps> = ({ isOpen, onClose }) => {
    const [logs, setLogs] = useState<AuditLogRecord[]>([]);
    const [filter, setFilter] = useState('');
    const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);

    useEffect(() => {
        if (isOpen) {
            getAuditLogs(500).then(setLogs);
        }
    }, [isOpen]);

    const filteredLogs = logs.filter(l => 
        l.event_type.toLowerCase().includes(filter.toLowerCase()) ||
        l.reason.toLowerCase().includes(filter.toLowerCase())
    );

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `sovereign_audit_log_${Date.now()}.json`);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-6xl h-[80vh] flex flex-col"
                    >
                        <GlassCard className="flex-1 flex flex-col overflow-hidden" noPadding>
                            {/* Header */}
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={onClose}
                                        className="p-2 hover:bg-white/10 rounded-none text-slate-400 hover:text-white transition-colors lg:hidden"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <Terminal className="w-5 h-5 text-cyan-400" />
                                    <h2 className="text-xl font-bold text-white tracking-wide">Sovereign Audit Ledger (Offline)</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={handleExport}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-none text-xs transition-colors"
                                    >
                                        <Download className="w-3 h-3" />
                                        Export JSON
                                    </button>
                                    <button 
                                        onClick={onClose} 
                                        className="p-2 hover:bg-white/10 rounded-none text-slate-400 hover:text-white"
                                        title="Close"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-1 overflow-hidden">
                                {/* List View */}
                                <div className="w-1/2 flex flex-col border-r border-white/10">
                                    <div className="p-2 border-b border-white/10">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input 
                                                type="text" 
                                                placeholder="Search logs..." 
                                                className="w-full bg-black/20 border border-white/10 rounded-none pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                                                value={filter}
                                                onChange={(e) => setFilter(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-white/5 text-slate-400 sticky top-0">
                                                <tr>
                                                    <th className="p-3 font-medium">Time</th>
                                                    <th className="p-3 font-medium">Event</th>
                                                    <th className="p-3 font-medium">Reason</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {filteredLogs.map((log, i) => (
                                                    <tr 
                                                        key={i} 
                                                        onClick={() => setSelectedLog(log)}
                                                        className={`cursor-pointer hover:bg-white/5 transition-colors ${selectedLog === log ? 'bg-cyan-500/10' : ''}`}
                                                    >
                                                        <td className="p-3 text-slate-400 font-mono text-xs whitespace-nowrap">
                                                            {new Date(log.timestamp).toLocaleString()}
                                                        </td>
                                                        <td className="p-3 text-cyan-300 font-medium">
                                                            {log.event_type}
                                                        </td>
                                                        <td className="p-3 text-slate-300 truncate max-w-[200px]">
                                                            {log.reason}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Detail View */}
                                <div className="w-1/2 bg-black/20 p-4 overflow-y-auto font-mono text-xs text-slate-300">
                                    {selectedLog ? (
                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-slate-500 mb-1">EVENT TYPE</div>
                                                <div className="text-xl text-white font-bold">{selectedLog.event_type}</div>
                                            </div>
                                            
                                            <div>
                                                <div className="text-slate-500 mb-1">TIMESTAMP</div>
                                                <div className="text-white">{new Date(selectedLog.timestamp).toISOString()}</div>
                                            </div>

                                            <div>
                                                <div className="text-slate-500 mb-1">REASON</div>
                                                <div className="p-3 bg-white/5 rounded text-amber-300 border border-amber-500/20">
                                                    {selectedLog.reason}
                                                </div>
                                            </div>

                                            {selectedLog.active_protection && (
                                                <div>
                                                    <div className="text-slate-500 mb-1">PROTECTION</div>
                                                    <div className="text-red-400 font-bold flex items-center gap-2">
                                                        <Filter className="w-3 h-3" />
                                                        {selectedLog.active_protection}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedLog.metric_value && (
                                                <div>
                                                    <div className="text-slate-500 mb-1">METRIC SNAPSHOT</div>
                                                    <div className="text-cyan-400 text-lg">
                                                        {selectedLog.metric_value} <span className="text-sm text-slate-500">{selectedLog.metric_unit}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedLog.details && (
                                                <div>
                                                    <div className="text-slate-500 mb-1">FULL CONTEXT</div>
                                                    <pre className="p-3 bg-black/40 rounded overflow-x-auto text-emerald-400/80">
                                                        {JSON.stringify(selectedLog.details, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                            <Terminal className="w-12 h-12 mb-4 opacity-20" />
                                            <p>Select a log entry to inspect forensic details</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
