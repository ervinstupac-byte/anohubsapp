import React, { useEffect, useState } from 'react';
import { useAssetContext } from '../../contexts/AssetContext.tsx';
import { useTelemetry } from '../../contexts/TelemetryContext.tsx';
import { useProjectEngine } from '../../contexts/ProjectContext.tsx';
import { Tooltip } from '../ui/Tooltip.tsx';
import { ModernButton } from '../ui/ModernButton.tsx';
import { useNavigate } from 'react-router-dom';

import { DigitalDisplay } from './DigitalDisplay.tsx';
import { dispatch } from '../../lib/events';

const TurbineUnit: React.FC<{ id: string; name: string; status: 'running' | 'stopped'; mw: number }> = React.memo(({ name, status, mw }) => (
    <div className="relative group">
        <Tooltip content={`${name} is currently ${status === 'running' ? 'Active & Generating' : 'Standby'}`}>
            {/* Premium Generator Housing with enhanced sizing and depth */}
            <div className={`
                w-52 h-52 rounded-full border-[6px] flex items-center justify-center relative translate-y-10 transition-all duration-700 backdrop-blur-sm
                ${status === 'running'
                    ? 'border-cyan-400 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent shadow-[0_0_60px_rgba(34,211,238,0.3),inset_0_0_40px_rgba(6,182,212,0.1)]'
                    : 'border-slate-700 bg-gradient-to-br from-slate-800/50 to-slate-900/50 shadow-xl'}
            `}>
                {/* Rotating inner ring with premium animation */}
                <div className={`w-40 h-40 rounded-full border-[3px] border-dashed ${status === 'running' ? 'border-cyan-400/40 animate-spin-slow' : 'border-slate-700'}`}></div>

                {/* Metrics Display - Enhanced */}
                <div className="absolute text-center">
                    <DigitalDisplay value={mw} label={name} unit="MW" color={status === 'running' ? 'cyan' : 'red'} className="!bg-transparent !border-none !p-0 scale-110" />
                </div>

                {/* Status indicator glow */}
                {status === 'running' && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-t from-cyan-500/5 to-transparent pointer-events-none"></div>
                )}
            </div>
        </Tooltip>

        {/* Shaft - Enhanced with better depth */}
        <div className="w-5 h-20 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 mx-auto relative -z-10 shadow-2xl" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' }}></div>

        {/* Turbine Runner - Premium styling */}
        <div className={`
            w-36 h-24 mx-auto rounded-b-2xl border-x-[3px] border-b-[3px] flex items-center justify-center overflow-hidden transition-all duration-700 backdrop-blur-sm
            ${status === 'running' ? 'border-cyan-400/50 bg-gradient-to-b from-cyan-500/15 to-blue-500/10 shadow-[0_8px_30px_rgba(34,211,238,0.2)]' : 'border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 shadow-xl'}
            ${mw === 0 ? 'bg-gradient-to-b from-red-500/20 to-red-600/10 border-red-500/50 shadow-[0_8px_30px_rgba(239,68,68,0.3)]' : ''}
        `}>
            {status === 'running' && mw > 0 && (
                <div className="w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(34,211,238,0.15)_50%,transparent_75%)] bg-[length:24px_24px] animate-[slide_1s_linear_infinite]"></div>
            )}
            {mw === 0 && (
                <div className="text-xs font-black text-red-400 animate-pulse tracking-tight px-2 py-1 bg-red-950/50 rounded border border-red-500/30">EMERGENCY SHUTDOWN</div>
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
    const seed = selectedAsset ? String(selectedAsset.id).charCodeAt(0) : 0;
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
                            icon={<span>⚡</span>}
                            onClick={() => {  
                                // Trigger registration wizard (same as sidebar)
                                dispatch.openAssetWizard();
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
                            <h3 className="text-white font-bold mb-2">System Diagnostics</h3>
                            <p className="text-sm text-slate-500">Failure detection & condition monitoring</p>
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
        <div className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">

            {/* Premium Grid Background with depth */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)', backgroundSize: '80px 80px' }}>
            </div>

            {/* Ambient glow effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Premium Demo Indicator */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-xs text-slate-500 font-mono uppercase tracking-[0.2em] opacity-50 px-4 py-2 bg-slate-900/30 backdrop-blur-sm rounded-full border border-white/5">
                Live Demo: {selectedAsset?.name}
            </div>

            {/* Main Dashboard Container - Premium glass morphism */}
            <div className="relative z-10 w-full max-w-6xl border-2 border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-black/60 p-6 sm:p-8 md:p-16 rounded-3xl backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden self-center">
                {/* Premium Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/8 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                {/* Premium Header Bar */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <div className="text-xs sm:text-sm font-black text-slate-400 tracking-[0.25em] border-2 border-cyan-500/20 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/5 rounded-lg backdrop-blur-md shadow-lg">
                        NEURAL INTERFACE :: INTELLIGENCE
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-cyan-400 uppercase tracking-[0.2em] truncate max-w-[150px] sm:max-w-none drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]"></span>
                        {selectedAsset?.name || 'NO CONTEXT'}
                    </div>
                </div>

                {/* Premium Status Badge */}
                <Tooltip content={isCritical ? "FATAL ERROR: Bearing Temperature Exceeded / High Vibration Detected" : "Infrastructure Status: All metrics within operational thresholds."}>
                    <div className={`absolute top-4 right-4 sm:top-6 sm:right-6 text-xs sm:text-sm font-mono px-4 py-2.5 rounded-xl backdrop-blur-md flex items-center gap-3 border-2 shadow-xl transition-all ${isCritical
                        ? 'text-red-400 bg-gradient-to-br from-red-950/60 to-red-900/40 border-red-500/50 shadow-red-500/20 animate-pulse'
                        : 'text-emerald-400 bg-gradient-to-br from-emerald-950/60 to-emerald-900/40 border-emerald-400/30 shadow-emerald-500/20'
                        }`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${isCritical ? 'bg-red-500 shadow-[0_0_12px_#ef4444]' : 'bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse'}`}></span>
                        <span className="hidden sm:inline tracking-wider uppercase font-black">
                            {isCritical ? 'STATUS: ALARM' : 'STATUS: OPTIMAL'}
                        </span>
                        <span className="sm:hidden font-bold">{isCritical ? 'ALARM' : 'OK'}</span>
                    </div>
                </Tooltip>

                {/* Turbine Units - Premium spacing and layout */}
                <div className="flex flex-col sm:flex-row justify-around items-center sm:items-end pt-16 sm:pt-20 pb-10 sm:pb-16 relative gap-16 sm:gap-8">
                    <TurbineUnit id="t1" name="GEN T1" status="running" mw={t1Mw} />
                    <div className="w-full h-[2px] sm:w-[2px] sm:h-80 bg-gradient-to-r sm:bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent sm:mx-12"></div>
                    <TurbineUnit id="t2" name="GEN T2" status="running" mw={t2Mw} />
                </div>

                {/* FLOW_STATS PANEL WITH EXPERT ENGINE INTEGRATION - Enhanced spacing */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12">
                    <DigitalDisplay value={scadaAlarms.find(a => a.type === 'CAVITATION_CRITICAL') ? "CAVITATE" : "42.5"} label="FLOW_RATE" unit="m³/s" color={scadaAlarms.find(a => a.type === 'CAVITATION_CRITICAL') ? 'red' : 'cyan'} className="glass" />
                    <DigitalDisplay value={scadaAlarms.find(a => a.type === 'CAVITATION_CRITICAL') ? "CAVITATE" : "152.0"} label="HEAD_PRES" unit="m" color={scadaAlarms.find(a => a.type === 'CAVITATION_CRITICAL') ? 'red' : 'cyan'} className="glass" />
                    <DigitalDisplay value={scadaAlarms.find(a => a.type === 'GRID_FREQUENCY_CRITICAL') ? "DESTRUCT" : "98.2"} label="GRID_FREQ" unit="Hz" color={scadaAlarms.find(a => a.type === 'GRID_FREQUENCY_CRITICAL') ? 'red' : 'cyan'} className="glass animate-pulse" />
                    <DigitalDisplay value={isCritical ? "ALERT" : "12.2"} label="COOLING_ΔT" unit="°C" color={isCritical ? 'red' : 'cyan'} className="glass" />
                </div>

                {/* SCADA ALARMS DISPLAY - Premium styling */}
                {scadaAlarms.length > 0 && (
                    <div className="mt-6 p-6 bg-gradient-to-br from-red-950/60 to-red-900/40 border-2 border-red-500/50 rounded-2xl shadow-[0_8px_30px_rgba(239,68,68,0.2)] backdrop-blur-md">
                        <h4 className="text-red-400 font-black uppercase text-base mb-4 tracking-wider flex items-center gap-3">
                            <span className="text-xl animate-pulse">⚠️</span>
                            EXPERT ENGINE ALARMS
                        </h4>
                        <div className="space-y-2">
                            {scadaAlarms.map((alarm, idx) => (
                                <div key={idx} className="text-red-300 text-sm font-medium animate-pulse flex items-start gap-2 p-2 bg-red-950/30 rounded-lg">
                                    <span className="text-red-500 font-bold">●</span>
                                    <span>{alarm.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});
