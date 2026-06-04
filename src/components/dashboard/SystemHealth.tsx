import React from 'react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { Activity, ShieldCheck, Wifi, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../services/supabaseClient';

// NC-11600: System Health Bridge
// Simple client-side check for Supabase reachability
// Reuse the shared singleton `supabase` imported above.

export const SystemHealth: React.FC = () => {
  const { executiveResult, lastUpdate } = useTelemetryStore();
  const [now, setNow] = React.useState(Date.now());
  const [dbStatus, setDbStatus] = React.useState<'checking' | 'connected' | 'error'>('checking');

  React.useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);

    // NC-11600: Periodic DB Health Check
    const checkDb = async () => {
      try {
        if (!supabase || typeof (supabase as any).from !== 'function') {
          setDbStatus('error');
          return;
        }

        const table = (supabase as any).from('dynamic_sensor_data');

        // Prefer chainable query if provided by real client
        try {
          if (table && typeof table.order === 'function') {
            const res = await table
              .select('ingest_timestamp')
              .order('ingest_timestamp', { ascending: false })
              .limit(1);
            if (res && (res.data || res.length >= 0)) {
              setDbStatus('connected');
              return;
            }
          }
        } catch (e) {
          // fallthrough to simpler select
        }

        // Fallback: call select and await result (works with stub/noop clients)
        const maybe = table.select ? table.select('ingest_timestamp') : null;
        const res = maybe ? await Promise.resolve(maybe) : null;
        if (res && (res.data || (Array.isArray(res) && res.length >= 0))) {
          setDbStatus('connected');
        } else {
          setDbStatus('error');
        }
      } catch (e: any) {
        console.warn('[SystemHealth] DB Check Warning:', e.message || 'Connection failed');
        setDbStatus('error');
      }
    };

    checkDb(); // Initial check
    const dbInterval = setInterval(checkDb, 30000); // Check every 30s

    return () => {
      clearInterval(interval);
      clearInterval(dbInterval);
    };
  }, []);

  // Calculate ingestion latency
  const lastUpdateTs = lastUpdate ? new Date(lastUpdate).getTime() : 0;
  const latencyMs = now - lastUpdateTs;
  const isLive = latencyMs < 30000; // < 30 seconds considered "Live"

  // Trust Score (default to 100 if missing, it's optimistic UI)
  const trustScore = executiveResult?.masterHealthScore ?? 100;

  return (
    <div className="flex items-center gap-4 bg-slate-900 border border-slate-700/50 rounded-none px-4 py-2">
      {/* Sensor Trust Score */}
      <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
        <ShieldCheck
          className={`w-4 h-4 ${trustScore > 90 ? 'text-emerald-400' : 'text-amber-400'}`}
        />
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
            Trust Score
          </span>
          <span
            className={`text-sm font-mono font-bold ${trustScore > 90 ? 'text-white' : 'text-amber-200'}`}
          >
            {trustScore.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Ingest Status */}
      <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
        <div className="relative">
          <Wifi className={`w-4 h-4 ${isLive ? 'text-emerald-400' : 'text-red-400'}`} />
          {isLive && (
            <motion.div
              className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-none"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
            Ingest
          </span>
          <span className={`text-xs font-mono ${isLive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isLive ? 'LIVE' : `LAG ${Math.floor(latencyMs / 1000)}s`}
          </span>
        </div>
      </div>

      {/* DB Status */}
      <div className="flex items-center gap-2">
        <Database
          className={`w-4 h-4 ${dbStatus === 'connected' ? 'text-blue-400' : 'text-red-400'}`}
        />
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
            Sovereign DB
          </span>
          <span
            className={`text-xs font-mono ${dbStatus === 'connected' ? 'text-blue-400' : 'text-red-400'}`}
          >
            {dbStatus === 'connected' ? 'SYNCED' : 'OFFLINE'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Part of the Sovereign Engineering Corps - Protocol NC-11700.
