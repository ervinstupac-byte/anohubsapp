import React from 'react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { Activity, ShieldCheck, Wifi, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// NC-11600: System Health Bridge
// Simple client-side check for Supabase reachability
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export const SystemHealth: React.FC = () => {
    const { executiveResult, lastUpdate } = useTelemetryStore();
    const [now, setNow] = React.useState(Date.now());
    const [dbStatus, setDbStatus] = React.useState<'checking' | 'connected' | 'error'>('checking');

    React.useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        
        // NC-11600: Periodic DB Health Check
        const checkDb = async () => {
            if (!supabase) {
                setDbStatus('error');
                return;
            }
            try {
                // Check if we can read the latest ingest timestamp
                const { data, error } = await supabase
                    .from('dynamic_sensor_data')
                    .select('ingest_timestamp')
                    .order('ingest_timestamp', { ascending: false })
                    .limit(1);
                
                if (error) throw error;
                setDbStatus('connected');
            } catch (e: any) {
                // Graceful fallback - warn instead of error to keep console clean
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
                <ShieldCheck className={`w-4 h-4 ${trustScore > 90 ? 'text-emerald-400' : 'text-amber-400'}`} />
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Trust Score</span>
                    <span className={`text-sm font-mono font-bold ${trustScore > 90 ? 'text-white' : 'text-amber-200'}`}>
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
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Ingest</span>
                    <span className={`text-xs font-mono ${isLive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isLive ? 'LIVE' : `LAG ${Math.floor(latencyMs / 1000)}s`}
                    </span>
                </div>
            </div>

            {/* DB Status */}
            <div className="flex items-center gap-2">
                <Database className={`w-4 h-4 ${dbStatus === 'connected' ? 'text-blue-400' : 'text-red-400'}`} />
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Sovereign DB</span>
                    <span className={`text-xs font-mono ${dbStatus === 'connected' ? 'text-blue-400' : 'text-red-400'}`}>
                        {dbStatus === 'connected' ? 'SYNCED' : 'OFFLINE'}
                    </span>
                </div>
            </div>
        </div>
    );
};

// Part of the Sovereign Engineering Corps - Protocol NC-11700.
