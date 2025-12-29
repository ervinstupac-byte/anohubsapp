import React, { useEffect, useState } from 'react';
import { useAssetContext } from '../../contexts/AssetContext.tsx';
import { useTelemetry } from '../../contexts/TelemetryContext.tsx';
import { useProjectEngine } from '../../contexts/ProjectContext.tsx';
import { Tooltip } from '../ui/Tooltip.tsx';
import { ModernButton } from '../ui/ModernButton.tsx';
import { useNavigate } from 'react-router-dom';

import { DigitalDisplay } from './DigitalDisplay.tsx';

const TurbineUnit: React.FC<{ id: string; name: string; status: 'running' | 'stopped'; mw: number }> = React.memo(({ name, status, mw }) => (
    <div className="relative group">
        <Tooltip content={`${name} is currently ${status === 'running' ? 'Active & Generating' : 'Standby'}`}>
            <div className={`
                w-40 h-40 rounded-full border-4 flex items-center justify-center relative translate-y-8 transition-all duration-500
                ${status === 'running'
                    ? 'border-neon-cyan bg-neon-cyan/5 shadow-[0_0_30px_rgba(0,243,255,0.2)]'
                    : 'border-slate-800 bg-slate-900/50'}
            `}>
                <div className={`w-32 h-32 rounded-full border-2 border-dashed ${status === 'running' ? 'border-neon-cyan/30 animate-spin-slow' : 'border-slate-800'}`}></div>
                <div className="absolute text-center">
                    <DigitalDisplay value={mw} label={name} unit="MW" color={status === 'running' ? 'cyan' : 'red'} className="!bg-transparent !border-none !p-0" />
                </div>
            </div>
        </Tooltip>

        {/* Shaft */}
        <div className="w-4 h-16 bg-gradient-to-r from-slate-800 to-slate-700 mx-auto relative -z-10 shadow-lg"></div>

        {/* Turbine Runner */}
        <div className={`
            w-28 h-20 mx-auto rounded-b-xl border-x-2 border-b-2 flex items-center justify-center overflow-hidden transition-all duration-500
            ${status === 'running' ? 'border-neon-cyan/40 bg-neon-cyan/10' : 'border-slate-800 bg-slate-900'}
            ${mw === 0 ? 'bg-red-500/10 border-red-500/40' : ''}
        `}>
            {status === 'running' && mw > 0 && (
                <div className="w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(0,243,255,0.1)_50%,transparent_75%)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]"></div>
            )}
            {mw === 0 && (
                <div className="text-[10px] font-black text-red-500 animate-pulse tracking-tighter">EMERGENCY_SHUTDOWN</div>
            )}
        </div>
    </div>
));

export const ScadaMimic: React.FC = React.memo(() => {
    const { selectedAsset } = useAssetContext();
    const { telemetry } = useTelemetry();
    const { connectSCADAToExpertEngine } = useProjectEngine();
    const [isLoading, setIsLoading] = useState(true);
    const [scadaAlarms, setScadaAlarms] = useState<any[]>([]);

    const liveData = selectedAsset ? telemetry[selectedAsset.id] : null;
    const isCritical = liveData?.status === 'CRITICAL';

    // Mock Data
    const seed = selectedAsset ? selectedAsset.id.charCodeAt(0) : 0;
    const baseMw = isCritical ? 0 : (200 + (seed % 50));

    const [t1Mw, setT1Mw] = useState(baseMw);
    const [t2Mw, setT2Mw] = useState(baseMw);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, [selectedAsset]);

    // Simulate subtle fluctuation
    useEffect(() => {
        if (isLoading) return;
        setT1Mw(baseMw);
        setT2Mw(baseMw);

        const interval = setInterval(() => {
            setT1Mw(prev => +(prev + (Math.random() - 0.5) * 0.2).toFixed(1));
            setT2Mw(prev => +(prev + (Math.random() - 0.5) * 0.2).toFixed(1));
        }, 2000);
        return () => clearInterval(interval);
    }, [baseMw, isLoading]);

    // SCADA TO EXPERT ENGINE INTEGRATION
    useEffect(() => {
        if (!selectedAsset || isLoading) return;

        // Extract SCADA values from display (simulated critical condition: 98.2 Hz)
        const flowRate = 42.5; // m³/s from display
        const headPressure = 152.0; // m from display
        const gridFreq = 98.2; // Hz from display (CRITICAL!)

        // Connect to ExpertDiagnosisEngine
        const scadaConnection = connectSCADAToExpertEngine(flowRate, headPressure, gridFreq);

        if (scadaConnection?.criticalAlarms?.length && scadaConnection.criticalAlarms.length > 0) {
            setScadaAlarms(scadaConnection?.criticalAlarms || []);
            console.warn('SCADA CRITICAL ALARMS:', scadaConnection?.criticalAlarms);
        } else {
            setScadaAlarms([]);
        }

        // Trigger visual alarm for frequency 98.2 Hz (massive deviation)
        if (gridFreq >= 98.0) {
            // Could trigger emergency shutdown here
            console.error('CRITICAL: Grid frequency at', gridFreq, 'Hz - Risk of mechanical destruction!');
        }
    }, [selectedAsset, isLoading, connectSCADAToExpertEngine]);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950">
                <div className="w-full max-w-4xl space-y-8 animate-pulse">
                    <div className="h-12 w-48 bg-slate-900/50 rounded-lg"></div>
                    <div className="grid grid-cols-2 gap-12">
                        <div className="h-64 bg-slate-900/50 rounded-2xl"></div>
                        <div className="h-64 bg-slate-900/50 rounded-2xl"></div>
                    </div>
                    <div className="h-16 w-full bg-slate-900/50 rounded-xl"></div>
                </div>
            </div>
        );
    }

    // Empty State: No Asset Selected (Priority CTA)
    if (!selectedAsset) {
        return (
            <div className="flex-1 bg-[#020617] relative overflow-hidden flex flex-col items-center justify-center p-8">
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
                </div>

                <div className="relative z-10 max-w-2xl text-center space-y-8 animate-fade-in">
                    {/* Headline */}
                    <div className="space-y-4">
                        <div className="inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-bold uppercase tracking-wider mb-4">
                            ⚡ Get Started
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
                            Register Your
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"> Hydropower Plant</span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-xl mx-auto font-light">
                            Connect your turbines to AnoHUB's advanced monitoring and diagnostic platform in minutes.
                        </p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <ModernButton
                            variant="primary"
                            icon={<span>🏭</span>}
                            onClick={() => {
                                // Trigger registration wizard (same as sidebar)
                                const event = new CustomEvent('openAssetWizard');
                                window.dispatchEvent(event);
                            }}
                            className="px-8 py-4 text-lg shadow-cyan-500/30 shadow-2xl"
                        >
                            Create Your Plant
                        </ModernButton>

                        <button
                            onClick={() => window.location.hash = '#/map'}
                            className="px-6 py-3 border-2 border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-white rounded-xl font-bold transition-all"
                        >
                            📍 View Global Map
                        </button>
                    </div>

                    {/* Features List */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/5">
                        <div className="p-6 bg-slate-900/50 border border-white/5 rounded-xl hover:border-cyan-500/30 transition-all">
                            <div className="text-3xl mb-3">📊</div>
                            <h3 className="text-white font-bold mb-2">Real-Time SCADA</h3>
                            <p className="text-sm text-slate-500">Live telemetry and performance monitoring</p>
                        </div>
                        <div className="p-6 bg-slate-900/50 border border-white/5 rounded-xl hover:border-cyan-500/30 transition-all">
                            <div className="text-3xl mb-3">🤖</div>
                            <h3 className="text-white font-bold mb-2">AI Diagnostics</h3>
                            <p className="text-sm text-slate-500">Predictive failure detection & RUL estimation</p>
                        </div>
                        <div className="p-6 bg-slate-900/50 border border-white/5 rounded-xl hover:border-cyan-500/30 transition-all">
                            <div className="text-3xl mb-3">⚙️</div>
                            <h3 className="text-white font-bold mb-2">Maintenance Hub</h3>
                            <p className="text-sm text-slate-500">Automated work orders & service tracking</p>
                        </div>
                    </div>

                    {/* Subtle Examples Note */}
                    <p className="text-xs text-slate-600 mt-8">
                        💡 Demo mode active - Example data available for exploration
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-[#020617] relative overflow-hidden flex flex-col items-center justify-center p-2 sm:p-4 md:p-8">

            {/* Grid Background - More subtle */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
            </div>

            {/* Subtle Demo Indicator */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-[10px] text-slate-600 font-mono uppercase tracking-widest opacity-40">
                Demo Example: {selectedAsset?.name}
            </div>

            <div className="relative z-10 w-full max-w-5xl border border-white/5 bg-black/40 p-4 sm:p-6 md:p-12 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden self-center">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3">
                    <div className="text-[10px] sm:text-xs font-black text-slate-500 tracking-[0.2em] border border-white/10 px-3 py-1 bg-white/5 rounded backdrop-blur-sm">
                        NEURAL INTERFACE :: SCADA
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold text-neon-cyan uppercase tracking-widest truncate max-w-[150px] sm:max-w-none drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]">
                        ● {selectedAsset?.name || 'NO CONTEXT'}
                    </div>
                </div>

                <Tooltip content={isCritical ? "FATAL ERROR: Bearing Temperature Exceeded / High Vibration Detected" : "Infrastructure Status: All metrics within operational thresholds."}>
                    <div className={`absolute top-2 right-2 sm:top-4 sm:right-4 text-[9px] sm:text-xs font-mono px-3 py-1 rounded backdrop-blur-sm flex items-center gap-2 border ${isCritical
                        ? 'text-red-500 bg-red-950/40 border-red-500 animate-pulse'
                        : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse'}`}></span>
                        <span className="hidden sm:inline tracking-tighter uppercase font-black">
                            {isCritical ? 'CORE_STATUS: ALARM' : 'CORE_STATUS: STABLE'}
                        </span>
                        <span className="sm:hidden">{isCritical ? 'ALARM' : 'OK'}</span>
                    </div>
                </Tooltip>

                <div className="flex flex-col sm:flex-row justify-around items-center sm:items-end pt-12 sm:pt-16 pb-8 sm:pb-12 relative gap-12 sm:gap-0">
                    <TurbineUnit id="t1" name="GEN T1" status="running" mw={t1Mw} />
                    <div className="w-full h-px sm:w-px sm:h-72 bg-gradient-to-b from-transparent via-white/10 to-transparent sm:mx-8"></div>
                    <TurbineUnit id="t2" name="GEN T2" status="running" mw={t2Mw} />
                </div>

                {/* FLOW_STATS PANEL WITH EXPERT ENGINE INTEGRATION */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    <DigitalDisplay value={scadaAlarms.find(a => a.type === 'CAVITATION_CRITICAL') ? "CAVITATE" : "42.5"} label="FLOW_RATE" unit="m³/s" color={scadaAlarms.find(a => a.type === 'CAVITATION_CRITICAL') ? 'red' : 'cyan'} className="glass" />
                    <DigitalDisplay value={scadaAlarms.find(a => a.type === 'CAVITATION_CRITICAL') ? "CAVITATE" : "152.0"} label="HEAD_PRES" unit="m" color={scadaAlarms.find(a => a.type === 'CAVITATION_CRITICAL') ? 'red' : 'cyan'} className="glass" />
                    <DigitalDisplay value={scadaAlarms.find(a => a.type === 'GRID_FREQUENCY_CRITICAL') ? "DESTRUCT" : "98.2"} label="GRID_FREQ" unit="Hz" color={scadaAlarms.find(a => a.type === 'GRID_FREQUENCY_CRITICAL') ? 'red' : 'cyan'} className="glass animate-pulse" />
                    <DigitalDisplay value={isCritical ? "ALERT" : "12.2"} label="COOLING_ΔT" unit="°C" color={isCritical ? 'red' : 'cyan'} className="glass" />
                </div>

                {/* SCADA ALARMS DISPLAY */}
                {scadaAlarms.length > 0 && (
                    <div className="mt-4 p-4 bg-red-950/40 border border-red-500/50 rounded-lg">
                        <h4 className="text-red-400 font-bold uppercase text-sm mb-2">⚠️ EXPERT ENGINE ALARMS</h4>
                        {scadaAlarms.map((alarm, idx) => (
                            <div key={idx} className="text-red-300 text-xs mb-1 animate-pulse">
                                • {alarm.message}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});
