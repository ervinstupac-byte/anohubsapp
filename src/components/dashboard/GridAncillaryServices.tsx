import React from 'react';
import { TrendingUp, Activity, Radio } from 'lucide-react';

interface GridAncillaryServicesProps {
    gridData: {
        frequency: number; // Hz
        nominalFrequency: number; // Hz (usually 50)
        frequencyDeviation: number; // Hz
        droopSetting: number; // % (typically 4-6%)
        regulationContribution: number; // MW
        fcr: {
            enabled: boolean;
            capacity: number; // MW
            activation: number; // % (0-100)
        };
        afrr: {
            enabled: boolean;
            capacity: number; // MW
            setpoint: number; // MW
            actual: number; // MW
        };
    };
}

export const GridAncillaryServices: React.FC<GridAncillaryServicesProps> = ({ gridData }) => {
    // Calculate droop response
    // Droop equation: ΔP = (Pmax / (droop% × f_nom)) × Δf
    const droopResponse = calculateDroopResponse(
        gridData.frequencyDeviation,
        gridData.droopSetting,
        gridData.nominalFrequency,
        gridData.fcr.capacity
    );

    const frequencyStatus = getFrequencyStatus(gridData.frequency, gridData.nominalFrequency);

    return (
        <div className="w-full bg-slate-950 p-6">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Radio className="w-6 h-6 text-green-400" />
                Grid Ancillary Services (FCR / aFRR)
            </div>

            {/* Grid Frequency Status */}
            <div className={`mb-6 p-4 rounded-lg border-2 ${frequencyStatus.status === 'NORMAL' ? 'bg-emerald-950 border-emerald-500' :
                    frequencyStatus.status === 'WARNING' ? 'bg-amber-950 border-amber-500' :
                        'bg-red-950 border-red-500'
                }`}>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <div className="text-xs text-slate-400 mb-1">Grid Frequency</div>
                        <div className={`text-4xl font-bold font-mono ${frequencyStatus.status === 'NORMAL' ? 'text-emerald-300' :
                                frequencyStatus.status === 'WARNING' ? 'text-amber-300' : 'text-red-300'
                            }`}>
                            {gridData.frequency.toFixed(3)}
                        </div>
                        <div className="text-xs text-slate-500">Hz</div>
                    </div>

                    <div>
                        <div className="text-xs text-slate-400 mb-1">Deviation (Δf)</div>
                        <div className={`text-4xl font-bold font-mono ${Math.abs(gridData.frequencyDeviation) < 0.05 ? 'text-emerald-300' : 'text-amber-300'
                            }`}>
                            {gridData.frequencyDeviation > 0 ? '+' : ''}{gridData.frequencyDeviation.toFixed(3)}
                        </div>
                        <div className="text-xs text-slate-500">Hz</div>
                    </div>

                    <div>
                        <div className="text-xs text-slate-400 mb-1">Status</div>
                        <div className={`text-2xl font-bold ${frequencyStatus.status === 'NORMAL' ? 'text-emerald-300' :
                                frequencyStatus.status === 'WARNING' ? 'text-amber-300' : 'text-red-300'
                            }`}>
                            {frequencyStatus.message}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* FCR (Frequency Containment Reserve) */}
                <div className={`bg-slate-900 border-2 rounded-lg p-4 ${gridData.fcr.enabled ? 'border-blue-500' : 'border-slate-700'
                    }`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-400" />
                            <div className="text-lg font-bold text-blue-300">FCR (Primary Reserve)</div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${gridData.fcr.enabled ? 'bg-blue-950 text-blue-300' : 'bg-slate-800 text-slate-400'
                            }`}>
                            {gridData.fcr.enabled ? 'ACTIVE' : 'INACTIVE'}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Capacity</div>
                            <div className="text-2xl font-bold text-blue-300 font-mono">
                                {gridData.fcr.capacity.toFixed(0)}
                            </div>
                            <div className="text-xs text-slate-500">MW</div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Activation</div>
                            <div className="text-2xl font-bold text-emerald-300 font-mono">
                                {gridData.fcr.activation.toFixed(0)}
                            </div>
                            <div className="text-xs text-slate-500">%</div>
                        </div>
                    </div>

                    {/* Droop Response Calculation */}
                    <div className="bg-slate-800 border border-blue-500/30 rounded p-3">
                        <div className="text-xs font-bold text-blue-300 mb-2">Droop Response</div>
                        <div className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Droop Setting:</span>
                                <span className="text-blue-300">{gridData.droopSetting.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Expected ΔP:</span>
                                <span className="text-emerald-300">{droopResponse.toFixed(2)} MW</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Response Time:</span>
                                <span className="text-amber-300">&lt;2s</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* aFRR (automatic Frequency Restoration Reserve) */}
                <div className={`bg-slate-900 border-2 rounded-lg p-4 ${gridData.afrr.enabled ? 'border-purple-500' : 'border-slate-700'
                    }`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                            <div className="text-lg font-bold text-purple-300">aFRR (Secondary Reserve)</div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${gridData.afrr.enabled ? 'bg-purple-950 text-purple-300' : 'bg-slate-800 text-slate-400'
                            }`}>
                            {gridData.afrr.enabled ? 'ACTIVE' : 'INACTIVE'}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Capacity</div>
                            <div className="text-2xl font-bold text-purple-300 font-mono">
                                {gridData.afrr.capacity.toFixed(0)}
                            </div>
                            <div className="text-xs text-slate-500">MW</div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Setpoint</div>
                            <div className="text-2xl font-bold text-blue-300 font-mono">
                                {gridData.afrr.setpoint.toFixed(1)}
                            </div>
                            <div className="text-xs text-slate-500">MW</div>
                        </div>
                    </div>

                    {/* Regulation Tracking */}
                    <div className="bg-slate-800 border border-purple-500/30 rounded p-3">
                        <div className="text-xs font-bold text-purple-300 mb-2">Regulation Tracking</div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">Actual Output:</span>
                                <span className="text-emerald-300 font-mono">{gridData.afrr.actual.toFixed(2)} MW</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">Error:</span>
                                <span className="text-amber-300 font-mono">
                                    {(gridData.afrr.setpoint - gridData.afrr.actual).toFixed(2)} MW
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">Response Time:</span>
                                <span className="text-blue-300 font-mono">&lt;30s</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Regulation Contribution */}
            <div className="mt-6 bg-gradient-to-r from-blue-950 to-purple-950 border border-blue-500 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-slate-300 mb-1">Total Regulation Contribution</div>
                        <div className="text-4xl font-bold text-emerald-300 font-mono">
                            {gridData.regulationContribution.toFixed(2)} MW
                        </div>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                        <div>FCR: {(droopResponse).toFixed(2)} MW</div>
                        <div>aFRR: {(gridData.afrr.actual).toFixed(2)} MW</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper function to calculate droop response
function calculateDroopResponse(
    frequencyDeviation: number,
    droopPercent: number,
    nominalFrequency: number,
    maxCapacity: number
): number {
    // Droop equation: ΔP = (Pmax / (droop% × f_nom)) × Δf
    const droopRatio = droopPercent / 100;
    const powerChange = (maxCapacity / (droopRatio * nominalFrequency)) * Math.abs(frequencyDeviation);

    // Sign: frequency low → increase power, frequency high → decrease power
    return frequencyDeviation < 0 ? powerChange : -powerChange;
}

// Helper function to determine frequency status
function getFrequencyStatus(frequency: number, nominal: number): {
    status: 'NORMAL' | 'WARNING' | 'CRITICAL';
    message: string;
} {
    const deviation = Math.abs(frequency - nominal);

    if (deviation < 0.05) {
        return { status: 'NORMAL', message: '✓ NORMAL' };
    } else if (deviation < 0.2) {
        return { status: 'WARNING', message: '⚠️ DEVIATION' };
    } else {
        return { status: 'CRITICAL', message: '🚨 CRITICAL' };
    }
}
