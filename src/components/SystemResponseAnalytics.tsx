import React, { useMemo, useState } from 'react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import idAdapter from '../utils/idAdapter';

export const SystemResponseAnalytics: React.FC = () => {
    const { telemetry, updateWicketGateSetpoint } = useTelemetry();
    const { selectedAsset } = useAssetContext();
    const [testValue, setTestValue] = useState(45);

    const assetTele = selectedAsset ? telemetry[idAdapter.toStorage(selectedAsset.id)] : null;

    const analysis = useMemo(() => {
        if (!assetTele) return null;

        const setpoint = assetTele.wicketGateSetpoint;
        const actual = assetTele.wicketGatePosition;
        const delta = Math.abs(setpoint - actual);
        const timeSinceCommand = Date.now() - assetTele.lastCommandTimestamp;

        // Diagnostic Logic
        let diagnosis = 'System Response: NOMINAL';
        let severity: 'OPTIMAL' | 'WARNING' | 'CRITICAL' = 'OPTIMAL';
        let recommendation = 'No action required.';

        if (delta > 2 && timeSinceCommand > 1500) {
            // "Lazy" response
            if (selectedAsset?.status === 'Critical') {
                diagnosis = 'Povećano trenje u glavi rotora';
                severity = 'CRITICAL';
                recommendation = 'Check rotor head lubrication and mechanical linkages for binding.';
            } else {
                diagnosis = 'Zrak u sistemu (Histerezis)';
                severity = 'WARNING';
                recommendation = 'Perform hydraulic system bleeding procedure. Check for pump cavitation.';
            }
        }

        return {
            setpoint,
            actual,
            delta: delta.toFixed(2),
            timeSinceCommand,
            diagnosis,
            severity,
            recommendation
        };
    }, [assetTele, selectedAsset]);

    if (!selectedAsset || !analysis) return null;

    return (
        <GlassCard title="System Response & Hysteresis" className={analysis.severity === 'CRITICAL' ? 'border-l-4 border-l-red-500 bg-red-950/20' : analysis.severity === 'WARNING' ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-emerald-500'}>
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Command Setpoint</p>
                        <p className="text-2xl font-mono font-black text-white">{analysis.setpoint}%</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Actual Feedback</p>
                        <p className="text-2xl font-mono font-black text-cyan-400">{analysis.actual}%</p>
                    </div>
                </div>

                {/* Hysteresis Visualization */}
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden relative">
                    <div
                        className="absolute h-full bg-slate-700 opacity-30 transition-all duration-500"
                        style={{ width: `${analysis.setpoint}%` }}
                    />
                    <div
                        className={`absolute h-full transition-all duration-100 ${analysis.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${analysis.actual}%` }}
                    />
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest px-1">
                    <span className="text-slate-500">Error Delta: {analysis.delta}%</span>
                    <span className={analysis.timeSinceCommand > 1000 ? 'text-amber-500 animate-pulse' : 'text-slate-500'}>
                        Settle Time: {analysis.timeSinceCommand}ms
                    </span>
                </div>

                <div className={`p-4 rounded-xl border ${analysis.severity === 'CRITICAL' ? 'bg-red-500/10 border-red-500/30' : analysis.severity === 'WARNING' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                    <div className="flex items-start gap-3">
                        <span className="text-xl">{analysis.severity === 'CRITICAL' ? '🔴' : analysis.severity === 'WARNING' ? '🟡' : '🟢'}</span>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Ano-Agent Diagnostic</p>
                            <p className="text-sm font-bold text-white mb-2 uppercase">{analysis.diagnosis}</p>
                            <p className="text-[10px] text-slate-400 leading-relaxed italic border-t border-white/5 pt-2">
                                {analysis.recommendation}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Manual Test Control */}
                <div className="pt-4 border-t border-white/5">
                    <p className="text-[9px] text-slate-500 uppercase font-black mb-3">Response Test Control</p>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={testValue}
                            onChange={(e) => setTestValue(parseInt(e.target.value))}
                            className="flex-grow accent-cyan-500"
                        />
                        <button
                            onClick={() => {
                                const numeric = idAdapter.toNumber(selectedAsset.id);
                                if (numeric !== null) updateWicketGateSetpoint(numeric, testValue);
                            }}
                            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black rounded uppercase tracking-widest transition-all"
                        >
                            Execute Move
                        </button>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};
