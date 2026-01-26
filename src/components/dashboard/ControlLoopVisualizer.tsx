import React from 'react';
import { Settings, TrendingUp } from 'lucide-react';

interface ControlLoopVisualizerProps {
    controlType: 'GOVERNOR' | 'BLADE' | 'NEEDLE';
    pidData: {
        setpoint: number;
        processVariable: number;
        error: number;
        kp: number;
        ki: number;
        kd: number;
        output: number;
        responseTime: number; // ms
    };
}

export const ControlLoopVisualizer: React.FC<ControlLoopVisualizerProps> = ({ controlType, pidData }) => {
    const errorPct = (pidData.error / pidData.setpoint) * 100;
    const outputPct = (pidData.output / 100) * 100; // Assume 0-100 output range

    return (
        <div className="w-full bg-slate-900 border border-slate-700 rounded-lg p-6">
            <div className="text-lg font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                {controlType} Control Loop - PID Tuning
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Left: PID Parameters */}
                <div className="space-y-4">
                    <div className="bg-slate-800 rounded p-4">
                        <div className="text-xs text-slate-400 mb-3">PID Gains</div>
                        <div className="space-y-3">
                            <PIDParameter label="Kp (Proportional)" value={pidData.kp} />
                            <PIDParameter label="Ki (Integral)" value={pidData.ki} />
                            <PIDParameter label="Kd (Derivative)" value={pidData.kd} />
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded p-4">
                        <div className="text-xs text-slate-400 mb-3">Control Values</div>
                        <div className="grid grid-cols-2 gap-3">
                            <ValueDisplay label="Setpoint" value={pidData.setpoint.toFixed(2)} unit="°" color="blue" />
                            <ValueDisplay label="Process Var" value={pidData.processVariable.toFixed(2)} unit="°" color="emerald" />
                            <ValueDisplay label="Error" value={pidData.error.toFixed(3)} unit="°" color={Math.abs(errorPct) > 5 ? 'red' : 'amber'} />
                            <ValueDisplay label="Output" value={pidData.output.toFixed(1)} unit="%" color="purple" />
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded p-4">
                        <div className="text-xs text-slate-400 mb-2">Performance</div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-mono text-emerald-300">
                                Response: {pidData.responseTime}ms
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Visual Feedback */}
                <div className="space-y-4">
                    {/* Error Visualization */}
                    <div className="bg-slate-800 rounded p-4">
                        <div className="text-xs text-slate-400 mb-3">Error Delta</div>
                        <div className="relative h-32 bg-slate-700 rounded overflow-hidden">
                            {/* Center line (zero error) */}
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-500" />

                            {/* Error bar */}
                            <div
                                className={`absolute top-1/2 left-1/2 w-2 bg-${Math.abs(errorPct) > 5 ? 'red' : 'amber'}-500 transform -translate-x-1/2`}
                                style={{
                                    height: `${Math.abs(errorPct) * 2}px`,
                                    transform: `translate(-50%, ${errorPct > 0 ? '-100%' : '0'})`
                                }}
                            />

                            {/* Error value label */}
                            <div className="absolute bottom-2 left-2 text-xs font-mono text-slate-400">
                                {pidData.error > 0 ? '+' : ''}{errorPct.toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    {/* Output Visualization */}
                    <div className="bg-slate-800 rounded p-4">
                        <div className="text-xs text-slate-400 mb-3">Control Output</div>
                        <div className="relative h-8 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-purple-500 transition-all"
                                style={{ width: `${outputPct}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-white">
                                {pidData.output.toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    {/* Response Time Gauge */}
                    <div className="bg-slate-800 rounded p-4">
                        <div className="text-xs text-slate-400 mb-3">Response Time</div>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-${pidData.responseTime < 50 ? 'emerald' : pidData.responseTime < 100 ? 'amber' : 'red'}-500 transition-all`}
                                    style={{ width: `${Math.min(100, (pidData.responseTime / 100) * 100)}%` }}
                                />
                            </div>
                            <div className="text-sm font-mono font-bold text-emerald-400">
                                {pidData.responseTime}ms
                            </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            Target: &lt;50ms
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// PID Parameter Component
const PIDParameter: React.FC<{ label: string; value: number }> = ({ label, value }) => {
    return (
        <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">{label}</div>
            <div className="text-sm font-mono font-bold text-purple-300">{value.toFixed(4)}</div>
        </div>
    );
};

// Value Display Component
const ValueDisplay: React.FC<{ label: string; value: string; unit: string; color: string }> = ({ label, value, unit, color }) => {
    return (
        <div className="bg-slate-700 rounded p-2">
            <div className="text-[10px] text-slate-400 mb-1">{label}</div>
            <div className={`text-lg font-mono font-bold text-${color}-400`}>
                {value}<span className="text-xs ml-1">{unit}</span>
            </div>
        </div>
    );
};
