import React, { useMemo } from 'react';
import { GlassCard } from './ui/GlassCard.tsx';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';
import { useAssetContext } from '../contexts/AssetContext.tsx';

export const MachineProtectionSystem: React.FC = () => {
    const { telemetry } = useTelemetry();
    const { selectedAsset } = useAssetContext();

    const assetTele = selectedAsset ? telemetry[selectedAsset.id] : null;

    const insights = useMemo(() => {
        if (!assetTele) return [];
        const reports: { id: string, label: string, status: 'OPTIMAL' | 'WARNING' | 'CRITICAL', info: string, detail: string }[] = [];

        // 1. Hydraulic Shock (dp/dt)
        const dpdt = assetTele.oilPressureRate;
        if (dpdt > 5) {
            reports.push({
                id: 'shock',
                label: 'Hydraulic Shock Suppression',
                status: 'CRITICAL',
                info: `dp/dt: ${dpdt.toFixed(2)} bar/s`,
                detail: 'Hydraulic hammer detected. Bypass valve activated. Throttling servomotor response.'
            });
        }

        // 2. Vibration Phase Analysis
        const phaseShift = Math.abs(assetTele.vibrationPhase - 12); // Assuming 12 deg is nominal
        if (phaseShift > 15) {
            reports.push({
                id: 'phase',
                label: 'Vibration Phase Analysis',
                status: 'CRITICAL',
                info: `Phase Shift: ${phaseShift.toFixed(1)}°`,
                detail: assetTele.vibration > 0.06 ? 'DANGER: Broken joint bolt suspected.' : 'Labavost u ležišnim blazinama (Bearing Looseness).'
            });
        }

        // 3. Oil Film Thickness
        // Simplified formula: h = k * (viscosity * speed / pressure)
        const viscosity = assetTele.oilViscosity;
        const load = assetTele.bearingLoad;
        const temp = assetTele.temperature;
        const thickness = (viscosity * 10) / (load / 100); // Simplified heuristic
        if (thickness < 0.5 || temp > 75) {
            reports.push({
                id: 'oil_film',
                label: 'Oil Film Thickness Monitor',
                status: thickness < 0.3 ? 'CRITICAL' : 'WARNING',
                info: `Index: ${thickness.toFixed(2)}`,
                detail: thickness < 0.3 ? 'CRITICAL: Metadata risk (Dry friction). Manual HP lift injection active.' : 'WARNING: Thinning oil film. Viscosity decreasing.'
            });
        }

        // 4. Backlash Detection
        const backlash = Math.abs(assetTele.actuatorPosition - assetTele.actualBladePosition);
        if (backlash > 2) {
            reports.push({
                id: 'backlash',
                label: 'Backlash & Hysteresis',
                status: 'CRITICAL',
                info: `Backlash: ${backlash.toFixed(2)}%`,
                detail: 'Kritično trošenje čahura/bolcni mehanizma (Linkage Wear).'
            });
        }

        // 5. Thermal Stress (Stator Hotspots)
        const statorTemps = assetTele.statorTemperatures || [55, 55, 55, 55, 55, 55];
        const maxTemp = Math.max(...statorTemps);
        const avgTemp = statorTemps.reduce((a, b) => a + b, 0) / statorTemps.length;
        const gradient = maxTemp - avgTemp;
        if (gradient > 25) {
            reports.push({
                id: 'thermal',
                label: 'Thermal Stress Watch',
                status: 'CRITICAL',
                info: `Max Gradient: ${gradient.toFixed(1)}°C`,
                detail: 'Local Hotspot in stator section. Excitation current reduction recommended.'
            });
        }

        return reports;
    }, [assetTele]);

    if (!selectedAsset || !assetTele) return null;

    return (
        <GlassCard title="Advanced Protection System (Mehanička i Električna Zaštita)">
            <div className="space-y-4">
                {insights.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-emerald-500 opacity-60">
                        <span className="text-4xl mb-2">🛡️</span>
                        <p className="text-[10px] font-black uppercase tracking-widest text-center">System Protected<br />Analytics Nominal</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {insights.map(item => (
                            <div key={item.id} className={`p-3 rounded-xl border transition-all ${item.status === 'CRITICAL' ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${item.status === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-amber-500 animate-pulse'}`} />
                                        <h4 className="text-[10px] font-black text-white uppercase tracking-tighter">{item.label}</h4>
                                    </div>
                                    <span className="text-[10px] font-mono font-black text-slate-500">{item.info}</span>
                                </div>
                                <p className="text-[10px] text-slate-300 leading-tight italic">
                                    {item.detail}
                                </p>
                                {item.status === 'CRITICAL' && (
                                    <div className="mt-2 text-[8px] font-black text-red-400 uppercase tracking-widest animate-pulse border-t border-red-500/20 pt-2">
                                        🤖 Ano-Agent: Automated safeguard sequence active
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
                    <div className="p-2 bg-slate-900/60 rounded border border-white/5 flex flex-col items-center">
                        <span className="text-[8px] text-slate-500 font-black uppercase mb-1">Cylinder Bypass</span>
                        <div className={`text-[10px] font-black ${assetTele.bypassValveActive ? 'text-cyan-400 animate-pulse' : 'text-slate-700'}`}>
                            {assetTele.bypassValveActive ? '● ACTIVATED' : '○ STANDBY'}
                        </div>
                    </div>
                    <div className="p-2 bg-slate-900/60 rounded border border-white/5 flex flex-col items-center">
                        <span className="text-[8px] text-slate-500 font-black uppercase mb-1">HP Lift Pump</span>
                        <div className={`text-[10px] font-black ${assetTele.hydrostaticLiftActive ? 'text-amber-400 animate-pulse' : 'text-slate-700'}`}>
                            {assetTele.hydrostaticLiftActive ? '● INJECTION' : '○ STANDBY'}
                        </div>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};
