import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, X, Database, RefreshCw } from 'lucide-react';

/**
 * OfflineBanner — NC-OFFLINE-AWARE v1.0
 *
 * Displays when the browser is disconnected from the network.
 * Shows a persistent, collapsible amber banner with:
 * - Clear "Local Mode" indication
 * - Feature impact summary
 * - Reconnect / dismiss controls
 * - Auto-hides and shows "Synced ✓" when back online
 */
export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isDismissed, setIsDismissed] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setIsDismissed(false);
      setJustReconnected(false);
    };

    const handleOnline = () => {
      setJustReconnected(true);
      setIsOffline(false);
      // Auto-hide the "reconnected" message after 3s
      setTimeout(() => {
        setJustReconnected(false);
      }, 3000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const shouldShow = (isOffline && !isDismissed) || justReconnected;

  if (!shouldShow) return null;

  return (
    <AnimatePresence mode="wait">
      {justReconnected ? (
        /* Reconnected flash */
        <motion.div
          key="reconnected"
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex items-center gap-3 px-4 py-2 bg-emerald-950/80 border-b border-emerald-500/30 backdrop-blur-sm"
        >
          <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            Connection Restored — Synchronizing data...
          </span>
          <RefreshCw className="w-3 h-3 text-emerald-500 animate-spin ml-1" />
        </motion.div>
      ) : (
        /* Offline banner */
        <motion.div
          key="offline"
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative overflow-hidden border-b border-amber-500/40 bg-amber-950/60 backdrop-blur-sm animate-offline-pulse"
          style={{ boxShadow: '0 0 0 0 rgba(245, 158, 11, 0.3)' }}
        >
          {/* Shimmer line at top */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

          <div className="flex items-center gap-3 px-4 py-2">
            {/* Icon */}
            <div className="relative flex-shrink-0">
              <WifiOff className="w-4 h-4 text-amber-400" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 animate-ping opacity-75" />
            </div>

            {/* Main text */}
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-widest whitespace-nowrap">
                LOCAL MODE
              </span>
              <span className="text-slate-500 text-xs hidden sm:inline">•</span>
              <span className="text-xs text-amber-300/70 font-mono hidden sm:inline truncate">
                All data is stored locally. Real-time sync disabled.
              </span>
            </div>

            {/* Feature chips */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-mono text-emerald-400 uppercase tracking-wider">
                <Database className="w-2.5 h-2.5" />
                Data: Cached
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] font-mono text-amber-400 uppercase tracking-wider">
                Physics: Active
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-800/50 border border-slate-700 rounded text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                Sync: Paused
              </span>
            </div>

            {/* Expand / info */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[9px] font-mono text-amber-500/60 hover:text-amber-400 uppercase tracking-wider transition-colors hidden lg:block"
            >
              {isExpanded ? 'Less ▲' : 'Details ▼'}
            </button>

            {/* Dismiss */}
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-amber-500/40 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-all shrink-0"
              title="Dismiss (banner will return if offline)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Expanded detail panel */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="px-4 pb-3 border-t border-amber-500/20 mt-1 pt-3"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] font-mono">
                  <div>
                    <div className="text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      Available Offline
                    </div>
                    <ul className="text-slate-400 space-y-0.5 ml-2.5">
                      <li>• Physics Engine</li>
                      <li>• Telemetry Display</li>
                      <li>• Maintenance Logs</li>
                      <li>• Risk Calculator</li>
                      <li>• PDF Export</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-amber-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                      Limited Offline
                    </div>
                    <ul className="text-slate-400 space-y-0.5 ml-2.5">
                      <li>• Map features</li>
                      <li>• Live sensor feed</li>
                      <li>• AI diagnostics</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-red-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                      Requires Network
                    </div>
                    <ul className="text-slate-400 space-y-0.5 ml-2.5">
                      <li>• Cloud sync</li>
                      <li>• Authentication</li>
                      <li>• Remote updates</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-slate-400 font-bold uppercase tracking-wider mb-1">
                      Storage Status
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Local DB</span>
                        <span className="text-emerald-400">✓ Ready</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Last Sync</span>
                        <span className="text-amber-400">–</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
