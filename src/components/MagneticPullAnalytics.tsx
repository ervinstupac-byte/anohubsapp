import React, { useMemo } from 'react';
import { GlassCard } from './ui/GlassCard.tsx';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';

export const MagneticPullAnalytics: React.FC = () => {
    const { selectedAsset } = useAssetContext();
    const { telemetry } = useTelemetry();

    const assetTele = useMemo(() => {
        if (!selectedAsset) return null;
        return telemetry[selectedAsset.id];
    }, [selectedAsset, telemetry]);

    const mspData = useMemo(() => {
        if (!assetTele) return null;

        const I = assetTele.excitationCurrent || 0;
        const e = assetTele.rotorEccentricity || 0;

        // F_msp = k * I^2 * e
        // Using a simplified scaling factor k = 0.0005 for demonstration
        const force = 0.0005 * (I ** 2) * e;
        const bearingCapacity = 500; // kN (example)

        const diagnosis = {
            status: 'OPTIMAL' as 'OPTIMAL' | 'WARNING' | 'CRITICAL',
            message: 'Magnetic balance nominal.'
        };

        if (force > 50) {
            diagnosis.status = 'CRITICAL';
            diagnosis.message = 'Magnetna debalansiranost: Ekscentricitet rotora kritičan.';
        } else if (force > 25) {
            diagnosis.status = 'WARNING';
            diagnosis.message = 'Magnetic side pull detected. Monitor runout.';
        }

        return { force, bearingCapacity, diagnosis, I, e };
    }, [assetTele]);

    if (!mspData) return null;

    const { force, bearingCapacity, diagnosis, I, e } = mspData;
    const forcePercent = Math.min(100, (force / bearingCapacity) * 100);

    return (
        <GlassCard
            title="MagneticSidePull Analytics"
            className={`border-l-4 ${diagnosis.status === 'CRITICAL' ? 'border-red-500' : diagnosis.status === 'WARNING' ? 'border-amber-500' : 'border-emerald-500'}`}
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Excitation Current</p>
                        <p className="text-xl font-mono font-black text-amber-500">{I.toFixed(1)} <span className="text-[10px]">A</span></p>
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Shaft Runout (e)</p>
                        <p className="text-xl font-mono font-black text-cyan-400">{e.toFixed(2)} <span className="text-[10px]">mm</span></p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <p className="text-[10px] font-black uppercase text-slate-400">Magnetic Side Pull Force</p>
                        <p className="text-lg font-mono font-black text-white">{force.toFixed(2)} <span className="text-[10px] text-slate-500">kN</span></p>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                        <div
                            className={`h-full transition-all duration-500 ${diagnosis.status === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : diagnosis.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${forcePercent}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[8px] font-bold text-slate-600 uppercase">
                        <span>0 kN</span>
                        <span>Capacity: {bearingCapacity} kN</span>
                    </div>
                </div>

                <div className={`p-4 rounded-xl border ${diagnosis.status === 'CRITICAL' ? 'bg-red-500/10 border-red-500/30' : diagnosis.status === 'WARNING' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                    <div className="flex items-center gap-3">
                        <span className="text-xl">{diagnosis.status === 'CRITICAL' ? '⚠️' : diagnosis.status === 'WARNING' ? '⚡' : '✅'}</span>
                        <div>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${diagnosis.status === 'CRITICAL' ? 'text-red-500' : diagnosis.status === 'WARNING' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                {diagnosis.status === 'CRITICAL' ? 'Critical Alert' : diagnosis.status === 'WARNING' ? 'Warning' : 'System Healthy'}
                            </p>
                            <p className="text-[10px] text-slate-300 italic leading-snug">
                                {diagnosis.message}
                            </p>
                        </div>
                    </div>
                    {diagnosis.status === 'CRITICAL' && (
                        <p className="mt-3 text-[9px] text-red-400/80 font-bold uppercase tracking-tight">
                            Action Required: Verify rotor/stator concentricity & air gap.
                        </p>
                    )}
                </div>
            </div>
        </GlassCard>
    );
};
