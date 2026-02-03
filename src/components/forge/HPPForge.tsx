import React, { useState, useEffect } from 'react';
import { Settings, Droplets, Zap, Activity, ArrowRight, Gauge } from 'lucide-react';
import { PhysicsGuardrailService, CalculationResult } from '../../services/PhysicsGuardrailService';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { useAssetContext } from '../../contexts/AssetContext';

export const HPPForge: React.FC = () => {
    const { addAsset } = useAssetContext();
    // State
    const [head, setHead] = useState<number>(350); // meters
    const [flow, setFlow] = useState<number>(12); // m3/s
    const [rpm, setRpm] = useState<number>(600);
    const [result, setResult] = useState<CalculationResult | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Sync Speeds (50Hz pairs)
    const SYNC_SPEEDS = [3000, 1500, 1000, 750, 600, 500, 428, 375, 333, 300];

    // Real-time Physics Loop
    useEffect(() => {
        const res = PhysicsGuardrailService.analyze(flow, head, rpm);
        setResult(res);
    }, [head, flow, rpm]);

    const handleGenerate = async () => {
        if (!result) return;
        setIsGenerating(true);

        try {
            const assetName = `Forge-${result.recommendedType}-${Math.floor(result.powerMW)}MW`;

            await addAsset({
                name: assetName,
                type: 'HPP',
                location: 'Forge Simulation',
                coordinates: [44.0, 15.0], // Default coords
                capacity: result.powerMW,
                specs: {
                    turbineProfile: {
                        type: result.recommendedType as any,
                        orientation: result.recommendedType === 'PELTON' ? 'HORIZONTAL' : 'VERTICAL',
                        ratedPowerMW: result.powerMW,
                        ratedHeadM: head,
                        ratedFlowM3S: flow,
                        ratedSpeedRPM: rpm,
                        manufacturer: 'Sovereign Forge',
                        model: 'SF-900',
                        commissioningYear: new Date().getFullYear()
                    }
                }
            });

            // Visual feedback could be improved, but alert captures attention as "System Notification"
            alert(`✅ DIGITAL TWIN INITIALIZED: ${assetName}\n\nOptimized for ${result.recommendedType} Operation.`);

        } catch (error) {
            console.error("Forge Generation Failed:", error);
            alert("❌ Generation Failed. Check console.");
        } finally {
            setIsGenerating(false);
        }
    };

    const getZoneColor = (type: string) => {
        if (type === 'PELTON') return 'text-violet-400';
        if (type === 'FRANCIS') return 'text-cyan-400';
        if (type === 'KAPLAN') return 'text-emerald-400';
        return 'text-white';
    };

    return (
        <GlassCard className="h-full flex flex-col p-4 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-cyan-500 to-emerald-500" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-white/5 border border-white/10">
                        <Settings className="w-5 h-5 text-amber-400 animate-[spin_10s_linear_infinite]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-wider flex items-center gap-2">
                            THE FORGE <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">NC-900</span>
                        </h2>
                        <p className="text-xs text-slate-400 font-mono">SOVEREIGN CONFIGURATION ENGINE</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto pr-2">

                {/* CONTROL PANEL */}
                <div className="space-y-6">
                    {/* Head Input */}
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5">
                        <div className="flex justify-between mb-2">
                            <label className="text-sm text-slate-400 flex items-center gap-2">
                                <ArrowRight className="w-4 h-4 text-violet-400 rotate-90" /> Net Head (H)
                            </label>
                            <span className="text-violet-300 font-mono font-bold">{head} m</span>
                        </div>
                        <input
                            type="range" min="10" max="1000" step="1"
                            value={head} onChange={(e) => setHead(Number(e.target.value))}
                            className="w-full accent-violet-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-slate-600 font-mono mt-1">
                            <span>10m</span>
                            <span>1000m</span>
                        </div>
                    </div>

                    {/* Flow Input */}
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5">
                        <div className="flex justify-between mb-2">
                            <label className="text-sm text-slate-400 flex items-center gap-2">
                                <Droplets className="w-4 h-4 text-cyan-400" /> Design Flow (Q)
                            </label>
                            <span className="text-cyan-300 font-mono font-bold">{flow} m³/s</span>
                        </div>
                        <input
                            type="range" min="1" max="200" step="0.5"
                            value={flow} onChange={(e) => setFlow(Number(e.target.value))}
                            className="w-full accent-cyan-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* RPM Selector */}
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5">
                        <div className="flex justify-between mb-2">
                            <label className="text-sm text-slate-400 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-emerald-400" /> Speed (n)
                            </label>
                            <select
                                value={rpm}
                                onChange={(e) => setRpm(Number(e.target.value))}
                                className="bg-slate-800 text-white border border-white/10 rounded px-2 py-1 text-sm font-mono focus:outline-none focus:border-emerald-500"
                            >
                                {SYNC_SPEEDS.map(s => (
                                    <option key={s} value={s}>{s} RPM</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* RESULTS PANEL */}
                <div className="flex flex-col gap-4">
                    {/* Power Output */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-lg border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap className="w-24 h-24" />
                        </div>
                        <h3 className="text-slate-400 text-xs font-bold uppercase mb-1">Theoretical Power</h3>
                        <div className="text-3xl font-bold text-white font-mono flex items-baseline gap-2">
                            {result?.powerMW.toFixed(2)} <span className="text-sm text-slate-500">MW</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-700 rounded-full mt-3 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-500"
                                style={{ width: `${Math.min((result?.powerMW || 0) / 500 * 100, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Specific Speed & Recommendation */}
                    <div className="flex-1 bg-slate-900/80 p-6 rounded-lg border border-white/10 flex flex-col items-center justify-center text-center relative">
                        <h3 className="text-slate-400 text-xs font-bold uppercase mb-4">Turbine DNA Analysis</h3>

                        <div className="mb-4 relative">
                            <Gauge className={`w-16 h-16 ${getZoneColor(result?.recommendedType || '')} transition-colors duration-500`} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-mono font-bold text-slate-900 bg-white/90 px-1 rounded">
                                    {Math.round(result?.specificSpeed || 0)}
                                </span>
                            </div>
                        </div>

                        <div className={`text-2xl font-black uppercase tracking-widest mb-2 ${getZoneColor(result?.recommendedType || '')}`}>
                            {result?.recommendedType}
                        </div>
                        <p className="text-xs text-slate-500 max-w-[200px]">
                            Based on Specific Speed ($n_q$) and Head ($H$).
                        </p>

                        {/* Warnings */}
                        {result?.warnings && result.warnings.length > 0 && (
                            <div className="mt-4 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400 text-left w-full">
                                {result.warnings.map((w, i) => (
                                    <div key={i}>• {w}</div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleGenerate}
                        className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-900/20 border border-cyan-400/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        INITIALIZE DIGITAL TWIN
                    </button>
                </div>
            </div>
        </GlassCard>
    );
};
