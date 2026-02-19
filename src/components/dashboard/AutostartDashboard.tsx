import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, RefreshCw, Activity, Gauge, Wind, Droplets, CheckCircle, AlertTriangle } from 'lucide-react';
import { SovereignStartSequence, SequenceStatus } from '../../services/SovereignStartSequence';
import { HPUStatus } from '../../services/HPUManager';
import { AirSystemStatus } from '../../services/PneumaticSystemManager';
import { SumpStatus } from '../../services/DewateringSovereign';

const AutostartDashboard: React.FC = () => {
    // --- 1. System State (Simulated Hardware) ---
    const [hpu, setHpu] = useState<HPUStatus>({
        pressureBar: 0,
        mainPumpStatus: 'OFF',
        standbyPumpStatus: 'OFF',
        oilLevelPct: 85,
        oilTempC: 45,
        nitrogenPreChargeBar: 90,
        availableEnergyJoules: 0,
        availableFullStrokes: 0,
        pumpDutyCycle: 0
    });

    const [air, setAir] = useState<AirSystemStatus>({
        systemPressureBar: 5.5, // Low initially
        compressorStatus: 'OFF',
        brakeReady: false
    });

    const [sump, setSump] = useState<SumpStatus>({
        sumpId: 'SUMP-01',
        levelPct: 40,
        volumeM3: 20,
        inflowRateLps: 5,
        pumpStatus: { pump1: 'OFF', pump2: 'OFF' },
        alarmStatus: 'NORMAL'
    });

    const [coolingFlow, setCoolingFlow] = useState(0);
    const [sequence, setSequence] = useState<SequenceStatus | null>(null);
    const [lastTick, setLastTick] = useState(Date.now());

    // --- 2. Physics Simulation Loop (10Hz) ---
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const dt = (now - lastTick) / 1000;
            setLastTick(now);

            // A. Update Physics based on Commands (inferred from State)
            const currentState = sequence?.state || 'IDLE';

            // HPU Physics
            let targetPressure = 0;
            if (currentState === 'START_AUX_HPU' || currentState === 'START_AUX_COOLING' || currentState === 'PREPARE_GOVERNOR' || currentState === 'RELEASE_BRAKES' || currentState === 'COMPLETED') {
                targetPressure = 160; // Rated
            }
            // Simple lag filter for pressure rise
            setHpu(prev => ({
                ...prev,
                pressureBar: prev.pressureBar + (targetPressure - prev.pressureBar) * 0.05,
                mainPumpStatus: targetPressure > prev.pressureBar ? 'RUNNING' : 'OFF',
                availableEnergyJoules: prev.pressureBar * 1000 // Simplified
            }));

            // Air Physics
            // Compressor starts if pressure low, but let's say Sequence requests it implicitly?
            // Realistically, Air is always managed by its own PLC. We'll simulate it rising if "Power On".
            setAir(prev => ({
                ...prev,
                systemPressureBar: Math.min(7.5, prev.systemPressureBar + 0.02), // Slow rise
                brakeReady: prev.systemPressureBar > 6.0
            }));

            // Cooling Physics
            let targetFlow = 0;
            if (['START_AUX_COOLING', 'PREPARE_GOVERNOR', 'RELEASE_BRAKES', 'COMPLETED'].includes(currentState)) {
                targetFlow = 65;
            }
            setCoolingFlow(prev => prev + (targetFlow - prev) * 0.1);

            // B. Run Sequence Logic
            const nextSeq = SovereignStartSequence.tick(
                hpu,
                air,
                sump,
                coolingFlow,
                false // No Lockout
            );
            setSequence(nextSeq);

        }, 100);

        return () => clearInterval(interval);
    }, [lastTick, hpu.pressureBar, air.systemPressureBar, coolingFlow, sequence?.state]);

    // --- 3. Interaction Handlers ---
    const handleStart = () => {
        SovereignStartSequence.initiateStart();
    };

    const handleAbort = () => {
        SovereignStartSequence.abortSequence('Operator Manual Abort');
    };

    const handleReset = () => {
        SovereignStartSequence.reset();
        // Reset physics for demo
        setHpu(prev => ({ ...prev, pressureBar: 0 }));
        setCoolingFlow(0);
    };

    // --- 4. Render Helpers ---
    const getStatusColor = (state: string) => {
        if (state === 'COMPLETED') return 'text-emerald-400';
        if (state === 'ABORTED') return 'text-red-500';
        if (state === 'IDLE') return 'text-slate-400';
        return 'text-blue-400 animate-pulse';
    };

    const PermissiveItem = ({ label, ok }: { label: string, ok: boolean }) => (
        <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800 last:border-0">
            <span className="text-slate-400 font-mono">{label}</span>
            {ok ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Square className="w-3 h-3 text-slate-700" />}
        </div>
    );

    return (
        <div className="w-full bg-slate-950 p-6 rounded-lg border border-slate-800 text-slate-200 font-sans">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Activity className="text-blue-500" />
                        Sovereign Start Sequence
                    </h2>
                    <div className="text-sm text-slate-500 font-mono mt-1">
                        AUTO-START ENGINE v1.0 • HPU / PNEUMATIC / COOLING
                    </div>
                </div>

                <div className="flex gap-2">
                    {sequence?.state === 'IDLE' || sequence?.state === 'ABORTED' || sequence?.state === 'COMPLETED' ? (
                        <button
                            onClick={handleStart}
                            disabled={sequence?.state === 'COMPLETED'}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Play className="w-4 h-4" /> INITIATE START
                        </button>
                    ) : (
                        <button
                            onClick={handleAbort}
                            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded font-bold flex items-center gap-2 animate-pulse"
                        >
                            <Square className="w-4 h-4" /> ABORT SEQUENCE
                        </button>
                    )}

                    {(sequence?.state === 'ABORTED' || sequence?.state === 'COMPLETED') && (
                        <button
                            onClick={handleReset}
                            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" /> RESET
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT: Sequence Status */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Status Display */}
                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-8 text-center relative overflow-hidden">
                        <div className={`text-4xl font-black tracking-widest ${getStatusColor(sequence?.state || 'IDLE')}`}>
                            {sequence?.state.replace(/_/g, ' ')}
                        </div>
                        <div className="text-slate-400 mt-2 font-mono h-6">
                            {sequence?.message}
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-8 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-300 ease-out"
                                style={{ width: `${sequence?.stepProgress}%` }}
                            />
                        </div>
                    </div>

                    {/* Subsystem Telemetry Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* HPU Card */}
                        <div className="bg-slate-900 border border-slate-700 p-4 rounded">
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <Gauge className="w-4 h-4" /> HPU
                            </div>
                            <div className="text-2xl font-mono text-white">
                                {hpu.pressureBar.toFixed(1)} <span className="text-xs text-slate-500">bar</span>
                            </div>
                            <div className={`text-xs mt-1 ${hpu.mainPumpStatus === 'RUNNING' ? 'text-emerald-400' : 'text-slate-600'}`}>
                                PUMP 1: {hpu.mainPumpStatus}
                            </div>
                        </div>

                        {/* AIR Card */}
                        <div className="bg-slate-900 border border-slate-700 p-4 rounded">
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <Wind className="w-4 h-4" /> PNEUMATIC
                            </div>
                            <div className="text-2xl font-mono text-white">
                                {air.systemPressureBar.toFixed(1)} <span className="text-xs text-slate-500">bar</span>
                            </div>
                            <div className={`text-xs mt-1 ${air.brakeReady ? 'text-emerald-400' : 'text-amber-500'}`}>
                                BRAKES: {air.brakeReady ? 'READY' : 'LOW P'}
                            </div>
                        </div>

                        {/* COOLING Card */}
                        <div className="bg-slate-900 border border-slate-700 p-4 rounded">
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <Droplets className="w-4 h-4" /> COOLING
                            </div>
                            <div className="text-2xl font-mono text-white">
                                {coolingFlow.toFixed(1)} <span className="text-xs text-slate-500">L/s</span>
                            </div>
                            <div className={`text-xs mt-1 ${coolingFlow > 40 ? 'text-emerald-400' : 'text-slate-600'}`}>
                                FLOW: {coolingFlow > 40 ? 'NORMAL' : 'LOW'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Permissive Checklist */}
                <div className="bg-slate-900 border border-slate-800 rounded p-4">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center justify-between">
                        Start Permissives
                        {sequence?.permissives.readyToStart ?
                            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px]">ALL CLEAR</span> :
                            <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-[10px]">INHIBITED</span>
                        }
                    </h3>

                    <div className="space-y-1">
                        {sequence?.permissives.permissives && Object.entries(sequence.permissives.permissives).map(([key, val]) => (
                            <PermissiveItem key={key} label={key.replace(/_/g, ' ')} ok={val} />
                        ))}
                    </div>

                    {sequence?.abortReason && (
                        <div className="mt-6 bg-red-900/20 border border-red-500/50 p-3 rounded">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-xs text-red-400 font-bold uppercase">Last Abort Reason</div>
                                    <div className="text-xs text-red-300 mt-1">{sequence.abortReason}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AutostartDashboard;
