import React, { useState } from 'react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { useToast } from '../../contexts/ToastContext';
import { AlertTriangle, Power, RotateCcw, CheckCircle } from 'lucide-react';
import guardedAction from '../../utils/guardedAction';

interface SafeStateHMIProps {
    assetId: string;
    currentStatus: {
        running: boolean;
        load: number;
        criticalAlarms: string[];
    };
    onStop: () => void;
    onStart: () => void;
    onReset: () => void;
}

export const SafeStateHMI: React.FC<SafeStateHMIProps> = ({
    assetId,
    currentStatus,
    onStop,
    onStart,
    onReset
}) => {
    const [confirmStop, setConfirmStop] = useState(false);
    const { showToast } = useToast();

    return (
        <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
            <div className="w-full max-w-4xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 bg-red-950 border-2 border-red-500 rounded-lg">
                        <AlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
                        <div>
                            <div className="text-2xl font-bold text-red-300">SAFE STATE MODE</div>
                            <div className="text-sm text-red-400">Simplified Emergency HMI</div>
                        </div>
                    </div>

                    <div className="text-4xl font-bold text-white mb-2">{assetId}</div>
                    <div className={`text-2xl font-mono ${currentStatus.running ? 'text-emerald-400' : 'text-slate-500'}`}>
                        STATUS: {currentStatus.running ? 'RUNNING' : 'STOPPED'}
                    </div>
                </div>

                {/* Critical Alarms */}
                {currentStatus.criticalAlarms.length > 0 && (
                    <div className="mb-8 p-4 bg-red-950 border-2 border-red-500 rounded-lg">
                        <div className="text-lg font-bold text-red-300 mb-2">⚠️ CRITICAL ALARMS</div>
                        <div className="space-y-1">
                            {currentStatus.criticalAlarms.map((alarm, i) => (
                                <div key={i} className="text-red-400 font-mono text-sm">
                                    • {alarm}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Controls */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    {/* STOP */}
                    <button
                        onClick={() => {
                            if (!confirmStop) {
                                setConfirmStop(true);
                                setTimeout(() => setConfirmStop(false), 3000);
                            } else {
                                const ok = guardedAction('Emergency Stop', () => { onStop(); setConfirmStop(false); });
                                if (!ok) { try { showToast('Emergency stop blocked: LOTO active','warning'); } catch (e) {} setConfirmStop(false); }
                            }
                        }}
                        disabled={!currentStatus.running}
                        className={`h-64 rounded-lg border-4 font-bold text-2xl transition-all ${!currentStatus.running
                                ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed'
                                : confirmStop
                                    ? 'bg-red-700 border-red-500 text-white animate-pulse'
                                    : 'bg-red-950 border-red-500 text-red-300 hover:bg-red-900 active:scale-95'
                            }`}
                    >
                        <div className="flex flex-col items-center gap-4">
                            <Power className="w-24 h-24" />
                            <div>{confirmStop ? 'CONFIRM STOP' : 'EMERGENCY STOP'}</div>
                            {confirmStop && (
                                <div className="text-sm">Click again to confirm</div>
                            )}
                        </div>
                    </button>

                    {/* STATUS */}
                    <div className="h-64 rounded-lg border-4 border-blue-500 bg-blue-950 flex items-center justify-center">
                        <div className="text-center">
                            <CheckCircle className="w-24 h-24 text-blue-300 mx-auto mb-4" />
                            <div className="text-2xl font-bold text-blue-300 mb-2">STATUS</div>
                            <div className="space-y-2 text-left px-4">
                                <div className="flex justify-between gap-4 text-sm">
                                    <span className="text-slate-400">Mode:</span>
                                    <span className="text-blue-300 font-mono">SAFE STATE</span>
                                </div>
                                <div className="flex justify-between gap-4 text-sm">
                                    <span className="text-slate-400">Load:</span>
                                    <span className="text-blue-300 font-mono">{currentStatus.load} MW</span>
                                </div>
                                <div className="flex justify-between gap-4 text-sm">
                                    <span className="text-slate-400">Alarms:</span>
                                    <span className={`font-mono ${currentStatus.criticalAlarms.length > 0 ? 'text-red-400' : 'text-emerald-400'
                                        }`}>
                                        {currentStatus.criticalAlarms.length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* START */}
                    <button
                        onClick={() => { const ok = guardedAction('Start Equipment', () => onStart()); if (!ok) { try { showToast('Start blocked: LOTO active','warning'); } catch (e) {} return; } }}
                        disabled={currentStatus.running || currentStatus.criticalAlarms.length > 0}
                        className={`h-64 rounded-lg border-4 font-bold text-2xl transition-all ${currentStatus.running || currentStatus.criticalAlarms.length > 0
                                ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed'
                                : 'bg-emerald-950 border-emerald-500 text-emerald-300 hover:bg-emerald-900 active:scale-95'
                            }`}
                    >
                        <div className="flex flex-col items-center gap-4">
                            <Power className="w-24 h-24" />
                            <div>START</div>
                            {currentStatus.criticalAlarms.length > 0 && (
                                <div className="text-sm text-red-400">Clear alarms first</div>
                            )}
                        </div>
                    </button>
                </div>

                {/* Reset Alarms */}
                <div className="text-center">
                    <button
                        onClick={() => { const ok = guardedAction('Reset Alarms', () => onReset()); if (!ok) { try { showToast('Reset blocked: LOTO active','warning'); } catch (e) {} return; } }}
                        className="px-8 py-4 bg-amber-950 border-2 border-amber-500 rounded-lg text-amber-300 font-bold text-lg hover:bg-amber-900 transition-all active:scale-95"
                    >
                        <div className="flex items-center gap-3">
                            <RotateCcw className="w-6 h-6" />
                            <div>RESET ALARMS & RETURN TO NORMAL HMI</div>
                        </div>
                    </button>
                </div>

                {/* Instructions */}
                <div className="mt-8 p-4 bg-slate-900 border border-slate-700 rounded-lg">
                    <div className="text-xs text-slate-400 space-y-1">
                        <div>• This simplified interface is for EMERGENCY USE ONLY</div>
                        <div>• STOP: Immediate emergency shutdown (confirm required)</div>
                        <div>• START: Only available when all critical alarms cleared</div>
                        <div>• RESET: Clear alarms and return to full SCADA interface</div>
                        <div>• For detailed diagnostics, return to Normal HMI mode</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
