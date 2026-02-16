import React, { useEffect, useState } from 'react';
import { useAssetContext } from '../../contexts/AssetContext.tsx';
import { useTelemetry } from '../../contexts/TelemetryContext.tsx';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore.ts';
import { Tooltip } from '../ui/Tooltip.tsx';
import { ModernButton } from '../ui/ModernButton.tsx';
import { useNavigate } from 'react-router-dom';
import { Decimal } from 'decimal.js';
import { PhysicsEngine } from '../../core/PhysicsEngine.ts';
import { ExpertDiagnosisEngine } from '../../features/physics-core/ExpertDiagnosisEngine.ts';

import { DigitalDisplay } from './DigitalDisplay.tsx';
import { dispatch } from '../../lib/events';
import { ActiveAlarmsModal } from '../dashboard/ActiveAlarmsModal';

const TurbineUnit: React.FC<{ id: string; name: string; status: 'running' | 'stopped'; mw: number }> = React.memo(({ name, status, mw }) => (
    <div className="relative group">
        <Tooltip content={`${name} is currently ${status === 'running' ? 'Active & Generating' : 'Standby'}`}>
            {/* Standard SCADA Generator Representation */}
            <div className={`
                w-52 h-52 rounded-full border-[4px] flex items-center justify-center relative translate-y-10 transition-all duration-700
                ${status === 'running'
                    ? 'border-status-info bg-scada-panel'
                    : 'border-scada-border bg-scada-panel'}
            `}>
                {/* Rotating inner ring - functional visualization */}
                <div className={`w-40 h-40 rounded-full border-[2px] border-dashed ${status === 'running' ? 'border-status-info animate-spin-slow' : 'border-scada-border'}`}></div>

                {/* Metrics Display */}
                <div className="absolute text-center">
                    <DigitalDisplay value={mw} label={name} unit="MW" color={status === 'running' ? 'cyan' : 'red'} className="!bg-transparent !border-none !p-0 scale-110" />
                </div>
            </div>
        </Tooltip>

        {/* Shaft */}
        <div className="w-5 h-20 bg-scada-border mx-auto relative -z-10"></div>

        {/* Turbine Runner */}
        <div className={`
            w-36 h-24 mx-auto rounded-b-sm border-x-[2px] border-b-[2px] flex items-center justify-center overflow-hidden transition-all duration-700
            ${status === 'running' ? 'border-status-info bg-scada-panel' : 'border-scada-border bg-scada-panel'}
            ${mw === 0 ? 'bg-status-error/10 border-status-error' : ''}
        `}>
            {status === 'running' && mw > 0 && (
                <div className="w-full h-full bg-status-info/10 animate-[slide_1s_linear_infinite]"></div>
            )}
            {mw === 0 && (
                <div className="text-xs font-black text-status-error tracking-tight px-2 py-1 bg-status-error/10 rounded-sm border border-status-error/30">EMERGENCY SHUTDOWN</div>
            )}
        </div>
    </div>
));

export const ScadaMimic: React.FC = React.memo(() => {
    const { selectedAsset } = useAssetContext();
    const { telemetry } = useTelemetry();
    const { updateTelemetry } = useTelemetryStore();
    const telemetryStore = useTelemetryStore();
    
    // Local helper to replace legacy ProjectEngine
    const connectSCADAToExpertEngine = (flow: number, head: number, frequency: number) => {
        const scadaState: any = {
            ...telemetryStore,
            hydraulic: {
                ...telemetryStore.hydraulic,
                flowRate: new Decimal(flow),
                waterHead: new Decimal(head),
                flow: flow,
                head: head
            },
            physics: {
                ...telemetryStore.physics,
                hoopStressMPa: telemetryStore.physics.hoopStressMPa || 0,
                // powerMW: 0, // Removed as it is not in TechnicalProjectState['physics']
                surgePressureBar: telemetryStore.physics.surgePressureBar || 0,
            },
            penstock: {
                ...telemetryStore.penstock,
                materialYieldStrength: telemetryStore.penstock.materialYieldStrength || 355
            }
        };

        const physicsResult = PhysicsEngine.recalculatePhysics(scadaState);
        const diagnosis = ExpertDiagnosisEngine.runExpertDiagnosis(physicsResult, scadaState);

        const criticalAlarms = diagnosis.messages
            .filter(m => diagnosis.severity === 'CRITICAL')
            .map(m => ({ message: m.en }));

        return {
            healthScore: diagnosis.severity === 'CRITICAL' ? 40 : diagnosis.severity === 'WARNING' ? 70 : 98,
            criticalAlarms,
            diagnostics: diagnosis
        };
    };

    const [isLoading, setIsLoading] = useState(true);
    const [scadaAlarms, setScadaAlarms] = useState<any[]>([]);
    const [showAlarmsModal, setShowAlarmsModal] = useState(false);

    const liveData = selectedAsset ? telemetry[selectedAsset.id] : null;
    const isCritical = liveData?.status === 'CRITICAL';

    // Simulated Data
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

        // MIGRATION: Update Telemetry Store directly instead of legacy ProjectEngine
        updateTelemetry({
            hydraulic: {
                flow: flowRate,
                head: headPressure,
                efficiency: isCritical ? 65 : 92
            }
        });

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
    }, [selectedAsset, isLoading, isCritical, updateTelemetry, connectSCADAToExpertEngine]);

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
            <div className="flex-1 bg-scada-bg relative overflow-hidden flex flex-col items-center justify-center p-8">
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
                </div>

                <div className="relative z-10 max-w-2xl text-center space-y-8 animate-fade-in">
                    {/* Headline */}
                    <div className="space-y-4">
                        <div className="inline-block px-4 py-2 bg-scada-panel border border-scada-border rounded-sm text-status-info text-sm font-bold uppercase tracking-wider mb-4">
                            ⚡ Get Started
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-scada-text uppercase font-header">
                            Register Your
                            <span className="text-status-info"> Hydropower Plant</span>
                        </h1>
                        <p className="text-xl text-scada-muted max-w-xl mx-auto font-light font-mono">
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
                            className="px-8 py-4 text-lg shadow-scada-card"     
                        >
                            Create Your Plant
                        </ModernButton>

                        <button
                            onClick={() => window.location.hash = '#/map'}
                            className="px-6 py-3 border-2 border-scada-border hover:border-status-info text-scada-muted hover:text-scada-text rounded-sm font-bold transition-all uppercase tracking-widest"
                        >
                            📍 View Global Map
                        </button>
                    </div>

                    {/* Features List */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-scada-border">
                        <div className="p-6 bg-scada-panel border border-scada-border rounded-sm hover:border-status-info transition-all">
                            <div className="text-3xl mb-3 grayscale opacity-70">📊</div>
                            <h3 className="text-scada-text font-bold mb-2 uppercase tracking-wide">Real-Time SCADA</h3>
                            <p className="text-sm text-scada-muted font-mono">Live telemetry and performance monitoring</p>
                        </div>
                        <div className="p-6 bg-scada-panel border border-scada-border rounded-sm hover:border-status-info transition-all">
                            <div className="text-3xl mb-3 grayscale opacity-70">🤖</div>
                            <h3 className="text-scada-text font-bold mb-2 uppercase tracking-wide">System Diagnostics</h3>
                            <p className="text-sm text-scada-muted font-mono">Failure detection & condition monitoring</p>
                        </div>
                        <div className="p-6 bg-scada-panel border border-scada-border rounded-sm hover:border-status-info transition-all">
                            <div className="text-3xl mb-3 grayscale opacity-70">⚙️</div>
                            <h3 className="text-scada-text font-bold mb-2 uppercase tracking-wide">Maintenance Hub</h3>
                            <p className="text-sm text-scada-muted font-mono">Automated work orders & service tracking</p>
                        </div>
                    </div>

                    {/* Subtle Examples Note */}
                    <p className="text-xs text-scada-muted mt-8 font-mono">
                        💡 Demo mode active - Example data available for exploration
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-scada-bg relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">

            {/* Standard Grid Background */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            {/* Demo Indicator */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-xs text-scada-muted font-mono uppercase tracking-widest px-4 py-2 bg-scada-panel border border-scada-border rounded-sm">
                Live Demo: {selectedAsset?.name}
            </div>

            {/* Main Dashboard Container */}
            <div className="relative z-10 w-full max-w-6xl border border-scada-border bg-scada-panel p-6 sm:p-8 md:p-16 rounded-sm shadow-scada-card overflow-hidden self-center">

                {/* Header Bar */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <div className="text-xs sm:text-sm font-black text-scada-muted tracking-widest border border-scada-border px-4 py-2 bg-scada-bg rounded-sm">
                        NEURAL INTERFACE :: INTELLIGENCE
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-status-info uppercase tracking-widest truncate max-w-[150px] sm:max-w-none flex items-center gap-2">
                        <span className="w-2 h-2 bg-status-info rounded-full"></span>
                        {selectedAsset?.name || 'NO CONTEXT'}
                    </div>
                </div>

                {/* Status Badge */}
                <Tooltip content={isCritical ? "FATAL ERROR: Bearing Temperature Exceeded / High Vibration Detected" : "Infrastructure Status: All metrics within operational thresholds."}>
                    <div className={`absolute top-4 right-4 sm:top-6 sm:right-6 text-xs sm:text-sm font-mono px-4 py-2.5 rounded-sm flex items-center gap-3 border transition-all ${isCritical
                        ? 'text-status-error bg-status-error/10 border-status-error'
                        : 'text-status-ok bg-status-ok/10 border-status-ok'
                        }`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${isCritical ? 'bg-status-error' : 'bg-status-ok'}`}></span>
                        <span className="hidden sm:inline tracking-wider uppercase font-black">
                            {isCritical ? 'STATUS: ALARM' : 'STATUS: OPTIMAL'}
                        </span>
                        <span className="sm:hidden font-bold">{isCritical ? 'ALARM' : 'OK'}</span>
                    </div>
                </Tooltip>

                {/* Turbine Units */}
                <div className="flex flex-col sm:flex-row justify-around items-center sm:items-end pt-16 sm:pt-20 pb-10 sm:pb-16 relative gap-16 sm:gap-8">
                    <TurbineUnit id="t1" name="GEN T1" status="running" mw={t1Mw} />
                    <div className="w-full h-[1px] sm:w-[1px] sm:h-80 bg-scada-border sm:mx-12"></div>
                    <TurbineUnit id="t2" name="GEN T2" status="running" mw={t2Mw} />
                </div>

                {/* FLOW_STATS PANEL WITH EXPERT ENGINE INTEGRATION */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12">
                    <DigitalDisplay value={scadaAlarms.find(a => a.type === 'CAVITATION_CRITICAL') ? "CAVITATE" : "42.5"} label="FLOW_RATE" unit="m³/s" color={scadaAlarms.find(a => a.type === 'CAVITATION_CRITICAL') ? 'red' : 'green'} className="!bg-scada-bg !border-scada-border" />
                    <DigitalDisplay value={scadaAlarms.find(a => a.type === 'CAVITATION_CRITICAL') ? "CAVITATE" : "152.0"} label="HEAD_PRES" unit="m" color={scadaAlarms.find(a => a.type === 'CAVITATION_CRITICAL') ? 'red' : 'green'} className="!bg-scada-bg !border-scada-border" />
                    <DigitalDisplay value={scadaAlarms.find(a => a.type === 'GRID_FREQUENCY_CRITICAL') ? "DESTRUCT" : "98.2"} label="GRID_FREQ" unit="Hz" color={scadaAlarms.find(a => a.type === 'GRID_FREQUENCY_CRITICAL') ? 'red' : 'green'} className="!bg-scada-bg !border-scada-border" />
                    <DigitalDisplay value={isCritical ? "ALERT" : "12.2"} label="COOLING_ΔT" unit="°C" color={isCritical ? 'red' : 'green'} className="!bg-scada-bg !border-scada-border" />
                </div>

                {/* SCADA ALARMS DISPLAY */}
                {scadaAlarms.length > 0 && (
                    <div className="mt-6 p-6 bg-status-error/10 border border-status-error rounded-sm shadow-scada-card">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-status-error font-black uppercase text-base tracking-wider flex items-center gap-3">
                                <span className="text-xl">⚠️</span>
                                EXPERT ENGINE ALARMS
                            </h4>
                            <button
                                onClick={() => setShowAlarmsModal(true)}
                                className="px-3 py-1 bg-status-error/20 hover:bg-status-error/30 border border-status-error/50 rounded-sm text-[10px] font-bold text-status-error uppercase tracking-widest transition-all"
                            >
                                VIEW ALL ({scadaAlarms.length})
                            </button>
                        </div>
                        <div className="space-y-2">
                            {scadaAlarms.slice(0, 3).map((alarm, idx) => (
                                <div key={idx} className="text-status-error text-sm font-medium flex items-start gap-2 p-2 bg-status-error/5 rounded-sm">
                                    <span className="text-status-error font-bold">●</span>
                                    <span>{alarm.message}</span>
                                </div>
                            ))}
                            {scadaAlarms.length > 3 && (
                                <div className="text-center pt-2">
                                    <span className="text-xs text-status-error/70 font-mono cursor-pointer hover:text-status-error" onClick={() => setShowAlarmsModal(true)}>
                                        + {scadaAlarms.length - 3} MORE ALERTS
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {/* Active Alarms Modal */}
            <ActiveAlarmsModal 
                isOpen={showAlarmsModal} 
                onClose={() => setShowAlarmsModal(false)} 
            />
        </div>
    );
});
