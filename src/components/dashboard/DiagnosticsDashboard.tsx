import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Zap, AlertTriangle, CheckCircle, XCircle, Filter } from 'lucide-react';
import { ActuatorDiagnosticCore, ActuatorState } from '../../services/ActuatorDiagnosticCore';
import { AlarmStormFilter, AlarmDefinition } from '../../services/AlarmStormFilter';

const DiagnosticsDashboard: React.FC = () => {
    // --- 1. State ---
    const [actuatorHistory, setActuatorHistory] = useState<{ cmd: number; pos: number; time: number }[]>([]);
    const [actuatorStatus, setActuatorStatus] = useState<ActuatorState | null>(null);
    const [visibleAlarms, setVisibleAlarms] = useState<AlarmDefinition[]>([]);
    const [suppressedCount, setSuppressedCount] = useState(0);

    // Simulation Controls
    const [simStiction, setSimStiction] = useState(false);
    const [simPumpTrip, setSimPumpTrip] = useState(false);

    // --- 2. Simulation Loop (10Hz) ---
    useEffect(() => {
        // Register Dependencies ONCE
        AlarmStormFilter.registerDependency('LOW_PRESSURE', 'PUMP_TRIP');
        AlarmStormFilter.registerDependency('CAVITATION_WARNING', 'LOW_PRESSURE');

        let cmd = 50;
        let pos = 50;
        let direction = 1;

        const interval = setInterval(() => {
            // A. Simulate Actuator Physics
            // Sweep command 30-70%
            if (cmd > 70) direction = -1;
            if (cmd < 30) direction = 1;
            cmd += direction * 0.5;

            // Physics: Follow command
            if (simStiction) {
                // If stuck, don't move until error is large
                const error = cmd - pos;
                if (Math.abs(error) > 5.0) {
                    // Slip! Jump to target
                    pos += error * 0.5;
                } else {
                    // Stuck
                }
            } else {
                // Nominal
                pos += (cmd - pos) * 0.2;
            }

            // B. Run Diagnostics
            const diag = ActuatorDiagnosticCore.analyze(cmd, pos);
            setActuatorStatus(diag);
            setActuatorHistory([...ActuatorDiagnosticCore.getHistory()]);

            // C. Simulate Alarms
            // Parent: Pump Trip
            AlarmStormFilter.updateAlarm('PUMP_TRIP', simPumpTrip);

            // Child: Low Pressure (Always true if pump tripped, effectively)
            // But let's say Low Pressure happens because Pump Tripped
            if (simPumpTrip) {
                AlarmStormFilter.updateAlarm('LOW_PRESSURE', true);
                // Grandchild
                AlarmStormFilter.updateAlarm('CAVITATION_WARNING', true);
            } else {
                AlarmStormFilter.updateAlarm('LOW_PRESSURE', false);
                AlarmStormFilter.updateAlarm('CAVITATION_WARNING', false);
            }

            // D. Get Alarm State
            setVisibleAlarms(AlarmStormFilter.getVisibleAlarms());
            setSuppressedCount(AlarmStormFilter.getSuppressedCount());

        }, 100);

        return () => clearInterval(interval);
    }, [simStiction, simPumpTrip]);

    // --- 3. Interaction Handlers ---
    const toggleStiction = () => setSimStiction(!simStiction);
    const togglePumpTrip = () => setSimPumpTrip(!simPumpTrip);

    return (
        <div className="w-full bg-slate-950 p-6 rounded-lg border border-slate-800 text-slate-200 font-sans">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Activity className="text-purple-500" />
                        Intelligent Diagnostics
                    </h2>
                    <div className="text-sm text-slate-500 font-mono mt-1">
                        ACTUATOR FORENSICS • ALARM RATIONALIZATION
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* LEFT: Actuator Health */}
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="flex items-center gap-2 font-bold text-slate-300">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            Guide Vane Servo
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${actuatorStatus?.status === 'HEALTHY' ? 'bg-emerald-900 text-emerald-400' : 'bg-red-900 text-red-400'}`}>
                                {actuatorStatus?.status}
                            </span>
                            <button
                                onClick={toggleStiction}
                                className={`text-xs px-2 py-1 rounded border ${simStiction ? 'bg-red-500 text-white border-red-500' : 'border-slate-600 text-slate-400 hover:border-slate-500'}`}
                            >
                                {simStiction ? 'SIMULATING STICTION' : 'SIMULATE FAULT'}
                            </button>
                        </div>
                    </div>

                    {/* Simple Visualization of Cmd vs Pos */}
                    <div className="h-48 bg-slate-950 rounded border border-slate-800 relative overflow-hidden flex items-end">
                        {actuatorHistory.map((pt, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end h-full gap-0.5" style={{ width: `${100 / 50}%` }}>
                                {/* Command (Blue Dot) */}
                                <div className="bg-blue-500 w-full rounded-full absolute"
                                    style={{ bottom: `${pt.cmd}%`, height: '4px', opacity: 0.5 }} />
                                {/* Position (Green or Red Dot) */}
                                <div className={`w-full rounded-full absolute transition-colors ${simStiction ? 'bg-red-500' : 'bg-emerald-400'}`}
                                    style={{ bottom: `${pt.pos}%`, height: '4px' }} />
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                        <div className="bg-slate-800 rounded p-2">
                            <div className="text-xs text-slate-500 uppercase">Stiction Index</div>
                            <div className="text-xl font-mono text-white">{actuatorStatus?.stictionIndex.toFixed(0)}</div>
                        </div>
                        <div className="bg-slate-800 rounded p-2">
                            <div className="text-xs text-slate-500 uppercase">Deadband</div>
                            <div className="text-xl font-mono text-white">{actuatorStatus?.deadbandPct.toFixed(1)}%</div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Alarm Rationalization */}
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="flex items-center gap-2 font-bold text-slate-300">
                            <Filter className="w-4 h-4 text-blue-500" />
                            Alarm Storm Filter
                        </h3>
                        <button
                            onClick={togglePumpTrip}
                            className={`text-xs px-2 py-1 rounded border ${simPumpTrip ? 'bg-red-500 text-white border-red-500' : 'border-slate-600 text-slate-400 hover:border-slate-500'}`}
                        >
                            {simPumpTrip ? 'TRIP PUMP' : 'TRIP PUMP'}
                        </button>
                    </div>

                    <div className="bg-slate-950 rounded border border-slate-800 p-4 min-h-[12rem]">
                        {visibleAlarms.length === 0 && (
                            <div className="text-center text-slate-600 py-10 flex flex-col items-center">
                                <CheckCircle className="w-8 h-8 mb-2 opacity-50" />
                                No Active Alarms
                            </div>
                        )}

                        <div className="space-y-2">
                            {visibleAlarms.map(alarm => (
                                <div key={alarm.id} className="bg-red-900/20 border border-red-500 text-red-200 px-3 py-2 rounded flex justify-between items-center animate-pulse">
                                    <span className="font-bold flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> {alarm.description}
                                    </span>
                                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">ACTIVE</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-slate-500 text-sm">
                        <ShieldAlert className="w-4 h-4" />
                        Suppressed Alarms: <span className="text-white font-bold">{suppressedCount}</span>
                        {suppressedCount > 0 && <span className="text-xs text-slate-600">(Parent Active)</span>}
                    </div>

                </div>

            </div>
        </div>
    );
};

export default DiagnosticsDashboard;
