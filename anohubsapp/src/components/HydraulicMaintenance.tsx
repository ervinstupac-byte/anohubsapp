import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';
import { useDiagnostic } from '../contexts/DiagnosticContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { GlassCard } from './ui/GlassCard.tsx';
import { StatCard } from './ui/StatCard.tsx';
import { BackButton } from './BackButton.tsx';
import { AssetPicker } from './AssetPicker.tsx';
import { ModernButton } from './ui/ModernButton.tsx';
import { useVoiceAssistant } from '../contexts/VoiceAssistantContext.tsx';

export const HydraulicMaintenance: React.FC = () => {
    const { selectedAsset } = useAssetContext();
    const { telemetry, updatePipeDiameter, triggerEmergency, shutdownExcitation } = useTelemetry();
    const { recordLessonLearned } = useDiagnostic();
    const { showToast } = useToast();
    const { triggerVoiceAlert } = useVoiceAssistant();

    const assetTele = selectedAsset ? telemetry[selectedAsset.id] : null;
    const lastRiverAlert = useRef<number>(0);
    const lastBlockageAlert = useRef<number>(0);
    const [diameterInput, setDiameterInput] = useState<number>(12);

    useEffect(() => {
        if (assetTele) {
            setDiameterInput(assetTele.pipeDiameter);
        }
    }, [assetTele?.pipeDiameter]);

    // 1. HYDRAULIC RETROFIT VALIDATOR (Actuator Velocity)
    const simResults = useMemo(() => {
        if (!assetTele) return null;
        const oldDiameter = assetTele.pipeDiameter;
        const newDiameter = diameterInput;

        if (oldDiameter === newDiameter) return null;

        const ratio = (newDiameter * newDiameter) / (oldDiameter * oldDiameter);
        const velocityIncrease = (ratio - 1) * 100;

        // LIMIT: 30% increase is warning, 100%+ is block (Standard #2024-KM)
        const isCritical = velocityIncrease >= 100;

        return {
            velocityIncrease: velocityIncrease.toFixed(1),
            isCritical
        };
    }, [diameterInput, assetTele]);

    // 2. DYNAMIC TENSION & ACOUSTIC MONITORING
    useEffect(() => {
        if (!assetTele || !selectedAsset) return;

        // TENSION MONITOR: Pressure spike without position change
        if (assetTele.oilPressureRate > 15 && assetTele.actuatorPosition < 1) {
            const now = Date.now();
            if (now - lastBlockageAlert.current > 10000) {
                triggerEmergency(selectedAsset.id, 'mechanical_blockage');
                showToast("Cilindar blokiran - Sumnja na mehaničko zapetljavanje!", "error");
                lastBlockageAlert.current = now;
            }
        }

        // ACOUSTIC MONITOR (Old Man's Ear)
        const maxAcousticMag = Math.max(...assetTele.vibrationSpectrum);
        if (maxAcousticMag > 0.8) {
            triggerVoiceAlert("Detektovano struganje metala na stražnjem ležaju. Automatsko gašenje uzbude.");
            shutdownExcitation(selectedAsset.id);
            triggerEmergency(selectedAsset.id, 'metal_scraping');
        }

        // OIL-IN-WATER Sensor
        if (assetTele.oilReservoirLevel < 80 && assetTele.output > 1) {
            const now = Date.now();
            if (now - lastRiverAlert.current > 60000) {
                triggerVoiceAlert("Sumnja na curenje ulja u rijeku. Provjeri zaptivke glave rotora.");
                lastRiverAlert.current = now;
            }
        }

        // 3. FLUID TEMPERATURE ALARM (>55°C)
        // Simulated reading from telemetry
        const fluidTemp = assetTele.temperature || 45; // Default safe
        if (fluidTemp > 55) {
            const now = Date.now();
            // Debounce 30s
            if (now - lastRiverAlert.current > 30000) {
                showToast("HEAT WARNING: Hydraulic Fluid > 55°C. Oil degradation risk!", "warning");
                triggerVoiceAlert("Temperatura ulja visoka. Rizik od degradacije viskoznosti.");
                lastRiverAlert.current = now;
            }
        }
    }, [assetTele, selectedAsset, triggerEmergency, shutdownExcitation, showToast, triggerVoiceAlert]);

    const handleApplyChange = () => {
        if (!selectedAsset || !simResults) return;

        if (simResults.isCritical) {
            triggerVoiceAlert("Upozorenje: Rizik od mehaničkog kidanja instalacija uslijed prevelikog protoka.");
            showToast("BLOCK: Velocity limits exceeded.", "error");

            recordLessonLearned({
                symptom: 'SPEC_CHANGE_VAL',
                cause: `Diameter change ${assetTele?.pipeDiameter}->${diameterInput}mm causes ${simResults.velocityIncrease}% velocity rise.`,
                resolution: 'Blocked by Change Management protocol.'
            });
            return;
        }

        updatePipeDiameter(selectedAsset.id, diameterInput);
        showToast("Retrofit Validated & Applied", "success");
    };

    return (
        <div className="animate-fade-in space-y-8 pb-12">
            <div className="flex justify-between items-center bg-slate-900/40 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-1">Field <span className="text-cyan-400">Safeguard</span></h2>
                    <p className="text-slate-400 text-sm font-light italic">Mechanical Failure Prevention & Retrofit Validation.</p>
                </div>
                <BackButton text="Back to Hub" />
            </div>

            <div className="max-w-md mx-auto">
                <AssetPicker />
            </div>

            {!selectedAsset ? (
                <GlassCard className="text-center py-20 text-slate-500 uppercase font-black tracking-widest">Select an Asset</GlassCard>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        <GlassCard title="Retrofit Validator" className="border-l-4 border-l-cyan-500">
                            <div className="p-4 bg-slate-950 border border-white/5 rounded-xl mb-6">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block">Pipe Diameter (mm)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={diameterInput}
                                        onChange={(e) => setDiameterInput(parseInt(e.target.value))}
                                        className="flex-grow bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white font-mono"
                                    />
                                    <ModernButton onClick={handleApplyChange} variant="primary">Validate</ModernButton>
                                </div>
                            </div>

                            {simResults && (
                                <div className={`p-4 rounded-xl border animate-pulse ${simResults.isCritical ? 'bg-red-500/10 border-red-500/30' : 'bg-cyan-500/10 border-cyan-500/30'}`}>
                                    <h4 className={`text-xs font-black uppercase mb-1 ${simResults.isCritical ? 'text-red-500' : 'text-cyan-400'}`}>
                                        {simResults.isCritical ? 'CRITICAL VELOCITY' : 'Safe Retrofit'}
                                    </h4>
                                    <p className="text-[10px] text-slate-300">Actuator Speed: +{simResults.velocityIncrease}%</p>
                                    {simResults.isCritical && <p className="text-[8px] text-red-400 font-bold mt-2 uppercase">ANO-AGENT BLOCK ACTIVE</p>}
                                </div>
                            )}
                        </GlassCard>

                        <GlassCard title="Acoustic Spectrum" className="border-l-4 border-l-purple-500">
                            <div className="h-24 flex items-end gap-1 px-2">
                                {assetTele?.vibrationSpectrum.map((mag, i) => (
                                    <div
                                        key={i}
                                        className={`flex-grow rounded-t transition-all duration-300 ${mag > 0.7 ? 'bg-red-500' : 'bg-purple-500'}`}
                                        style={{ height: `${mag * 100}%` }}
                                    />
                                ))}
                            </div>
                            <div className="mt-4 flex justify-between items-center bg-slate-950 p-3 rounded-xl">
                                <span className="text-[10px] text-slate-500 font-black uppercase">Excitation</span>
                                <span className={`text-[10px] font-black ${assetTele?.excitationActive ? 'text-emerald-400' : 'text-red-500'}`}>
                                    {assetTele?.excitationActive ? 'ACTIVE' : 'SHUTDOWN'}
                                </span>
                            </div>
                        </GlassCard>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <StatCard
                                label="Line Pressure"
                                value={assetTele?.cylinderPressure.toFixed(1) || '0'}
                                unit="bar"
                            />
                            <StatCard
                                label="Supply Flow"
                                value={assetTele?.pumpFlowRate.toFixed(1) || '0'}
                                unit="l/s"
                            />
                            <StatCard
                                label="Actuator Extension"
                                value={assetTele?.actuatorPosition.toFixed(1) || '0'}
                                unit="%"
                            />
                            <StatCard
                                label="Spike Rate"
                                value={assetTele?.oilPressureRate.toFixed(1) || '0'}
                                unit="bar/s"
                            />
                        </div>

                        <GlassCard title="Dynamic Tension Monitoring" className="relative group">
                            {assetTele?.oilPressureRate && assetTele.oilPressureRate > 15 && assetTele.actuatorPosition < 5 && (
                                <div className="absolute inset-x-0 -top-2 flex justify-center z-10">
                                    <div className="px-4 py-1 bg-red-600 text-white text-[10px] font-black rounded-full animate-bounce">
                                        BLOCKAGE DETECTED!
                                    </div>
                                </div>
                            )}

                            <div className="aspect-video bg-slate-950 rounded-2xl border border-white/5 relative flex items-center justify-center p-12">
                                <div className="w-full h-8 bg-slate-900 border border-slate-800 rounded-full relative overflow-hidden">
                                    <div
                                        className={`absolute top-0 bottom-0 left-0 transition-all duration-300 ${assetTele?.oilPressureRate && assetTele.oilPressureRate > 15 ? 'bg-red-500 shadow-[0_0_20px_red]' : 'bg-cyan-500'}`}
                                        style={{ width: `${assetTele?.actuatorPosition || 0}%` }}
                                    />
                                </div>
                                {assetTele?.safetyValveActive && (
                                    <div className="absolute inset-0 bg-red-500/5 animate-pulse flex items-center justify-center">
                                        <span className="text-red-500 text-xs font-black uppercase tracking-widest border border-red-500 px-4 py-2 rounded-xl bg-slate-950/80">
                                            Emergency Dump Active
                                        </span>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            )}
        </div>
    );
};
