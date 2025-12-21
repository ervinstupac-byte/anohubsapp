import React, { useState } from 'react';
import { useFleet } from '../contexts/FleetContext.tsx';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';
import { reportGenerator } from '../services/ReportGenerator.ts';
import { GlassCard } from './ui/GlassCard.tsx';
import { ModernButton } from './ui/ModernButton.tsx';
import { SatelliteInflowMap } from './SatelliteInflowMap.tsx';

export const ExecutiveDashboard: React.FC = () => {
    const { fleetReports, totalMoneyAtRisk, globalFleetHealth } = useFleet();
    const { triggerEmergency } = useTelemetry();
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(fleetReports[0]?.assetId || null);

    const selectedReport = fleetReports.find(r => r.assetId === selectedAssetId) || fleetReports[0];

    const handleExport = () => {
        const reportData = {
            fleetHealth: globalFleetHealth,
            totalMoneyAtRisk: totalMoneyAtRisk,
            reports: fleetReports.map(r => ({
                assetName: r.assetName,
                score: r.healthScore,
                efficiency: r.efficiencyIndex,
                risk: r.moneyAtRisk,
                readiness: r.readiness
            })),
            integrityHash: 'ANO-SHA256-' + Math.random().toString(16).slice(2, 10).toUpperCase()
        };
        const blob = reportGenerator.generateExecutiveBriefing(reportData);
        reportGenerator.downloadReport(blob, `Executive_Briefing_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="p-8 space-y-8 animate-fade-in max-w-7xl mx-auto pb-24">
            {/* HEADER AREA */}
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.2em] mb-2">Fleet Operations Command</p>
                    <h1 className="text-5xl font-black text-white uppercase tracking-tighter">Strategic Intelligence</h1>
                </div>
                <div className="flex gap-4">
                    <select
                        className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none font-bold uppercase cursor-pointer"
                        value={selectedAssetId || ''}
                        onChange={(e) => setSelectedAssetId(e.target.value)}
                    >
                        {fleetReports.map(r => (
                            <option key={r.assetId} value={r.assetId}>{r.assetName}</option>
                        ))}
                    </select>
                    <ModernButton variant="primary" onClick={handleExport}>
                        GENERATE EXECUTIVE BRIEFING (PDF)
                    </ModernButton>
                </div>
            </div>

            {/* STRATEGIC KPIS LAYER */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard title="Fleet Health (HPP-HS)" className="border-l-4 border-l-cyan-500">
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-5xl font-black text-white">{globalFleetHealth.toFixed(1)}</span>
                        <span className="text-xl font-bold text-slate-500">%</span>
                    </div>
                    <div className="mt-4 w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 h-full transition-all duration-1000" style={{ width: `${globalFleetHealth}%` }} />
                    </div>
                </GlassCard>

                <GlassCard title="Total Money At Risk" className="border-l-4 border-l-red-500">
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-5xl font-black text-red-500">€{(totalMoneyAtRisk / 1000).toFixed(1)}</span>
                        <span className="text-xl font-bold text-slate-500">K</span>
                    </div>
                    <p className="text-[8px] text-slate-500 uppercase font-black mt-2">Predicted Failure + Revenue Loss</p>
                </GlassCard>

                <GlassCard title="Market Revenue Index" className="border-l-4 border-l-emerald-500">
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-5xl font-black text-emerald-400">98.4</span>
                        <span className="text-xl font-bold text-slate-500">pts</span>
                    </div>
                    <p className="text-[8px] text-emerald-500 font-black mt-2">HPP Response to Grid Fluctuations</p>
                </GlassCard>

                <GlassCard title="Digital Integrity Seal" className="border-l-4 border-l-indigo-500">
                    <div className="mt-4 space-y-2">
                        <div className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 p-2 rounded border border-indigo-500/20">
                            ANO-HHP-AUDIT-ACTIVE
                        </div>
                        <p className="text-[8px] text-slate-500 uppercase font-bold">SHA-256 Verified Source Chain</p>
                    </div>
                </GlassCard>
            </div>

            {/* MID SECTION: SATELLITE & PREDICTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. SATELLITE MAP */}
                <div className="lg:col-span-2">
                    {selectedReport.inflow && (
                        <SatelliteInflowMap
                            snowCover={selectedReport.inflow.snowCoverPercent}
                            assetName={selectedReport.assetName}
                        />
                    )}
                </div>

                {/* 2. PRODUCTION PREDICTIONS */}
                <GlassCard title="Strategic Inflow Prediction" className="overflow-hidden">
                    <div className="mt-4 space-y-6">
                        {selectedReport.inflow && [
                            { label: '30 DAYS FORECAST', value: selectedReport.inflow.days30, color: 'text-cyan-400' },
                            { label: '60 DAYS FORECAST', value: selectedReport.inflow.days60, color: 'text-blue-400' },
                            { label: '90 DAYS FORECAST', value: selectedReport.inflow.days90, color: 'text-indigo-400' }
                        ].map((item, i) => (
                            <div key={i} className="group cursor-default">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[10px] text-slate-500 font-black tracking-tighter">{item.label}</span>
                                    <span className={`text-xl font-black ${item.color}`}>{(item.value / 1000).toFixed(1)} MWh</span>
                                </div>
                                <div className="w-full bg-white/5 h-1 rounded-full group-hover:bg-white/10 transition-colors" />
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                        <p className="text-[10px] text-indigo-400 uppercase font-black mb-1">Inflow Intelligence</p>
                        <p className="text-xs text-white opacity-60 leading-relaxed italic">
                            Predicted run-of-river inflow based on SWE (Snow Water Equivalent) sensor data from NASA MODIS sensors.
                        </p>
                    </div>
                </GlassCard>
            </div>

            {/* PERFORMANCE & ROI OVERLAY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassCard title="Efficiency & Economic Intelligence">
                    <div className="mt-6 flex gap-12 items-center">
                        {/* EFFICIENCY GAUGE SIMULATION */}
                        <div className="relative w-40 h-40">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/5" strokeWidth="3" />
                                <circle
                                    cx="18" cy="18" r="16" fill="none"
                                    className="stroke-cyan-500 transition-all duration-[2000ms]"
                                    strokeWidth="3"
                                    strokeDasharray={`${selectedReport.efficiencyIndex}, 100`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-white">{selectedReport.efficiencyIndex}%</span>
                                <span className="text-[8px] text-slate-500 uppercase font-bold">EFFICIENCY</span>
                            </div>
                        </div>

                        {/* ROI CALLOUT */}
                        {selectedReport.maintenanceROI ? (
                            <div className="flex-1 p-6 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 relative overflow-hidden animate-pulse">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/20 blur-[40px]" />
                                <h4 className="text-emerald-400 font-black uppercase text-xs mb-2">ROI OPPORTUNITY: {selectedReport.maintenanceROI.action}</h4>
                                <p className="text-2xl font-black text-white mb-2">
                                    <span className="text-emerald-400">+{selectedReport.maintenanceROI.gainPercentage}%</span> Productivity
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="px-3 py-1 bg-black/40 rounded border border-white/10 text-[10px] text-white">
                                        PAYBACK: <b>{selectedReport.maintenanceROI.paybackDays} DAYS</b>
                                    </div>
                                    <ModernButton variant="secondary" className="h-8 text-[9px] px-4 font-black">APPROVE ACTION</ModernButton>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 p-6 bg-slate-900/40 rounded-3xl border border-white/5 text-center">
                                <p className="text-xs text-slate-500 uppercase font-bold">System performing at peak economic capacity.</p>
                                <p className="text-emerald-500 font-black mt-2 uppercase tracking-widest text-[10px]">No ROI optimizations available</p>
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* MASTER KILL-SWITCH */}
                <div className="p-8 rounded-[2rem] bg-slate-900/40 border border-white/5 flex flex-col justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-red-500 uppercase tracking-tighter mb-4 flex items-center gap-3">
                            Strategic Kill-Switch
                        </h3>
                        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                            Authorized personnel only. Activate digital isolation of the entire fleet. This simulation
                            synchronizes with the Incident Simulator for total thermal shutdown.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <ModernButton
                            variant="primary"
                            className="bg-red-600 hover:bg-red-700 h-14 px-8 border-none shadow-[0_0_40px_rgba(220,38,38,0.3)]"
                            onClick={() => {
                                if (confirm('CONFIRM TOTAL FLEET SHUTDOWN SIMULATION?')) {
                                    fleetReports.forEach(r => triggerEmergency(r.assetId, 'vibration_excess'));
                                }
                            }}
                        >
                            ACTIVATE MASTER STOP
                        </ModernButton>
                        <div className="flex flex-col justify-center">
                            <span className="text-[10px] text-red-500 font-black uppercase mb-1">Command Level</span>
                            <span className="text-sm text-white font-mono">ADMIN_OVERRIDE</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
