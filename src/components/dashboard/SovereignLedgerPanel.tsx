import React, { useState, useEffect, useCallback } from 'react';
import { 
  History, 
  Shield, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Maximize2
} from 'lucide-react';
import { SovereignGlobalState, GlobalState } from '../../services/SovereignGlobalState';
import { ThePulseEngine } from '../../services/ThePulseEngine';
import ExperienceLedgerService from '../../services/ExperienceLedgerService';
import { getAuditLogs, AuditLogRecord } from '../../services/PersistenceService';
import { FullAuditLogModal } from '../modals/FullAuditLogModal';

// Ledger Entry Type
interface LedgerEntry {
  id: string;
  timestamp: number;
  action: string;
  actor: string;
  componentId?: string;
  previousPulseIndex?: number;
  newPulseIndex?: number;
  pulseDelta?: number;
  details: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export const SovereignLedgerPanel: React.FC = () => {
  const [ledgerHistory, setLedgerHistory] = useState<LedgerEntry[]>([]);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'COMMANDER' | 'SYSTEM' | 'CRITICAL'>('ALL');
  const [currentPulseIndex, setCurrentPulseIndex] = useState(100);
  const [showFullLog, setShowFullLog] = useState(false);

  // Load from PersistenceService (Audit Logs)
  useEffect(() => {
    const loadLogs = async () => {
        const logs = await getAuditLogs(100);
        const mapped: LedgerEntry[] = logs.map(l => ({
            id: String(l.id || Date.now()),
            timestamp: l.timestamp,
            action: l.event_type,
            actor: 'System',
            details: `${l.reason} ${l.metric_value ? `(${l.metric_value} ${l.metric_unit})` : ''}`,
            severity: (l.active_protection && l.active_protection !== 'NONE' ? 'WARNING' : 'INFO') as LedgerEntry['severity']
        }));
        setLedgerHistory(mapped);
    };

    loadLogs();
    
    // Listen for new logs
    const handleSovereignLog = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail) {
            const r = customEvent.detail;
            setLedgerHistory(prev => [{
                id: String(Date.now()),
                timestamp: Date.now(),
                action: r.event_type,
                actor: 'System',
                details: `${r.reason} ${r.metric_value ? `(${r.metric_value} ${r.metric_unit})` : ''}`,
                severity: (r.active_protection && r.active_protection !== 'NONE' ? 'WARNING' : 'INFO') as LedgerEntry['severity']
            }, ...prev].slice(0, 100));
        }
    };

    window.addEventListener('SOVEREIGN_AUDIT_LOG', handleSovereignLog);
    return () => window.removeEventListener('SOVEREIGN_AUDIT_LOG', handleSovereignLog);
  }, []);

  // Manual entry logger using ExperienceLedgerService high-level logic
  const logCommanderAction = useCallback(async (
    action: 'COMMANDER_SETPOINT' | 'SYSTEM_OVERRIDE',
    actor: string,
    componentId: string | undefined,
    previousIndex: number,
    newIndex: number,
    details: string
  ) => {
    const entry: LedgerEntry = {
      id: `cmd-${Date.now()}`,
      timestamp: Date.now(),
      action,
      actor,
      componentId,
      previousPulseIndex: previousIndex,
      newPulseIndex: newIndex,
      pulseDelta: newIndex - previousIndex,
      details,
      severity: Math.abs(newIndex - previousIndex) > 10 ? 'CRITICAL' : 'INFO'
    };
    
    setLedgerHistory(prev => [entry, ...prev].slice(0, 100));
    setCurrentPulseIndex(newIndex);

    // Record to ExperienceLedgerService (orphan integration)
    try {
      await ExperienceLedgerService.record({
        symptom_observed: `${action}: ${details}`,
        actual_cause: `Pulse changed from ${previousIndex}% to ${newIndex}%`,
        resolution_steps: `Commander action by ${actor}`,
        asset_id: componentId || null,
        work_order_id: entry.id
      });
      console.log('[ExperienceLedgerService] Action recorded to database');
    } catch (e) {
      console.warn('[ExperienceLedgerService] Failed to record:', e);
    }
  }, []);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Get action icon
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'COMMANDER_SETPOINT':
        return <Shield className="w-4 h-4 text-status-warning" />;
      case 'SYSTEM_OVERRIDE':
        return <Activity className="w-4 h-4 text-status-info" />;
      case 'PULSE_UPDATE':
        return <Zap className="w-4 h-4 text-status-info" />;
      case 'EXPERT_VALIDATION':
        return <CheckCircle className="w-4 h-4 text-status-ok" />;
      default:
        return <History className="w-4 h-4 text-scada-muted" />;
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-status-error border-status-error/30 bg-status-error/10';
      case 'WARNING':
        return 'text-status-warning border-status-warning/30 bg-status-warning/10';
      default:
        return 'text-scada-muted border-scada-border bg-scada-bg';
    }
  };

  // Filter entries
  const filteredEntries = ledgerHistory.filter(entry => {
    if (filter === 'ALL') return true;
    if (filter === 'COMMANDER') return entry.action === 'COMMANDER_SETPOINT';
    if (filter === 'SYSTEM') return entry.action === 'SYSTEM_OVERRIDE' || entry.action === 'PULSE_UPDATE';
    if (filter === 'CRITICAL') return entry.severity === 'CRITICAL';
    return true;
  });

  // Calculate statistics
  const totalActions = ledgerHistory.length;
  const commanderActions = ledgerHistory.filter(e => e.action === 'COMMANDER_SETPOINT').length;
  const systemUpdates = ledgerHistory.filter(e => e.action === 'PULSE_UPDATE').length;
  const avgPulseChange = ledgerHistory.length > 0
    ? ledgerHistory.reduce((acc, e) => acc + Math.abs(e.pulseDelta || 0), 0) / ledgerHistory.length
    : 0;

  return (
    <div className="p-4 bg-scada-panel border border-scada-border rounded-sm shadow-scada-card">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-status-info" />
          <div>
            <h2 className="text-lg font-bold text-scada-text uppercase tracking-tight">Sovereign Ledger</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-scada-muted font-mono uppercase">NC-1100 Immutable Record</span>
              <div className="px-1.5 py-0.5 rounded-sm bg-status-info/10 border border-status-info/20 text-[10px] text-status-info font-mono font-bold">
                {ledgerHistory.length} ENTRIES
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
            <button
                onClick={() => setShowFullLog(true)}
                className="p-2 bg-scada-bg hover:bg-scada-panel rounded-sm transition-colors border border-scada-border hover:border-scada-text text-status-info"
                title="Open Full Forensic Log"
            >
                <Maximize2 className="w-4 h-4" />
            </button>
            <div className="text-right">
              <div className="text-2xl font-bold font-mono text-scada-text tabular-nums">{currentPulseIndex}%</div>
              <div className="text-[10px] text-scada-muted font-mono uppercase">CURRENT PULSE</div>
            </div>
        </div>
      </div>

      <FullAuditLogModal isOpen={showFullLog} onClose={() => setShowFullLog(false)} />

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-scada-bg border border-scada-border rounded-sm p-2 text-center">
          <div className="text-xl font-bold font-mono text-scada-text tabular-nums">{totalActions}</div>
          <div className="text-[10px] text-scada-muted uppercase font-mono">Total Actions</div>
        </div>
        <div className="bg-scada-bg border border-scada-border rounded-sm p-2 text-center">
          <div className="text-xl font-bold font-mono text-status-warning tabular-nums">{commanderActions}</div>
          <div className="text-[10px] text-scada-muted uppercase font-mono">Commander</div>
        </div>
        <div className="bg-scada-bg border border-scada-border rounded-sm p-2 text-center">
          <div className="text-xl font-bold font-mono text-status-info tabular-nums">{systemUpdates}</div>
          <div className="text-[10px] text-scada-muted uppercase font-mono">System</div>
        </div>
        <div className="bg-scada-bg border border-scada-border rounded-sm p-2 text-center">
          <div className="text-xl font-bold font-mono text-status-info tabular-nums">{avgPulseChange.toFixed(1)}%</div>
          <div className="text-[10px] text-scada-muted uppercase font-mono">Avg Change</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-scada-muted" />
        <div className="flex gap-2">
          {(['ALL', 'COMMANDER', 'SYSTEM', 'CRITICAL'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-colors font-mono ${
                filter === f
                  ? 'bg-status-info/20 text-status-info border border-status-info/50'
                  : 'bg-scada-bg text-scada-muted border border-scada-border hover:text-scada-text'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Entries */}
      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-scada-muted">
              <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-mono uppercase">No ledger entries yet</p>
              <p className="text-xs font-mono">Actions will be recorded here</p>
            </div>
          ) : (
            filteredEntries.map((entry, index) => (
              <div
                key={entry.id}
                className={`border rounded-sm overflow-hidden ${getSeverityColor(entry.severity)}`}
              >
                <button
                  onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                  className="w-full p-3 flex items-center gap-3 hover:bg-white/5 transition-colors"
                >
                  {getActionIcon(entry.action)}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs font-mono uppercase tracking-tight">{entry.action.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] font-mono opacity-70">{formatTime(entry.timestamp)}</span>
                    </div>
                    <div className="text-[10px] font-mono opacity-70 mt-0.5 uppercase">
                      {entry.actor} {entry.componentId && `• ${entry.componentId}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {(entry.pulseDelta || 0) > 0 ? (
                        <TrendingUp className="w-3 h-3 text-status-ok" />
                      ) : (entry.pulseDelta || 0) < 0 ? (
                        <TrendingDown className="w-3 h-3 text-status-error" />
                      ) : null}
                      <span className={`text-xs font-mono font-bold ${
                        (entry.pulseDelta || 0) > 0 ? 'text-status-ok' : 
                        (entry.pulseDelta || 0) < 0 ? 'text-status-error' : 'text-scada-muted'
                      }`}>
                        {(entry.pulseDelta || 0) > 0 ? '+' : ''}{entry.pulseDelta}%
                      </span>
                    </div>
                    {expandedEntry === entry.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {expandedEntry === entry.id && (
                    <div className="border-t border-current border-opacity-20 animate-in slide-in-from-top-1 duration-200">
                      <div className="p-3 space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-scada-bg rounded-sm p-2">
                            <div className="text-[10px] uppercase font-mono opacity-70">Previous Pulse</div>
                            <div className="font-mono font-bold">{entry.previousPulseIndex}%</div>
                          </div>
                          <div className="bg-scada-bg rounded-sm p-2">
                            <div className="text-[10px] uppercase font-mono opacity-70">New Pulse</div>
                            <div className="font-mono font-bold">{entry.newPulseIndex}%</div>
                          </div>
                        </div>
                        <div className="bg-scada-bg rounded-sm p-2">
                          <div className="text-[10px] uppercase font-mono opacity-70">Details</div>
                          <div className="font-mono text-xs">{entry.details}</div>
                        </div>
                        {entry.severity === 'CRITICAL' && (
                          <div className="flex items-center gap-2 text-status-error text-xs font-mono uppercase font-bold">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Critical pulse change detected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            ))
          )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-scada-border flex items-center justify-between text-[10px] text-scada-muted font-mono uppercase">
        <span>Last updated: {formatTime(Date.now())}</span>
        <span>Showing {filteredEntries.length} of {ledgerHistory.length} entries</span>
      </div>
    </div>
  );
};

export default SovereignLedgerPanel;