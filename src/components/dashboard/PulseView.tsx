import React from 'react';
import { Watch, Shield, Radio, Activity } from 'lucide-react';

interface PulseData {
    clock: {
        offsetNs: number;
        status: string;
        source: string;
    };
    pqc: {
        algorithm: string;
        securePackets: number;
        lastVerification: string;
    };
    gnss: {
        spoofing: boolean;
        satellites: number;
    };
}

export const PulseView: React.FC<{ data: PulseData }> = ({ data }) => {
    return (
        <div className="w-full bg-slate-950 p-6 text-white border-2 border-slate-800 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-fuchsia-900/30 rounded-full">
                    <Watch className="w-6 h-6 text-fuchsia-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Quantum-Safe Pulse</h2>
                    <p className="text-xs text-slate-400">PTP Sync • Post-Quantum Cryptography</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">

                {/* 1. CLOCK SYNC (PTP) */}
                <div className={`bg-slate-900/50 p-4 rounded-lg border ${data.clock.status === 'LOCKED' ? 'border-slate-700' : 'border-amber-500 animate-pulse'}`}>
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        Precision Time (IEEE 1588)
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded text-center">
                            <div className="text-xs text-slate-400 mb-1">Offset from Master</div>
                            <div className={`text-3xl font-bold font-mono ${Math.abs(data.clock.offsetNs) < 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {data.clock.offsetNs} <span className="text-lg text-slate-500">ns</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Sync Status</span>
                            <span className={`font-bold ${data.clock.status === 'LOCKED' ? 'text-emerald-300' : 'text-amber-300'}`}>
                                {data.clock.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. SECURITY LAYER (PQC) */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-fuchsia-400" />
                        Lattice Encryption
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Algorithm</span>
                                <span className="font-mono text-fuchsia-300">{data.pqc.algorithm}</span>
                            </div>
                            <div className="text-center mt-2">
                                <div className="text-2xl font-bold text-white">{data.pqc.securePackets}</div>
                                <div className="text-[10px] text-slate-500">Secured Packets/sec</div>
                            </div>
                        </div>

                        <div className="text-center text-[10px] text-fuchsia-400/70 border border-fuchsia-900/50 rounded p-1">
                            QUANTUM IMMUNITY ACTIVE
                        </div>
                    </div>
                </div>

                {/* 3. TIME SOURCE GUARD */}
                <div className={`bg-slate-900/50 p-4 rounded-lg border ${data.gnss.spoofing ? 'border-red-500 animate-pulse' : 'border-slate-700'}`}>
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Radio className="w-4 h-4 text-cyan-400" />
                        GNSS & Holdover
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded text-center">
                            <div className="text-xs text-slate-400 mb-1">Active Time Source</div>
                            <div className={`text-lg font-bold ${data.clock.source === 'GNSS' ? 'text-cyan-300' : 'text-amber-300'}`}>
                                {data.clock.source.replace('_', ' ')}
                            </div>
                        </div>

                        {data.clock.source !== 'GNSS' && (
                            <div className="p-2 bg-amber-950/30 border border-amber-500/30 rounded text-xs text-amber-400 text-center">
                                ⚠️ HOLDOVER MODE: {data.gnss.spoofing ? 'Spoofing Detected' : 'Signal Lost'}
                            </div>
                        )}

                        <div className="text-center text-[10px] text-slate-500">
                            Satellites Visible: {data.gnss.satellites}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
