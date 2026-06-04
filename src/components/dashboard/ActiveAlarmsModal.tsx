/**
 * ActiveAlarmsModal.tsx
 *
 * NC-LOOP: Unified alarm view merging two sources:
 *   1. ScadaCore interlock alarms (from useTelemetryStore.activeAlarms)
 *   2. AlarmBridge ISA 18.2 alarms (from useAlarmStore)
 *
 * This is the convergence point where the nervous system meets the SCADA HMI.
 */

import React, { useMemo } from 'react';
import {
  AlertTriangle,
  X,
  CheckCircle,
  ShieldAlert,
  Activity,
  ArrowLeft,
  BellRing,
} from 'lucide-react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { useAlarmStore, UIAlarm } from '../../stores/useAlarmStore';
import { useAlarmBridge } from '../../contexts/AlarmBridgeContext';

interface ActiveAlarmsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Unified alarm shape for rendering
interface UnifiedAlarm {
  id: string;
  severity: string;
  message: string;
  timestamp: number;
  source: 'SCADA' | 'ISA_18.2';
  value?: number;
  unit?: string;
  threshold?: number;
  category?: string;
  state?: string;
}

export const ActiveAlarmsModal: React.FC<ActiveAlarmsModalProps> = ({ isOpen, onClose }) => {
  const {
    activeAlarms: scadaAlarms,
    acknowledgeAlarm: ackScada,
    acknowledgeAllAlarms,
  } = useTelemetryStore();
  const { alarms: bridgeAlarms, acknowledgeAlarm: ackBridgeStore } = useAlarmStore();
  const { acknowledgeAlarm: ackBridge } = useAlarmBridge();

  // Merge both alarm sources into a unified view
  const unifiedAlarms = useMemo<UnifiedAlarm[]>(() => {
    // ScadaCore interlock alarms
    const scadaEntries: UnifiedAlarm[] = (scadaAlarms || []).map((a: any) => ({
      id: a.id,
      severity: a.severity || 'WARN',
      message: a.message || 'Unknown alarm',
      timestamp: a.timestamp || Date.now(),
      source: 'SCADA' as const,
    }));

    // AlarmBridge ISA 18.2 alarms (only active/acknowledged, not cleared)
    const bridgeEntries: UnifiedAlarm[] = bridgeAlarms
      .filter(a => a.state !== 'CLEARED')
      .map(a => ({
        id: a.id,
        severity:
          a.priority === 'CRITICAL' ? 'CRITICAL' : a.priority === 'WARNING' ? 'WARNING' : 'INFO',
        message: a.message,
        timestamp: a.timestamp,
        source: 'ISA_18.2' as const,
        value: a.value,
        unit: a.unit,
        threshold: a.threshold,
        category: a.category,
        state: a.state,
      }));

    // Merge & sort: Critical first, then by timestamp descending
    return [...scadaEntries, ...bridgeEntries].sort((a, b) => {
      const priorityMap: Record<string, number> = {
        CRITICAL: 3,
        HIGH: 2,
        WARNING: 2,
        WARN: 1,
        INFO: 0,
      };
      const pA = priorityMap[a.severity] || 0;
      const pB = priorityMap[b.severity] || 0;
      if (pA !== pB) return pB - pA;
      return (b.timestamp || 0) - (a.timestamp || 0);
    });
  }, [scadaAlarms, bridgeAlarms]);

  const handleAcknowledge = (alarm: UnifiedAlarm) => {
    if (alarm.source === 'SCADA') {
      ackScada?.(alarm.id);
    } else {
      ackBridge(alarm.id);
    }
  };

  const handleAcknowledgeAll = () => {
    // Ack SCADA alarms
    acknowledgeAllAlarms?.();
    // Ack all bridge alarms
    bridgeAlarms.filter(a => a.state === 'ACTIVE').forEach(a => ackBridge(a.id));
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-status-error/10 border-status-error/50 hover:bg-status-error/15',
          icon: 'bg-status-error/20 text-status-error border-status-error/30',
          text: 'text-status-error',
        };
      case 'WARNING':
      case 'WARN':
        return {
          bg: 'bg-status-warning/10 border-status-warning/50 hover:bg-status-warning/15',
          icon: 'bg-status-warning/20 text-status-warning border-status-warning/30',
          text: 'text-status-warning',
        };
      default:
        return {
          bg: 'bg-status-info/10 border-status-info/50 hover:bg-status-info/15',
          icon: 'bg-status-info/20 text-status-info border-status-info/30',
          text: 'text-status-info',
        };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div onClick={onClose} className="absolute inset-0 bg-black/90" />
      <div className="relative w-full max-w-2xl max-h-[80vh] flex flex-col bg-scada-panel border border-status-error/30 rounded-none shadow-none animate-in zoom-in-95 duration-200">
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
              <h2 className="text-xl font-bold text-scada-text tracking-wide font-header uppercase">
                UNIFIED ALARM CENTER
              </h2>
              <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest font-bold">
                <span className="text-status-error">{unifiedAlarms.length} ALERTS</span>
                <span className="text-scada-muted">•</span>
                <span className="text-scada-muted flex items-center gap-1">
                  <Activity className="w-3 h-3" /> SCADA: {scadaAlarms.length}
                </span>
                <span className="text-scada-muted flex items-center gap-1">
                  <BellRing className="w-3 h-3" /> ISA:{' '}
                  {bridgeAlarms.filter(a => a.state !== 'CLEARED').length}
                </span>
              </div>
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
          {unifiedAlarms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-scada-muted">
              <CheckCircle className="w-12 h-12 mb-3 text-status-ok/50" />
              <p className="text-sm font-medium font-mono uppercase">SYSTEM NOMINAL</p>
              <p className="text-xs uppercase tracking-widest opacity-60 font-mono">
                No Active Alarms
              </p>
            </div>
          ) : (
            unifiedAlarms.map(alarm => {
              const cfg = getSeverityConfig(alarm.severity);
              const isAcked = alarm.state === 'ACKNOWLEDGED';
              return (
                <div
                  key={alarm.id}
                  className={`p-4 rounded-none border flex items-start gap-4 group relative overflow-hidden transition-colors ${cfg.bg} ${isAcked ? 'opacity-50' : ''}`}
                >
                  <div className={`mt-1 p-1.5 rounded-none border ${cfg.icon}`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider font-mono ${cfg.text}`}
                        >
                          {alarm.severity} PRIORITY
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded-none border ${
                            alarm.source === 'ISA_18.2'
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-600'
                          }`}
                        >
                          {alarm.source}
                        </span>
                      </div>
                      <span className="text-[10px] text-scada-muted font-mono tabular-nums">
                        {new Date(alarm.timestamp || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-scada-text mb-1 font-mono">
                      {alarm.message}
                    </h3>
                    {/* ISA 18.2 enriched data */}
                    {alarm.value !== undefined && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-scada-muted">
                          Measured:{' '}
                          <strong className="text-scada-text">
                            {alarm.value.toFixed(2)} {alarm.unit}
                          </strong>
                        </span>
                        {alarm.threshold !== undefined && (
                          <span className="text-[10px] font-mono text-scada-muted">
                            Limit: {alarm.threshold} {alarm.unit}
                          </span>
                        )}
                        {alarm.category && (
                          <span className="text-[10px] font-mono text-scada-muted px-1 bg-scada-panel border border-scada-border">
                            {alarm.category}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {!isAcked && (
                    <button
                      onClick={() => handleAcknowledge(alarm)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 bg-scada-bg hover:bg-scada-panel border border-scada-border hover:border-scada-text rounded-none text-[10px] font-bold text-scada-text uppercase tracking-wider font-mono"
                    >
                      ACK
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {unifiedAlarms.length > 0 && (
          <div className="p-4 border-t border-scada-border bg-scada-panel">
            <button
              onClick={handleAcknowledgeAll}
              className="w-full py-3 bg-status-error/10 hover:bg-status-error/20 border border-status-error/30 rounded-none text-status-error font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all font-mono"
            >
              <Activity className="w-4 h-4" />
              Acknowledge All Events ({unifiedAlarms.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
