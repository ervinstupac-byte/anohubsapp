import React, { useState } from 'react';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { useDiagnostic } from '../contexts/DiagnosticContext.tsx';
import { GlassCard } from './ui/GlassCard.tsx';
import { ModernButton } from './ui/ModernButton.tsx';

export const StructuralIntegrity: React.FC = () => {
    const { telemetry } = useTelemetry();
    const { assets } = useAssetContext();
    const { activeDiagnoses } = useDiagnostic();
    const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');

    const assetTele = telemetry[selectedAssetId];

    const relevantDiagnoses = activeDiagnoses.filter(d =>
        d.message.includes(selectedAssetId) ||
        d.symptom === 'DAM_SUFFUSION' ||
        d.symptom === 'FOUNDATION_MOVEMENT'
    );

    if (!assetTele) return <div className="p-8 text-white">Loading Structural Intelligence...</div>;

    return (
        <div className="p-8 space-y-8 animate-fade-in max-w-7xl mx-auto pb-24">
            {/* HEADER */}
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mb-2">Structural Health Monitoring</p>
                    <h1 className="text-5xl font-black text-white uppercase tracking-tighter">Physical Integrity</h1>
                </div>
                <select
                    className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none font-bold uppercase cursor-pointer"
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                >
                    {assets.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. PIEZOMETRICAL PERFORMANCE */}
                <GlassCard title="Dam Body Piezometry" className="lg:col-span-2">
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Piezometric Pressure</p>
                            <p className="text-3xl font-black text-white">{assetTele.piezometricPressure.toFixed(2)} <span className="text-sm opacity-40">bar</span></p>
                            <div className="mt-4 flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${assetTele.piezometricPressure > 4.5 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                                <span className="text-[9px] text-slate-400 font-bold uppercase">
                                    {assetTele.piezometricPressure > 4.5 ? 'High Seepage Potential' : 'Nominal Saturation'}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Seepage Rate</p>
                            <p className="text-3xl font-black text-white">{assetTele.seepageRate.toFixed(1)} <span className="text-sm opacity-40">l/min</span></p>
                        </div>

                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Reservoir Level</p>
                            <p className="text-3xl font-black text-cyan-400">{assetTele.reservoirLevel.toFixed(1)} <span className="text-sm opacity-40">m</span></p>
                        </div>
                    </div>

                    {/* Trend Simulation Visual */}
                    <div className="mt-8 h-48 bg-black/20 rounded-2xl border border-white/5 relative overflow-hidden flex items-end px-4 gap-1">
                        {[...Array(40)].map((_, i) => {
                            const val = 20 + Math.random() * 60;
                            return (
                                <div
                                    key={i}
                                    className="flex-1 bg-indigo-500/20 rounded-t-sm"
                                    style={{ height: `${val}%` }}
                                />
                            );
                        })}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">Real-time Piezometric Drift Analysis</span>
                        </div>
                        {/* ALERT OVERLAY */}
                        {assetTele.piezometricPressure > 4.5 && (
                            <div className="absolute top-4 right-4 px-4 py-2 bg-red-600/20 border border-red-500/50 rounded-full animate-bounce">
                                <p className="text-[10px] text-red-400 font-black uppercase">Alarm: Moguća pojava sufozije</p>
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* 2. SEISMIC & FOUNDATION */}
                <GlassCard title="Seismic Stability Index">
                    <div className="mt-6 space-y-8">
                        <div className="text-center p-8 bg-indigo-500/5 rounded-[2.5rem] border border-indigo-500/10 relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                <svg viewBox="0 0 100 100" className="w-full h-full scale-150 animate-pulse">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                                    <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" />
                                </svg>
                            </div>
                            <p className="text-[10px] text-indigo-400 font-black uppercase mb-2">Foundation Displacement</p>
                            <p className="text-5xl font-black text-white">{assetTele.foundationDisplacement.toFixed(3)}</p>
                            <p className="text-[10px] text-slate-500 font-bold mt-2">μm/m (MICRO-STRAIN)</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] text-slate-500 font-black uppercase">Foundation vs Rotor Correlation</span>
                                <span className={`text-[10px] font-black ${assetTele.foundationDisplacement > 0.1 ? 'text-orange-400' : 'text-emerald-400'}`}>
                                    {assetTele.foundationDisplacement > 0.1 ? 'DECOUPLED VIBRATION' : 'COHERENT SYSTEM'}
                                </span>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${assetTele.foundationDisplacement > 0.1 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${Math.min(100, assetTele.foundationDisplacement * 500)}%` }}
                                />
                            </div>
                            <p className="text-[9px] text-slate-500 leading-relaxed italic">
                                High coherence detected. Current vibration profile matches mechanical imbalance footprint, not structural concrete failure.
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* DIAGNOSTIC CORRELATION PANEL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassCard title="Structural Diagnosis Engine">
                    <div className="mt-4 space-y-4">
                        {relevantDiagnoses.length > 0 ? (
                            relevantDiagnoses.map((diag, i) => (
                                <div key={i} className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex gap-4 items-start">
                                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-red-500 font-black text-xs">!</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black uppercase text-xs mb-1">{diag.diagnosis?.diagnosis || 'Critical structural anomaly'}</h4>
                                        <p className="text-[10px] text-slate-400 leading-relaxed">{diag.message}</p>
                                        <div className="mt-3 flex gap-2">
                                            <span className="px-2 py-0.5 bg-red-500 text-white text-[8px] font-black rounded">ACTION REQUIRED</span>
                                            <span className="px-2 py-0.5 bg-white/5 text-slate-400 text-[8px] font-black rounded uppercase">Source: {diag.source}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
                                <p className="text-sm text-emerald-400 font-black uppercase">Concrete & Dam Integrity Optimal</p>
                                <p className="text-[10px] text-slate-500 mt-2 uppercase font-bold tracking-widest">Zero micro-drift detected across all foundations</p>
                            </div>
                        )}
                    </div>
                </GlassCard>

                <div className="p-8 rounded-[2.5rem] bg-indigo-600/10 border border-indigo-500/20 flex flex-col justify-between group overflow-hidden relative">
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/10 blur-[80px] group-hover:bg-indigo-500/20 transition-all duration-700" />
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Integrity Certificate</h3>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                            Generate a cryptographically signed structural health report for regulatory compliance.
                            Includes piezometric stability history and seismic sensor logs.
                        </p>
                    </div>
                    <div className="mt-8 flex gap-4">
                        <ModernButton variant="primary" className="h-12 px-8">GENERATE REPORT</ModernButton>
                        <div className="flex flex-col justify-center">
                            <span className="text-[10px] text-indigo-400 font-black uppercase mb-0.5">Verification Chain</span>
                            <span className="text-xs text-white font-mono opacity-60">ANO-RSA4096-SEC3</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
