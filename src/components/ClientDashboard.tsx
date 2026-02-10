import React, { useState, useRef, useEffect } from 'react';
import { useClient, MaintenanceEvent } from '../contexts/ClientContext';
import { useNotifications, Severity } from '../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Calendar, Activity, Zap, MessageSquare, LogOut, CheckCircle, Clock, Bell, Settings as SettingsIcon, X, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { ToastSystem } from './ui/ToastSystem';
import { TurbineLoader } from './ui/TurbineLoader';
import { useTranslation } from 'react-i18next';

export const ClientDashboard: React.FC = () => {
    const { activeClient, logout, clients, loginClient } = useClient();
    const { notifications, unreadCount, markAsRead, markAllAsRead, updateSettings, settings, simulateCriticalEvent } = useNotifications();
    const { t } = useTranslation();
    const [alerts, setAlerts] = useState<string[]>([]);

    // UI States
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const handleDownloadPdf = () => {
        setIsGeneratingPdf(true);
        setTimeout(() => {
            setIsGeneratingPdf(false);
            setAlerts(prev => [...prev, "PDF Report Generated Successfully"]);
            // Trigger actual download logic here if available
        }, 3000);
    };

    // Watchdog Simulation (Auto-trigger demo event after 5s)
    useEffect(() => {
        // Only triggering once for demo purposes on mount if no notifications exist
        // In reality, this would listen to a socket or polling
        /*
        const timer = setTimeout(() => {
            if (notifications.length === 0) simulateCriticalEvent();
        }, 3000);
        return () => clearTimeout(timer);
        */
    }, []);

    if (!activeClient) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-sans">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold tracking-widest text-[#2dd4bf]">SECURE PORTAL ACCESS</h1>
                    <div className="flex gap-4">
                        {clients.map(c => (
                            <button
                                key={c.id}
                                onClick={() => loginClient(c.id)}
                                className="px-6 py-3 bg-slate-800 rounded hover:bg-slate-700 border border-slate-700"
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const handleConsultationRequest = () => {
        setAlerts(prev => [...prev, "Consultation Request sent to AnoHUB Experts!"]);
        setTimeout(() => setAlerts([]), 3000); // Clear after 3s
    };

    const getSeverityIcon = (sev: Severity) => {
        switch (sev) {
            case 'CRITICAL': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'WARNING': return <AlertCircle className="w-4 h-4 text-amber-500" />;
            case 'INFO': return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    // Formatter for relative time (simple)
    const timeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        return `${Math.floor(minutes / 60)}h ago`;
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-[#2dd4bf55] relative">

            {/* --- HEADER (Co-Branding) --- */}
            <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a] relative z-20">
                <div className="flex items-center gap-6">
                    {/* AnoHUB Logo */}
                    <div className="flex items-center gap-2 opacity-80">
                        <div className="w-8 h-8 bg-[#2dd4bf] rounded-sm transform rotate-45" />
                        <span className="font-bold text-lg tracking-tighter text-white">AnoHUB</span>
                    </div>

                    <div className="h-8 w-px bg-white/10" />

                    {/* Client Logo */}
                    <div className="flex items-center gap-3">
                        <img src={activeClient.logoUrl} alt={activeClient.name} className="w-8 h-8 rounded bg-white/10 p-1" />
                        <span className="font-bold text-white text-lg">{activeClient.name}</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Live Power KPI */}
                    <div className="text-right border-r border-white/10 pr-6 mr-2 hidden md:block">
                        <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest flex items-center justify-end gap-2">
                            Live Power <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="text-2xl font-black text-white font-mono">
                            {activeClient.activePowerMW} <span className="text-sm text-slate-500">of {activeClient.capacityMW} MW</span>
                        </div>
                    </div>

                    {/* NOTIFICATION BELL */}
                    <div className="relative">
                        <button
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors relative"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                        </button>

                        {/* DROPDOWN */}
                        <AnimatePresence>
                            {isNotifOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 top-12 w-96 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden backdrop-blur-xl z-50 flex flex-col max-h-[500px]"
                                >
                                    {/* Notif Header */}
                                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#151515]">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('notifications.title', 'Notifications')}</h3>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                                className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-white"
                                            >
                                                <SettingsIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={markAllAsRead}
                                                className="text-[10px] text-[#2dd4bf] hover:underline uppercase tracking-wider font-bold"
                                            >
                                                {t('notifications.markAllRead', 'Mark Read')}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Settings Panel */}
                                    <AnimatePresence>
                                        {isSettingsOpen && (
                                            <motion.div
                                                initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                                className="bg-[#111] overflow-hidden border-b border-white/5"
                                            >
                                                <div className="p-4 space-y-2">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" checked={settings.allowCritical} onChange={e => updateSettings({ allowCritical: e.target.checked })} />
                                                        <span className="text-xs text-red-500 font-bold">Critical Alerts</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" checked={settings.allowWarning} onChange={e => updateSettings({ allowWarning: e.target.checked })} />
                                                        <span className="text-xs text-amber-500 font-bold">Warnings</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" checked={settings.allowInfo} onChange={e => updateSettings({ allowInfo: e.target.checked })} />
                                                        <span className="text-xs text-blue-500 font-bold">Info Updates</span>
                                                    </label>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* List */}
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-slate-600 text-xs uppercase tracking-widest">
                                                {t('notifications.empty', 'No new notifications')}
                                            </div>
                                        ) : (
                                            notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    className={`p-3 rounded border border-transparent hover:border-white/10 transition-colors cursor-pointer group relative ${n.read ? 'opacity-50 hover:opacity-100 bg-transparent' : 'bg-white/5'}`}
                                                    onClick={() => markAsRead(n.id)}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className="mt-1">{getSeverityIcon(n.severity)}</div>
                                                        <div className="flex-1">
                                                            <p className="text-xs text-white leading-relaxed">
                                                                {t(n.translationKey, n.params)}
                                                            </p>
                                                            <div className="flex justify-between items-center mt-2">
                                                                <span className="text-[10px] text-slate-500 font-mono">{timeAgo(n.timestamp)}</span>
                                                                {n.link && (
                                                                    <span className="text-[10px] text-[#2dd4bf] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        Expert Advice &rarr;
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {!n.read && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#2dd4bf] rounded-full" />}
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Demo Trigger Footer */}
                                    <div className="p-2 border-t border-white/5 bg-[#111]">
                                        <button
                                            onClick={simulateCriticalEvent}
                                            className="w-full py-1 text-[10px] text-slate-600 hover:text-red-500 uppercase tracking-widest font-bold transition-colors"
                                        >
                                            [DEV] Simulate Watchdog Trigger
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={logout}
                        className="p-2 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1600px] mx-auto z-10 relative">

                {/* LEFT: AUDIT HISTORY (Col 1-7) */}
                <div className="col-span-1 lg:col-span-7 space-y-6">
                    <h2 className="text-xl font-bold text-white uppercase tracking-widest border-l-4 border-[#2dd4bf] pl-4">
                        Audit History
                    </h2>

                    <div className="space-y-4">
                        {activeClient.reports.map((report) => (
                            <motion.div
                                key={report.id}
                                whileHover={{ scale: 1.01 }}
                                className="bg-[#121212] border border-white/5 p-6 rounded-lg flex flex-col sm:flex-row items-start gap-5 hover:border-[#2dd4bf]/30 transition-colors group"
                            >
                                <div className="p-4 bg-slate-900 rounded-lg text-[#2dd4bf]">
                                    <FileCheckIcon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold text-white group-hover:text-[#2dd4bf] transition-colors">{report.title}</h3>
                                        <span className="text-xs font-mono text-slate-500">{report.date}</span>
                                    </div>
                                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                                        {report.summary}
                                    </p>
                                    <button
                                        onClick={handleDownloadPdf}
                                        disabled={isGeneratingPdf}
                                        className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Download className="w-4 h-4" /> Download PDF Report
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: TIMELINE & ACTIONS (Col 8-12) */}
                <div className="col-span-1 lg:col-span-5 space-y-8">

                    {/* MAINTENANCE TIMELINE */}
                    <div className="bg-[#121212] border border-white/5 rounded-lg p-6">
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#2dd4bf]" /> Maintenance Timeline
                        </h2>

                        <div className="relative pl-6 border-l border-white/10 space-y-8">
                            {activeClient.timeline.map((event, idx) => (
                                <div key={event.id} className="relative">
                                    {/* Dot */}
                                    <div className={`absolute -left-[29px] top-1 w-4 h-4 rounded-full border-2 ${event.type === 'PAST' ? 'bg-[#121212] border-emerald-500' : 'bg-[#121212] border-amber-500'
                                        }`} />

                                    <div className="flex flex-col">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${event.type === 'PAST' ? 'text-emerald-500' : 'text-amber-500'
                                            }`}>
                                            {event.type === 'PAST' ? 'Completed' : 'Upcoming'}
                                        </span>
                                        <span className="text-sm font-bold text-white mt-1">{event.date}</span>
                                        <span className="text-slate-400 text-sm mt-1">{event.description}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* COMMUNICATION BRIDGE */}
                    <div className="bg-gradient-to-br from-[#2dd4bf]/10 to-transparent border border-[#2dd4bf]/20 rounded-lg p-6 text-center">
                        <MessageSquare className="w-8 h-8 text-[#2dd4bf] mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Need Expert Advice?</h3>
                        <p className="text-sm text-slate-400 mb-6">
                            Direct line to AnoHUB engineers for urgent consultations regarding your plant's physics or efficiency.
                        </p>
                        <button
                            onClick={handleConsultationRequest}
                            className="bg-[#2dd4bf] text-black font-bold py-3 px-6 rounded hover:bg-emerald-400 transition-colors w-full uppercase tracking-widest text-xs"
                        >
                            Request Expert Consultation
                        </button>
                    </div>

                </div>

            </main>

            {/* FULL SCREEN LOADER OVERLAY */}
            <AnimatePresence>
                {isGeneratingPdf && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
                    >
                        <TurbineLoader message="Generating Secure PDF..." />
                    </motion.div>
                )}
            </AnimatePresence>


            <ToastSystem alerts={alerts} />
        </div>
    );
};

// Icons (Simple Wrappers)
const FileCheckIcon = ({ className }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="m9 15 2 2 4-4" /></svg>
);
