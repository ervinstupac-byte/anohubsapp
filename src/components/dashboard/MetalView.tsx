import React from 'react';
import { Hammer, Flame, Layers, Microscope } from 'lucide-react';

interface MetalData {
    scanner: {
        deficitsFound: number;
        maxDepth: number; // mm
        powderNeeded: number; // kg
    };
    cladding: {
        status: string;
        layer: number; // %
        tempSubstrate: number;
        tempMelt: number;
    };
    hardening: {
        status: string;
        stress: number; // MPa
    };
}

export const MetalView: React.FC<{ data: MetalData }> = ({ data }) => {
    return (
        <div className="w-full bg-slate-950 p-6 text-white border-2 border-slate-800 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-900/30 rounded-full">
                    <Flame className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Regenerative Metallurgy</h2>
                    <p className="text-xs text-slate-400">In-Situ Laser Cladding • Ultrasonic Hardening</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">

                {/* 1. DEFECT ANALYSIS */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Microscope className="w-4 h-4 text-blue-400" />
                        Scan & Path Plan
                    </h3>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-800 p-3 rounded">
                            <span className="text-xs text-slate-400">Defects Identified</span>
                            <span className="text-xl font-bold text-white">{data.scanner.deficitsFound}</span>
                        </div>

                        <div className="flex justify-between items-center bg-slate-800 p-3 rounded">
                            <span className="text-xs text-slate-400">Max Depth</span>
                            <span className="text-lg font-mono text-red-300">{data.scanner.maxDepth.toFixed(1)} mm</span>
                        </div>

                        <div className="flex justify-between items-center bg-slate-800 p-3 rounded">
                            <span className="text-xs text-slate-400">Powder Load</span>
                            <span className="text-lg font-mono text-amber-300">{data.scanner.powderNeeded.toFixed(2)} kg</span>
                        </div>
                    </div>
                </div>

                {/* 2. DED CLADDING */}
                <div className={`bg-slate-900/50 p-4 rounded-lg border ${data.cladding.status === 'WELDING' ? 'border-orange-500 animate-pulse' : 'border-slate-700'}`}>
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-orange-400" />
                        Laser Deposition
                    </h3>

                    <div className="space-y-4">
                        <div className="text-center">
                            <div className="text-xs text-slate-400 mb-1">Status</div>
                            <div className={`text-lg font-black ${data.cladding.status === 'WELDING' ? 'text-orange-400' : 'text-slate-500'}`}>
                                {data.cladding.status.replace('_', ' ')}
                            </div>
                        </div>

                        <div className="relative h-4 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-600">
                            <div
                                className="h-full bg-orange-500"
                                style={{ width: `${data.cladding.layer}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow">
                                {data.cladding.layer.toFixed(0)}% Layer
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-slate-800 p-1 rounded">
                                <div className="text-[9px] text-slate-400">Melt Pool</div>
                                <div className="text-sm text-orange-300 font-mono">{data.cladding.tempMelt.toFixed(0)}°C</div>
                            </div>
                            <div className="bg-slate-800 p-1 rounded">
                                <div className="text-[9px] text-slate-400">Substrate</div>
                                <div className={`text-sm font-mono ${data.cladding.tempSubstrate > 150 ? 'text-red-400' : 'text-emerald-300'}`}>
                                    {data.cladding.tempSubstrate.toFixed(0)}°C
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. HARDENING (UIT) */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Hammer className="w-4 h-4 text-cyan-400" />
                        Ultrasonic Hardening
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded text-center">
                            <div className="text-xs text-slate-400 mb-1">Residual Stress Target</div>
                            <div className={`text-2xl font-bold font-mono ${data.hardening.stress < -200 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {data.hardening.stress} <span className="text-sm text-slate-500">MPa</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1">
                                (Compressive is Good)
                            </div>
                        </div>

                        <div className={`p-2 rounded text-center text-xs font-bold border ${data.hardening.status === 'COMPLETE' ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-600'}`}>
                            {data.hardening.status.replace('_', ' ')}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
