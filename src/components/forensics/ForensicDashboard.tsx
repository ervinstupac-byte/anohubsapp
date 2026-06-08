import React, { useEffect, useState } from 'react';
import { Microscope, Activity, ShieldAlert, Wifi, Globe, Lock, Camera, Mic, FileText, Search, AlertTriangle, Zap, CheckCircle, Info } from 'lucide-react';
import { VisionAnalyzer } from './VisionAnalyzer';
import { AudioSpectrogram } from './AudioSpectrogram';
import { PostMortemMonitor } from './PostMortemMonitor';
import { useTranslation } from 'react-i18next';
import { useForensics } from '../../hooks/useForensics';
import { KillSwitch } from './KillSwitch';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { QuickAccessCard } from '../../shared/components/ui/QuickAccessCard';
import { motion, AnimatePresence } from 'framer-motion';

// --- PACKET VISUALIZER COMPONENT ---
const PacketTrafficVisualizer: React.FC<{ history: any[] }> = ({ history }) => {
    if (history.length < 2) return <div className="h-48 flex items-center justify-center text-slate-600">INITIALIZING SENSORS...</div>;

    const width = 600;
    const height = 200;
    const maxVal = Math.max(...history.map(d => d.outbound), 100) * 1.2;

    const points = history.map((d, i) => {
        const x = (i / (history.length - 1)) * width;
        const y = height - (d.outbound / maxVal) * height;
        return `${x},${y}`;
    }).join(' ');

    const areaPath = `${points} ${width},${height} 0,${height}`;

    return (
        <div className="relative h-48 w-full bg-slate-950/50 rounded-xl overflow-hidden border border-slate-800">
            {/* Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-10 pointer-events-none">
                {[...Array(24)].map((_, i) => <div key={i} className="border-r border-b border-cyan-500/30"></div>)}
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-3d">
                <defs>
                    <linearGradient id="spikeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#spikeGradient)" stroke="none" />
                <polyline points={points} fill="none" stroke="#ef4444" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>

            <div className="absolute top-2 right-2 text-[10px] font-mono text-red-400">
                PEAK: {maxVal.toFixed(0)} Mbps
            </div>
        </div>
    );
};

export const ForensicDashboard: React.FC = () => {
    const { t } = useTranslation();
    const { status, trafficHistory, securityEvents, triggerSimulatedAttack, executeKillSwitch, currentLatency } = useForensics();
    const [forensicStatus, setForensicStatus] = useState<'secure' | 'monitoring' | 'threat'>('secure');

    // Calculate forensic status based on security events and traffic
    useEffect(() => {
        if (status === 'ATTACK_IN_PROGRESS') {
            setForensicStatus('threat');
        } else if (securityEvents.length > 0) {
            setForensicStatus('monitoring');
        } else {
            setForensicStatus('secure');
        }
    }, [status, securityEvents]);

    // Sound Effect for Attack (Optional)
    useEffect(() => {
        if (status === 'ATTACK_IN_PROGRESS') {
            // Play alarm sound if we had an audio context
        }
    }, [status]);

    return (
        <div className={`min-h-screen bg-[#050505] text-slate-200 p-8 font-sans transition-colors duration-1000 ${status === 'ATTACK_IN_PROGRESS' ? 'shadow-[inset_0_0_100px_rgba(220,38,38,0.2)]' : ''}`}>

            {/* CRITICAL OVERLAY */}
            <AnimatePresence>
                {status === 'ATTACK_IN_PROGRESS' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
                    >
                        <div className="w-full h-full border-[__20px] border-red-500/10 animate-pulse"></div>
                        <div className="absolute top-10 bg-red-600 text-white px-6 py-2 rounded-full font-black tracking-widest uppercase shadow-[0_0_50px_rgba(239,68,68,0.5)] animate-bounce">
                            ⚠️ {t('forensics.critical_alert', 'CRITICAL SECURITY ALERT: DATA EXFILTRATION')}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="mb-8 border-b border-white/10 pb-6 flex justify-between items-end relative z-10">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${status === 'ATTACK_IN_PROGRESS' ? 'bg-red-500 animate-pulse' : 'bg-[#2dd4bf] text-black'}`}>
                            {status === 'ATTACK_IN_PROGRESS' ? <ShieldAlert className="w-8 h-8 text-white" /> : <Microscope className="w-8 h-8" />}
                        </div>
                        {t('forensics.title', 'Diagnostic Forensics')}
                    </h1>
                    <p className="text-xs font-mono text-slate-500 uppercase tracking-widest pl-1">
                        {t('forensics.subtitle', 'Field Analysis Unit • Machine Health • Root Cause')}
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${status === 'ATTACK_IN_PROGRESS' ? 'bg-red-950/50 border-red-500 text-red-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                        <Wifi className="w-4 h-4" />
                        <span className="text-xs font-mono font-bold">{currentLatency.toFixed(0)}ms</span>
                    </div>
                </div>
            </header>

            {/* QUICK ACCESS CARDS SECTION */}
            <div className="mb-6">
                {/* Forensic Status Banner */}
                <div className={`mb-4 p-4 rounded-xl border-2 flex items-center justify-between ${
                    forensicStatus === 'threat' ? 'bg-red-500/10 border-red-500/30' :
                    forensicStatus === 'monitoring' ? 'bg-amber-500/10 border-amber-500/30' :
                    'bg-emerald-500/10 border-emerald-500/30'
                }`}>
                    <div className="flex items-center gap-3">
                        {forensicStatus === 'threat' ? <ShieldAlert className="w-5 h-5 text-red-500" /> :
                         forensicStatus === 'monitoring' ? <AlertTriangle className="w-5 h-5 text-amber-500" /> :
                         <CheckCircle className="w-5 h-5 text-emerald-500" />}
                        <div>
                            <div className={`text-xs font-bold uppercase tracking-wider ${
                                forensicStatus === 'threat' ? 'text-red-500' :
                                forensicStatus === 'monitoring' ? 'text-amber-500' :
                                'text-emerald-500'
                            }`}>
                                Security Status: {forensicStatus === 'threat' ? 'THREAT DETECTED' : forensicStatus === 'monitoring' ? 'MONITORING' : 'SECURE'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                                {securityEvents.length > 0 ? `${securityEvents.length} event${securityEvents.length > 1 ? 's' : ''} logged` : 'No security events'}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Network Latency</div>
                        <div className="text-sm font-bold text-white">{currentLatency.toFixed(0)}ms</div>
                    </div>
                </div>

                <div className="mb-4">
                    <h2 className="text-xl font-black text-white uppercase tracking-widest mb-1">Forensic Command Center</h2>
                    <p className="text-sm text-slate-400">Quick access to forensic analysis tools</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    <QuickAccessCard
                        id="vision-analyzer"
                        title="Vision Analyzer"
                        description="Visual forensics"
                        icon={<Camera className="w-6 h-6" />}
                        color="bg-red-500/10"
                        borderColor="border-red-500/30"
                        priority="critical"
                        onClick={() => document.getElementById('vision-analyzer')?.scrollIntoView({ behavior: 'smooth' })}
                    />
                    <QuickAccessCard
                        id="audio-spectrogram"
                        title="Audio Spectrogram"
                        description="Acoustic analysis"
                        icon={<Mic className="w-6 h-6" />}
                        color="bg-red-500/10"
                        borderColor="border-red-500/30"
                        priority="critical"
                        onClick={() => document.getElementById('audio-spectrogram')?.scrollIntoView({ behavior: 'smooth' })}
                    />
                    <QuickAccessCard
                        id="network-traffic"
                        title="Network Traffic"
                        description="Security monitoring"
                        icon={<Globe className="w-6 h-6" />}
                        color="bg-amber-500/10"
                        borderColor="border-amber-500/30"
                        priority="high"
                        onClick={() => document.getElementById('network-traffic')?.scrollIntoView({ behavior: 'smooth' })}
                    />
                    <QuickAccessCard
                        id="security-feed"
                        title="Security Feed"
                        description="Threat detection"
                        icon={<ShieldAlert className="w-6 h-6" />}
                        color="bg-amber-500/10"
                        borderColor="border-amber-500/30"
                        priority="high"
                        onClick={() => document.getElementById('security-feed')?.scrollIntoView({ behavior: 'smooth' })}
                    />
                    <QuickAccessCard
                        id="post-mortem"
                        title="Post-Mortem"
                        description="Incident analysis"
                        icon={<FileText className="w-6 h-6" />}
                        color="bg-cyan-500/10"
                        borderColor="border-cyan-500/30"
                        priority="medium"
                        onClick={() => document.getElementById('post-mortem')?.scrollIntoView({ behavior: 'smooth' })}
                    />
                    <QuickAccessCard
                        id="kill-switch"
                        title="Kill Switch"
                        description="Emergency shutdown"
                        icon={<Zap className="w-6 h-6" />}
                        color="bg-cyan-500/10"
                        borderColor="border-cyan-500/30"
                        priority="medium"
                        onClick={() => document.getElementById('kill-switch')?.scrollIntoView({ behavior: 'smooth' })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8 relative z-10">

                {/* 1. NETWORK TRAFFIC & SECURITY (Left Column) */}
                <div className="col-span-12 lg:col-span-4 space-y-6" id="network-traffic">
                    {/* Forensic Insights Panel */}
                    {securityEvents.length > 0 && (
                        <GlassCard className="bg-gradient-to-r from-red-950/20 to-amber-950/20 border border-red-500/30">
                            <div className="flex items-center gap-2 mb-3">
                                <Info className="w-5 h-5 text-red-400" />
                                <h3 className="text-sm font-bold text-red-300 uppercase tracking-wider">Recent Security Events</h3>
                            </div>
                            <div className="space-y-2">
                                {securityEvents.slice(0, 3).map((event, idx) => (
                                    <div key={idx} className="p-2 bg-slate-900/50 rounded border border-white/5">
                                        <p className="text-[10px] text-slate-200 font-mono">{event}</p>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    )}

                    <GlassCard className="p-0 overflow-hidden border-t-4 border-t-cyan-500">
                        <div className="p-4 bg-slate-900/50 flex justify-between items-center border-b border-white/5">
                            <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Globe className="w-4 h-4 text-cyan-400" />
                                {t('forensics.network_traffic', 'Network Traffic')}
                            </h3>
                            {status === 'ATTACK_IN_PROGRESS' && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded animate-pulse">SPIKE DETECTED</span>}
                        </div>
                        <div className="p-6">
                            <PacketTrafficVisualizer history={trafficHistory} />
                            <div className="flex justify-between mt-4 text-xs font-mono text-slate-500">
                                <span>INBOUND: {trafficHistory[trafficHistory.length - 1]?.inbound.toFixed(1)} Mbps</span>
                                <span className={status === 'ATTACK_IN_PROGRESS' ? 'text-red-400 font-bold' : ''}>
                                    OUTBOUND: {trafficHistory[trafficHistory.length - 1]?.outbound.toFixed(1)} Mbps
                                </span>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="h-96 flex flex-col" id="security-feed">
                        <div className="p-4 border-b border-white/5 bg-red-950/10">
                            <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-red-400" />
                                {t('forensics.security_feed', 'Security & Threat Feed')}
                            </h3>
                        </div>
                        <div className="flex-grow overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            {securityEvents.length === 0 ? (
                                <div className="text-center text-slate-600 text-xs italic mt-10">
                                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                    No active threats detected. System Nominal.
                                </div>
                            ) : (
                                securityEvents.map((event, i) => (
                                    <div key={i} className="text-[10px] font-mono p-2 bg-slate-900/80 border-l-2 border-red-500 text-slate-300">
                                        {event}
                                    </div>
                                ))
                            )}
                        </div>
                    </GlassCard>

                    <div id="kill-switch">
                        <KillSwitch isActive={status === 'THREAT_CONTAINED' || forensicStatus === 'threat'} onEngage={executeKillSwitch} />
                    </div>
                </div>

                {/* 2. MAIN VISUAL ANALYZER (Center/Right) */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    {/* Visual Forensics */}
                    <div id="vision-analyzer">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Camera className="w-4 h-4 text-cyan-400" />
                                Vision Analyzer
                            </h3>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Visual forensics & anomaly detection</span>
                        </div>
                        <div className="h-[450px]">
                            <VisionAnalyzer />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        {/* Audio Forensics */}
                        <div id="audio-spectrogram">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Mic className="w-4 h-4 text-cyan-400" />
                                    Audio Spectrogram
                                </h3>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Acoustic analysis</span>
                            </div>
                            <div className="h-[300px]">
                                <AudioSpectrogram />
                            </div>
                        </div>
                        {/* Post-Mortem */}
                        <div id="post-mortem">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-cyan-400" />
                                    Post-Mortem Monitor
                                </h3>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Incident analysis</span>
                            </div>
                            <div className="h-[300px]">
                                <PostMortemMonitor />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
