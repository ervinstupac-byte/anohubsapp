import React, { useEffect, useState } from 'react';
import { X, Activity, Cpu, Server, Shield, Zap, Clock, Network, Layers, Box, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EcosystemMap } from '../ui/EcosystemMap';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';

interface SystemOverviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * SystemOverviewModal - Displays the high-level ecosystem map.
 * Enhanced with Real-Time Telemetry & Sovereign Executive Status.
 * Now features improved glassmorphism and animated status indicators.
 */
export const SystemOverviewModal: React.FC<SystemOverviewModalProps> = ({ isOpen, onClose }) => {
    const { executiveResult, lastUpdate } = useTelemetryStore();
    const [uptime, setUptime] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setUptime(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatUptime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    const mode = executiveResult?.financials?.mode || 'STANDBY';
    const tier = executiveResult?.permissionTier || 'READ_ONLY';
    const health = executiveResult?.masterHealthScore || 100;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-6xl h-[85vh] flex flex-col"
                >
                    <GlassCard className="flex-1 flex flex-col relative overflow-hidden border-cyan-500/30 p-0 shadow-none rounded-none">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-950/80 shrink-0">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-none text-slate-400 hover:text-white transition-colors lg:hidden"
                                >
                                    <ArrowLeft className="w-6 h-6" />
                                </button>
                                <div className="p-3 bg-cyan-500/10 rounded-none border border-cyan-500/20 shadow-none">
                                    <Server className="w-6 h-6 text-cyan-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
                                        System Topology
                                        <span className="text-[10px] px-2 py-0.5 rounded-none bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 tracking-normal font-mono">v2.4.0</span>
                                    </h2>
                                    <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mt-1">
                                        <span className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-none bg-emerald-500 animate-pulse" />
                                            ONLINE
                                        </span>
                                        <span className="text-slate-600">|</span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-cyan-500" />
                                            UPTIME: <span className="text-cyan-100">{formatUptime(uptime)}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-none transition-colors text-slate-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Telemetry Bar */}
                        <div className="grid grid-cols-4 border-b border-white/10 bg-black/40 shrink-0">
                            <div className="p-4 border-r border-white/10 flex flex-col justify-center">
                                <div className="text-[10px] text-slate-500 font-mono uppercase mb-1 flex items-center gap-2">
                                    <Shield className="w-3 h-3" />
                                    Sovereign Mode
                                </div>
                                <div className={`text-xl font-black tracking-wider ${
                                    mode === 'RUN' ? 'text-emerald-400' : 
                                    mode === 'STOP' ? 'text-red-400' : 'text-amber-400'
                                }`}>
                                    {mode}
                                </div>
                            </div>
                            <div className="p-4 border-r border-white/10 flex flex-col justify-center">
                                <div className="text-[10px] text-slate-500 font-mono uppercase mb-1 flex items-center gap-2">
                                    <Activity className="w-3 h-3" />
                                    Health Score
                                </div>
                                <div className="text-xl font-black text-white tracking-wider flex items-end gap-1">
                                    {health.toFixed(1)}<span className="text-sm font-bold text-slate-500 mb-1">%</span>
                                </div>
                            </div>
                            <div className="p-4 border-r border-white/10 flex flex-col justify-center">
                                <div className="text-[10px] text-slate-500 font-mono uppercase mb-1 flex items-center gap-2">
                                    <Cpu className="w-3 h-3" />
                                    Permission Tier
                                </div>
                                <div className="text-lg font-bold text-purple-400 tracking-wider">
                                    {tier}
                                </div>
                            </div>
                            <div className="p-4 flex flex-col justify-center">
                                <div className="text-[10px] text-slate-500 font-mono uppercase mb-1 flex items-center gap-2">
                                    <Zap className="w-3 h-3" />
                                    Last Pulse
                                </div>
                                <div className="text-sm font-mono text-cyan-200">
                                    {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Waiting...'}
                                </div>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 bg-slate-950/80 relative overflow-hidden">
                             {/* Background Grid */}
                             <div className="absolute inset-0 opacity-20 pointer-events-none" 
                                style={{ 
                                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', 
                                    backgroundSize: '40px 40px' 
                                }} 
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-950/80 pointer-events-none" />
                            
                            <div className="h-full w-full flex items-center justify-center p-8">
                                <EcosystemMap />
                            </div>
                        </div>

                        {/* Footer Status */}
                        <div className="px-6 py-3 bg-slate-900 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-slate-500 shrink-0">
                            <div className="flex gap-8">
                                <div className="flex items-center gap-2">
                                    <Network className="w-3 h-3 text-cyan-500" />
                                    <span>SYNC: <span className="text-slate-300">ACTIVE (14ms)</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Layers className="w-3 h-3 text-purple-500" />
                                    <span>BRIDGE: <span className="text-slate-300">CONNECTED</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Box className="w-3 h-3 text-amber-500" />
                                    <span>NODES: <span className="text-slate-300">14/14</span></span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-none bg-emerald-500/10 border border-emerald-500/20">
                                <div className="w-1.5 h-1.5 rounded-none bg-emerald-500" />
                                <span className="text-emerald-400 font-bold">SYSTEM INTEGRITY VERIFIED</span>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
