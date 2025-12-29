import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from './ui/GlassCard.tsx';
import { ModernButton } from './ui/ModernButton.tsx';
import { useMaintenance } from '../contexts/MaintenanceContext.tsx';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { useNotifications } from '../contexts/NotificationContext.tsx';
import { Calendar, AlertCircle, Power } from 'lucide-react';

/**
 * Toolbox Launchpad
 * 
 * The Central Nervous System of AnoHUB.
 * Now fully connected to Asset and Maintenance contexts.
 */
export const ToolboxLaunchpad: React.FC = () => {
    const navigate = useNavigate();
    const { workOrders } = useMaintenance();
    const { assets, selectedAsset, assetLogs } = useAssetContext();
    const { pushNotification } = useNotifications();
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    // ZERO STATE: ONBOARDING GUIDE
    if (assets.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 flex items-center justify-center">
                <div className="max-w-4xl w-full space-y-8 animate-fade-in">

                    <GlassCard className="p-12 border-slate-800 max-w-xl mx-auto text-center shadow-2xl relative overflow-hidden group">
                        {/* Pulse Effect */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-pulse-slow" />

                        <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center border border-slate-700 mx-auto mb-8 shadow-inner relative">
                            <Power className="w-12 h-12 text-slate-600 group-hover:text-cyan-400 transition-colors duration-500" />
                        </div>

                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                            System Standby
                        </h3>
                        <p className="text-slate-500 font-mono text-sm mb-10 tracking-widest uppercase">
                            No Active Assets Detected
                        </p>

                        <ModernButton
                            variant="primary"
                            className="w-full py-4 text-lg font-bold shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] transition-shadow"
                            onClick={() => window.dispatchEvent(new CustomEvent('openAssetWizard'))}
                        >
                            Initialize First Asset
                        </ModernButton>
                    </GlassCard>

                    <p className="text-center text-[10px] text-slate-700 font-mono uppercase tracking-[0.2em]">
                        AnoHUB Secure Environment • v2.5.0
                    </p>
                </div>
            </div>
        );
    }

    // ACTIVE STATE DASHBOARD
    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8 space-y-8 animate-fade-in">
            {/* DYNAMIC HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/5">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
                        {greeting}, <span className="text-cyan-400">Engineer</span>
                    </h1>
                    <p className="text-slate-400 font-mono flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        System Operational • {assets.length} Assets Online
                        {selectedAsset && (
                            <span className="ml-4 text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded border border-white/5">
                                Active: {selectedAsset.name}
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex gap-3">
                    {selectedAsset && (
                        <ModernButton
                            variant="ghost"
                            onClick={() => {
                                pushNotification('INFO', `Generating Passport for ${selectedAsset.name}...`);
                                // Dynamic Import to avoid SSR/Build issues with jspdf if any, though standard import works
                                import('../utils/pdfGenerator').then(mod => {
                                    // Filter logs for this asset from the Centralized Asset Log
                                    const relevantLogs = assetLogs.filter(log => log.assetId === selectedAsset.id);

                                    mod.generateAssetPassport(selectedAsset, relevantLogs);
                                });
                            }}
                            className="text-white hover:text-cyan-400 border border-white/10"
                        >
                            📄 Passport
                        </ModernButton>
                    )}
                    <ModernButton
                        variant="secondary"
                        onClick={() => window.dispatchEvent(new CustomEvent('openAssetWizard'))}
                        className="text-xs"
                    >
                        + Add Asset
                    </ModernButton>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: TOOLS (2/3 width) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* CALCULATORS */}
                    <section>
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Engineering Utilities</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { name: 'Bolt Torque', icon: '🔩', path: '/bolt-torque' },
                                { name: 'Shaft Align', icon: '🔄', path: '/shaft-alignment' },
                                { name: 'Hydraulics', icon: '🚰', path: '/hydraulic-maintenance' },
                            ].map(tool => (
                                <GlassCard
                                    key={tool.name}
                                    onClick={() => navigate(tool.path)}
                                    className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                                >
                                    <div className="p-4 flex flex-col items-center text-center gap-3">
                                        <span className="text-4xl group-hover:scale-110 transition-transform">{tool.icon}</span>
                                        <span className="text-sm font-bold text-slate-300">{tool.name}</span>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </section>

                    {/* DESIGN STUDIO */}
                    <section>
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Design & Analysis</h2>
                        <GlassCard
                            onClick={() => navigate('/hpp-builder')}
                            className="p-6 cursor-pointer hover:border-emerald-500/50 transition-colors group border-l-4 border-l-emerald-500"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-3xl group-hover:bg-emerald-500/20 transition-colors">
                                        ⚡
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">HPP Design Studio</h3>
                                        <p className="text-slate-400 text-sm">Advanced physics modeling and plant dimensioning</p>
                                    </div>
                                </div>
                                <div className="hidden md:block">
                                    <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest">ready to launch &rarr;</span>
                                </div>
                            </div>
                        </GlassCard>
                    </section>

                    {/* OPERATIONS GRID */}
                    <section>
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Operational Modules</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { name: 'Maintenance Logbook', icon: '📝', path: '/logbook', desc: 'Digital logs & tracking' },
                                { name: 'Structural Integrity', icon: '🏗️', path: '/structural-integrity', desc: 'Civil works analysis' },
                                { name: 'SOP Manager', icon: '🛠️', path: '/shadow-engineer', desc: 'Standard procedures' },
                                { name: 'Toolbox Analytics', icon: '📊', path: '/executive', desc: 'Fleet performance' },
                            ].map(item => (
                                <GlassCard
                                    key={item.name}
                                    onClick={() => navigate(item.path)}
                                    className="p-4 cursor-pointer hover:bg-slate-800/50 flex items-center gap-4 group"
                                >
                                    <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                    <div>
                                        <h4 className="font-bold text-slate-200 text-sm">{item.name}</h4>
                                        <p className="text-xs text-slate-500">{item.desc}</p>
                                    </div>
                                </GlassCard>
                            ))}

                            {/* DYNAMIC: FRANCIS PROTOCOLS */}
                            {/* DYNAMIC PROTOCOLS CARDS based on Asset Type */}
                            {selectedAsset?.type === 'HPP' && (
                                <>
                                    {/* FRANCIS */}
                                    {(selectedAsset.turbine_type === 'francis' || selectedAsset.specs?.spiralCasePressure) && (
                                        <GlassCard
                                            onClick={() => navigate('/francis-diagnostics')}
                                            className="p-4 cursor-pointer bg-cyan-900/10 border-cyan-500/30 hover:bg-cyan-900/20 flex items-center gap-4 group col-span-1 md:col-span-2"
                                        >
                                            <span className="text-2xl group-hover:scale-110 transition-transform">🩺</span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-cyan-400 text-sm">Francis Diagnostics</h4>
                                                    <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30 uppercase">Active</span>
                                                </div>
                                                <p className="text-xs text-slate-400">Run troubleshooting engine for {selectedAsset.name}</p>
                                            </div>
                                        </GlassCard>
                                    )}

                                    {/* PELTON */}
                                    {(selectedAsset.turbine_type === 'pelton' || selectedAsset.specs?.nozzleCount) && (
                                        <GlassCard
                                            onClick={() => navigate('/shadow-engineer')} // Link to SOP Manager
                                            className="p-4 cursor-pointer bg-blue-900/10 border-blue-500/30 hover:bg-blue-900/20 flex items-center gap-4 group col-span-1 md:col-span-2"
                                        >
                                            <span className="text-2xl group-hover:scale-110 transition-transform">💧</span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-blue-400 text-sm">Pelton Impulse Protocols</h4>
                                                    <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30 uppercase">Detected</span>
                                                </div>
                                                <p className="text-xs text-slate-400">Nozzle erosion & bucket MPI checklists</p>
                                            </div>
                                        </GlassCard>
                                    )}

                                    {/* KAPLAN */}
                                    {(selectedAsset.turbine_type === 'kaplan' || selectedAsset.specs?.bladeAngleRangeDeg) && (
                                        <GlassCard
                                            onClick={() => navigate('/shadow-engineer')}
                                            className="p-4 cursor-pointer bg-purple-900/10 border-purple-500/30 hover:bg-purple-900/20 flex items-center gap-4 group col-span-1 md:col-span-2"
                                        >
                                            <span className="text-2xl group-hover:scale-110 transition-transform">🌀</span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-purple-400 text-sm">Kaplan Reaction Protocols</h4>
                                                    <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30 uppercase">Detected</span>
                                                </div>
                                                <p className="text-xs text-slate-400">Blade seal & oil head integrity checks</p>
                                            </div>
                                        </GlassCard>
                                    )}

                                    {/* BULB */}
                                    {(selectedAsset.turbine_type === 'bulb' || selectedAsset.specs?.bulbHousingPressureBar) && (
                                        <GlassCard
                                            onClick={() => navigate('/shadow-engineer')}
                                            className="p-4 cursor-pointer bg-emerald-900/10 border-emerald-500/30 hover:bg-emerald-900/20 flex items-center gap-4 group col-span-1 md:col-span-2"
                                        >
                                            <span className="text-2xl group-hover:scale-110 transition-transform">💡</span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-emerald-400 text-sm">Bulb Housing Protocols</h4>
                                                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase">Detected</span>
                                                </div>
                                                <p className="text-xs text-slate-400">Watertightness & cooling air audits</p>
                                            </div>
                                        </GlassCard>
                                    )}
                                </>
                            )}
                        </div>
                    </section>
                </div>

                {/* RIGHT COLUMN: FEED (1/3 width) */}
                <div className="space-y-8">
                    {/* RECENT ACTIVITY STREAM */}
                    <div className="bg-slate-900/50 border border-white/5 rounded-xl p-6 h-full">
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-cyan-400" /> Recent Activity
                        </h2>

                        <div className="space-y-6 relative">
                            {/* Timeline Line */}
                            <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-slate-800"></div>

                            {(!workOrders || workOrders.length === 0) ? (
                                <div className="text-center py-12">
                                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <AlertCircle className="w-6 h-6 text-slate-600" />
                                    </div>
                                    <p className="text-slate-500 text-sm">No recent activity.</p>
                                    <button
                                        onClick={() => navigate('/logbook')}
                                        className="text-cyan-400 text-xs font-bold uppercase tracking-wider mt-2 hover:underline"
                                    >
                                        Open Logbook
                                    </button>
                                </div>
                            ) : (
                                workOrders.slice().reverse().slice(0, 3).map((order, idx) => (
                                    <div key={idx} className="relative pl-6">
                                        <div className={`absolute left-0 top-1.5 w-3.5 h-3.5 bg-slate-900 border-2 rounded-full z-10 ${order.status === 'COMPLETED' ? 'border-emerald-500' : 'border-cyan-500'}`}></div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-cyan-400 font-mono mb-0.5">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </span>
                                            <h4 className="text-slate-200 font-bold text-sm leading-tight mb-1">
                                                {order.description}
                                            </h4>
                                            <p className="text-xs text-slate-500 line-clamp-2">
                                                Status: {order.status}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 uppercase tracking-wider">
                                                    {order.assetName || 'General'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {workOrders && workOrders.length > 0 && (
                            <button
                                onClick={() => navigate('/logbook')}
                                className="w-full mt-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider rounded transition-colors"
                            >
                                View Logbook
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
