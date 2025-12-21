import React from 'react';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { GlassCard } from './ui/GlassCard.tsx';
import { ModernButton } from './ui/ModernButton.tsx';

export const IncidentSimulator: React.FC = () => {
    const { triggerEmergency, clearEmergency, activeIncident } = useTelemetry();
    const { selectedAsset } = useAssetContext();

    if (!selectedAsset) return null;

    return (
        <GlassCard className="fixed bottom-24 left-6 z-[2000] w-72 bg-slate-900/90 border-red-500/30 backdrop-blur-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                    <span className="text-red-500 animate-pulse">🚨</span>
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Incident Simulator</h3>
                </div>
                {activeIncident && (
                    <button
                        onClick={clearEmergency}
                        className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-colors"
                    >
                        RESET
                    </button>
                )}
            </div>

            <div className="space-y-3">
                <p className="text-[10px] text-slate-400 leading-tight">
                    Inject critical telemetry data for <span className="text-cyan-400 font-bold">{selectedAsset.name}</span> to test system-wide resilience.
                </p>

                <div className="grid grid-cols-1 gap-2">
                    <ModernButton
                        variant="secondary"
                        className="!py-2 border-red-500/20 hover:border-red-500/50 bg-red-500/5"
                        onClick={() => triggerEmergency(selectedAsset.id, 'vibration_excess')}
                        disabled={!!activeIncident}
                    >
                        <span className="text-[10px] font-bold">💥 VIBRATION EXCESS</span>
                    </ModernButton>

                    <ModernButton
                        variant="secondary"
                        className="!py-2 border-orange-500/20 hover:border-orange-500/50 bg-orange-500/5"
                        onClick={() => triggerEmergency(selectedAsset.id, 'bearing_overheat')}
                        disabled={!!activeIncident}
                    >
                        <span className="text-[10px] font-bold">🔥 BEARING OVERHEAT</span>
                    </ModernButton>
                </div>

                {activeIncident && (
                    <div className="mt-4 p-2 bg-red-500/10 border border-red-500/20 rounded text-[9px] font-mono text-red-400 animate-pulse">
                        STATUS: EMERGENCY_INJECTED
                        <br />
                        TYPE: {activeIncident.type.toUpperCase()}
                    </div>
                )}
            </div>
        </GlassCard>
    );
};
