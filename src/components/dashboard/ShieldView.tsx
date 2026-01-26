import React from 'react';
import { Shield, Lock, Radio, AlertOctagon } from 'lucide-react';

interface SecurityData {
    network: {
        status: string;
        anomalies: number;
        lastScan: string;
    };
    blocked: {
        count: number;
        lastReason: string;
    };
    isolation: {
        active: boolean; // Is plant air-gapped/isolated?
        rootOfTrust: boolean;
    };
}

export const ShieldView: React.FC<{ data: SecurityData }> = ({ data }) => {
    return (
        <div className="w-full bg-slate-950 p-6 text-white border-2 border-slate-800 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-900/30 rounded-full">
                    <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Cyber-Physical Shield</h2>
                    <p className="text-xs text-slate-400">Intrusion Detection • Hardware Security</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">

                {/* 1. NETWORK INTEGRITY */}
                <div className={`bg-slate-900/50 p-4 rounded-lg border ${data.network.anomalies > 0 ? 'border-amber-500 animate-pulse' : 'border-slate-700'}`}>
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Radio className="w-4 h-4 text-cyan-400" />
                        Network Integrity
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded flex justify-between items-center">
                            <div>
                                <div className="text-xs text-slate-400">Status</div>
                                <div className={`text-lg font-bold ${data.network.status === 'SECURE' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {data.network.status}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-500">Anomalies</div>
                                <div className={`text-xl font-mono font-bold ${data.network.anomalies > 0 ? 'text-red-400' : 'text-white'}`}>
                                    {data.network.anomalies}
                                </div>
                            </div>
                        </div>
                        <div className="text-xs text-slate-500 text-center">
                            Scanning Protocols: Modbus, IEC 61850, DNP3
                        </div>
                    </div>
                </div>

                {/* 2. BLOCKED ATTACKS */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <AlertOctagon className="w-4 h-4 text-red-400" />
                        Shield Interventions
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded text-center">
                            <div className="text-xs text-slate-400 mb-1">Total Blocked</div>
                            <div className="text-3xl font-bold font-mono text-red-400">
                                {data.blocked.count}
                            </div>
                        </div>

                        {data.blocked.lastReason && (
                            <div className="p-2 bg-red-950/30 border border-red-500/30 rounded text-xs text-red-300">
                                <span className="font-bold">LAST:</span> {data.blocked.lastReason}
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. ROOT OF TRUST */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-purple-400" />
                        Hardware Trust
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-2 bg-slate-800 rounded">
                            <span className="text-xs text-slate-400">TPM/HSM Status</span>
                            <span className={`text-xs font-bold ${data.isolation.rootOfTrust ? 'text-emerald-400' : 'text-red-400'}`}>
                                {data.isolation.rootOfTrust ? 'VERIFIED' : 'FAILED'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-slate-800 rounded">
                            <span className="text-xs text-slate-400">System Isolation</span>
                            <span className={`text-xs font-bold ${data.isolation.active ? 'text-cyan-400' : 'text-slate-500'}`}>
                                {data.isolation.active ? 'AIR-GAPPED' : 'NETWORKED'}
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
