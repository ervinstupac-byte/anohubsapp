import React from 'react';
import { useAssetContext } from '../contexts/AssetContext';
import { useNavigate } from 'react-router-dom';
import { MetricCard } from './dashboard/anohub/MetricCard';
import { SystemHealthCard, RiskStatusCard } from './dashboard/anohub/StatusCards';
import { ThermalCard, ShaftLiftCard, LabyrinthCard } from './dashboard/anohub/VisualCards';
import { ActionCard, LiveAnalytics, SystemAlerts } from './dashboard/anohub/AnalyticsPanel';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { EngineeringDossierCard } from './EngineeringDossierCard';

/**
 * ANOHUB Command Center - Fixed HUD Architecture
 * 
 * This component is designed to be a non-scrolling "Head-Up Display".
 * Proportional scaling ensures all elements fit within the viewport.
 */
export const ToolboxLaunchpad: React.FC = () => {
    const navigate = useNavigate();
    const { selectedAsset } = useAssetContext();

    return (
        <div className="h-full w-full flex flex-col p-4 lg:p-6 overflow-hidden bg-slate-950/20 font-sans text-slate-300 relative">

            {/* CYBERPUNK BACKGROUND LAYERS */}
            <div className="absolute inset-0 pointer-events-none z-[-1]">
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] mix-blend-overlay" />
                <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
                <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />
            </div>

            {/* HEADER ROW (Fixed Height) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 shrink-0 mb-4 lg:mb-6">
                <div className="md:col-span-3 h-24 lg:h-28 cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-95 z-10" onClick={() => navigate('/executive')}>
                    <SystemHealthCard />
                </div>
                <div className="md:col-span-3 h-24 lg:h-28 cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-95 z-10" onClick={() => navigate('/risk-assessment')}>
                    <RiskStatusCard />
                </div>
                <div className="md:col-span-6 h-24 lg:h-28 relative border border-white/5 rounded-xl bg-slate-900/10 overflow-hidden bevel-industrial group">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1),transparent_70%)]" />
                    <div className="h-full w-full flex items-center justify-center p-2">
                        <div className="flex flex-col items-center gap-1">
                            <div className="text-[clamp(8px,1vh,10px)] font-black text-slate-500 uppercase tracking-[0.3em]">HPP BIHAC COMMAND NODE</div>
                            <div className="flex gap-1 justify-center items-center h-4">
                                {[...Array(24)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className={`w-0.5 ${i % 3 === 0 ? 'bg-cyan-500/40' : 'bg-slate-800'}`}
                                        animate={{ height: i % 3 === 0 ? [8, 14, 8] : 8 }}
                                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA - SYMMETRICAL 1FR ROWS */}
            <div className="flex-1 min-h-0 grid grid-rows-2 gap-4 lg:gap-6">

                {/* ROW 2: METRICS & VISUALS (1fr) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 min-h-0">
                    <div className="cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-95 h-full z-10 min-h-0" onClick={() => navigate('/executive')}>
                        <MetricCard
                            title="Operating Hours"
                            value="12,500"
                            unit="hrs"
                            subtitle="Total System Runtime"
                            chart={
                                <div className="w-full flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shrink-0">
                                        <Clock className="w-4 h-4 text-cyan-400 animate-gear" />
                                    </div>
                                    <div className="flex-1 space-y-1 min-w-0">
                                        <div className="h-1.5 w-full flex gap-[1px]">
                                            {[...Array(20)].map((_, i) => (
                                                <div key={i} className={`h-full flex-1 ${i < 15 ? 'bg-cyan-500' : 'bg-slate-800'} ${i < 15 ? 'bloom-glow-cyan' : ''}`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            }
                        />
                    </div>
                    <div className="cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-95 h-full z-10 min-h-0 overflow-hidden" onClick={() => navigate('/maintenance/hydraulic')}>
                        <LabyrinthCard />
                    </div>
                    <div className="cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-95 h-full z-10 min-h-0 overflow-hidden" onClick={() => navigate('/maintenance/dashboard')}>
                        <ThermalCard />
                    </div>
                    <div className="cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-95 h-full z-10 min-h-0 overflow-hidden" onClick={() => navigate('/francis/sop-shaft-alignment')}>
                        <ShaftLiftCard />
                    </div>
                </div>

                {/* ROW 3: ANALYTICS & ALERTS (1fr) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 min-h-0 overflow-hidden">
                    <div className="lg:col-span-3 h-full cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-95 z-10 min-h-0" onClick={() => navigate('/precision-audit')}>
                        <ActionCard />
                    </div>
                    <div className="lg:col-span-6 h-full cursor-pointer hover:scale-[1.01] transition-all duration-200 active:scale-95 z-10 min-h-0 overflow-hidden" onClick={() => navigate('/executive')}>
                        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 h-full flex flex-col bevel-industrial overflow-hidden">
                            <h3 className="text-[clamp(8px,1vh,10px)] font-black text-slate-500 uppercase tracking-widest mb-2 flex justify-between items-center font-mono shrink-0">
                                <span>Live Analytics</span>
                                <span className="text-emerald-500 animate-pulse">● LIVE_FEED</span>
                            </h3>
                            <div className="flex-1 min-h-0 overflow-hidden">
                                <LiveAnalytics />
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-3 h-full cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-95 z-10 min-h-0 overflow-hidden" onClick={() => navigate('/forensics')}>
                        <SystemAlerts />
                    </div>
                </div>
            </div>

            {/* FOOTER ROW (Fixed Height) */}
            <div className="shrink-0 pt-4 lg:pt-6 flex flex-col gap-4">
                <EngineeringDossierCard />
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-slate-950/80 backdrop-blur-md border border-white/10 px-6 py-2 rounded-xl flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)] metallic-border w-full"
                >
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse bloom-glow-emerald shrink-0" />
                            <span className="text-[clamp(7px,0.9vh,9px)] font-mono font-black text-slate-400 uppercase tracking-wider">TELEMETRY_LINK: ESTABLISHED</span>
                        </div>
                        <div className="w-px h-4 bg-white/10 shrink-0" />
                        <div className="text-[clamp(7px,0.9vh,9px)] font-mono font-bold text-h-gold tracking-wider uppercase">SECURE_SYNC: NC-5.7 CRYPTO</div>
                    </div>
                    <div className="text-[clamp(7px,0.8vh,8px)] font-mono text-slate-600 font-black tracking-[0.2em] uppercase truncate ml-4">HPP_NODE_BIH_44.92N_15.87E</div>
                </motion.div>
            </div>
        </div>
    );
};
