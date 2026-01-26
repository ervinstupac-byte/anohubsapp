import React from 'react';
import { Shield, Lock, AlertTriangle, CheckCircle } from 'lucide-react';

interface PLCConnection {
    assetId: string;
    ipAddress: string;
    protocol: 'OPC-UA' | 'Modbus-TCP';
    status: 'CONNECTED' | 'DISCONNECTED' | 'AUTH_FAILED';
    lastHandshake: number;
    encryptionLevel: 'TLS-1.3' | 'TLS-1.2' | 'NONE';
    certificateValid: boolean;
    intrusions: number;
}

interface CyberMapProps {
    connections: PLCConnection[];
    sovereigntyChainStatus: {
        verified: boolean;
        length: number;
        lastBlock: string;
    };
}

export const CyberMap: React.FC<CyberMapProps> = ({ connections, sovereigntyChainStatus }) => {
    const connectedCount = connections.filter(c => c.status === 'CONNECTED').length;
    const secureConnections = connections.filter(c => c.encryptionLevel === 'TLS-1.3' && c.certificateValid).length;
    const totalIntrusions = connections.reduce((sum, c) => sum + c.intrusions, 0);

    return (
        <div className="w-full h-full bg-slate-950 p-6">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-emerald-400" />
                Network Health & Cyber Security
            </div>

            {/* Security Overview */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <SecurityMetric
                    label="Connected PLCs"
                    value={`${connectedCount}/${connections.length}`}
                    status={connectedCount === connections.length ? 'good' : 'warning'}
                />
                <SecurityMetric
                    label="Secure Connections"
                    value={`${secureConnections}/${connections.length}`}
                    status={secureConnections === connections.length ? 'good' : 'critical'}
                />
                <SecurityMetric
                    label="Chain Verified"
                    value={sovereigntyChainStatus.verified ? 'YES' : 'NO'}
                    status={sovereigntyChainStatus.verified ? 'good' : 'critical'}
                />
                <SecurityMetric
                    label="Intrusion Attempts"
                    value={totalIntrusions.toString()}
                    status={totalIntrusions === 0 ? 'good' : 'warning'}
                />
            </div>

            {/* Network Topology */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-6">
                <div className="text-sm font-bold text-slate-300 mb-4">PLC Network Topology</div>

                <div className="relative h-96">
                    {/* Central SCADA Server */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-32 h-32 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex flex-col items-center justify-center border-4 border-purple-500">
                            <Shield className="w-12 h-12 text-white mb-2" />
                            <div className="text-xs text-white font-bold">SCADA Server</div>
                            <div className="text-[10px] text-purple-200">Sovereign Kernel</div>
                        </div>
                    </div>

                    {/* PLC Connections in a circle */}
                    {connections.map((conn, i) => {
                        const angle = (i / connections.length) * 2 * Math.PI;
                        const radius = 180;
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;

                        const statusColors = {
                            CONNECTED: 'emerald',
                            DISCONNECTED: 'red',
                            AUTH_FAILED: 'amber'
                        };
                        const color = statusColors[conn.status];

                        return (
                            <div key={i}>
                                {/* Connection Line */}
                                <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                                    <line
                                        x1="50%"
                                        y1="100"
                                        x2={`calc(50% + ${x}px)`}
                                        y2={`calc(100px + ${y + 100}px)`}
                                        stroke={conn.status === 'CONNECTED' ? '#10b981' : '#ef4444'}
                                        strokeWidth="2"
                                        strokeDasharray={conn.status === 'CONNECTED' ? '0' : '5,5'}
                                    />
                                </svg>

                                {/* PLC Node */}
                                <div
                                    className="absolute"
                                    style={{
                                        top: `calc(100px + ${y + 100}px)`,
                                        left: `calc(50% + ${x}px)`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                >
                                    <div className={`w-24 h-24 bg-slate-800 border-4 border-${color}-500 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700 transition-all`}>
                                        <div className="text-xs font-bold text-white mb-1">{conn.assetId}</div>
                                        <div className={`w-3 h-3 rounded-full bg-${color}-500 mb-1 ${conn.status === 'CONNECTED' ? 'animate-pulse' : ''}`} />
                                        <div className="text-[10px] text-slate-400">{conn.ipAddress}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Connection Details Table */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                    <thead className="bg-slate-800">
                        <tr>
                            <th className="text-left p-3 text-slate-400 font-bold">Asset</th>
                            <th className="text-left p-3 text-slate-400 font-bold">IP Address</th>
                            <th className="text-left p-3 text-slate-400 font-bold">Protocol</th>
                            <th className="text-left p-3 text-slate-400 font-bold">Encryption</th>
                            <th className="text-left p-3 text-slate-400 font-bold">Certificate</th>
                            <th className="text-left p-3 text-slate-400 font-bold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {connections.map((conn, i) => (
                            <tr key={i} className="border-t border-slate-800">
                                <td className="p-3 font-mono font-bold text-white">{conn.assetId}</td>
                                <td className="p-3 font-mono text-slate-300">{conn.ipAddress}</td>
                                <td className="p-3 font-mono text-blue-300">{conn.protocol}</td>
                                <td className="p-3 font-mono text-purple-300">{conn.encryptionLevel}</td>
                                <td className="p-3">
                                    {conn.certificateValid ? (
                                        <div className="flex items-center gap-1 text-emerald-400">
                                            <CheckCircle className="w-3 h-3" />
                                            <span>Valid</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-red-400">
                                            <AlertTriangle className="w-3 h-3" />
                                            <span>Invalid</span>
                                        </div>
                                    )}
                                </td>
                                <td className="p-3">
                                    <div className={`px-2 py-1 rounded-full text-center ${conn.status === 'CONNECTED' ? 'bg-emerald-950 text-emerald-300' :
                                            conn.status === 'DISCONNECTED' ? 'bg-red-950 text-red-300' :
                                                'bg-amber-950 text-amber-300'
                                        }`}>
                                        {conn.status}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Sovereignty Chain Status */}
            <div className="mt-6 bg-slate-900 border border-emerald-500 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-bold text-emerald-300 mb-1">Cryptographic Chain Integrity</div>
                        <div className="text-xs text-slate-400 font-mono">
                            Blocks: {sovereigntyChainStatus.length} | Last: {sovereigntyChainStatus.lastBlock.substring(0, 16)}...
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                        <Lock className="w-5 h-5" />
                        <span className="text-sm font-bold">VERIFIED</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SecurityMetric: React.FC<{ label: string; value: string; status: 'good' | 'warning' | 'critical' }> = ({ label, value, status }) => {
    const colors = {
        good: 'emerald',
        warning: 'amber',
        critical: 'red'
    };
    const color = colors[status];

    return (
        <div className={`bg-slate-900 border border-${color}-500 rounded-lg p-4`}>
            <div className={`text-xs text-${color}-400 mb-1`}>{label}</div>
            <div className={`text-2xl font-bold text-${color}-300 font-mono`}>{value}</div>
        </div>
    );
};
