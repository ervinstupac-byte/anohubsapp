import React from 'react';
import { Zap, Activity, ShieldAlert, Thermometer } from 'lucide-react';

interface PQViewProps {
    activePowerMW: number;
    reactivePowerMVAR: number;
    ratedMVA: number;
    coolingTempC: number;
    limiters: {
        oel: boolean;
        uel: boolean;
        vHz: boolean;
    };
    pssActive: boolean;
}

export const PQView: React.FC<PQViewProps> = ({
    activePowerMW,
    reactivePowerMVAR,
    ratedMVA,
    coolingTempC,
    limiters,
    pssActive
}) => {
    // Determine Capability Curve scaling based on Cooling
    // Standard: 40C cold air. If >40C, capability de-rates.
    const deRateFactor = coolingTempC > 40 ? 1.0 - ((coolingTempC - 40) * 0.015) : 1.0;
    const currentMVA = ratedMVA * deRateFactor;

    // Canvas coordinate logic (Simplified for CSS visualization)
    // Center (0,0) MVAR/MW. 
    // Y-axis: MW, X-axis: MVAR (+Lag/-Lead)
    // Or standard: Y=MW, X=MVAR.

    // Normalizing to % of Rated
    const xPos = (reactivePowerMVAR / ratedMVA) * 100; // %
    const yPos = (activePowerMW / ratedMVA) * 100; // %

    return (
        <div className="w-full bg-slate-950 p-6 text-white border-2 border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-900/30 rounded-full">
                        <Zap className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Dynamic Capability (P-Q)</h2>
                        <p className="text-xs text-slate-400">Generator Operating Point • {ratedMVA} MVA Rated</p>
                    </div>
                </div>

                {/* Status Flags */}
                <div className="flex gap-2">
                    <div className={`px-2 py-1 rounded text-xs font-bold border ${pssActive ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>
                        PSS: {pssActive ? 'ACTIVE' : 'OFF'}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold border ${limiters.oel ? 'bg-red-900/30 border-red-500 text-red-400 animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>
                        OEL
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold border ${limiters.uel ? 'bg-amber-900/30 border-amber-500 text-amber-400 animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>
                        UEL
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">

                {/* 1. VISUALIZER */}
                <div className="col-span-2 bg-slate-900 rounded-lg border border-slate-700 h-64 relative overflow-hidden flex items-center justify-center">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-10 pointer-events-none">
                        {[...Array(16)].map((_, i) => <div key={i} className="border-r border-b border-slate-400" />)}
                    </div>

                    {/* Axis */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-600 opacity-50" /> {/* Y-Axis (MW) */}
                    <div className="absolute left-0 right-0 bottom-8 h-0.5 bg-slate-600 opacity-50" /> {/* X-Axis (MVAR) - shifted up */}

                    {/* Capability Curve (Semi-Circle approx) */}
                    <div
                        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 border-2 border-emerald-500 rounded-t-full opacity-30"
                        style={{ width: '80%', height: '80%' }}
                    />

                    {/* De-Rated Curve (if hot) */}
                    {deRateFactor < 1.0 && (
                        <div
                            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 border-2 border-dashed border-red-500 rounded-t-full opacity-40 transition-all duration-1000"
                            style={{ width: `${80 * deRateFactor}%`, height: `${80 * deRateFactor}%` }}
                        />
                    )}

                    {/* Operating Point */}
                    <div
                        className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all duration-500 flex items-center justify-center"
                        style={{
                            bottom: `calc(2rem + ${yPos * 0.8}%)`, // Adjusted for visual scaling 
                            left: `calc(50% + ${xPos * 0.8}%)`
                        }}
                    >
                        <div className="w-1 h-1 bg-purple-600 rounded-full" />
                    </div>

                    {/* Labels */}
                    <div className="absolute bottom-2 left-4 text-xs text-slate-500">- MVAR (Lead)</div>
                    <div className="absolute bottom-2 right-4 text-xs text-slate-500">+ MVAR (Lag)</div>
                    <div className="absolute top-2 left-1/2 text-xs text-slate-500 transform -translate-x-1/2">+ MW</div>

                </div>

                {/* 2. DATA PANEL */}
                <div className="space-y-4">
                    <div className="bg-slate-800 p-3 rounded border border-slate-700">
                        <div className="text-xs text-slate-400 mb-1">Active Power (P)</div>
                        <div className="text-2xl font-bold font-mono text-white">
                            {activePowerMW.toFixed(1)} <span className="text-sm text-slate-500">MW</span>
                        </div>
                    </div>

                    <div className="bg-slate-800 p-3 rounded border border-slate-700">
                        <div className="text-xs text-slate-400 mb-1">Reactive Power (Q)</div>
                        <div className={`text-2xl font-bold font-mono ${reactivePowerMVAR > 0 ? 'text-amber-300' : 'text-cyan-300'}`}>
                            {reactivePowerMVAR.toFixed(1)} <span className="text-sm text-slate-500">MVAR</span>
                        </div>
                        <div className="text-xs mt-1 text-slate-500">
                            {reactivePowerMVAR > 0 ? 'LAG (Inductive)' : 'LEAD (Capacitive)'}
                        </div>
                    </div>

                    <div className="bg-slate-800 p-3 rounded border border-slate-700">
                        <div className="text-xs text-slate-400 mb-1 flex items-center gap-2">
                            <Thermometer className="w-3 h-3 text-red-400" />
                            Cooling Limit
                        </div>
                        <div className={`text-xl font-bold font-mono ${coolingTempC > 40 ? 'text-red-400' : 'text-emerald-300'}`}>
                            {deRateFactor < 1.0 ? `De-Rate ${(100 * deRateFactor).toFixed(0)}%` : '100% Capacity'}
                        </div>
                        <div className="text-xs text-slate-500">Air Temp: {coolingTempC}°C</div>
                    </div>
                </div>

            </div>
        </div>
    );
};
