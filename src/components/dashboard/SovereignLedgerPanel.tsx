/**
 * SovereignLedgerPanel.tsx
 * 
 * NC-1100: Sovereign Ledger & Asset Passports
 * Displays chronological history of Commander actions and system overrides
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Filter
} from 'lucide-react';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { SovereignGlobalState, GlobalState } from '../../services/SovereignGlobalState';
import { ThePulseEngine } from '../../services/ThePulseEngine';
import ExperienceLedgerService from '../../services/ExperienceLedgerService';

// Ledger Entry Type
interface LedgerEntry {
  id: string;
  timestamp: number;
  action: 'COMMANDER_SETPOINT' | 'SYSTEM_OVERRIDE' | 'PULSE_UPDATE' | 'EXPERT_VALIDATION';
  actor: string;
  componentId?: string;
  previousPulseIndex: number;
  newPulseIndex: number;
  pulseDelta: number;
  details: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export const SovereignLedgerPanel: React.FC = () => {
  const [ledgerHistory, setLedgerHistory] = useState<LedgerEntry[]>([]);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'COMMANDER' | 'SYSTEM' | 'CRITICAL'>('ALL');
  const [currentPulseIndex, setCurrentPulseIndex] = useState(100);

  // Subscribe to SovereignGlobalState updates
  useEffect(() => {
    const checkForUpdates = () => {
      const state = SovereignGlobalState.getState();
      const newPulse = ThePulseEngine.calculatePulse(
        [state.physics.efficiency],
        state.finance.revenuePerHour,
        50,
        0,
        0,
        0
      );
      
      const newIndex = Math.round(newPulse.index);
      
      // Detect significant changes
      if (Math.abs(newIndex - currentPulseIndex) > 2) {
        const delta = newIndex - currentPulseIndex;
        const entry: LedgerEntry = {
          id: `pulse-${Date.now()}`,
          timestamp: Date.now(),
          action: 'PULSE_UPDATE',
          actor: 'System',
          previousPulseIndex: currentPulseIndex,
          newPulseIndex: newIndex,
          pulseDelta: delta,
          details: `Pulse index changed by ${delta > 0 ? '+' : ''}${delta}% due to telemetry update`,
          severity: Math.abs(delta) > 10 ? 'CRITICAL' : Math.abs(delta) > 5 ? 'WARNING' : 'INFO'
        };
        
        setLedgerHistory(prev => [entry, ...prev].slice(0, 100)); // Keep last 100 entries
        setCurrentPulseIndex(newIndex);
      }
    };

    // Check every 5 seconds
    const interval = setInterval(checkForUpdates, 5000);
    
    // Initial check
    checkForUpdates();
    
    return () => clearInterval(interval);
  }, [currentPulseIndex]);

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
        return <Shield className="w-4 h-4 text-amber-400" />;
      case 'SYSTEM_OVERRIDE':
        return <Activity className="w-4 h-4 text-blue-400" />;
      case 'PULSE_UPDATE':
        return <Zap className="w-4 h-4 text-purple-400" />;
      case 'EXPERT_VALIDATION':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <History className="w-4 h-4 text-slate-400" />;
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'WARNING':
        return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      default:
        return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
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
    ? ledgerHistory.reduce((acc, e) => acc + Math.abs(e.pulseDelta), 0) / ledgerHistory.length
    : 0;

  return (
    <GlassCard className="p-4 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Sovereign Ledger</h3>
          <span className="text-xs text-slate-500">Immutable History</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Current Pulse:</span>
          <span className={`text-lg font-bold ${
            currentPulseIndex > 90 ? 'text-green-400' :
            currentPulseIndex > 70 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {currentPulseIndex}%
          </span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-800/50 rounded p-2 text-center">
          <div className="text-xl font-bold text-white">{totalActions}</div>
          <div className="text-xs text-slate-500">Total Actions</div>
        </div>
        <div className="bg-slate-800/50 rounded p-2 text-center">
          <div className="text-xl font-bold text-amber-400">{commanderActions}</div>
          <div className="text-xs text-slate-500">Commander</div>
        </div>
        <div className="bg-slate-800/50 rounded p-2 text-center">
          <div className="text-xl font-bold text-blue-400">{systemUpdates}</div>
          <div className="text-xs text-slate-500">System</div>
        </div>
        <div className="bg-slate-800/50 rounded p-2 text-center">
          <div className="text-xl font-bold text-purple-400">{avgPulseChange.toFixed(1)}%</div>
          <div className="text-xs text-slate-500">Avg Change</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-slate-400" />
        <div className="flex gap-2">
          {(['ALL', 'COMMANDER', 'SYSTEM', 'CRITICAL'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Entries */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No ledger entries yet</p>
              <p className="text-xs">Actions will be recorded here</p>
            </div>
          ) : (
            filteredEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`border rounded-lg overflow-hidden ${getSeverityColor(entry.severity)}`}
              >
                <button
                  onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                  className="w-full p-3 flex items-center gap-3"
                >
                  {getActionIcon(entry.action)}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{entry.action.replace(/_/g, ' ')}</span>
                      <span className="text-xs opacity-70">{formatTime(entry.timestamp)}</span>
                    </div>
                    <div className="text-xs opacity-70 mt-0.5">
                      {entry.actor} {entry.componentId && `• ${entry.componentId}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {entry.pulseDelta > 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-400" />
                      ) : entry.pulseDelta < 0 ? (
                        <TrendingDown className="w-3 h-3 text-red-400" />
                      ) : null}
                      <span className={`text-sm font-bold ${
                        entry.pulseDelta > 0 ? 'text-green-400' : 
                        entry.pulseDelta < 0 ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {entry.pulseDelta > 0 ? '+' : ''}{entry.pulseDelta}%
                      </span>
                    </div>
                    {expandedEntry === entry.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedEntry === entry.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-current border-opacity-20"
                    >
                      <div className="p-3 space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-black/20 rounded p-2">
                            <div className="text-xs opacity-70">Previous Pulse</div>
                            <div className="font-mono">{entry.previousPulseIndex}%</div>
                          </div>
                          <div className="bg-black/20 rounded p-2">
                            <div className="text-xs opacity-70">New Pulse</div>
                            <div className="font-mono">{entry.newPulseIndex}%</div>
                          </div>
                        </div>
                        <div className="bg-black/20 rounded p-2">
                          <div className="text-xs opacity-70">Details</div>
                          <div>{entry.details}</div>
                        </div>
                        {entry.severity === 'CRITICAL' && (
                          <div className="flex items-center gap-2 text-red-400 text-xs">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Critical pulse change detected</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
        <span>Last updated: {formatTime(Date.now())}</span>
        <span>Showing {filteredEntries.length} of {ledgerHistory.length} entries</span>
      </div>
    </GlassCard>
  );
};

export default SovereignLedgerPanel;
