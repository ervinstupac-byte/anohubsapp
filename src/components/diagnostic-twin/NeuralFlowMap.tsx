import React, { useEffect, useState } from 'react';
import { useAssetContext } from '../../contexts/AssetContext.tsx';
import { useProjectEngine } from '../../contexts/ProjectContext.tsx';
import { useEngineeringMath } from '../../hooks/useEngineeringMath.ts';
import { Tooltip } from '../ui/Tooltip.tsx';
import { useNavigate } from 'react-router-dom';
import { DigitalDisplay } from './DigitalDisplay.tsx';
import { Activity, ShieldCheck, ZapOff, Sparkles } from 'lucide-react';

const TurbineUnit: React.FC<{
    id: string;
    name: string;
    status: 'running' | 'stopped';
    mw: number;
    eccentricity: number;
    vibration: number;
}> = React.memo(({ name, status, mw, eccentricity, vibration }) => {
    // NC-4.2 Reactive Color Logic: Base color on physics metrics
    // Vibration > 0.05 or Eccentricity > 0.8 triggers Warning/Critical aesthetics
    const isVibrationCritical = vibration > 0.06;
    const isEccentricityWarning = eccentricity > 0.75;

    let unitColor = 'cyan';
    if (isVibrationCritical) unitColor = 'red';
    else if (isEccentricityWarning) unitColor = 'orange';

    const colorMap = {
        cyan: 'border-cyan-400 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent shadow-[0_0_60px_rgba(34,211,238,0.3),inset_0_0_40px_rgba(6,182,212,0.1)]',
        orange: 'border-orange-400 bg-gradient-to-br from-orange-500/10 via-yellow-500/5 to-transparent shadow-[0_0_60px_rgba(251,146,60,0.3),inset_0_0_40px_rgba(245,158,11,0.1)]',
        red: 'border-red-400 bg-gradient-to-br from-red-500/10 via-pink-500/5 to-transparent shadow-[0_0_60px_rgba(239,68,68,0.3),inset_0_0_40px_rgba(220,38,38,0.1)]'
    };

    return (
        <div className="relative group">
            <Tooltip content={`${name}: Eccentricity ${(eccentricity).toFixed(3)} | Vibration ${(vibration * 1000).toFixed(1)}μm`}>
                <div className={`
                    w-52 h-52 rounded-full border-[6px] flex items-center justify-center relative translate-y-10 transition-all duration-700 backdrop-blur-sm
                    ${status === 'running' ? colorMap[unitColor as keyof typeof colorMap] : 'border-slate-700 bg-gradient-to-br from-slate-800/50 to-slate-900/50 shadow-xl'}
                `}>
                    <div className={`w-40 h-40 rounded-full border-[3px] border-dashed ${status === 'running' ? 'border-cyan-400/40 animate-spin-slow' : 'border-slate-700'}`}></div>

                    <div className="absolute text-center">
                        <DigitalDisplay
                            value={mw.toFixed(1)}
                            label={name}
                            unit="MW"
                            color={unitColor as any}
                            className="!bg-transparent !border-none !p-0 scale-110"
                        />
                    </div>

                    {status === 'running' && unitColor === 'cyan' && (
                        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-cyan-500/5 to-transparent pointer-events-none"></div>
                    )}
                </div>
            </Tooltip>

            <div className="w-5 h-20 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 mx-auto relative -z-10 shadow-2xl" />

            <div className={`
                w-36 h-24 mx-auto rounded-b-2xl border-x-[3px] border-b-[3px] flex items-center justify-center overflow-hidden transition-all duration-700 backdrop-blur-sm
                ${status === 'running' ? 'border-cyan-400/50 bg-gradient-to-b from-cyan-500/15 to-blue-500/10 shadow-[0_8px_30px_rgba(34,211,238,0.2)]' : 'border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 shadow-xl'}
                ${isVibrationCritical ? 'bg-gradient-to-b from-red-500/20 to-red-600/10 border-red-500/50 shadow-[0_8px_30px_rgba(239,68,68,0.3)]' : ''}
            `}>
                {status === 'running' && !isVibrationCritical && (
                    <div className="w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(34,211,238,0.15)_50%,transparent_75%)] bg-[length:24px_24px] animate-[slide_1s_linear_infinite]"></div>
                )}
                {isVibrationCritical && (
                    <div className="text-[10px] font-black text-red-400 animate-pulse tracking-tight px-2 py-1 bg-red-950/50 rounded border border-red-500/30 uppercase">Thermal/Vib Threshold Breached</div>
                )}
            </div>
        </div>
    );
});

export const NeuralFlowMap: React.FC = React.memo(() => {
    const { selectedAsset } = useAssetContext();
    const { connectTwinToExpertEngine, technicalState } = useProjectEngine();
    const { orbit, vibration, waterHammer } = useEngineeringMath();
    const [isLoading, setIsLoading] = useState(true);
    const [diagnosticAlerts, setDiagnosticAlerts] = useState<any[]>([]);

    const mwOutput = technicalState.physics?.surgePressureBar ? technicalState.physics.surgePressureBar * 2.5 : 45.0;

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, [selectedAsset]);

    // DIAGNOSTIC INTEGRITY MONITOR
    useEffect(() => {
        if (!selectedAsset || isLoading) return;

        // Reactive Diagnostic Pipeline (Formerly SCADA Interlock)
        const flowRate = technicalState.hydraulic.flow;
        const headPressure = technicalState.hydraulic.head;
        const gridFreq = 50.0; // Stabilized frequency for twin visualization

        const scadaConnection = connectTwinToExpertEngine(flowRate, headPressure, gridFreq);
        setDiagnosticAlerts(scadaConnection?.criticalAlarms || []);

    }, [selectedAsset, isLoading, technicalState, connectTwinToExpertEngine]);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950">
                <div className="w-full max-w-4xl space-y-8 animate-pulse">
                    <div className="h-12 w-48 bg-slate-900/50 rounded-lg"></div>
                    <div className="grid grid-cols-2 gap-12">
                        <div className="h-64 bg-slate-900/50 rounded-2xl"></div>
                        <div className="h-64 bg-slate-900/50 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!selectedAsset) {
        return (
            <div className="flex-1 bg-[#020617] relative overflow-hidden flex flex-col items-center justify-center p-8">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
                </div>
                <div className="relative z-10 max-w-2xl text-center space-y-8 animate-fade-in">
                    <div className="inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-bold uppercase tracking-wider mb-4">
                        <Sparkles className="w-4 h-4 inline mr-2" /> Asset Intelligence Initialization
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
                        Deploy Your
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"> Diagnostic Twin</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-xl mx-auto font-light">
                        Connect high-fidelity field data for forensic analysis and predictive maintenance.
                    </p>
                    <button
                        className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all active:scale-95"
                        onClick={() => window.dispatchEvent(new CustomEvent('openAssetWizard'))}
                    >
                        Register New Asset
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/5">
                        <div className="p-6 bg-slate-900/50 border border-white/5 rounded-xl hover:border-cyan-500/30 transition-all text-center">
                            <Activity className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                            <h3 className="text-white font-bold mb-2">Neural Flow</h3>
                            <p className="text-xs text-slate-500">Real-time physics synchronization</p>
                        </div>
                        <div className="p-6 bg-slate-900/50 border border-white/5 rounded-xl hover:border-cyan-500/30 transition-all text-center">
                            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                            <h3 className="text-white font-bold mb-2">Diagnostic Integrity</h3>
                            <p className="text-xs text-slate-500">Certified forensic data stream</p>
                        </div>
                        <div className="p-6 bg-slate-900/50 border border-white/5 rounded-xl hover:border-cyan-500/30 transition-all text-center">
                            <ZapOff className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                            <h3 className="text-white font-bold mb-2">Zero Control</h3>
                            <p className="text-xs text-slate-500">Non-intrusive monitoring focus</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)', backgroundSize: '80px 80px' }}>
            </div>

            <div className="relative z-10 w-full max-w-6xl border-2 border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-black/60 p-6 sm:p-8 md:p-16 rounded-3xl backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <div className="text-xs sm:text-sm font-black text-slate-400 tracking-[0.25em] border-2 border-cyan-500/20 px-4 py-2 bg-slate-900/50 rounded-lg shadow-lg">
                        NEURAL CORE // DIAGNOSTIC TWIN
                    </div>
                </div>

                <div className={`absolute top-4 right-4 sm:top-6 sm:right-6 text-xs sm:text-sm font-mono px-4 py-2.5 rounded-xl backdrop-blur-md flex items-center gap-3 border-2 transition-all ${diagnosticAlerts.length > 0
                    ? 'text-red-400 bg-red-950/40 border-red-500/30'
                    : 'text-emerald-400 bg-emerald-950/40 border-emerald-400/30'
                    }`}>
                    <ShieldCheck className={`w-4 h-4 ${diagnosticAlerts.length > 0 ? 'text-red-500' : 'text-emerald-400'}`} />
                    <span className="font-black uppercase tracking-wider">
                        {diagnosticAlerts.length > 0 ? 'DIAGNOSTIC ALARM' : 'INTEGRITY VERIFIED'}
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row justify-around items-center sm:items-end pt-16 sm:pt-20 pb-10 sm:pb-16 relative gap-16 sm:gap-8">
                    <TurbineUnit
                        id="t1"
                        name="UNIT_01"
                        status="running"
                        mw={mwOutput}
                        eccentricity={orbit.eccentricity}
                        vibration={vibration.x}
                    />
                    <div className="w-full h-[2px] sm:w-[2px] sm:h-80 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent sm:mx-12"></div>
                    <TurbineUnit
                        id="t2"
                        name="UNIT_02"
                        status="running"
                        mw={mwOutput * 0.98}
                        eccentricity={orbit.eccentricity * 1.05}
                        vibration={vibration.y}
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12">
                    <DigitalDisplay value={technicalState.hydraulic.flow.toFixed(1)} label="NOMINAL_FLOW" unit="m³/s" color="cyan" />
                    <DigitalDisplay value={technicalState.hydraulic.head.toFixed(0)} label="GROSS_HEAD" unit="m" color="cyan" />
                    <DigitalDisplay value={orbit.eccentricity.toFixed(3)} label="ECCENTRICITY" color={orbit.eccentricity > 0.8 ? 'red' : 'cyan'} />
                    <DigitalDisplay value={(vibration.x * 1000).toFixed(1)} label="VIB_X_PEAK" unit="μm" color={vibration.x > 0.05 ? 'red' : 'cyan'} />
                </div>

                {diagnosticAlerts.length > 0 && (
                    <div className="mt-6 p-5 bg-red-950/30 border border-red-500/30 rounded-2xl animate-pulse">
                        <div className="flex items-center gap-3 mb-3">
                            <ZapOff className="w-5 h-5 text-red-500" />
                            <h4 className="text-red-400 font-black uppercase text-sm tracking-widest text-white">Forensic Detection Active</h4>
                        </div>
                        <div className="space-y-1">
                            {diagnosticAlerts.map((alarm, idx) => (
                                <div key={idx} className="text-red-200 text-xs font-mono pl-8">
                                    {`> ${alarm.message}`}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});
