/**
 * NotificationCenter.tsx
 *
 * Premium notification panel — docks into the sidebar or floats as an overlay.
 * Consumes useAlarmStore directly (no context needed — Zustand is global).
 * Provides: alarm list, severity badges, acknowledge action, asset deep-link.
 */

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BellRing,
  BellOff,
  X,
  CheckCheck,
  AlertTriangle,
  AlertOctagon,
  Info,
  ChevronRight,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { useAlarmStore, UIAlarm, AlarmPriorityUI } from '../../stores/useAlarmStore';
import { useAlarmBridge } from '../../contexts/AlarmBridgeContext';

// ─── Priority config ──────────────────────────────────────────────────────────
const PRIORITY_CONFIG: Record<
  AlarmPriorityUI,
  {
    Icon: LucideIcon;
    color: string;
    bg: string;
    border: string;
    badge: string;
    pulse: boolean;
  }
> = {
  CRITICAL: {
    Icon: AlertOctagon,
    color: 'text-red-400',
    bg: 'bg-red-950/60',
    border: 'border-red-500/40',
    badge: 'bg-red-500',
    pulse: true,
  },
  WARNING: {
    Icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-950/40',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500',
    pulse: false,
  },
  INFO: {
    Icon: Info,
    color: 'text-sky-400',
    bg: 'bg-sky-950/30',
    border: 'border-sky-500/20',
    badge: 'bg-sky-500',
    pulse: false,
  },
};

// ─── Alarm Card ───────────────────────────────────────────────────────────────
const AlarmCard: React.FC<{ alarm: UIAlarm }> = ({ alarm }) => {
  const navigate = useNavigate();
  const { acknowledgeAlarm } = useAlarmBridge();
  const cfg = PRIORITY_CONFIG[alarm.priority];
  const isAcknowledged = alarm.state === 'ACKNOWLEDGED';

  const handleAcknowledge = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      acknowledgeAlarm(alarm.id);
    },
    [alarm.id, acknowledgeAlarm]
  );

  const handleNavigate = useCallback(() => {
    // Navigate to the relevant asset in executive dashboard
    navigate(`/executive?asset=${alarm.assetId}`);
    useAlarmStore.getState().closePanel();
  }, [alarm.assetId, navigate]);

  const timeAgo = (() => {
    const diff = Date.now() - alarm.timestamp;
    const m = Math.floor(diff / 60_000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: isAcknowledged ? 0.5 : 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      layout
      className={`
        relative rounded-lg border p-3 cursor-pointer transition-all
        ${cfg.bg} ${cfg.border}
        ${isAcknowledged ? 'opacity-50' : 'hover:brightness-125'}
      `}
      onClick={handleNavigate}
    >
      {/* Priority indicator line */}
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-l-lg ${cfg.badge}`} />

      <div className="flex items-start gap-2.5 pl-2">
        {/* Icon */}
        <div className="mt-0.5 flex-shrink-0">
          {(() => {
            const IconComponent = cfg.Icon;
            const iconClass = `w-4 h-4 ${cfg.color}`;
            if (cfg.pulse && !isAcknowledged) {
              return (
                <div className="relative">
                  <IconComponent size={16} className={iconClass} />
                  <span className="absolute inset-0 animate-ping rounded-full opacity-30 bg-red-400" />
                </div>
              );
            }
            return <IconComponent size={16} className={iconClass} />;
          })()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>
              {alarm.priority} · {alarm.category}
            </span>
            <span className="text-[9px] text-slate-500 flex-shrink-0">{timeAgo}</span>
          </div>

          <p className="text-xs text-slate-200 font-medium leading-snug truncate">
            {alarm.assetName}
          </p>
          <p className="text-[10px] text-slate-400 leading-snug mt-0.5 line-clamp-2">
            {alarm.message}
          </p>

          {/* Value badge */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color} border ${cfg.border}`}
            >
              {alarm.value.toFixed(2)} {alarm.unit}
            </span>
            <span className="text-[9px] text-slate-600">
              limit: {alarm.threshold} {alarm.unit}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {!isAcknowledged && (
            <button
              onClick={handleAcknowledge}
              title="Acknowledge"
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-green-400 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Panel ───────────────────────────────────────────────────────────────
export const NotificationCenter: React.FC = () => {
  const { alarms, panelOpen, closePanel, getActiveCount, getCriticalCount, acknowledgeAlarm } =
    useAlarmStore();
  const alarmBridge = useAlarmBridge();

  const activeAlarms = alarms.filter(a => a.state !== 'CLEARED');
  const criticalCount = getCriticalCount();
  const activeCount = getActiveCount();

  const handleAcknowledgeAll = useCallback(() => {
    activeAlarms.filter(a => a.state === 'ACTIVE').forEach(a => alarmBridge.acknowledgeAlarm(a.id));
  }, [activeAlarms, alarmBridge]);

  return (
    <AnimatePresence>
      {panelOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-[2px]"
            onClick={closePanel}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 320 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 320 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[90] w-80 flex flex-col bg-slate-950 border-l border-slate-800/60 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 flex-shrink-0">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-slate-100 tracking-wide">Alarm Center</span>
                {activeCount > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      criticalCount > 0 ? 'bg-red-500 text-white' : 'bg-amber-500 text-black'
                    }`}
                  >
                    {activeCount}
                  </span>
                )}
              </div>
              <button
                onClick={closePanel}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stats bar */}
            {activeCount > 0 && (
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 border-b border-slate-800/40 flex-shrink-0">
                <div className="flex items-center gap-3 text-[10px]">
                  {criticalCount > 0 && (
                    <span className="flex items-center gap-1 text-red-400 font-bold">
                      <AlertOctagon className="w-3 h-3" />
                      {criticalCount} CRITICAL
                    </span>
                  )}
                  <span className="text-slate-500">{activeCount} active total</span>
                </div>
                <button
                  onClick={handleAcknowledgeAll}
                  className="text-[10px] text-slate-400 hover:text-green-400 flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3 h-3" />
                  ACK ALL
                </button>
              </div>
            )}

            {/* Alarm list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {activeAlarms.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600">
                  <ShieldCheck className="w-10 h-10 opacity-30" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-500">All Clear</p>
                    <p className="text-[11px] mt-1">No active alarms detected</p>
                  </div>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {activeAlarms.map(alarm => (
                    <AlarmCard key={alarm.id} alarm={alarm} />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-800/60 flex-shrink-0">
              <p className="text-[9px] text-slate-600 text-center">
                ISA 18.2 Compliant · AlarmBridge Active
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Bell trigger button (used in header/sidebar) ────────────────────────────
export const AlarmBellButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { getActiveCount, getCriticalCount, togglePanel } = useAlarmStore();
  const active = getActiveCount();
  const critical = getCriticalCount();

  return (
    <button
      id="alarm-bell-button"
      onClick={togglePanel}
      title={`${active} active alarm${active !== 1 ? 's' : ''}`}
      className={`relative p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors ${className}`}
    >
      {critical > 0 ? (
        <BellRing className="w-5 h-5 text-red-400" />
      ) : active > 0 ? (
        <BellRing className="w-5 h-5 text-amber-400" />
      ) : (
        <BellOff className="w-5 h-5" />
      )}

      {active > 0 && (
        <span
          className={`absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-black rounded-full px-1 ${
            critical > 0 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
          } text-white`}
        >
          {active > 99 ? '99+' : active}
        </span>
      )}
    </button>
  );
};
