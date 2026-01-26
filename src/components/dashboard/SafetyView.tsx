import React from 'react';
import { Shield, AlertTriangle, Lock, Power } from 'lucide-react';

interface SafetyViewProps {
    permissives: {
        ready: boolean;
        missing: string[];
    };
    interlocks: {
        tripActive: boolean;
        reason: string | null;
    };
    esd: {
        lastAction: string;
        level: string;
    };
}

export const SafetyView: React.FC<SafetyViewProps> = ({ permissives, interlocks, esd }) => {
    return (
        <div className="w-full bg-slate-950 p-6 text-white border-2 border-slate-800 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-900/30 rounded-full">
                    <Shield className="w-6 h-6 text-red-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Safety & Interlocks</h2>
                    <p className="text-xs text-slate-400">Hardened Logic • Protection Matrix</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">

                {/* 1. START PERMISSIVES */}
                <div className={`bg-slate-900/50 p-4 rounded-lg border ${permissives.ready ? 'border-emerald-500' : 'border-slate-700'}`}>
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-emerald-400" />
                        Start Permissives
                    </h3>

                    {permissives.ready ? (
                        <div className="flex flex-col items-center justify-center py-6 text-emerald-400">
                            <div className="text-3xl font-bold">READY</div>
                            <div className="text-xs">Sequence Enabled</div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="text-xs text-red-400 font-bold mb-2">BLOCKING START:</div>
                            {permissives.missing.map((cond, i) => (
                                <div key={i} className="px-2 py-1 bg-red-950/30 border border-red-500/30 rounded text-xs text-red-300 font-mono">
                                    {cond}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. ACTIVE INTERLOCKS/TRIPS */}
                <div className={`bg-slate-900/50 p-4 rounded-lg border ${interlocks.tripActive ? 'border-red-500 animate-pulse' : 'border-slate-700'}`}>
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Power className="w-4 h-4 text-red-400" />
                        Protection Relay
                    </h3>

                    {interlocks.tripActive ? (
                        <div className="text-center py-4">
                            <div className="text-3xl font-black text-red-500 mb-2">TRIPPED</div>
                            <div className="px-2 py-1 bg-red-500 text-white rounded font-bold text-sm inline-block">
                                {interlocks.reason}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-slate-500">
                            <div className="text-2xl font-bold mb-1">HEALTHY</div>
                            <div className="text-xs">System Normal</div>
                        </div>
                    )}
                </div>

                {/* 3. ESD MATRIX STATUS */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        ESD Matrix status
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded">
                            <div className="text-xs text-slate-400 mb-1">Active Level</div>
                            <div className={`text-xl font-bold font-mono ${esd.level.includes('LEVEL_3') ? 'text-red-500' : esd.level.includes('LEVEL_1') ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {esd.level.replace('LEVEL_', '').replace('_', ' ')}
                            </div>
                        </div>
                        <div className="text-xs text-slate-500">
                            Last Action: <br />
                            <span className="font-mono text-white">{esd.lastAction}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
