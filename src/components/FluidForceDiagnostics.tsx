import React, { useMemo } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import idAdapter from '../utils/idAdapter';

export const FluidForceDiagnostics: React.FC = () => {
    const { telemetry } = useTelemetry();
    const { selectedAsset } = useAssetContext();

    const assetTele = selectedAsset ? telemetry[idAdapter.toStorage(selectedAsset.id)] : null;

    const insights = useMemo(() => {
        if (!assetTele) return [];
        const reports: { id: string, label: string, status: 'OPTIMAL' | 'WARNING' | 'CRITICAL', info: string, detail: string }[] = [];

        // 1. Bearing Radial Force (Shaft Sag)
        const sag = assetTele.shaftSag || 0;
        if (sag > 0.02) {
            reports.push({
                id: 'shaft_sag',
                label: 'Bearing Radial Force / Shaft Sag',
                status: 'CRITICAL',
                info: `${sag.toFixed(3)} mm`,
                detail: 'Prekomjerno trošenje donje polovine blazine ležaja (Radial babbitt wear detected).'
            });
        } else if (sag > 0.015) {
            reports.push({
                id: 'shaft_sag',
                label: 'Bearing Radial Force / Shaft Sag',
                status: 'WARNING',
                info: `${sag.toFixed(3)} mm`,
                detail: 'Indication of bearing clearance increase. Monitor vertical displacement.'
            });
        }

        // 2. Oil Degradation Estimator
        const responseLag = assetTele.responseTimeIndex || 0;
        const oilTemp = assetTele.temperature;

        // Logic: If response is slow (> 0.5 index) but temp is high (> 50C), 
        // it means viscosity is not the issue, but oil quality is (oxidation/emulsion).
        if (responseLag > 0.5 && oilTemp > 50) {
            reports.push({
                id: 'oil_degradation',
                label: 'Oil Degradation Estimator',
                status: 'CRITICAL',
                info: `Lag Index: ${responseLag.toFixed(2)}`,
                detail: 'Ulje gubi projektovana svojstva - hitna filtracija ili zamjena (Oxidation/Emulsion suspected).'
            });
        } else if (responseLag > 0.4) {
            reports.push({
                id: 'oil_degradation',
                label: 'Oil Degradation Estimator',
                status: 'WARNING',
                info: `Lag Index: ${responseLag.toFixed(2)}`,
                detail: 'Increased hydraulic response time. Verify oil filter differential pressure.'
            });
        }

        return reports;
    }, [assetTele]);

    if (!selectedAsset || !assetTele) return null;

    return (
        <GlassCard title="Radial Force & Fluid Diagnostics">
            <div className="space-y-4">
                {insights.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-emerald-500 opacity-60">
                        <span className="text-3xl mb-2">💎</span>
                        <p className="text-[9px] font-black uppercase tracking-widest text-center">Fluid & Bearings Nominal<br />Prazan hod u normi</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {insights.map(item => (
                            <div key={item.id} className={`p-3 rounded-xl border transition-all ${item.status === 'CRITICAL' ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${item.status === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`} />
                                        <h4 className="text-[9px] font-black text-white uppercase tracking-tighter">{item.label}</h4>
                                    </div>
                                    <span className="text-[10px] font-mono font-black text-slate-500">{item.info}</span>
                                </div>
                                <p className="text-[10px] text-slate-300 leading-tight italic">
                                    {item.detail}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                    <div className="bg-black/20 p-2 rounded-lg border border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Shaft Centerline</p>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-8 bg-slate-800 rounded-full relative overflow-hidden">
                                <div
                                    className="absolute w-full bg-cyan-500 transition-all duration-500"
                                    style={{
                                        height: '2px',
                                        top: `${50 + (assetTele.shaftSag * 1000)}%` // Visual exaggeration
                                    }}
                                />
                            </div>
                            <span className="text-xs font-mono text-white">{(assetTele.shaftSag * 1000).toFixed(1)} µm</span>
                        </div>
                    </div>
                    <div className="bg-black/20 p-2 rounded-lg border border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Hydraulic Fluidity</p>
                        <div className="flex items-center gap-2">
                            <div className="flex-grow h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${assetTele.responseTimeIndex > 0.5 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${(1 - assetTele.responseTimeIndex) * 100}%` }}
                                />
                            </div>
                            <span className="text-[9px] font-mono text-slate-400">{(1 - assetTele.responseTimeIndex).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};
