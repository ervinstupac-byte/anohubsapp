import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Activity, Zap, Lock, Scale, DoorOpen, ShieldAlert, AlertTriangle } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';

interface FaultState {
    n2: boolean;
    sync: boolean;
    dp: boolean;
    angle: boolean;
}

export const MissionControl: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // PROCEDURE STATE
    const [step, setStep] = useState(1);
    const [simulatedPressure, setSimulatedPressure] = useState(0.0);
    const [isFilling, setIsFilling] = useState(false);

    // FAULTS STATE
    const [faults, setFaults] = useState<FaultState>({
        n2: false,
        sync: false,
        dp: false,
        angle: false
    });

    // TIMELINE PROGRESS CALCULATION
    const timelineHeight = step === 5 ? '100%' : `${((step - 1) / 4) * 100}%`;

    // --- LOGIC GATES ---

    const toggleFault = (key: keyof FaultState) => {
        setFaults(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const confirmStep = (stepId: number) => {
        // Gate Checks
        if (stepId === 1 && faults.n2) return; // Blocked
        if (stepId === 2 && faults.sync) return; // Blocked
        if (stepId === 3 && faults.dp) return; // Blocked
        if (stepId === 4 && faults.angle) return; // Blocked

        if (stepId === 4) {
            setStep(5); // Complete
        } else {
            setStep(stepId + 1);
        }
    };

    // Filling Simulation Effect
    useEffect(() => {
        if (isFilling) {
            const limit = faults.dp ? 11.0 : 14.5;
            const interval = setInterval(() => {
                setSimulatedPressure(prev => {
                    const next = prev + 0.2;
                    if (next >= limit) {
                        clearInterval(interval);
                        setIsFilling(false);
                        return limit;
                    }
                    return next;
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, [isFilling, faults.dp]);

    // RENDER HELPERS
    const getNodeClass = (nodeId: number) => {
        if (step > nodeId) return "border-green-500 bg-slate-900/80 opacity-100"; // Completed
        if (step === nodeId) return "border-cyan-500 bg-slate-900/90 shadow-[0_0_20px_rgba(14,165,233,0.1)] opacity-100 translate-x-1"; // Active
        return "border-slate-700 bg-slate-900/40 opacity-50"; // Future
    };

    const getCircleClass = (nodeId: number) => {
        if (step > nodeId) return "bg-green-500 border-green-500 shadow-[0_0_15px_#22c55e]";
        if (step === nodeId) return "bg-slate-900 border-cyan-500 shadow-[0_0_10px_#0ea5e9] scale-125";
        return "bg-slate-900 border-slate-700";
    };

    // --- UI COMPONENTS ---

    const NodeHeader = ({ id, nodeKey, icon: Icon }: { id: number, nodeKey: string, icon: any }) => (
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className={`text-lg font-bold mb-1 ${step >= id ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {t(`francis.missionControl.${nodeKey}.title`)}
                </h3>
                <p className="text-slate-400 text-xs">
                    {t(`francis.missionControl.${nodeKey}.desc`)}
                </p>
            </div>
            <Icon className={`w-8 h-8 ${step >= id ? 'text-cyan-500' : 'text-slate-700'}`} />
        </div>
    );

    const FaultToggle = ({ id, label, active }: { id: keyof FaultState, label: string, active: boolean }) => (
        <button
            onClick={() => toggleFault(id)}
            className={`text-[10px] px-2 py-1 rounded transition-all duration-200 border ${active
                ? 'bg-purple-900/80 border-purple-500 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
                }`}
        >
            {label}
        </button>
    );

    const ConfirmButton = ({ onClick, label, isComplete, isBlocked }: any) => {
        if (isComplete) return (
            <button disabled className="w-full py-2 bg-green-600 border border-green-500 text-white font-bold rounded text-sm uppercase tracking-wider cursor-default">
                {t('francis.missionControl.actions.conditionMet')}
            </button>
        );

        return (
            <button
                onClick={onClick}
                className={`w-full py-2 border rounded transition text-sm uppercase tracking-wider font-bold ${isBlocked
                    ? 'bg-red-900/20 border-red-500 text-red-500 animate-shake'
                    : 'bg-cyan-900/50 hover:bg-cyan-600 border-cyan-700 hover:border-cyan-400 text-cyan-100'
                    }`}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-[#020617] p-4 md:p-8 font-mono text-slate-300">
            <div className="max-w-4xl mx-auto">

                {/* HEADER */}
                <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-widest uppercase flex items-center gap-3">
                            <Activity className="text-cyan-400 w-8 h-8" />
                            <span>Francis <span className="text-cyan-400">{t('francis.missionControl.title')}</span></span>
                        </h1>
                        <p className="text-slate-500 font-mono text-sm mt-2 md:ml-11">
                            {t('francis.missionControl.subtitle')}
                        </p>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">{t('francis.missionControl.systemStatus')}</div>
                        <div className={`font-bold text-lg md:text-xl animate-pulse ${step === 5 ? 'text-green-500' : 'text-amber-500'}`}>
                            {step === 5 ? t('francis.missionControl.unitReady') : t('francis.missionControl.sequenceHold')}
                        </div>
                    </div>
                </header>

                {/* FAULT SIMULATION PANEL */}
                <div className="mb-12 p-4 bg-slate-900/50 rounded border border-slate-700/50">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{t('francis.missionControl.simTitle')}</span>
                        <span className="text-[10px] font-bold text-purple-400">DEV MODE</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <FaultToggle id="n2" label="[GATE 1] Sim Low N2 Pressure" active={faults.n2} />
                        <FaultToggle id="sync" label="[GATE 2] Sim Sync Error" active={faults.sync} />
                        <FaultToggle id="dp" label="[GATE 3] Sim High Delta-P" active={faults.dp} />
                        <FaultToggle id="angle" label="[GATE 4] Sim GUV Angle Err" active={faults.angle} />
                    </div>
                </div>

                <div className="relative pl-12 md:pl-16">
                    {/* TIMELINE LINE */}
                    <div className="absolute left-6 md:left-8 top-8 bottom-8 w-[3px] bg-slate-800 z-0 shadow-inner">
                        <div
                            className="absolute top-0 left-0 w-full bg-green-500 shadow-[0_0_10px_#22c55e] transition-all duration-700 ease-in-out"
                            style={{ height: timelineHeight }}
                        />
                    </div>

                    {/* NODE 1 */}
                    <div className={`relative mb-12 p-6 rounded-lg border backdrop-blur-sm transition-all duration-300 ${getNodeClass(1)}`}>
                        <div className={`absolute -left-[3.35rem] md:-left-[4.35rem] top-6 w-5 h-5 rounded-full border-[3px] transition-all z-10 ${getCircleClass(1)}`} />

                        <NodeHeader id={1} nodeKey="node1" icon={Zap} />

                        {/* DATA DISPLAY */}
                        <div className="bg-black/40 rounded p-3 mb-4 text-xs">
                            <div className="flex justify-between mb-1">
                                <span className="text-slate-500">Oil Pressure:</span>
                                <span className="text-white">14.2 MPa</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">N2 Pre-Charge:</span>
                                <span className={faults.n2 ? "text-red-500 animate-pulse font-bold" : "text-green-400"}>
                                    {faults.n2 ? "LOW (10.1 MPa)" : "NORMAL"}
                                </span>
                            </div>
                        </div>

                        {faults.n2 && (
                            <div className="text-red-500 text-xs font-bold mb-4 bg-red-900/20 p-2 rounded border border-red-500/50">
                                ⚠ BLOCKED: N2 PRESSURE CRITICAL
                            </div>
                        )}

                        <ConfirmButton
                            onClick={() => confirmStep(1)}
                            label={`${t('francis.missionControl.actions.confirm')} (12.5 - 16 MPa)`}
                            isComplete={step > 1}
                            isBlocked={faults.n2}
                        />
                    </div>

                    {/* NODE 2 */}
                    <div className={`relative mb-12 p-6 rounded-lg border backdrop-blur-sm transition-all duration-300 ${getNodeClass(2)}`}>
                        <div className={`absolute -left-[3.35rem] md:-left-[4.35rem] top-6 w-5 h-5 rounded-full border-[3px] transition-all z-10 ${getCircleClass(2)}`} />

                        <NodeHeader id={2} nodeKey="node2" icon={Lock} />

                        <div className="bg-black/40 rounded p-3 mb-4 text-xs">
                            <div className="flex justify-between mb-1">
                                <span className="text-slate-500">Vanes (1-20):</span>
                                <span className={faults.sync ? "text-red-500 animate-pulse font-bold" : "text-green-400"}>
                                    {faults.sync ? "ERROR [VANE 4]" : "0.0% [LOCKED]"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Squeeze Pressure:</span>
                                <span className="text-green-400">ACTIVE</span>
                            </div>
                        </div>

                        {faults.sync && (
                            <div className="text-red-500 text-xs font-bold mb-4 bg-red-900/20 p-2 rounded border border-red-500/50">
                                ⚠ BLOCKED: VANE 4 DEVIATION (+2.1mm)
                            </div>
                        )}

                        <ConfirmButton
                            onClick={() => confirmStep(2)}
                            label={t('francis.missionControl.actions.confirmZero')}
                            isComplete={step > 2}
                            isBlocked={faults.sync}
                        />
                    </div>

                    {/* NODE 3 */}
                    <div className={`relative mb-12 p-6 rounded-lg border backdrop-blur-sm transition-all duration-300 ${getNodeClass(3)}`}>
                        <div className={`absolute -left-[3.35rem] md:-left-[4.35rem] top-6 w-5 h-5 rounded-full border-[3px] transition-all z-10 ${getCircleClass(3)}`} />

                        <NodeHeader id={3} nodeKey="node3" icon={Scale} />

                        <div className="flex items-center gap-4 mb-4">
                            <div className="text-center">
                                <div className="text-[10px] text-slate-500">UPSTREAM</div>
                                <div className="text-lg font-bold text-white">14.5 Bar</div>
                            </div>
                            <div className="flex-1 h-2 bg-slate-800 rounded overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-300"
                                    style={{ width: `${(simulatedPressure / 14.5) * 100}%` }}
                                ></div>
                            </div>
                            <div className="text-center">
                                <div className="text-[10px] text-slate-500">SPIRAL</div>
                                <div className={`text-lg font-bold ${faults.dp && simulatedPressure >= 11 ? "text-red-500 animate-pulse" : simulatedPressure >= 14.5 ? "text-green-400" : "text-red-500"}`}>
                                    {simulatedPressure.toFixed(1)} Bar
                                </div>
                            </div>
                        </div>

                        {faults.dp && simulatedPressure >= 11 && (
                            <div className="text-red-500 text-xs font-bold mb-4 bg-red-900/20 p-2 rounded border border-red-500/50">
                                ⚠ BLOCKED: DELTA P {'>'} 3 BAR. GUV CLOSED.
                            </div>
                        )}

                        {step === 3 && !isFilling && simulatedPressure < 14.5 ? (
                            <button
                                onClick={() => setIsFilling(true)}
                                className="w-full py-2 bg-blue-900/50 hover:bg-blue-600 border border-blue-700 hover:border-blue-400 text-blue-100 font-bold rounded transition text-sm uppercase tracking-wider"
                            >
                                {t('francis.missionControl.actions.startFilling')}
                            </button>
                        ) : (
                            <ConfirmButton
                                onClick={() => confirmStep(3)}
                                label={t('francis.missionControl.actions.fillingComplete')}
                                isComplete={step > 3}
                                isBlocked={faults.dp || simulatedPressure < 14.5}
                            />
                        )}
                    </div>

                    {/* NODE 4 */}
                    <div className={`relative mb-12 p-6 rounded-lg border backdrop-blur-sm transition-all duration-300 ${getNodeClass(4)}`}>
                        <div className={`absolute -left-[3.35rem] md:-left-[4.35rem] top-6 w-5 h-5 rounded-full border-[3px] transition-all z-10 ${getCircleClass(4)}`} />

                        <NodeHeader id={4} nodeKey="node4" icon={DoorOpen} />

                        <div className="bg-black/40 rounded p-3 mb-4 text-xs">
                            <div className="flex justify-between mb-1">
                                <span className="text-slate-500">Interlock:</span>
                                <span className="text-green-400">RELEASED</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Target Angle:</span>
                                <span className={faults.angle ? "text-red-500 animate-pulse font-bold" : "text-white"}>
                                    {faults.angle ? "45.0° [STUCK]" : "80.0°"}
                                </span>
                            </div>
                        </div>

                        {faults.angle && (
                            <div className="text-red-500 text-xs font-bold mb-4 bg-red-900/20 p-2 rounded border border-red-500/50">
                                ⚠ BLOCKED: VALVE STUCK @ 45°. EROSION RISK.
                            </div>
                        )}

                        <ConfirmButton
                            onClick={() => confirmStep(4)}
                            label={t('francis.missionControl.actions.openMiv')}
                            isComplete={step > 4}
                            isBlocked={faults.angle}
                        />
                    </div>

                </div>

                {/* ESD PANEL */}
                <div className="border-[2px] border-red-500 bg-gradient-to-br from-red-950/90 to-red-900/20 rounded-lg p-6 relative overflow-hidden animate-[pulse_3s_infinite]">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <AlertTriangle className="w-24 h-24 text-red-500" />
                    </div>

                    <h3 className="text-xl font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ShieldAlert />
                        <span>{t('francis.missionControl.esdTitle')}</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e]"></div>
                            <span className="text-red-200">Gravity Weights: ARMED</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e]"></div>
                            <span className="text-red-200">Hydraulic Integrity: OK</span>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="text-center mt-12">
                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition"
                    >
                        ← {t('francis.missionControl.returnBtn')}
                    </button>
                </div>
            </div>
        </div>
    );
};
